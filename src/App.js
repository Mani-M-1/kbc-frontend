import React, { useState, useEffect, useContext, createContext } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import io from 'socket.io-client';
import './App.css';

const socket = io('https://kbc-backend-9mww.onrender.com'); // Connect to the backend
const GameContext = createContext();

function App() {
  const [isHost, setIsHost] = useState(false);  // Host or Player mode
  const [gameCompleted, setGameCompleted] = useState(false); // Track game completion state

  const resetGame = () => {
    setIsHost(false);
    setGameCompleted(false);
  };

  return (
    <div className="App">
      <h1>Welcome to Fastest Finger First</h1>
      {!gameCompleted ? (
        <>
          <button onClick={() => setIsHost(true)}>Host</button>
          <button onClick={() => setIsHost(false)}>Player</button>
        </>
      ) : (
        <button onClick={resetGame}>Home</button>
      )}
      <GameContext.Provider value={{ socket, setGameCompleted }}>
        {!gameCompleted && (isHost ? <Host /> : <Player />)}
      </GameContext.Provider>
    </div>
  );
}

// Host Component
function Host() {
  const [players, setPlayers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const { socket, setGameCompleted } = useContext(GameContext);

  useEffect(() => {
    socket.on('playersList', (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    socket.on('gameStarted', () => {
      setGameStarted(true);
    });

    socket.on('gameCompleted', (players) => {
      setPlayers(players);
      setGameCompleted(true);
    });
  }, [socket, setGameCompleted]);

  const startGame = () => {
    socket.emit('startGame'); // Emit event to start the game
  };

  const websiteLink = 'https://kbc-frontend-taupe.vercel.app'; // Game link

  return (
    <div className="host">
      {!gameStarted ? (
        <>
          <QRCodeSVG value={websiteLink} />
          <button onClick={startGame}>Start Game</button>
        </>
      ) : (
        <GamePanel isHost={true} />
      )}
      <div className="players-list">
        <h3>Players Joined:</h3>
        <ul>
          {players.map((player) => (
            <li key={player.id}>
              {player.name} - {player.score} points
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Player Component
function Player() {
  const [name, setName] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const { socket, setGameCompleted } = useContext(GameContext);

  const registerPlayer = () => {
    socket.emit('register', name);
    setIsRegistered(true);
  };

  useEffect(() => {
    socket.on('gameStarted', () => {
      setGameStarted(true);
    });

    socket.on('gameCompleted', () => {
      setGameCompleted(true);
    });
  }, [socket, setGameCompleted]);

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
          {gameStarted ? <GamePanel isHost={false} /> : <h3>Waiting for the host to start the game...</h3>}
        </div>
      )}
    </div>
  );
}

// GamePanel Component to display questions and manage answers
function GamePanel({ isHost }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [showCongrats, setShowCongrats] = useState(false);
  const [firstResponder, setFirstResponder] = useState(null); // Track who answered first
  const { socket } = useContext(GameContext);

  const questions = [
    { question: 'What is the capital of India?', options: ['A: Delhi', 'B: Mumbai', 'C: Kolkata', 'D: Chennai'] },
    { question: 'What is the currency of Japan?', options: ['A: Yen', 'B: Dollar', 'C: Peso', 'D: Won'] },
    { question: 'Who wrote "Macbeth"?', options: ['A: William Shakespeare', 'B: Charles Dickens', 'C: Mark Twain', 'D: George Orwell'] },
    { question: 'Which planet is closest to the Sun?', options: ['A: Mercury', 'B: Venus', 'C: Earth', 'D: Mars'] },
    { question: 'What is the largest mammal in the world?', options: ['A: Blue Whale', 'B: Elephant', 'C: Giraffe', 'D: Great White Shark'] },
    { question: 'What is the chemical symbol for water?', options: ['A: O2', 'B: H2O', 'C: CO2', 'D: H2'] },
  ];

  const handleOptionSelect = (option) => {
    if (isHost) return; // Host should not select options
    setSelectedOption(option);
    // Emit the selected answer to the backend
    socket.emit('submitAnswer', { selectedOption: option, time: Date.now() });
  };

  const handleContinue = () => {
    setSelectedOption('');
    setShowCongrats(false);
    socket.emit('nextQuestion'); // Emit event to get the next question
  };

  useEffect(() => {
    // Listen for new question from the server
    socket.on('newQuestion', (question) => {
      setCurrentQuestion((prev) => prev + 1);
      setFirstResponder(null); // Reset first responder
    });

    // Listen for game result from the server
    socket.on('gameResult', (results) => {
      setFirstResponder(results.firstResponder);
      setShowCongrats(true);
    });
  }, [socket]);

  return (
    <div className="game-panel">
      {showCongrats && firstResponder ? (
        <div className="congratulations">
          <h2>Congratulations! {firstResponder.name} answered first!</h2>
          <button onClick={handleContinue}>Continue to Next Question</button>
        </div>
      ) : (
        <div>
          <h2>{questions[currentQuestion].question}</h2>
          <ul>
            {questions[currentQuestion].options.map((option) => (
              <li
                key={option}
                onClick={() => handleOptionSelect(option)}
                className={isHost ? '' : selectedOption === option ? 'selected' : ''}
                style={isHost ? { cursor: 'default' } : {}}
              >
                {option}
              </li>
            ))}
          </ul>
          {!isHost && (
            <button onClick={handleContinue} disabled={!selectedOption}>
              Submit
            </button>
          )}
        </div>
      )}
    </div>
  );
}


export default App;
