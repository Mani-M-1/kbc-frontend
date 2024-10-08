import React, { useState, useEffect, useContext, createContext } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import io from 'socket.io-client';
import './App.css';

const socket = io('https://kbc-backend-9mww.onrender.com');
const GameContext = createContext();

function App() {
  const [isHost, setIsHost] = useState(false);

  return (
    <div className="App">
      <h1>Welcome to Fastest Finger First</h1>
      <button onClick={() => setIsHost(true)}>Host</button>
      <button onClick={() => setIsHost(false)}>Player</button>
      <GameContext.Provider value={{ socket }}>
        {isHost ? <Host /> : <Player />}
      </GameContext.Provider>
    </div>
  );
}

function Host() {
  const [players, setPlayers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const { socket } = useContext(GameContext);

  useEffect(() => {
    socket.on('playersList', (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    socket.on('gameStarted', () => {
      setGameStarted(true);
    });

    socket.on('gameCompleted', () => {
      setGameCompleted(true);
    });
  }, [socket]);

  const startGame = () => {
    socket.emit('startGame');
  };

  const websiteLink = 'https://kbc-frontend-taupe.vercel.app';

  if (gameCompleted) {
    return <Summary players={players} />;
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
      {gameStarted && <GamePanel isHost={true} />}
    </div>
  );
}

function Player() {
  const [name, setName] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const { socket } = useContext(GameContext);

  const registerPlayer = () => {
    socket.emit('register', name);
    setIsRegistered(true);
  };

  useEffect(() => {
    socket.on('gameStarted', () => {
      setGameStarted(true);
    });
  }, [socket]);

  return (
    <div className="player">
      {!isRegistered && !gameStarted ? (
        <div>
          <h2>Register</h2>
          <input
            type="text"
            placeholder="Enter your unique name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={registerPlayer}>Submit</button>
        </div>
      ) : (
        <div>
          {gameStarted ? (
            <GamePanel isHost={false} />
          ) : (
            <h3>Waiting for the host to start the game...</h3>
          )}
        </div>
      )}
    </div>
  );
}

function GamePanel({ isHost }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [questionComplete, setQuestionComplete] = useState(false);
  const { socket } = useContext(GameContext);

  const questions = [
    { question: 'What is the capital of India?', options: ['A: Delhi', 'B: Mumbai', 'C: Kolkata', 'D: Chennai'] },
    { question: 'What is the currency of Japan?', options: ['A: Yen', 'B: Dollar', 'C: Peso', 'D: Won'] },
    { question: 'What is the tallest mountain in the world?', options: ['A: K2', 'B: Kilimanjaro', 'C: Everest', 'D: Denali'] },
    { question: 'Who wrote the play "Hamlet"?', options: ['A: Marlowe', 'B: Shakespeare', 'C: Dickens', 'D: Austen'] },
    { question: 'Which planet is known as the Red Planet?', options: ['A: Mars', 'B: Venus', 'C: Saturn', 'D: Jupiter'] }
  ];

  const submitAnswer = () => {
    const time = Date.now();
    socket.emit('submitAnswer', { questionId: currentQuestion, selectedOption, time });
    setQuestionComplete(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setQuestionComplete(false);
    } else {
      socket.emit('endGame');
    }
  };

  if (questionComplete && isHost) {
    return (
      <div className="congratulations">
        <h2>Congratulations!</h2>
        <button onClick={nextQuestion}>
          {currentQuestion < questions.length - 1 ? 'Next Question' : 'View Summary'}
        </button>
      </div>
    );
  }

  return (
    <div className="game-panel">
      <h2>{questions[currentQuestion].question}</h2>
      <ul>
        {questions[currentQuestion].options.map((option) => (
          <li key={option}>
            {!isHost && (
              <label>
                <input
                  type="radio"
                  name="option"
                  value={option.charAt(0)}
                  onChange={() => setSelectedOption(option.charAt(0))}
                />
                {option}
              </label>
            )}
            {isHost && <span>{option}</span>}
          </li>
        ))}
      </ul>
      {!isHost && <button onClick={submitAnswer}>Submit</button>}
      {isHost && <button onClick={nextQuestion}>Next Question</button>}
    </div>
  );
}

function Summary({ players }) {
  return (
    <div className="summary">
      <h2>Game Over! Summary:</h2>
      <ul>
        {players.map((player) => (
          <li key={player.id}>
            {player.name} - {player.score} / 5
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
