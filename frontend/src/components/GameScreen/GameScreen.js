// [1] Gerekli kütüphaneler
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import CountryManagementPanel from '../CountryManagementPanel/CountryManagementPanel';
import apiHelper from '../../services/apiHelper';

// [2] Stil bileşenleri ve UI yapısı - Kullanıcıdan
const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(to bottom, #1a2a3a, #0a1a2a);
  color: white;
  font-family: 'Orbitron', sans-serif;
  overflow: hidden;
`;

const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(0, 30, 60, 0.7);
  border-bottom: 1px solid rgba(0, 200, 255, 0.3);
  height: 64px;
  z-index: 10;
`;

const GameTitle = styled.h2`
  margin: 0;
  color: rgba(0, 200, 255, 0.8);
`;

const HeaderControls = styled.div`
  display: flex;
  gap: 1rem;
`;

const InfoText = styled.div`
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
`;

const GameCanvas = styled.div`
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
`;

const SideMenu = styled.div`
  width: 200px;
  background: rgba(0, 20, 40, 0.8);
  border-right: 1px solid rgba(0, 200, 255, 0.3);
  padding: 1rem 0;
  overflow-y: auto;
`;

const MenuButton = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1.5rem;
  background: ${(props) => (props.active ? 'rgba(0, 100, 200, 0.5)' : 'transparent')};
  border: none;
  color: white;
  text-align: left;
  font-family: 'Orbitron', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    background: rgba(0, 100, 200, 0.3);
  }
`;

const MainContent = styled.div`
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
`;

const TabContent = styled.div`
  padding: 20px;
  background: rgba(0, 30, 60, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(0, 200, 255, 0.3);
  height: 100%;
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

const GameScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [slotId, setSlotId] = useState(1);
  const [character, setCharacter] = useState(null);
  const [party, setParty] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [gamePaused, setGamePaused] = useState(false);
  const [showCountryPanel, setShowCountryPanel] = useState(false);

  useEffect(() => {
    const loadSlotData = async () => {
      try {
        setIsLoading(true);
        const stateData = location.state || {};
        const slotIdFromState = stateData.slotId || 1;
        setSlotId(slotIdFromState);

        const isNewGame = stateData.newGame || false;
        const isOfflineMode = stateData.offlineMode || false;
        setOfflineMode(isOfflineMode);

        const token = localStorage.getItem('token');
        if (!token) {
          alert('Oturum bilginiz bulunamadı. Lütfen giriş yapın.');
          navigate('/login', { state: { returnUrl: '/single-player' } });
          return;
        }

        if (isNewGame && stateData.character && stateData.party) {
          setCharacter(stateData.character);
          setParty(stateData.party);

          const newGameData = createInitialGameData(stateData.character, stateData.party);
          setGameData(newGameData);
          saveGameDataToLocalStorage(slotIdFromState, newGameData, stateData.character, stateData.party);

          if (!isOfflineMode) {
            try {
              await apiHelper.post('/api/game/update-auto-save', {
                gameData: newGameData,
                slotId: slotIdFromState
              });
            } catch (error) {
              console.error('API kayıt hatası:', error);
              setOfflineMode(true);
            }
          }
        } else {
          const savedData = loadGameDataFromLocalStorage(slotIdFromState);
          if (savedData) {
            setCharacter(savedData.character);
            setParty(savedData.party);
            setGameData(savedData.gameData);
          } else {
            alert('Kayıtlı veri bulunamadı.');
            navigate('/');
            return;
          }
        }
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
        alert('Veri yüklenemedi.');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    loadSlotData();
  }, [location, navigate]);

  const createInitialGameData = (character, party) => {
    return {
      currentDate: '1 Ocak 2025',
      currentWeek: 1,
      currentMonth: 1,
      currentYear: 2025,
      characterId: character.id || Date.now(),
      partyId: party.id || Date.now(),
      popularity: 30,
      funds: 1500000,
      supporters: 0,
      seats: 0,
      totalSeats: 600,
      achievements: [],
      completedEvents: [],
      relationships: {},
      lastSave: new Date().toISOString()
    };
  };

  const saveGameDataToLocalStorage = (slotId, gameData, character, party) => {
    try {
      const saveData = {
        gameData,
        character,
        party,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem(`gameData_slot_${slotId}`, JSON.stringify(saveData));
    } catch (error) {
      console.error('Yerel kayıt hatası:', error);
    }
  };

  const loadGameDataFromLocalStorage = (slotId) => {
    try {
      const savedData = localStorage.getItem(`gameData_slot_${slotId}`);
      return savedData ? JSON.parse(savedData) : null;
    } catch (error) {
      console.error('Yerel yükleme hatası:', error);
      return null;
    }
  };

  const saveGame = async () => {
    const currentGameData = { ...gameData, lastSave: new Date().toISOString() };
    saveGameDataToLocalStorage(slotId, currentGameData, character, party);
    if (!offlineMode) {
      try {
        await apiHelper.post('/api/game/save-game', {
          gameData: currentGameData,
          saveName: `${character?.fullName} - ${party?.name} - ${currentGameData.currentDate}`,
          saveSlot: slotId,
          slotId
        });
        alert('Oyun kaydedildi.');
      } catch (error) {
        console.error('API kaydetme hatası:', error);
        alert('Yalnızca yerel olarak kaydedildi.');
        setOfflineMode(true);
      }
    } else {
      alert('Yerel olarak kaydedildi.');
    }
    setGameData(currentGameData);
  };

  const returnToMenu = () => {
    navigate('/');
  };

  const togglePause = () => {
    setGamePaused(!gamePaused);
  };

  const renderTabContent = () => {
    if (!gameData) return <div>Veri yükleniyor...</div>;
    return (
      <TabContent>
        <h2>Ana Gösterge Paneli</h2>
        <p>Popülarite: %{gameData.popularity}</p>
        <p>Fon: {gameData.funds.toLocaleString()} ₺</p>
        <p>Koltuk: {gameData.seats}/{gameData.totalSeats}</p>
      </TabContent>
    );
  };

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <GameContainer>
      <GameHeader>
        <GameTitle>{character?.fullName || 'Karakter'} - {party?.shortName || 'Parti'}</GameTitle>
        <HeaderControls>
          <InfoText>Tarih: {gameData?.currentDate}</InfoText>
          <InfoText>Popülerlik: %{gameData?.popularity}</InfoText>
          <InfoText>Fon: {gameData?.funds.toLocaleString()} ₺</InfoText>
          {offlineMode && <InfoText>Çevrimdışı Mod</InfoText>}
        </HeaderControls>
      </GameHeader>

      <GameCanvas>
        <SideMenu>
          <MenuButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>Ana Sayfa</MenuButton>
        </SideMenu>
        <MainContent>
          {renderTabContent()}
        </MainContent>
        <CountryManagementPanel
          isOpen={true}
          onClose={() => {}}
          populationData={{
            total: 85250000,
            urban: 76725000,
            rural: 8525000,
            regions: {
              'Marmara': 25575000,
              'İç Anadolu': 14492500,
              'Ege': 11085000,
              'Akdeniz': 10997500,
              'Karadeniz': 8100000,
              'Güneydoğu Anadolu': 9377500,
              'Doğu Anadolu': 5622500
            }
          }}
        />
      </GameCanvas>

      <GameControls>
        <Button onClick={returnToMenu}>Ana Menü</Button>
        <div>
          <Button onClick={togglePause}>{gamePaused ? 'Devam Et' : 'Duraklat'}</Button>
          <Button onClick={() => setGameData(prev => ({ ...prev, currentMonth: prev.currentMonth + 1 }))}>İlerle (1 Ay)</Button>
        </div>
        <Button onClick={saveGame}>Kaydet</Button>
      </GameControls>
    </GameContainer>
  );
};

export default GameScreen;
