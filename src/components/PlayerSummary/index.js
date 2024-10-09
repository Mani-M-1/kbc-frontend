import { useState, useContext, useEffect } from "react";
import {GameContext} from "../../App";
import { useNavigate } from "react-router-dom";


function PlayerSummary() {
  const { finalScores, setIsHost } = useContext(GameContext);

  const navigate = useNavigate();


  console.log("players summary page");
  console.log(finalScores);

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
            {player.name} - Score: {player.score}
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