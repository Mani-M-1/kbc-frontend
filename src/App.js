import './App.css';
import React, { useState, useEffect, useContext, createContext } from 'react';
import io from 'socket.io-client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './components/Home';

const socket = io('https://kbc-backend-9mww.onrender.com');


export const GameContext = createContext();

function App() {
  const [isHost, setIsHost] = useState(false);

  const [finalScores, setFinalScores] = useState([]);

  return (
    <GameContext.Provider value={{ socket, finalScores, setFinalScores, setIsHost, isHost}}>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home/>}/>
        </Routes>
      </BrowserRouter>
    </GameContext.Provider>
  );
}






export default App;
