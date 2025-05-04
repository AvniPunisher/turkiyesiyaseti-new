// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainMenu from './components/MainMenu';
import Login from './components/Login';
import Register from './components/Register';
import SinglePlayer from './components/SinglePlayer';
import MultiPlayer from './components/MultiPlayer';
import LoadGame from './components/LoadGame';
import CharacterCreator from './components/CharacterCreator/CharacterCreator';
import PartyCreator from './components/PartyCreator/PartyCreator';
import GameDashboard from './components/GameDashboard/GameDashboard';
import GameScreen from './components/GameScreen/GameScreen';
import GlobalStyle from './GlobalStyle';

// Özel koruma bileşeni - oyun sayfaları için giriş kontrolü
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Kullanıcı giriş yapmamışsa Login sayfasına yönlendir
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <GlobalStyle />
      <Routes>
        {/* Genel erişilebilir rotalar */}
        <Route path="/" element={<MainMenu />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Korumalı rotalar - giriş gerektiren sayfalar */}
        <Route path="/single-player" element={
          <ProtectedRoute>
            <SinglePlayer />
          </ProtectedRoute>
        } />
        <Route path="/multi-player" element={
          <ProtectedRoute>
            <MultiPlayer />
          </ProtectedRoute>
        } />
        <Route path="/load-game" element={
          <ProtectedRoute>
            <LoadGame />
          </ProtectedRoute>
        } />
        <Route path="/character-creator" element={
          <ProtectedRoute>
            <CharacterCreator />
          </ProtectedRoute>
        } />
        <Route path="/party-creator" element={
          <ProtectedRoute>
            <PartyCreator />
          </ProtectedRoute>
        } />
        <Route path="/game-dashboard" element={
          <ProtectedRoute>
            <GameDashboard />
          </ProtectedRoute>
        } />
        <Route path="/game" element={<GameScreen />} />
          
        
        {/* Bulunamayan sayfalar için ana menüye yönlendir */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
