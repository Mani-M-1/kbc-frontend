import { useState, useContext, useEffect } from "react";
import {GameContext} from "../../App";
import { useNavigate } from "react-router-dom";

function Player() {
  const [name, setName] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [wrongAnswer, setWrongAnswer] = useState({playerName: "", show: false, correctOption: ''});


  const { socket, setIsHost, setFinalScores, playerId, setPlayerId } = useContext(GameContext);

  const navigate = useNavigate();


  const registerPlayer = () => {
    socket.emit('register', name);
    setIsRegistered(true);
  };

  useEffect(() => {
    socket.on('playersList', ({playerId}) => {
      setPlayerId({playerId});
    });

    socket.on('gameStarted', () => {
      setGameStarted(true);
    });

    socket.on('newQuestion', (question) => {
      setCurrentQuestion(question);
    });

    socket.on('wrongAnswer', (data) => {
      setWrongAnswer({playerName: data.playerName, show: true, correctOption: data.correctOption});
    });

    socket.on('gameEnded', (finalScores) => {
      console.log("Final Scores:", finalScores);
      setFinalScores(finalScores);

      navigate("/players-summary", {replace: true});
    });

    socket.on('quitGame', () => {

      navigate("/players-summary", {replace: true});
    });
  }, [socket]);

  const submitAnswer = () => {
    const time = Date.now();
    socket.emit('submitAnswer', { selectedOption, time });
  };

  const navigateToHome = () => {
    setIsHost(null);
    navigate("/", {replace: true});
  }

  const quitGame = () => {
    socket.emit('quitGame');
  }

  const WrongAnswerView = ({playerName, correctOption}) => {
    return (
        <div>
            <p>
                {playerName} your answer is incorrect, the corrct option is - 
                <strong>
                    {correctOption}
                </strong>
            </p>
        </div>
    )
  }

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

          <button onClick={navigateToHome}>Back</button>
        </div>
      ) 
      : 
      gameStarted && currentQuestion ? (
        <div className="game-panel">
            <header>
                <h3>
                    KBC
                </h3>
                <button onClick={quitGame}>
                    Quit
                </button>
            </header>
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

          {wrongAnswer.show && wrongAnswer.playerId === playerId && <WrongAnswerView playerName={wrongAnswer.playerName } correctOption={wrongAnswer.correctOption} />}
        </div>
      ) : (
        <h3>Waiting for the host to start the game...</h3>
      )}
    </div>
  );
}


export default Player;