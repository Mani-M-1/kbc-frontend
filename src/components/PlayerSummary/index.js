import { useState, useContext, useEffect } from "react";
import {GameContext} from "../../App";


function PlayerSummary() {
  const { finalScores } = useContext(GameContext);

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
    </div>
  );
}


export default PlayerSummary;