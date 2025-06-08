// src/components/SinglePlayer.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import apiHelper from '../services/apiHelper';
import gameService from '../services/gameService';


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
  overflow-y: auto;
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
  overflow-y: auto;
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
  const [isLoading, setIsLoading] = useState(true);
  const [character, setCharacter] = useState(null);
  const [party, setParty] = useState(null);
  const [hasCharacter, setHasCharacter] = useState(false);
  const [autoSave, setAutoSave] = useState(null);
  const [selectedSaveSlot, setSelectedSaveSlot] = useState(1); // Varsayılan slot 1

  // Oyun açılışında hazırlık
  useEffect(() => {
    const prepareGame = async () => {
      try {
        setIsLoading(true);
        
        // URL'den veya state'den slot bilgisini al
        const params = new URLSearchParams(location.search);
        const slotFromUrl = params.get('slot');
        
        // URL'den veya state'den slot bilgisini al
        const saveSlot = slotFromUrl ? parseInt(slotFromUrl) : 
                      location.state?.slotId ? location.state.slotId : 1;
                      
        setSelectedSaveSlot(saveSlot);
        
        // Token kontrolü
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login', { state: { returnUrl: `/single-player?slot=${saveSlot}` } });
          return;
        }
        
        // İlgili slot için karakter bilgilerini kontrol et
        try {
          // Önce API'den sorgula
          const characterResponse = await apiHelper.get(`/api/game/get-character?slotId=${saveSlot}`);
          
          if (characterResponse.success && characterResponse.data.character) {
            setCharacter(characterResponse.data.character);
            setHasCharacter(true);
            
            // Parti kontrolü
            const partyResponse = await apiHelper.get(`/api/game/get-party?slotId=${saveSlot}`);
            if (partyResponse.success && partyResponse.data.party) {
              setParty(partyResponse.data.party);
            }
          } else {
            // API'den veri alınamazsa localStorage kontrolü yap
            const localCharacter = localStorage.getItem(`characterData_slot_${saveSlot}`);
            if (localCharacter) {
              const characterData = JSON.parse(localCharacter);
              setCharacter(characterData);
              setHasCharacter(true);
              
              // Parti kontrolü
              const localParty = localStorage.getItem(`partyData_slot_${saveSlot}`);
              if (localParty) {
                setParty(JSON.parse(localParty));
              }
            } else {
              setHasCharacter(false);
            }
          }
        } catch (error) {
          // API hatası durumunda localStorage kontrolü yap
          console.error("API'den karakter/parti verisi alınamadı:", error);
          
          const localCharacter = localStorage.getItem(`characterData_slot_${saveSlot}`);
          if (localCharacter) {
            const characterData = JSON.parse(localCharacter);
            setCharacter(characterData);
            setHasCharacter(true);
            
            // Parti kontrolü
            const localParty = localStorage.getItem(`partyData_slot_${saveSlot}`);
            if (localParty) {
              setParty(JSON.parse(localParty));
            }
          } else {
            setHasCharacter(false);
          }
        }
        
        // Otomatik kayıtları kontrol et
        try {
          const savedGamesResponse = await apiHelper.get('/api/game/saved-games');
          if (savedGamesResponse.success && savedGamesResponse.data.savedGames?.length > 0) {
            const autoSaves = savedGamesResponse.data.savedGames.filter(
              save => save.isAutoSave && save.slotId === saveSlot
            );
            
            if (autoSaves.length > 0) {
              setAutoSave(autoSaves[0]);
            }
          }
        } catch (error) {
          console.error("Otomatik kayıt kontrolü hatası:", error);
        }
        
      } catch (error) {
        console.error("Oyun hazırlama hatası:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    prepareGame();
  }, [location, navigate]);
  
  // Otomatik kaydı yükle
  const loadAutoSave = () => {
    if (!autoSave) return;
    
    // Oyun ekranına yönlendir
    navigate('/game-screen', { 
      state: { 
        slotId: selectedSaveSlot,
        saveId: autoSave.id,
        character: character,
        party: party
      }
    });
  };
  
  // Yeni oyun başlat
  const startNewGame = () => {
    // Otomatik kayıt göstergesini kaldır
    setAutoSave(null);
    
    if (hasCharacter && party) {
      // Karakter ve parti varsa, doğrudan oyun ekranına yönlendir
      navigate('/game-screen', { 
        state: { 
          character: character,
          party: party,
          slotId: selectedSaveSlot,
          newGame: true
        }
      });
    } else if (hasCharacter && !party) {
      // Karakter var ama parti yoksa, parti oluşturmaya yönlendir
      navigate('/party-creator', { 
        state: { 
          character: character,
          slotId: selectedSaveSlot 
        }
      });
    } else {
      // Karakter yoksa, karakter oluşturmaya yönlendir
      navigate('/character-creator', { 
        state: { 
          slotId: selectedSaveSlot 
        }
      });
    }
  };
  
  // Ana menüye dön
  const returnToMenu = () => {
    navigate('/');
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
      </GameHeader>
      
      <GameCanvas>
        {/* Karakter bulunamadığında */}
        {!hasCharacter && (
          <GameOverlay>
            <OverlayText>Karakter Bulunamadı</OverlayText>
            <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              Oyunu oynamak için bir karakter oluşturmanız gerekmektedir.
            </p>
            <Button onClick={startNewGame}>Yeni Karakter Oluştur</Button>
          </GameOverlay>
        )}
        
        {/* Otomatik kayıt varsa göster */}
        {hasCharacter && autoSave && (
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
              <Button onClick={startNewGame}>Yeni Oyun Başlat</Button>
            </ButtonsContainer>
          </GameOverlay>
        )}
        
        {/* Karakteri olan ama otomatik kaydı olmayan kullanıcılar için */}
        {hasCharacter && !autoSave && (
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
                  (character.ideology.overallPosition < 35 ? "Sol" :
                    character.ideology.overallPosition < 48 ? "Merkez Sol" :
                    character.ideology.overallPosition < 52 ? "Merkez" :
                    character.ideology.overallPosition < 65 ? "Merkez Sağ" : "Sağ") 
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
              <Button onClick={startNewGame}>Oyunu Başlat</Button>
            </div>
          </GameOverlay>
        )}
      </GameCanvas>
      
      <GameControls>
        <Button onClick={returnToMenu}>Ana Menü</Button>
      </GameControls>
    </GameContainer>
  );
};

export default SinglePlayer;
