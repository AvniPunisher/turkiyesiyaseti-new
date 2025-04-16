// src/components/LoadGame.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

const LoadGameContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(to bottom, #1a2a3a, #0a1a2a);
  color: white;
  font-family: 'Orbitron', sans-serif;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(0, 30, 60, 0.7);
  border-bottom: 1px solid rgba(0, 200, 255, 0.3);
`;

const Title = styled.h2`
  margin: 0;
  color: rgba(0, 200, 255, 0.8);
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  overflow-y: auto;
`;

const GamesList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const GameCard = styled.div`
  background: rgba(0, 30, 60, 0.7);
  border: 1px solid rgba(0, 200, 255, 0.3);
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 200, 255, 0.2);
  }
`;

const GameName = styled.h3`
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: rgba(0, 200, 255, 0.8);
`;

const GameDate = styled.p`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1rem;
`;

const NoGames = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
`;

const NoGamesText = styled.p`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.7);
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

const Controls = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: rgba(0, 30, 60, 0.7);
  border-top: 1px solid rgba(0, 200, 255, 0.3);
`;

const LoadGame = () => {
  const navigate = useNavigate();
  const [savedGames, setSavedGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      fetchSavedGames(token);
    } else {
      setLoading(false);
    }
  }, []);
  
  const fetchSavedGames = async (token) => {
    try {
      setLoading(true);
      
      // Örnek veri (gerçekte API'dan gelecek)
      const dummyData = [
        { 
          id: 1, 
          gameName: 'Kaydedilmiş Oyun 1', 
          createdAt: new Date(Date.now() - 86400000).toISOString(), 
          gameType: 'single' 
        },
        { 
          id: 2, 
          gameName: 'Kaydedilmiş Oyun 2', 
          createdAt: new Date(Date.now() - 172800000).toISOString(), 
          gameType: 'single' 
        },
        { 
          id: 3, 
          gameName: 'Çok Oyunculu Kayıt', 
          createdAt: new Date(Date.now() - 259200000).toISOString(), 
          gameType: 'multi' 
        },
      ];
      
      // Gerçek API çağrısı:
      // const response = await axios.get('https://api.turkiyesiyaseti.net/api/game/saved-games', {
      //   headers: {
      //     Authorization: `Bearer ${token}`
      //   }
      // });
      // setSavedGames(response.data);
      
      setSavedGames(dummyData);
      setLoading(false);
    } catch (error) {
      console.error('Kayıtlı oyunları yükleme hatası:', error);
      setLoading(false);
    }
  };
  
  const handleLoadGame = (game) => {
    // Oyun tipine göre yönlendirme yap
    if (game.gameType === 'single') {
      navigate('/single-player', { state: { loadedGame: game } });
    } else {
      navigate('/multi-player', { state: { loadedGame: game } });
    }
  };
  
  const returnToMenu = () => {
    navigate('/');
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <LoadGameContainer>
      <Header>
        <Title>Kayıtlı Oyunlar</Title>
      </Header>
      
      <ContentArea>
        {loading ? (
          <NoGames>
            <NoGamesText>Yükleniyor...</NoGamesText>
          </NoGames>
        ) : !isLoggedIn ? (
          <NoGames>
            <NoGamesText>Kayıtlı oyunları görmek için giriş yapmanız gerekiyor.</NoGamesText>
            <Button onClick={() => navigate('/login')}>Giriş Yap</Button>
          </NoGames>
        ) : savedGames.length === 0 ? (
          <NoGames>
            <NoGamesText>Henüz kaydedilmiş oyununuz bulunmuyor.</NoGamesText>
            <Button onClick={() => navigate('/single-player')}>Yeni Oyun Başlat</Button>
          </NoGames>
        ) : (
          <GamesList>
            {savedGames.map((game) => (
              <GameCard key={game.id} onClick={() => handleLoadGame(game)}>
                <GameName>{game.gameName}</GameName>
                <GameDate>{formatDate(game.createdAt)}</GameDate>
                <div>
                  {game.gameType === 'single' ? 'Tek Oyunculu' : 'Çok Oyunculu'}
                </div>
              </GameCard>
            ))}
          </GamesList>
        )}
      </ContentArea>
      
      <Controls>
        <Button onClick={returnToMenu}>Ana Menü</Button>
      </Controls>
    </LoadGameContainer>
  );
};

export default LoadGame;
