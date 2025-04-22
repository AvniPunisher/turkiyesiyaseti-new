// src/components/LoadGame.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import apiHelper from '../services/apiHelper';

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

const SlotContainer = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
  gap: 1rem;
`;

const SlotButton = styled.button`
  padding: 0.8rem 1.5rem;
  background: ${props => props.active ? 'rgba(0, 150, 255, 0.7)' : 'rgba(0, 100, 200, 0.5)'};
  border: none;
  border-radius: 5px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Orbitron', sans-serif;
  flex: 1;
  
  &:hover {
    background: rgba(0, 150, 255, 0.7);
    transform: translateY(-2px);
  }
  
  .count {
    display: inline-block;
    background: rgba(0, 0, 0, 0.3);
    padding: 0.15rem 0.5rem;
    border-radius: 10px;
    font-size: 0.8rem;
    margin-left: 0.5rem;
  }
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
  position: relative;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 200, 255, 0.2);
  }
`;

const AutoSaveBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 200, 255, 0.7);
  color: #ffffff;
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: bold;
`;

const SlotIndicator = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: rgba(0, 100, 200, 0.7);
  color: #ffffff;
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: bold;
`;

const GameName = styled.h3`
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: rgba(0, 200, 255, 0.8);
`;

const GameParty = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const PartyBadge = styled.div`
  display: inline-block;
  background-color: ${props => props.color || '#555555'};
  color: ${props => getContrastTextColor(props.color) || '#ffffff'};
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 3px;
  margin-right: 8px;
  font-size: 0.8rem;
`;

const GameDate = styled.p`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1rem;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.4rem 0.8rem;
  background: rgba(0, 100, 200, 0.5);
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 0.8rem;
  font-family: 'Orbitron', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 150, 255, 0.7);
  }
  
  &:disabled {
    background: rgba(100, 100, 100, 0.5);
    cursor: not-allowed;
  }
`;

const DeleteButton = styled(ActionButton)`
  background: rgba(200, 60, 60, 0.5);
  
  &:hover {
    background: rgba(255, 80, 80, 0.7);
  }
`;

const NoGames = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  background: rgba(0, 30, 60, 0.7);
  border-radius: 8px;
  padding: 2rem;
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

const ErrorText = styled.div`
  color: #ff5555;
  background: rgba(255, 0, 0, 0.1);
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border: 1px solid rgba(255, 0, 0, 0.3);
`;

// Kontrastlı metin rengi seçimi için yardımcı fonksiyon
const getContrastTextColor = (hexColor) => {
  if (!hexColor || hexColor === '#555555') return '#ffffff';
  
  // HEX'i RGB'ye dönüştür
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Parlaklık formülü (0.299*R + 0.587*G + 0.114*B)
  const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
  
  // Parlaklık 128'den azsa beyaz, değilse siyah döndür
  return brightness < 128 ? '#ffffff' : '#000000';
};

const LoadGame = () => {
  const navigate = useNavigate();
  const [allSavedGames, setAllSavedGames] = useState([]); // Tüm kayıtlı oyunlar
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState(null);
  const [deletingGame, setDeletingGame] = useState(null);
  
  // Slot sistemi
  const [slots, setSlots] = useState([
    { id: 1, name: "Otomatik Kayıtlar", saves: [] },
    { id: 2, name: "Slot 1", saves: [] },
    { id: 3, name: "Slot 2", saves: [] },
    { id: 4, name: "Slot 3", saves: [] }
  ]);
  const [selectedSlot, setSelectedSlot] = useState(1);
  
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
        const games = response.data.savedGames || [];
        setAllSavedGames(games);
        
        // Oyunları slotlara göre ayır
        const gamesBySlot = {};
        slots.forEach(slot => {
          gamesBySlot[slot.id] = [];
        });
        
        games.forEach(game => {
          // Otomatik kayıtlar her zaman slot 1'e gider
          if (game.isAutoSave) {
            gamesBySlot[1].push(game);
          } else {
            // Manuel kayıtlar saveSlot değerine göre uygun slota gider (2-4)
            const slotId = game.saveSlot || 2;
            // Slot sınırlarını kontrol et (2, 3, 4 numaralı slotlar)
            if (slotId >= 2 && slotId <= 4) {
              gamesBySlot[slotId].push(game);
            } else {
              // Geçersiz slot numarası varsa varsayılan olarak slot 2'ye ekle
              gamesBySlot[2].push(game);
            }
          }
        });
        
        // Slot verilerini güncelle
        const updatedSlots = slots.map(slot => ({
          ...slot,
          saves: gamesBySlot[slot.id] || []
        }));
        
        setSlots(updatedSlots);
      } else {
        console.error('Kayıtlı oyunları getirme başarısız:', response.message);
        setError('Kayıtlı oyunlar yüklenirken bir hata oluştu: ' + response.message);
      }
    } catch (error) {
      console.error('Kayıtlı oyunları yükleme hatası:', error);
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
    // Kartın tıklanmasını engelle
    event.stopPropagation();
    
    try {
      setDeletingGame(gameId);
      
      const response = await apiHelper.delete(`/api/game/delete-save/${gameId}`);
      
      if (response.success) {
        // Tüm oyunlar listesinden ve slot listesinden kaldır
        setAllSavedGames(prev => prev.filter(game => game.id !== gameId));
        
        // Slotları güncelle
        setSlots(prevSlots => {
          return prevSlots.map(slot => ({
            ...slot,
            saves: slot.saves.filter(game => game.id !== gameId)
          }));
        });
      } else {
        console.error('Oyun silme başarısız:', response.message);
        setError('Oyun silinirken bir hata oluştu: ' + response.message);
      }
    } catch (error) {
      console.error('Oyun silme hatası:', error);
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
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Geçersiz tarih';
    }
  };
  
  // Seçili slota göre gösterilecek oyunları filtrele
  const filteredGames = slots.find(slot => slot.id === selectedSlot)?.saves || [];

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
        ) : error ? (
          <NoGames>
            <ErrorText>{error}</ErrorText>
            <Button onClick={fetchSavedGames}>Tekrar Dene</Button>
          </NoGames>
        ) : allSavedGames.length === 0 ? (
          <NoGames>
            <NoGamesText>Henüz kaydedilmiş oyununuz bulunmuyor.</NoGamesText>
            <Button onClick={() => navigate('/single-player')}>Yeni Oyun Başlat</Button>
          </NoGames>
        ) : (
          <>
            {error && <ErrorText>{error}</ErrorText>}
            
            {/* Slot seçim butonları */}
            <SlotContainer>
              {slots.map(slot => (
                <SlotButton 
                  key={slot.id}
                  active={selectedSlot === slot.id}
                  onClick={() => setSelectedSlot(slot.id)}
                >
                  {slot.name} <span className="count">{slot.saves.length}</span>
                </SlotButton>
              ))}
            </SlotContainer>
            
            {/* Seçili slotta oyun yoksa */}
            {filteredGames.length === 0 ? (
              <NoGames>
                <NoGamesText>Bu slotta henüz kaydedilmiş oyun bulunmuyor.</NoGamesText>
                {selectedSlot !== 1 && (
                  <Button onClick={() => navigate('/single-player')}>Yeni Oyun Başlat</Button>
                )}
              </NoGames>
            ) : (
              <GamesList>
                {filteredGames.map((game) => (
                  <GameCard key={game.id} onClick={() => handleLoadGame(game)}>
                    {game.isAutoSave && <AutoSaveBadge>Otomatik Kayıt</AutoSaveBadge>}
                    <SlotIndicator>Slot {game.saveSlot || 1}</SlotIndicator>
                    
                    <GameName>{game.saveName}</GameName>
                    
                    <div>
                      <strong>Karakter:</strong> {game.characterName || 'Bilinmiyor'}
                    </div>
                    
                    {game.partyName && (
                      <GameParty>
                        <strong>Parti:</strong>&nbsp;
                        <PartyBadge color={game.partyColor}>
                          {game.partyShortName}
                        </PartyBadge>
                        {game.partyName}
                      </GameParty>
                    )}
                    
                    <GameDate>
                      <strong>Son Güncelleme:</strong> {formatDate(game.updatedAt)}
                    </GameDate>
                    
                    <ActionButtons>
                      <ActionButton onClick={(e) => {
                        e.stopPropagation();
                        handleLoadGame(game);
                      }}>
                        Yükle
                      </ActionButton>
                      
                      {/* Otomatik kayıtlar silinemez */}
                      {!game.isAutoSave && (
                        <DeleteButton 
                          onClick={(e) => handleDeleteGame(game.id, e)}
                          disabled={deletingGame === game.id}
                        >
                          {deletingGame === game.id ? 'Siliniyor...' : 'Sil'}
                        </DeleteButton>
                      )}
                    </ActionButtons>
                  </GameCard>
                ))}
              </GamesList>
            )}
          </>
        )}
      </ContentArea>
      
      <Controls>
        <Button onClick={returnToMenu}>Ana Menü</Button>
        {isLoggedIn && !loading && allSavedGames.length > 0 && (
          <Button onClick={fetchSavedGames}>Yenile</Button>
        )}
      </Controls>
    </LoadGameContainer>
  );
};

export default LoadGame;
