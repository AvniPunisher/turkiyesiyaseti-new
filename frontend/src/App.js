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
import GlobalStyle from './GlobalStyle';
import { GameProvider } from './context/GameContext';
import { CharacterProvider } from './context/CharacterContext';
import GameScreen from './components/GameScreen/GameScreen';
import Dashboard from './pages/Dashboard'; // ✅ yeni slot sayfası
import GamePage from './pages/GamePage'; // dummy sayfa (oluşturulacak)
import CharacterCreator from './pages/CharacterCreator';

// Özel koruma bileşeni
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <GameProvider>
        <CharacterProvider>
          <GlobalStyle />
          <Routes>
            {/* Genel erişilebilir rotalar */}
            <Route path="/" element={<MainMenu />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Korumalı rotalar */}
            <Route path="/single-player" element={<ProtectedRoute><SinglePlayer /></ProtectedRoute>} />
            <Route path="/multi-player" element={<ProtectedRoute><MultiPlayer /></ProtectedRoute>} />
            <Route path="/load-game" element={<ProtectedRoute><LoadGame /></ProtectedRoute>} />
            <Route path="/character-creator" element={<ProtectedRoute><CharacterCreator /></ProtectedRoute>} />
            <Route path="/party-creator" element={<ProtectedRoute><PartyCreator /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/game/:id" element={<ProtectedRoute><GamePage /></ProtectedRoute>} />

			<Route path="/slots/:slotId/character" element={<CharacterCreator />} />

            {/* Eski "/"" -> GameScreen yönlendirmesi iptal edildi */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CharacterProvider>
      </GameProvider>
    </Router>
  );
}

export default App;
