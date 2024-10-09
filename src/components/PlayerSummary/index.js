import { useState, useContext, useEffect } from "react";
import {GameContext} from "../../App";
import { useNavigate } from "react-router-dom";


function PlayerSummary() {
  const { finalScores, setIsHost, questions } = useContext(GameContext);

  const navigate = useNavigate();

  const navigateToHome = () => {
    setIsHost(null);
    navigate("/", {replace: true});
  }

  return (
    <div className="summary-page">
      <h2>Game Summary</h2>
      <ul>
        {finalScores.map((player, index) => (
          <li key={index}>
            {player.name} - Score: {player.score} / {questions.length}
          </li>
        ))}
      </ul>

      <button onClick={navigateToHome}>
        Home
      </button>
    </div>
  );
}


export default PlayerSummary;