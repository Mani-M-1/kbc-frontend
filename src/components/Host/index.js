import { useState, useContext, useEffect } from "react";
import { QRCodeSVG } from 'qrcode.react';

import {GameContext} from "../../App";
import { useNavigate } from "react-router-dom";

function Host() {
  const [players, setPlayers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  
  
  const navigate = useNavigate();

  const { socket, setFinalScores, setIsHost } = useContext(GameContext);
  

  const questions = [
    { question: 'What is the capital of India?', options: ['A: Delhi', 'B: Mumbai', 'C: Kolkata', 'D: Chennai'] },
    { question: 'What is the currency of Japan?', options: ['A: Yen', 'B: Dollar', 'C: Peso', 'D: Won'] },
  ];

  useEffect(() => {
    socket.on('playersList', (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    socket.on('gameStarted', () => {
      setGameStarted(true);
    });

    socket.on('correctAnswer', (data) => {
      setCorrectAnswer(data.playerName);
    });

    socket.on('gameEnded', (finalScores) => {
      console.log("Final Scores:", finalScores);
      setFinalScores(finalScores);

      navigate("/players-summary", {replace: true});
    });
  }, [socket]);

  const startGame = () => {
    socket.emit('startGame');
  };

  const endGame = () => {
    // Emit an event to notify the server that the game has ended
    socket.emit('endGame');
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setCorrectAnswer(null);
      socket.emit('newQuestion', questions[currentQuestion + 1]); // Emit the next question to players
    } else {
      // Show summary after the last question
      endGame()
    }
  };

  const websiteLink = 'https://kbc-frontend-taupe.vercel.app';

  

  const navigateToHome = () => {
    setIsHost(null);
    navigate("/", {replace: true});
  }

  return (
    <div className="host">
      <h2>Welcome to KBC</h2>
      {!gameStarted && (
        <>
          <QRCodeSVG value={websiteLink} />
          <button onClick={startGame}>Start Game</button>
        </>
      )}
      <div className="players-list">
        <h3>Players Joined:</h3>
        <ul>
          {players.map((player) => (
            <li key={player.id}>
              {player.name} {player.answerTime ? ` - Answered in ${player.answerTime} ms` : ''}
            </li>
          ))}
        </ul>
      </div>

      {gameStarted && correctAnswer === null && (
        <div className="question-section">
          <h2>Question: {questions[currentQuestion].question}</h2>
          <ul>
            {questions[currentQuestion].options.map((option) => (
              <li key={option}>{option}</li>
            ))}
          </ul>
        </div>
      )}

      {correctAnswer && (
        <div className="congrats-section">
          <h3>Congratulations {correctAnswer}! You answered correctly.</h3>
          {currentQuestion < questions.length - 1 && <button onClick={nextQuestion}>Next Question</button>}
        </div>
      )}

      {gameStarted && (
        <button onClick={endGame}>End Game</button> // Button to end the game
      )}
    </div>
  );
}

export default Host;