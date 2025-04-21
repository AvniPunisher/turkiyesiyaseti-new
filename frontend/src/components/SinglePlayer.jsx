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

const ErrorMessage = styled.div`
  color: #ff5555;
  background: rgba(180, 30, 30, 0.2);
  border: 1px solid #ff5555;
  padding: 1rem;
  border-radius: 5px;
  margin: 1rem 0;
  max-width: 500px;
  width: 100%;
  text-align: center;
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
  const [autoSave, setAutoSave] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [error, setError] = useState(null);
  const [gameData, setGameData] = useState({
    score: 0,
    level: 1,
    // Diğer oyun verileri...
  });
  
  // Hata durumunu resetle ve yeni sayfa yüklendiğinde yeniden kontrol et
  useEffect(() => {
    setError(null);
    setIsLoading(true);
    checkAuthAndGameState();
  }, [location.pathname, location.search]);
  
  // Yetkilendirme ve oyun durumu kontrol fonksiyonu
  const checkAuthAndGameState = async () => {
    try {
      // 1. Token kontrolü
      const token = localStorage.getItem('token');
      if (!token) {
        console.log("Token bulunamadı, giriş sayfasına yönlendiriliyor");
        navigate('/login', { state: { returnUrl: '/single-player' } });
        return;
      }
      
      // 2. Location state'ten yüklenen oyun kontrolü
      if (location.state?.loadedGame) {
        console.log("URL'den oyun verisi alındı, oyun yükleniyor...");
        await loadGameFromState(location.state.loadedGame);
        return;
      }
      
      // 3. Otomatik kayıt kontrolü
      await checkAutoSave(token);
    } catch (err) {
      console.error("Oyun durumu kontrolü hatası:", err);
      setError("Oyun durumu kontrol edilirken bir hata oluştu: " + err.message);
      setIsLoading(false);
      setAuthChecked(true);
    }
  };
  
  // URL state'inden gelen oyun verisini yükle
  const loadGameFromState = async (gameInfo) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Oyun yükleniyor, ID:", gameInfo.id);
      
      if (!gameInfo || !gameInfo.id) {
        throw new Error("Geçersiz oyun bilgisi");
      }
      
      // Oyun verilerini yükle
      const response = await apiHelper.get(`/api/game/load-game/${gameInfo.id}`);
      
      if (response.success && response.data.saveData) {
        const saveData = response.data.saveData;
        console.log("Oyun yüklendi:", saveData);
        
        // Karakter ve parti kontrolü
        if (!saveData.character) {
          throw new Error("Yüklenen oyunda karakter verisi eksik");
        }
        
        // Karakter, parti ve oyun verilerini ayarla
        setCharacter(saveData.character);
        setParty(saveData.party);
        setGameData(saveData.gameData || {});
        setHasCharacter(true);
        
        // Oyun durumuna göre başlangıç ekranını ayarla
        if (saveData.gameData && 
            (saveData.gameData.gameState === 'active' || 
             saveData.gameData.gameState === 'paused')) {
          setGameStarted(true);
          setGamePaused(saveData.gameData.gameState === 'paused');
        }
      } else {
        console.error("Oyun yükleme başarısız:", response.message);
        throw new Error("Oyun yüklenirken bir hata oluştu: " + (response.message || "Beklenmeyen yanıt"));
      }
    } catch (error) {
      console.error("Oyun yükleme hatası:", error);
      setError("Oyun yüklenirken bir hata oluştu: " + error.message);
      // Arka planda karakter kontrolü yap - belki oyun yüklenmedi ama karakterimiz var
      try {
        await checkExistingCharacter(localStorage.getItem('token'));
      } catch (err) {
        console.error("Karakter kontrolü hatası:", err);
      }
    } finally {
      setIsLoading(false);
      setAuthChecked(true);
    }
  };
  
  // Otomatik kayıtlı oyun kontrolü
  const checkAutoSave = async (token) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Kayıtlı oyunları getir
      const response = await apiHelper.get('/api/game/saved-games');
      
      if (response.success && response.data.savedGames?.length > 0) {
        // Otomatik kayıtları filtrele
        const autoSaves = response.data.savedGames.filter(game => game.isAutoSave);
        
        if (autoSaves.length > 0) {
          console.log("Otomatik kayıt bulundu:", autoSaves[0]);
          setAutoSave(autoSaves[0]);
          setHasCharacter(true);
          
          // Otomatik kayıt direkt yüklenmez, kullanıcıya seçenek sunulur
        } else {
          // Otomatik kayıt yoksa karakter kontrolü yap
          await checkExistingCharacter(token);
        }
      } else {
        // Kayıtlı oyun yoksa karakter kontrolü yap
        await checkExistingCharacter(token);
      }
    } catch (error) {
      console.error("Otomatik kayıt kontrolü hatası:", error);
      setError("Otomatik kayıt kontrol edilirken bir hata oluştu: " + error.message);
      // Yine de karakteri kontrol et
      await checkExistingCharacter(token);
    } finally {
      setIsLoading(false);
      setAuthChecked(true);
    }
  };
  
  // Karakter kontrolü
  const checkExistingCharacter = async (token) => {
    try {
      if (!token) return;
      
      console.log("Karakter kontrol ediliyor...");
      
      // Karakter bilgilerini getir
      const charResponse = await apiHelper.get('/api/game/get-character');
      
      if (charResponse.success && charResponse.data.character) {
        console.log("Karakter bulundu:", charResponse.data.character);
        setCharacter(charResponse.data.character);
        setHasCharacter(true);
        
        // Karakter varsa parti kontrolü yap
        await checkExistingParty(token, charResponse.data.character.id);
      } else {
        console.log("Karakter bulunamadı");
        setHasCharacter(false);
      }
    } catch (error) {
      console.error('Karakter kontrolü hatası:', error);
      
      // Token geçersizse giriş sayfasına yönlendir
      if (error.response?.status === 401) {
        console.log("Token geçersiz, giriş sayfasına yönlendiriliyor");
        localStorage.removeItem('token');
        navigate('/login', { state: { returnUrl: '/character-creator' } });
        return;
      }
      
      setHasCharacter(false);
      setError("Karakter bilgileri alınırken bir hata oluştu: " + error.message);
    }
  };
  
  // Parti kontrolü
  const checkExistingParty = async (token, characterId) => {
    try {
      if (!token || !characterId) return;
      
      console.log("Parti kontrol ediliyor...");
      
      // Parti bilgilerini getir
      const partyResponse = await apiHelper.get('/api/game/get-party');
      
      if (partyResponse.success && partyResponse.data.party) {
        console.log("Parti bulundu:", partyResponse.data.party);
        setParty(partyResponse.data.party);
      } else {
        console.log("Parti bulunamadı");
      }
    } catch (error) {
      console.error('Parti kontrolü hatası:', error);
      // Parti yoksa sorun değil, oyuna devam edilebilir
    }
  };
  
  // Otomatik kaydı yükle
  const loadAutoSave = async () => {
    if (!autoSave) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Otomatik kaydı getir
      const response = await apiHelper.get(`/api/game/load-game/${autoSave.id}`);
      
      if (response.success && response.data.saveData) {
        const saveData = response.data.saveData;
        
        // Karakter, parti ve oyun verilerini ayarla
        setCharacter(saveData.character);
        setParty(saveData.party);
        setGameData(saveData.gameData || {});
        
        // Oyun durumuna göre başlangıç ekranını ayarla
        if (saveData.gameData && 
            (saveData.gameData.gameState === 'active' || 
             saveData.gameData.gameState === 'paused')) {
          setGameStarted(true);
          setGamePaused(saveData.gameData.gameState === 'paused');
        }
      } else {
        console.error("Otomatik kayıt yükleme başarısız:", response.message);
        setError("Otomatik kayıt yüklenirken bir hata oluştu: " + response.message);
      }
    } catch (error) {
      console.error("Otomatik kayıt yükleme hatası:", error);
      setError("Otomatik kayıt yüklenirken bir hata oluştu: " + error.message);
    } finally {
      setIsLoading(false);
      setAutoSave(null); // Otomatik kayıt göstergesini kaldır
    }
  };
  
  // Yeni oyun başlat
  const startNewGame = () => {
    setAutoSave(null); // Otomatik kayıt göstergesini kaldır
    // Karakterimiz ve varsa partimiz ile direkt yeni oyun başlatılır
  };
  
  // Oyun döngüsü
  useEffect(() => {
    if (!gameStarted || gamePaused) return;
    
    // Oyun döngüsü kodları buraya gelecek
    
    return () => {
      // Temizleme kodları
    };
  }, [gameStarted, gamePaused]);
  
  // Oyunu başlat
  const startGame = () => {
    try {
      // Oyun verisini güncelle
      const updatedGameData = {
        ...gameData,
        gameState: 'active',
        lastSave: new Date().toISOString()
      };
      
      setGameData(updatedGameData);
      setGameStarted(true);
      setGamePaused(false);
      
      // Otomatik kayıt güncelle
      updateAutoSave(updatedGameData);
    } catch (error) {
      console.error("Oyun başlatma hatası:", error);
      setError("Oyun başlatılırken bir hata oluştu: " + error.message);
    }
  };
  
  // Oyunu durdur
  const pauseGame = () => {
    try {
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
    } catch (error) {
      console.error("Oyun duraklatma hatası:", error);
      setError("Oyun duraklatılırken bir hata oluştu: " + error.message);
    }
  };
  
  // Oyunu kaydet
  const saveGame = async () => {
    try {
      setError(null);
      
      // Oyunu manuel olarak kaydet (yeni bir slot'a)
      const saveSlot = 2; // Manuel kayıtlar için 2 ve üstü slotları kullanıyoruz
      
      const updatedGameData = {
        ...gameData,
        lastSave: new Date().toISOString()
      };
      
      const response = await apiHelper.post('/api/game/save-game', {
        gameData: updatedGameData,
        saveName: `${character?.fullName || 'Oyuncu'}'ın Oyunu`,
        saveSlot
      });
      
      if (response.success) {
        alert('Oyun başarıyla kaydedildi!');
        setGameData(updatedGameData);
      } else {
        throw new Error(response.message || "Kayıt işlemi başarısız");
      }
    } catch (error) {
      console.error('Oyun kaydedilirken hata:', error);
      setError("Oyun kaydedilirken bir hata oluştu: " + error.message);
    }
  };
  
  // Otomatik kayıt güncelleme
  const updateAutoSave = async (updatedGameData) => {
    try {
      const response = await apiHelper.post('/api/game/update-auto-save', {
        gameData: updatedGameData
      });
      
      if (!response.success) {
        console.error("Otomatik kayıt güncellenemedi:", response.message);
      }
    } catch (error) {
      console.error("Otomatik kayıt güncelleme hatası:", error);
      // Bu önemli bir hata değil, sessizce devam edelim
    }
  };
  
  // Ana menüye dön
  const returnToMenu = () => {
    navigate('/');
  };
  
  // Yeni karakter oluştur
  const createNewCharacter = () => {
    navigate('/character-creator');
  };
  
  // Bir sonraki haftayı hesapla
  const getNextWeek = (weekData) => {
    let nextWeek = weekData.week + 1;
    let nextYear = weekData.year;
    
    if (nextWeek > 52) {
      nextWeek = 1;
      nextYear += 1;
    }
    
    return { week: nextWeek, year: nextYear };
  };
  
  // Sayfayı yenile
  const handleRetry = () => {
    window.location.reload();
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
            {character.fullName} | Skor: {gameData.score || 0} | Seviye: {gameData.level || 1}
          </div>
        )}
      </GameHeader>
      
      <GameCanvas>
        {/* Hata durumunda */}
        {error && (
          <GameOverlay>
            <OverlayText>Hata Oluştu</OverlayText>
            <ErrorMessage>{error}</ErrorMessage>
            <ButtonsContainer>
              <Button onClick={handleRetry}>Tekrar Dene</Button>
              <Button onClick={returnToMenu}>Ana Menü</Button>
            </ButtonsContainer>
          </GameOverlay>
        )}
        
        {/* Karakter bulunamadığında */}
        {authChecked && !hasCharacter && !error && (
          <GameOverlay>
            <OverlayText>Karakter Bulunamadı</OverlayText>
            <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              Oyunu oynamak için bir karakter oluşturmanız gerekmektedir.
            </p>
            <Button onClick={createNewCharacter}>Yeni Karakter Oluştur</Button>
          </GameOverlay>
        )}
        
        {/* Otomatik kayıt varsa göster */}
        {authChecked && hasCharacter && autoSave && !gameStarted && !error && (
          <GameOverlay>
            <OverlayText>Kayıtlı Oyun Bulundu</OverlayText>
            <CharacterInfoCard>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'rgba(0, 200, 255, 0.8)' }}>
                Otomatik Kayıt Bilgileri
              </h3>
              
              <CharacterDetail>
                <CharacterLabel>Karakter:</CharacterLabel>
                <span>{autoSave.characterName || 'Bilinmiyor'}</span>
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
              <Button onClick={startNewGame}>Yeni Oyun Başlat</Button>
            </ButtonsContainer>
          </GameOverlay>
        )}
        
        {/* Karakteri olan ama henüz oyuna başlamamış kullanıcılar için */}
        {hasCharacter && !autoSave && !gameStarted && !error && (
          <GameOverlay>
            <OverlayText>Oyunu Başlatmak İçin Hazır mısın?</OverlayText>
            
            <CharacterInfoCard>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'rgba(0, 200, 255, 0.8)' }}>
                Karakter Bilgileri
              </h3>
              
              <CharacterDetail>
                <CharacterLabel>İsim:</CharacterLabel>
                <span>{character?.fullName || 'Bilinmiyor'}</span>
              </CharacterDetail>
              
              <CharacterDetail>
                <CharacterLabel>Yaş:</CharacterLabel>
                <span>{character?.age || '40'}</span>
              </CharacterDetail>
              
              <CharacterDetail>
                <CharacterLabel>Meslek:</CharacterLabel>
                <span>{character?.profession || 'Bilinmiyor'}</span>
              </CharacterDetail>
              
              <CharacterDetail>
                <CharacterLabel>İdeoloji:</CharacterLabel>
                <span>{character?.ideology ? 
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
            </CharacterInfoCard>
            
            {/* Parti kurma veya oyunu başlatma seçenekleri */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              {!party ? (
                <Button onClick={() => navigate('/party-creator')}>Parti Kur</Button>
              ) : null}
              <Button onClick={startGame}>Oyunu Başlat</Button>
            </div>
          </GameOverlay>
        )}
        
        {/* Oyun duraklatıldığında */}
        {gamePaused && !error && (
          <GameOverlay>
            <OverlayText>Oyun Duraklatıldı</OverlayText>
            <ButtonsContainer>
              <Button onClick={pauseGame}>Devam Et</Button>
              <Button onClick={saveGame}>Kaydet</Button>
            </ButtonsContainer>
          </GameOverlay>
        )}
        
        {/* Oyun canvas'ı buraya gelecek */}
        {gameStarted && !gamePaused && !error && (
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
        {gameStarted && !error && (
          <Button onClick={pauseGame}>
            {gamePaused ? 'Devam Et' : 'Duraklat'}
          </Button>
        )}
        {gameStarted && !gamePaused && !error && (
          <Button onClick={saveGame}>Oyunu Kaydet</Button>
        )}
      </GameControls>
    </GameContainer>
  );
};

export default SinglePlayer;
