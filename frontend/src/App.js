// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainMenu from './components/MainMenu';
import Login from './components/Login';
import Register from './components/Register';
import SinglePlayer from './components/SinglePlayer';
import MultiPlayer from './components/MultiPlayer';
import LoadGame from './components/LoadGame';
import CharacterCreator from './components/CharacterCreator/CharacterCreator';
import PartyCreator from './components/PartyCreator/PartyCreator';
import GlobalStyle from './GlobalStyle';

function App() {
  return (
    <Router>
      <GlobalStyle />
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/single-player" element={<SinglePlayer />} />
        <Route path="/multi-player" element={<MultiPlayer />} />
        <Route path="/load-game" element={<LoadGame />} />
        <Route path="/character-creator" element={<CharacterCreator />} />
        <Route path="/party-creator" element={<PartyCreator />} />
      </Routes>
    </Router>
  );
}

export default App;
