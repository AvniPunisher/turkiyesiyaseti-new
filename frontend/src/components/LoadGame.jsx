// src/components/LoadGame.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import apiHelper from '../services/apiHelper';


// Kontrastlı metin rengi hesaplama
const getContrastTextColor = (hexColor) => {
  if (!hexColor || hexColor === '#555555') return '#ffffff';
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
  return brightness < 128 ? '#ffffff' : '#000000';
};

// Stil bileşenleri
const LoadGameContainer = styled.div`/* ... */`;
const Header = styled.div`/* ... */`;
const Title = styled.h2`/* ... */`;
const ContentArea = styled.div`/* ... */`;
const GamesList = styled.div`/* ... */`;
const GameCard = styled.div`/* ... */`;
const AutoSaveBadge = styled.div`/* ... */`;
const GameName = styled.h3`/* ... */`;
const GameParty = styled.div`/* ... */`;
const PartyBadge = styled.div`
  background-color: ${props => props.color || '#555'};
  color: ${props => getContrastTextColor(props.color)};
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: bold;
  margin-right: 6px;
  font-size: 0.8rem;
`;
const GameDate = styled.p`/* ... */`;
const ActionButtons = styled.div`/* ... */`;
const ActionButton = styled.button`/* ... */`;
const DeleteButton = styled(ActionButton)`/* ... */`;
const NoGames = styled.div`/* ... */`;
const NoGamesText = styled.p`/* ... */`;
const Button = styled.button`/* ... */`;
const Controls = styled.div`/* ... */`;
const ErrorText = styled.div`/* ... */`;

const LoadGame = () => {
  const navigate = useNavigate();
  const [savedGames, setSavedGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState(null);
  const [deletingGame, setDeletingGame] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      fetchSavedGames();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchSavedGames = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiHelper.get('/api/game/saved-games');
      if (response.success) {
        setSavedGames(response.data.savedGames || []);
      } else {
        setError('Kayıtlı oyunlar yüklenirken bir hata oluştu: ' + response.message);
      }
    } catch (error) {
      setError('Sunucu bağlantı hatası. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadGame = async (game) => {
    try {
      setError(null);
      setLoading(true);
      console.log(`Oyun ID: ${game.id} yükleniyor...`);
      
      const response = await apiHelper.get(`/api/game/load-game/${game.id}`);
      
      if (response.success) {
        const saveData = response.data.saveData;

        if (!saveData.character) {
          setError(`Kayıt ID: ${game.id} - Karakter verisi eksik`);
          setLoading(false);
          return;
        }

        try {
          localStorage.setItem('characterData', JSON.stringify(saveData.character));
          if (saveData.party) {
            localStorage.setItem('partyData', JSON.stringify(saveData.party));
          }
          if (saveData.gameData) {
            localStorage.setItem('gameData', JSON.stringify(saveData.gameData));
          }
        } catch (storageError) {
          console.warn("LocalStorage kaydetme hatası:", storageError);
        }

        navigate('/single-player', {
          state: {
            loadedGame: {
              id: game.id,
              character: saveData.character,
              party: saveData.party,
              gameData: saveData.gameData,
              saveName: game.saveName
            }
          }
        });
      } else {
        setError("Oyun yüklenirken bir hata oluştu: " + response.message);
      }
    } catch (error) {
      setError("Sunucu bağlantı hatası. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGame = async (gameId, event) => {
    event.stopPropagation();
    try {
      setDeletingGame(gameId);
      const response = await apiHelper.delete(`/api/game/delete-save/${gameId}`);
      if (response.success) {
        setSavedGames(prev => prev.filter(game => game.id !== gameId));
      } else {
        setError('Oyun silinirken bir hata oluştu: ' + response.message);
      }
    } catch (error) {
      setError('Sunucu bağlantı hatası. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setDeletingGame(null);
    }
  };

  const returnToMenu = () => {
    navigate('/');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Bilinmeyen tarih';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) {
      return 'Geçersiz tarih';
    }
  };

  return (
    <LoadGameContainer>
      <Header><Title>Kayıtlı Oyunlar</Title></Header>
      <ContentArea>
        {loading ? (
          <NoGames><NoGamesText>Yükleniyor...</NoGamesText></NoGames>
        ) : !isLoggedIn ? (
          <NoGames>
            <NoGamesText>Giriş yapmanız gerekiyor.</NoGamesText>
            <Button onClick={() => navigate('/login')}>Giriş Yap</Button>
          </NoGames>
        ) : error ? (
          <NoGames>
            <ErrorText>{error}</ErrorText>
            <Button onClick={fetchSavedGames}>Tekrar Dene</Button>
          </NoGames>
        ) : savedGames.length === 0 ? (
          <NoGames>
            <NoGamesText>Henüz kaydedilmiş oyununuz yok.</NoGamesText>
            <Button onClick={() => navigate('/single-player')}>Yeni Oyun Başlat</Button>
          </NoGames>
        ) : (
          <GamesList>
            {savedGames.map((game) => (
              <GameCard key={game.id} onClick={() => handleLoadGame(game)}>
                {game.isAutoSave && <AutoSaveBadge>Otomatik Kayıt</AutoSaveBadge>}
                <GameName>{game.saveName}</GameName>
                <div><strong>Karakter:</strong> {game.characterName || 'Bilinmiyor'}</div>
                {game.partyName && (
                  <GameParty>
                    <strong>Parti:</strong>&nbsp;
                    <PartyBadge color={game.partyColor}>{game.partyShortName}</PartyBadge>
                    {game.partyName}
                  </GameParty>
                )}
                <GameDate><strong>Güncelleme:</strong> {formatDate(game.updatedAt)}</GameDate>
                <ActionButtons>
                  <ActionButton onClick={(e) => { e.stopPropagation(); handleLoadGame(game); }}>
                    Yükle
                  </ActionButton>
                  {!game.isAutoSave && (
                    <DeleteButton 
                      onClick={(e) => handleDeleteGame(game.id, e)}
                      disabled={deletingGame === game.id}>
                      {deletingGame === game.id ? 'Siliniyor...' : 'Sil'}
                    </DeleteButton>
                  )}
                </ActionButtons>
              </GameCard>
            ))}
          </GamesList>
        )}
      </ContentArea>
      <Controls>
        <Button onClick={returnToMenu}>Ana Menü</Button>
        {isLoggedIn && !loading && savedGames.length > 0 && (
          <Button onClick={fetchSavedGames}>Yenile</Button>
        )}
      </Controls>
    </LoadGameContainer>
  );
};

export default LoadGame;
