import './App.css';
import React, { useState, useEffect, useContext, createContext } from 'react';
import io from 'socket.io-client';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

import Home from './components/Home';
import Host from './components/Host';
import Player from './components/Player';
import PlayerSummary from './components/PlayerSummary';

const socket = io('https://kbc-backend-9mww.onrender.com');


export const GameContext = createContext();

function App() {
  const [isHost, setIsHost] = useState(null);
  const [playerId, setPlayerId] = useState(null);

  const [finalScores, setFinalScores] = useState([]);

  const questions = [
    { question: 'What is the capital of India?', options: ['A: Delhi', 'B: Mumbai', 'C: Kolkata', 'D: Chennai'] },
    { question: 'What is the currency of Japan?', options: ['A: Yen', 'B: Dollar', 'C: Peso', 'D: Won'] },
  ];

  // const navigate = useNavigate();

  // const navigateToHome = () => {
  //   setIsHost(null);
  //   navigate("/", {replace: true});
  // }

  return (
    <GameContext.Provider value={{ socket, finalScores, setFinalScores, setIsHost, isHost, playerId, setPlayerId, questions}}>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/host' element={<Host/>}/>
          <Route path='/player' element={<Player/>}/>
          <Route path='/players-summary' element={<PlayerSummary/>}/>
        </Routes>
      </BrowserRouter>
    </GameContext.Provider>
  );
}






export default App;
