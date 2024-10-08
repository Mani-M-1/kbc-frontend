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

// function Host() {
//   const [players, setPlayers] = useState([]);
//   const [gameStarted, setGameStarted] = useState(false);
//   const [currentQuestion, setCurrentQuestion] = useState(0);
//   const [correctAnswer, setCorrectAnswer] = useState(null);
//   const { socket } = useContext(GameContext);

//   const questions = [
//     { question: 'What is the capital of India?', options: ['A: Delhi', 'B: Mumbai', 'C: Kolkata', 'D: Chennai'] },
//     { question: 'What is the currency of Japan?', options: ['A: Yen', 'B: Dollar', 'C: Peso', 'D: Won'] },
//   ];

//   useEffect(() => {
//     socket.on('playersList', (updatedPlayers) => {
//       setPlayers(updatedPlayers);
//     });

//     socket.on('gameStarted', () => {
//       setGameStarted(true);
//     });

//     socket.on('correctAnswer', (data) => {
//       setCorrectAnswer(data.playerName);
//     });
//   }, [socket]);

//   const startGame = () => {
//     socket.emit('startGame');
//   };

//   const nextQuestion = () => {
//     if (currentQuestion < questions.length - 1) {
//       setCurrentQuestion(currentQuestion + 1);
//       setCorrectAnswer(null);
//       socket.emit('newQuestion', questions[currentQuestion + 1]); // Emit the next question to players
//     } else {
//       // Show summary after the last question
//       socket.emit('gameEnd');
//     }
//   };

//   const websiteLink = 'https://kbc-frontend-taupe.vercel.app';

//   return (
//     <div className="host">
//       <h2>Welcome to KBC</h2>
//       {!gameStarted && (
//         <>
//           <QRCodeSVG value={websiteLink} />
//           <button onClick={startGame}>Start Game</button>
//         </>
//       )}
//       <div className="players-list">
//         <h3>Players Joined:</h3>
//         <ul>
//           {players.map((player) => (
//             <li key={player.id}>
//               {player.name} {player.answerTime ? ` - Answered in ${player.answerTime} ms` : ''}
//             </li>
//           ))}
//         </ul>
//       </div>

//       {gameStarted && correctAnswer === null && (
//         <div className="question-section">
//           <h2>Question: {questions[currentQuestion].question}</h2>
//           <ul>
//             {questions[currentQuestion].options.map((option) => (
//               <li key={option}>{option}</li>
//             ))}
//           </ul>
//         </div>
//       )}

//       {correctAnswer && (
//         <div className="congrats-section">
//           <h3>Congratulations {correctAnswer}! You answered correctly.</h3>
//           <button onClick={nextQuestion}>Next Question</button>
//         </div>
//       )}
//     </div>
//   );
// }

function Host() {
  const [players, setPlayers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const { socket } = useContext(GameContext);

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

    socket.on('gameEnded', () => {
    setGameStarted(false);
    setPlayers([]);
  });
  }, [socket]);

  const startGame = () => {
    socket.emit('startGame');
  };

  const endGame = () => {
    // Emit an event to notify the server that the game has ended
    socket.emit('endGame');

    // Optionally reset states
    setGameStarted(false);
    setCurrentQuestion(0);
    setCorrectAnswer(null);
    setPlayers([]); // Clear players if needed
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setCorrectAnswer(null);
      socket.emit('newQuestion', questions[currentQuestion + 1]); // Emit the next question to players
    } else {
      // Show summary after the last question
      socket.emit('gameEnd');
    }
  };

  const websiteLink = 'https://kbc-frontend-taupe.vercel.app';

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
          <button onClick={nextQuestion}>Next Question</button>
        </div>
      )}

      {gameStarted && (
        <button onClick={endGame}>End Game</button> // Button to end the game
      )}
    </div>
  );
}


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

export default App;
