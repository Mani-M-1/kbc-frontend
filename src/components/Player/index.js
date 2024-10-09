import { useState, useContext, useEffect } from "react";
import {GameContext} from "../../App";

function Player() {
  const [name, setName] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const { socket } = useContext(GameContext);

  const registerPlayer = () => {
    socket.emit('register', name);
    setIsRegistered(true);
  };

  useEffect(() => {
    socket.on('gameStarted', () => {
      setGameStarted(true);
    });

    socket.on('newQuestion', (question) => {
      setCurrentQuestion(question);
    });

    socket.on('gameEnded', (finalScores) => {
      // Navigate to the summary page with final scores
      alert("Game Ended! Check the summary console log.");
      console.log("Final Scores:", finalScores);
    });
  }, [socket]);

  const submitAnswer = () => {
    const time = Date.now();
    socket.emit('submitAnswer', { selectedOption, time });
  };

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
      ) : gameStarted && currentQuestion ? (
        <div className="game-panel">
          <h2>{currentQuestion.question}</h2>
          <ul>
            {currentQuestion.options.map((option) => (
              <li key={option}>
                <label>
                  <input
                    type="radio"
                    name="option"
                    value={option.charAt(0)}
                    onChange={() => setSelectedOption(option.charAt(0))}
                  />
                  {option}
                </label>
              </li>
            ))}
          </ul>
          <button onClick={submitAnswer}>Submit</button>
        </div>
      ) : (
        <h3>Waiting for the host to start the game...</h3>
      )}
    </div>
  );
}


export default Player;