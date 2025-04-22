// src/components/SinglePlayer.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import apiHelper from '../services/apiHelper';

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

const PartyBadge = styled.div`
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  margin-right: 8px;
  font-weight: bold;
  background-color: ${props => props.color || '#555555'};
  color: ${props => getContrastTextColor(props.color) || '#ffffff'};
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

const ErrorText = styled.div`
  font-size: 1.2rem;
  color: #ff5555;
  text-align: center;
  margin: 1rem 0;
  background: rgba(255, 0, 0, 0.1);
  padding: 1rem;
  border-radius: 5px;
  border: 1px solid rgba(255, 0, 0, 0.3);
  max-width: 80%;
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

const SinglePlayer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [gameStarted, setGameStarted] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [character, setCharacter] = useState(null);
  const [party, setParty] = useState(null);
  const [hasCharacter, setHasCharacter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoSave, setAutoSave] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [gameData, setGameData] = useState({
    score: 0,
    level: 1,
    // Diğer oyun verileri...
  });
  
  // Çoklu slot desteği için eklenmiş state'ler
  const [availableSlots, setAvailableSlots] = useState([
    { id: 1, name: "Slot 1", character: null, hasData: false },
    { id: 2, name: "Slot 2", character: null, hasData: false },
    { id: 3, name: "Slot 3", character: null, hasData: false }
  ]);
  const [selectedSlot, setSelectedSlot] = useState(1);
  const [showSlotSelection, setShowSlotSelection] = useState(true);
  
  // Oyun açılışında hazırlık
  useEffect(() => {
    // 1. Location state'ten yüklenen oyun kontrolü
    if (location.state?.loadedGame) {
      console.log("URL'den oyun verisi alındı, oyun yükleniyor...");
      loadGameFromState(location.state.loadedGame);
      return;
    }
    
    // 2. Kullanıcı giriş kontrolü
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log("Token bulunamadı, giriş sayfasına yönlendiriliyor");
      navigate('/login', { state: { returnUrl: '/single-player' } });
      return;
    }
    
    // 3. Tüm slotları ve kayıtları kontrol et
    fetchAllCharactersAndSaves();
  }, [location.pathname]); // sadece path değişirse çalışsın
  
  // Tüm karakterleri ve kayıtları yükleme fonksiyonu
  const fetchAllCharactersAndSaves = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Token kontrolü
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login', { state: { returnUrl: '/single-player' } });
        return;
      }
      
      // Tüm karakterleri getir
      const characterResponse = await apiHelper.get('/api/character/get-all-characters');
      
      if (characterResponse.success && characterResponse.data.characters) {
        // Slot verilerini güncelle
        const updatedSlots = [...availableSlots];
        
        characterResponse.data.characters.forEach(character => {
          const slotId = character.slotId || 1;
          if (slotId >= 1 && slotId <= 3) {
            updatedSlots[slotId - 1] = {
              ...updatedSlots[slotId - 1],
              character: character,
              hasData: true
            };
          }
        });
        
        setAvailableSlots(updatedSlots);
      }
      
      // Kayıtlı oyunları getir
      const savesResponse = await apiHelper.get('/api/game/saved-games');
      
      if (savesResponse.success && savesResponse.data.savedGames) {
        // Her slot için otomatik kayıtları kontrol et
        const autoSaves = savesResponse.data.savedGames.filter(game => game.isAutoSave);
        
        const updatedSlots = [...availableSlots];
        autoSaves.forEach(save => {
          const slotId = save.slotId || 1;
          if (slotId >= 1 && slotId <= 3) {
            updatedSlots[slotId - 1] = {
              ...updatedSlots[slotId - 1],
              autoSave: save,
              hasData: true
            };
          }
        });
        
        setAvailableSlots(updatedSlots);
      }
      
    } catch (error) {
      console.error("Karakter ve kayıt verilerini yükleme hatası:", error);
      setError("Karakter verilerine erişilemiyor. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setIsLoading(false);
      setAuthChecked(true);
    }
  };
  
  // URL state'inden gelen oyun verisini yükle
  const loadGameFromState = async (gameInfo) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Oyun verilerini yükle
      const response = await apiHelper.get(`/api/game/load-game/${gameInfo.id}`);
      
      if (response.success) {
        const saveData = response.data.saveData;
        
        // Karakter ve parti verilerini kontrol et
        if (!saveData.character) {
          setError(`Kayıt ID: ${gameInfo.id} - Karakter verisi eksik`);
          setIsLoading(false);
          return;
        }
        
        // Karakter, parti ve oyun verilerini ayarla
        setCharacter(saveData.character);
        setParty(saveData.party);
        setGameData(saveData.gameData);
        setHasCharacter(true);
        
        // Verileri localStorage'a da kaydet
        localStorage.setItem('characterData', JSON.stringify(saveData.character));
        if (saveData.party) {
          localStorage.setItem('partyData', JSON.stringify(saveData.party));
        }
        
        // Slot bilgisi varsa al
        const slotId = saveData.character.slotId || 1;
        setSelectedSlot(slotId);
        setShowSlotSelection(false);
        
        // Oyun durumuna göre başlangıç ekranını ayarla ya da GameDashboard'a yönlendir
        if (saveData.gameData.gameState === 'active' || saveData.gameData.gameState === 'paused') {
          // GameDashboard'a yönlendir ve gerekli verileri aktar
          navigate('/game-dashboard', { 
            state: { 
              character: saveData.character,
              party: saveData.party,
              gameData: saveData.gameData,
              saveId: gameInfo.id,
              slotId: slotId
            }
          });
        } else {
          setGameStarted(false);
          setGamePaused(false);
        }
      } else {
        console.error("Oyun yükleme başarısız:", response.message);
        setError("Oyun yüklenirken bir hata oluştu: " + response.message);
      }
    } catch (error) {
      console.error("Oyun yükleme hatası:", error);
      setError("Sunucu bağlantı hatası. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setIsLoading(false);
      setAuthChecked(true);
    }
  };
  
  // Slot seçildiğinde çağrılacak fonksiyon
  const handleSlotSelect = async (slotId) => {
    setSelectedSlot(slotId);
    
    // Seçilen slotta karakter var mı kontrol et
    const selectedSlotData = availableSlots[slotId - 1];
    
    if (selectedSlotData.hasData) {
      // Bu slotta data varsa, otomatik kayıt varsa göster
      if (selectedSlotData.autoSave) {
        setAutoSave(selectedSlotData.autoSave);
      }
      
      // Karakter verisi varsa, karakteri yükle
      if (selectedSlotData.character) {
        setCharacter(selectedSlotData.character);
        setHasCharacter(true);
        
        // Karakter ile ilişkili parti verilerini kontrol et
        try {
          const partyResponse = await apiHelper.get(`/api/game/get-party/${selectedSlotData.character.id}`);
          if (partyResponse.success && partyResponse.data.party) {
            setParty(partyResponse.data.party);
          } else {
            setParty(null);
          }
        } catch (error) {
          console.error("Parti verisi yükleme hatası:", error);
          setParty(null);
        }
      }
    } else {
      // Slot boşsa karakter oluşturmaya yönlendir
      setHasCharacter(false);
      setCharacter(null);
      setParty(null);
    }
    
    setShowSlotSelection(false);
  };
  
  // Otomatik kaydı yükle
  const loadAutoSave = async () => {
    if (!autoSave) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Otomatik kaydı getir
      const response = await apiHelper.get(`/api/game/load-game/${autoSave.id}`);
      
      if (response.success) {
        const saveData = response.data.saveData;
        
        // Karakter verilerini kontrol et
        if (!saveData.character) {
          setError("Otomatik kayıtta karakter verisi eksik");
          setIsLoading(false);
          return;
        }
        
        // Slot bilgisini kontrol et
        const slotId = saveData.character.slotId || selectedSlot;
        
        // Karakter ve parti verilerini localStorage'a kaydet
        localStorage.setItem('characterData', JSON.stringify(saveData.character));
        if (saveData.party) {
          localStorage.setItem('partyData', JSON.stringify(saveData.party));
        }
        
        // GameDashboard'a yönlendir
        navigate('/game-dashboard', { 
          state: { 
            character: saveData.character,
            party: saveData.party,
            gameData: saveData.gameData,
            saveId: autoSave.id,
            slotId: slotId
          }
        });
      } else {
        console.error("Otomatik kayıt yükleme başarısız:", response.message);
        setError("Oyun yüklenirken bir hata oluştu: " + response.message);
      }
    } catch (error) {
      console.error("Otomatik kayıt yükleme hatası:", error);
      setError("Sunucu bağlantı hatası. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setIsLoading(false);
      setAutoSave(null); // Otomatik kayıt göstergesini kaldır
    }
  };
  
  // Yeni oyun başlat - Yeni karakter oluşturmaya yönlendir
  const startNewGame = () => {
    // Mevcut karakter ve parti verilerini temizle
    setCharacter(null);
    setParty(null);
    setHasCharacter(false);
    setAutoSave(null);
    
    // LocalStorage'ı temizle
    localStorage.removeItem('characterData');
    localStorage.removeItem('partyData');
    
    // Karakter oluşturma sayfasına yönlendir
    navigate('/character-creator', { state: { slotId: selectedSlot } });
  };
  
  // Yeni karakter oluştur
  const createNewCharacter = () => {
    // Slot bilgisini de geçir
    navigate('/character-creator', { state: { slotId: selectedSlot } });
  };
  
  // Oyunu başlat
  const startGame = () => {
    // Karakter ve parti verilerini kontrol et
    if (!character) {
      setError("Oyunu başlatmak için karakter verisi gerekiyor");
      return;
    }
    
    // Oyun verisini güncelle
    const updatedGameData = {
      ...gameData,
      gameState: 'active',
      lastSave: new Date().toISOString()
    };
    
    setGameData(updatedGameData);
    
    // GameDashboard sayfasına yönlendir
    navigate('/game-dashboard', { 
      state: { 
        character: character,
        party: party,
        gameData: updatedGameData,
        slotId: selectedSlot
      }
    });
  };
  
  // Oyunu durdur
  const pauseGame = () => {
    // Durdurulmuş/devam edilmiş durumunu değiştir
    const isPaused = !gamePaused;
    
    // Oyun verisini güncelle
    const updatedGameData = {
      ...gameData,
      gameState: isPaused ? 'paused' : 'active',
      lastSave: new Date().toISOString()
    };
    
    setGameData(updatedGameData);
    setGamePaused(isPaused);
    
    // Otomatik kayıt güncelle
    updateAutoSave(updatedGameData);
  };
  
  // Oyunu kaydet
  const saveGame = async () => {
    try {
      // Oyunu manuel olarak kaydet (yeni bir slot'a)
      const saveSlot = 2; // Manuel kayıtlar için 2 ve üstü slotları kullanıyoruz
      
      const updatedGameData = {
        ...gameData,
        lastSave: new Date().toISOString()
      };
      
      const response = await apiHelper.post('/api/game/save-game', {
        gameData: updatedGameData,
        saveName: `${character.fullName}'in Oyunu`,
        saveSlot,
        slotId: selectedSlot
      });
      
      if (response.success) {
        alert('Oyun başarıyla kaydedildi!');
        setGameData(updatedGameData);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Oyun kaydedilirken hata:', error);
      alert('Oyun kaydedilirken bir hata oluştu.');
    }
  };
  
  // Otomatik kayıt güncelleme
  const updateAutoSave = async (updatedGameData) => {
    try {
      const response = await apiHelper.post('/api/game/update-auto-save', {
        gameData: updatedGameData,
        slotId: selectedSlot
      });
      
      if (!response.success) {
        console.error("Otomatik kayıt güncellenemedi:", response.message);
      }
    } catch (error) {
      console.error("Otomatik kayıt güncelleme hatası:", error);
    }
  };
  
  // Ana menüye dön
  const returnToMenu = () => {
    navigate('/');
  };

  // Slot seçim ekranını oluştur
  const renderSlotSelection = () => {
    return (
      <GameOverlay>
        <OverlayText>Oyun Slotu Seçin</OverlayText>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '400px' }}>
          {availableSlots.map((slot) => (
            <div 
              key={slot.id}
              style={{
                background: 'rgba(0, 30, 60, 0.7)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid rgba(0, 200, 255, 0.3)',
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
              onClick={() => handleSlotSelect(slot.id)}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: 'rgba(0, 200, 255, 0.8)' }}>{slot.name}</h3>
                {slot.hasData ? (
                  <span style={{ 
                    background: 'rgba(0, 200, 255, 0.3)', 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '4px',
                    fontSize: '0.8rem'
                  }}>
                    Kayıt Var
                  </span>
                ) : (
                  <span style={{ 
                    background: 'rgba(100, 100, 100, 0.3)', 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '4px',
                    fontSize: '0.8rem'
                  }}>
                    Boş
                  </span>
                )}
              </div>
              
              {slot.hasData && slot.character && (
                <div style={{ marginTop: '0.75rem' }}>
                  <div><strong>Karakter:</strong> {slot.character.fullName}</div>
                  {slot.autoSave && (
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)', marginTop: '0.25rem' }}>
                      Son Oynama: {new Date(slot.autoSave.updatedAt).toLocaleString('tr-TR')}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </GameOverlay>
    );
  };

  // Karakter oluşturma ekranını oluştur
  const renderCreateCharacter = () => {
    return (
      <GameOverlay>
        <OverlayText>Karakter Bulunamadı</OverlayText>
        <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          Bu slot için bir karakter oluşturmanız gerekmektedir.
        </p>
        <ButtonsContainer>
          <Button onClick={createNewCharacter}>Yeni Karakter Oluştur</Button>
          <Button onClick={() => setShowSlotSelection(true)}>
            Başka Slot Seç
          </Button>
        </ButtonsContainer>
      </GameOverlay>
    );
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
        {/* Hata mesajları */}
        {error && (
          <ErrorText>{error}</ErrorText>
        )}
        
        {/* Slot seçim ekranı */}
        {authChecked && showSlotSelection && renderSlotSelection()}
        
        {/* Karakter bulunamadığında */}
        {authChecked && !showSlotSelection && !hasCharacter && !error && renderCreateCharacter()}
        
        {/* Otomatik kayıt varsa göster */}
        {authChecked && !showSlotSelection && hasCharacter && autoSave && !gameStarted && !error && (
          <GameOverlay>
            <OverlayText>Kayıtlı Oyun Bulundu</OverlayText>
            <CharacterInfoCard>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'rgba(0, 200, 255, 0.8)' }}>
                Otomatik Kayıt Bilgileri
              </h3>
              
              <CharacterDetail>
                <CharacterLabel>Karakter:</CharacterLabel>
                <span>{autoSave.characterName}</span>
              </CharacterDetail>
              
              {autoSave.partyName && (
                <CharacterDetail>
                  <CharacterLabel>Parti:</CharacterLabel>
                  <span>
                    <PartyBadge color={autoSave.partyColor}>
                      {autoSave.partyShortName}
                    </PartyBadge>
                    {autoSave.partyName}
                  </span>
                </CharacterDetail>
              )}
              
              <CharacterDetail>
                <CharacterLabel>Son Güncelleme:</CharacterLabel>
                <span>{new Date(autoSave.updatedAt).toLocaleString('tr-TR')}</span>
              </CharacterDetail>
            </CharacterInfoCard>
            
            <ButtonsContainer>
              <Button onClick={loadAutoSave}>Kayıtlı Oyunu Yükle</Button>
              <Button onClick={startNewGame}>Yeni Karakter Oluştur</Button>
              <Button onClick={() => setShowSlotSelection(true)}>Başka Slot Seç</Button>
            </ButtonsContainer>
          </GameOverlay>
        )}
        
        {/* Karakteri olan ama henüz oyuna başlamamış kullanıcılar için */}
        {authChecked && !showSlotSelection && hasCharacter && !autoSave && !gameStarted && !error && (
          <GameOverlay>
            <OverlayText>Oyunu Başlatmak İçin Hazır mısın?</OverlayText>
            
            <CharacterInfoCard>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'rgba(0, 200, 255, 0.8)' }}>
                Karakter Bilgileri
              </h3>
              
              {character ? (
                <>
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
                  
                  {party && (
                    <CharacterDetail>
                      <CharacterLabel>Parti:</CharacterLabel>
                      <span>
                        <PartyBadge color={party.colorId}>
                          {party.shortName}
                        </PartyBadge>
                        {party.name}
                      </span>
                    </CharacterDetail>
                  )}
                </>
              ) : (
                <div>Karakter bilgileri yüklenemedi. Lütfen karakter oluşturun.</div>
              )}
            </CharacterInfoCard>
            
            {/* Parti kurma veya oyunu başlatma seçenekleri */}
            <ButtonsContainer>
              {character && !party && (
                <Button onClick={() => navigate('/party-creator', { state: { slotId: selectedSlot } })}>
                  Parti Kur
                </Button>
              )}
              <Button onClick={character ? startGame : createNewCharacter}>
                {character ? 'Oyunu Başlat' : 'Karakter Oluştur'}
              </Button>
              <Button onClick={startNewGame}>Yeni Karakter Oluştur</Button>
              <Button onClick={() => setShowSlotSelection(true)}>Başka Slot Seç</Button>
            </ButtonsContainer>
          </GameOverlay>
        )}
        
        {/* Oyun duraklatıldığında */}
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
          <div style={{ fontSize: '1.5rem', textAlign: 'center' }}>
            <h3>Aktif Oyun</h3>
            {party && (
              <div>
                <PartyBadge color={party.colorId}>
                  {party.shortName}
                </PartyBadge>
                {party.name} partisinin lideri olarak ülke yönetimini ele geçirmeye çalışıyorsunuz.
              </div>
            )}
            <p>Oyun modülleri entegrasyonu devam ediyor...</p>
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
