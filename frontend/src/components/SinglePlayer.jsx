// src/components/SinglePlayer.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

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
  overflow-y: auto; /* İçerik taşarsa scroll olsun */
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
  overflow-y: auto; /* İçerik taşarsa scroll olsun */
  padding: 2rem 0;
`;

const OverlayText = styled.h2`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: rgba(0, 200, 255, 0.8);
`;

const CharacterInfoCard = styled.div`
  background: rgba(0, 30, 60, 0.7);
  padding: 1.5rem;
  border-radius: 10px;
  border: 1px solid rgba(0, 200, 255, 0.3);
  margin-bottom: 1.5rem;
  max-width: 500px;
  width: 100%;
`;

const CharacterDetail = styled.div`
  margin-bottom: 0.8rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const CharacterLabel = styled.span`
  font-weight: bold;
  color: rgba(0, 200, 255, 0.8);
  margin-right: 0.5rem;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const LoadingText = styled.div`
  font-size: 1.5rem;
  color: rgba(0, 200, 255, 0.8);
  text-align: center;
  margin: 2rem 0;
`;

const SinglePlayer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [gameStarted, setGameStarted] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [character, setCharacter] = useState(null);
  const [hasCharacter, setHasCharacter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [gameData, setGameData] = useState({
    score: 0,
    level: 1,
    // Diğer oyun verileri...
  });
  
  // Oyun açılışında karakter kontrolü
  useEffect(() => {
    // İlk olarak URL'den gelen karakter bilgisini kontrol et
    if (location.state?.character) {
      setCharacter(location.state.character);
      setHasCharacter(true);
      setIsLoading(false);
      setAuthChecked(true);
      return;
    }
    
    // Kullanıcının giriş yapıp yapmadığını kontrol et
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log("Token bulunamadı, giriş sayfasına yönlendiriliyor");
      // Kullanıcı giriş yapmamış, login sayfasına yönlendir
      navigate('/login', { state: { returnUrl: '/character-creator' } });
      return;
    }
    
    // Kullanıcı giriş yapmış, karakteri var mı kontrol et
    checkExistingCharacter(token);
  }, [location.pathname]); // sadece path değişirse çalışsın
  
  // Mevcut kaydedilmiş karakteri kontrol et
  const checkExistingCharacter = async (token) => {
    try {
      setIsLoading(true);
      console.log("Karakter kontrol ediliyor...");
      
      // Veritabanından karakter bilgilerini çek
      const response = await axios.get('http://localhost:5000/api/game/get-character', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success && response.data.character) {
        console.log("Karakter bulundu:", response.data.character);
        setCharacter(response.data.character);
        setHasCharacter(true);
      } else {
        console.log("Karakter bulunamadı");
        setHasCharacter(false);
      }
    } catch (error) {
      console.error('Karakter kontrolü hatası:', error);
      
      // Token geçersizse veya süresi dolmuşsa
      if (error.response && error.response.status === 401) {
        console.log("Token geçersiz, giriş sayfasına yönlendiriliyor");
        localStorage.removeItem('token');
        navigate('/login', { state: { returnUrl: '/character-creator' } });
        return;
      }
      
      setHasCharacter(false);
    } finally {
      setIsLoading(false);
      setAuthChecked(true);
    }
  };
  
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
  
  const saveGame = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Oyunu kaydetmek için giriş yapmanız gerekmektedir.');
        return;
      }
      
      // Oyun verisini veritabanına kaydet
      const response = await axios.post('http://localhost:5000/api/game/save-game', {
        gameData,
        saveName: `${character.fullName}'in Oyunu`,
        saveSlot: 1
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        alert('Oyun başarıyla kaydedildi!');
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Oyun kaydedilirken hata:', error);
      alert('Oyun kaydedilirken bir hata oluştu.');
    }
  };
  
  const returnToMenu = () => {
    navigate('/');
  };
  
  const createNewCharacter = () => {
    navigate('/character-creator');
  };
  
  if (isLoading) {
    return (
      <GameContainer>
        <GameHeader>
          <GameTitle>Tek Oyunculu Mod</GameTitle>
        </GameHeader>
        
        <GameCanvas>
          <LoadingText>Yükleniyor...</LoadingText>
        </GameCanvas>
        
        <GameControls>
          <Button onClick={returnToMenu}>Ana Menü</Button>
        </GameControls>
      </GameContainer>
    );
  }
  
  return (
    <GameContainer>
      <GameHeader>
        <GameTitle>Tek Oyunculu Mod</GameTitle>
        {character && gameStarted && (
          <div>
            {character.fullName} | Skor: {gameData.score} | Seviye: {gameData.level}
          </div>
        )}
      </GameHeader>
      
      <GameCanvas>
        {authChecked && !hasCharacter && (
          <GameOverlay>
            <OverlayText>Karakter Bulunamadı</OverlayText>
            <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              Oyunu oynamak için bir karakter oluşturmanız gerekmektedir.
            </p>
            <Button onClick={createNewCharacter}>Yeni Karakter Oluştur</Button>
          </GameOverlay>
        )}
        
        {hasCharacter && !gameStarted && (
          <GameOverlay>
            <OverlayText>Oyunu Başlatmak İçin Hazır mısın?</OverlayText>
            
            <CharacterInfoCard>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'rgba(0, 200, 255, 0.8)' }}>
                Karakter Bilgileri
              </h3>
              
              <CharacterDetail>
                <CharacterLabel>İsim:</CharacterLabel>
                <span>{character.fullName}</span>
              </CharacterDetail>
              
              <CharacterDetail>
                <CharacterLabel>Yaş:</CharacterLabel>
                <span>{character.age}</span>
              </CharacterDetail>
              
              <CharacterDetail>
                <CharacterLabel>Meslek:</CharacterLabel>
                <span>{character.profession}</span>
              </CharacterDetail>
              
              <CharacterDetail>
                <CharacterLabel>İdeoloji:</CharacterLabel>
                <span>{character.ideology ? 
                  (character.ideology.overallPosition < 20 ? "Sol" :
                   character.ideology.overallPosition < 40 ? "Merkez Sol" :
                   character.ideology.overallPosition < 60 ? "Merkez" :
                   character.ideology.overallPosition < 80 ? "Merkez Sağ" : "Sağ") 
                  : "Bilinmiyor"}</span>
              </CharacterDetail>
            </CharacterInfoCard>
            
            <Button onClick={startGame}>Oyunu Başlat</Button>
          </GameOverlay>
        )}
        
        {gamePaused && (
          <GameOverlay>
            <OverlayText>Oyun Duraklatıldı</OverlayText>
            <ButtonsContainer>
              <Button onClick={pauseGame}>Devam Et</Button>
              <Button onClick={saveGame}>Kaydet</Button>
            </ButtonsContainer>
          </GameOverlay>
        )}
        
        {/* Oyun canvas'ı buraya gelecek */}
        {gameStarted && !gamePaused && (
          <div style={{ fontSize: '1.5rem' }}>
            Oyun Alanı - Aktif Oyun
          </div>
        )}
      </GameCanvas>
      
      <GameControls>
        <Button onClick={returnToMenu}>Ana Menü</Button>
        {gameStarted && (
          <Button onClick={pauseGame}>
            {gamePaused ? 'Devam Et' : 'Duraklat'}
          </Button>
        )}
        {gameStarted && !gamePaused && (
          <Button onClick={saveGame}>Oyunu Kaydet</Button>
        )}
      </GameControls>
    </GameContainer>
  );
};

export default SinglePlayer;