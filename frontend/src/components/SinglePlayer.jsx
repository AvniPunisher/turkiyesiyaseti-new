// src/components/SinglePlayer.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(to bottom, #1a2a3a, #0a1a2a);
  color: white;
  font-family: 'Orbitron', sans-serif;
`;

const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: rgba(0, 30, 60, 0.7);
  border-bottom: 1px solid rgba(0, 200, 255, 0.3);
`;

const GameTitle = styled.h2`
  margin: 0;
  color: rgba(0, 200, 255, 0.8);
`;

const GameCanvas = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const GameControls = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: rgba(0, 30, 60, 0.7);
  border-top: 1px solid rgba(0, 200, 255, 0.3);
`;

const Button = styled.button`
  padding: 0.6rem 1.2rem;
  background: rgba(0, 100, 200, 0.5);
  border: none;
  border-radius: 5px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Orbitron', sans-serif;
  
  &:hover {
    background: rgba(0, 150, 255, 0.7);
  }
`;

const GameOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(0, 10, 20, 0.8);
  z-index: 10;
`;

const OverlayText = styled.h2`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: rgba(0, 200, 255, 0.8);
`;

const SinglePlayer = () => {
  const navigate = useNavigate();
  const [gameStarted, setGameStarted] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [gameData, setGameData] = useState({
    score: 0,
    level: 1,
    // Diğer oyun verileri...
  });
  
  // Oyun döngüsü
  useEffect(() => {
    if (!gameStarted || gamePaused) return;
    
    // Oyun döngüsü kodları buraya gelecek
    
    return () => {
      // Temizleme kodları
    };
  }, [gameStarted, gamePaused]);
  
  const startGame = () => {
    setGameStarted(true);
    setGamePaused(false);
  };
  
  const pauseGame = () => {
    setGamePaused(!gamePaused);
  };
  
  const saveGame = () => {
    // Oyun kaydetme kodları buraya gelecek
    alert('Oyun kaydedildi!');
  };
  
  const returnToMenu = () => {
    navigate('/');
  };
  
  return (
    <GameContainer>
      <GameHeader>
        <GameTitle>Tek Oyunculu Mod</GameTitle>
        <div>
          Skor: {gameData.score} | Seviye: {gameData.level}
        </div>
      </GameHeader>
      
      <GameCanvas>
        {!gameStarted && (
          <GameOverlay>
            <OverlayText>Oyunu Başlatmak İçin Hazır mısın?</OverlayText>
            <Button onClick={startGame}>Oyunu Başlat</Button>
          </GameOverlay>
        )}
        
        {gamePaused && (
          <GameOverlay>
            <OverlayText>Oyun Duraklatıldı</OverlayText>
            <Button onClick={pauseGame}>Devam Et</Button>
          </GameOverlay>
        )}
        
        {/* Oyun canvas'ı buraya gelecek */}
        <div style={{ fontSize: '1.5rem' }}>
          Oyun Alanı
        </div>
      </GameCanvas>
      
      <GameControls>
        <Button onClick={returnToMenu}>Ana Menü</Button>
        <Button onClick={pauseGame}>
          {gamePaused ? 'Devam Et' : 'Duraklat'}
        </Button>
        <Button onClick={saveGame}>Oyunu Kaydet</Button>
      </GameControls>
    </GameContainer>
  );
};

export default SinglePlayer;