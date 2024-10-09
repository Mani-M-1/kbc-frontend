import './index.css';
import React, { useState, useEffect, useContext, createContext } from 'react';
import io from 'socket.io-client';

import Host from "../Host";
import Player from '../Player';

import {GameContext} from "../../App";

const socket = io('https://kbc-backend-9mww.onrender.com');


function Home() {
  const { setIsHost, isHost } = useContext(GameContext);


  return (
    <div className="Home">
      <h1>Welcome to Fastest Finger First</h1>
      <button onClick={() => setIsHost(true)}>Host</button>
      <button onClick={() => setIsHost(false)}>Player</button>
      {isHost ? <Host /> : <Player />}
    </div>
  );
}


export default Home;