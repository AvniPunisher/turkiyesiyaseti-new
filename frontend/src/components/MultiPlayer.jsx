// src/components/MultiPlayer.jsx
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

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  width: 300px;
`;

const Label = styled.label`
  margin-bottom: 0.5rem;
  color: rgba(0, 200, 255, 0.8);
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid rgba(0, 200, 255, 0.5);
  border-radius: 5px;
  background: rgba(0, 20, 40, 0.8);
  color: white;
  font-family: 'Orbitron', sans-serif;
  
  &:focus {
    outline: none;
    border-color: rgba(0, 200, 255, 0.8);
    box-shadow: 0 0 10px rgba(0, 200, 255, 0.5);
  }
`;

const PlayersList = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
  width: 300px;
  background: rgba(0, 20, 40, 0.5);
  border: 1px solid rgba(0, 200, 255, 0.3);
  border-radius: 5px;
  padding: 0.5rem;
`;

const PlayerItem = styled.div`
  padding: 0.5rem;
  margin: 0.2rem 0;
  background: rgba(0, 30, 60, 0.7);
  border-radius: 3px;
  display: flex;
  justify-content: space-between;
`;

const MultiPlayer = () => {
  const navigate = useNavigate();
  const [gameStarted, setGameStarted] = useState(false);
  const [gameSession, setGameSession] = useState(null);
  const [sessionCode, setSessionCode] = useState('');
  const [players, setPlayers] = useState([
    { id: 1, username: 'Oyuncu1', isHost: true },
    { id: 2, username: 'Oyuncu2', isHost: false },
  ]);
  
  const createSession = () => {
    // Oturum oluşturma kodları buraya gelecek
    setGameSession({
      id: Math.random().toString(36).substring(7),
      sessionCode: Math.random().toString(36).substring(7).toUpperCase(),
      hostId: 1,
    });
  };
  
  const joinSession = () => {
    // Oturuma katılma kodları buraya gelecek
    if (!sessionCode.trim()) {
      alert('Lütfen bir oturum kodu girin');
      return;
    }
    
    // API çağrısı yapılacak
    setGameSession({
      id: Math.random().toString(36).substring(7),
      sessionCode: sessionCode,
      hostId: 2,
    });
  };
  
  const startGame = () => {
    setGameStarted(true);
  };
  
  const returnToMenu = () => {
    navigate('/');
  };
  
  return (
    <GameContainer>
      <GameHeader>
        <GameTitle>Çok Oyunculu Mod</GameTitle>
        {gameSession && (
          <div>Oturum Kodu: {gameSession.sessionCode}</div>
        )}
      </GameHeader>
      
      <GameCanvas>
        {!gameSession && (
          <GameOverlay>
            <OverlayText>Çok Oyunculu Oyun</OverlayText>
            <div style={{ display: 'flex', marginBottom: '1rem' }}>
              <Button onClick={createSession} style={{ marginRight: '1rem' }}>
                Yeni Oyun Oluştur
              </Button>
              <Button onClick={() => document.getElementById('joinSessionInput').focus()}>
                Oyuna Katıl
              </Button>
            </div>
            
            <InputGroup>
              <Label htmlFor="joinSessionInput">Oturum Kodu</Label>
              <div style={{ display: 'flex' }}>
                <Input 
                  id="joinSessionInput"
                  type="text" 
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value)}
                  placeholder="Oturum kodunu girin"
                />
                <Button onClick={joinSession} style={{ marginLeft: '0.5rem' }}>
                  Katıl
                </Button>
              </div>
            </InputGroup>
          </GameOverlay>
        )}
        
        {gameSession && !gameStarted && (
          <GameOverlay>
            <OverlayText>Oyuncular Bekleniyor</OverlayText>
            <PlayersList>
              {players.map(player => (
                <PlayerItem key={player.id}>
                  <span>{player.username}</span>
                  {player.isHost && <span style={{ color: '#ffcc00' }}>Host</span>}
                </PlayerItem>
              ))}
            </PlayersList>
            
            <Button onClick={startGame} style={{ marginTop: '1rem' }}>
              Oyunu Başlat
            </Button>
          </GameOverlay>
        )}
        
        {gameStarted && (
          <div style={{ fontSize: '1.5rem' }}>
            Çok Oyunculu Oyun Alanı
          </div>
        )}
      </GameCanvas>
      
      <GameControls>
        <Button onClick={returnToMenu}>Ana Menü</Button>
        {gameSession && !gameStarted && (
          <Button onClick={() => navigator.clipboard.writeText(gameSession.sessionCode)}>
            Kodu Kopyala
          </Button>
        )}
      </GameControls>
    </GameContainer>
  );
};

export default MultiPlayer;