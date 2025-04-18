// src/components/MultiPlayer.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

// Import API helper for consistent API calls
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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
  padding: 2rem;
  overflow-y: auto;
`;

const OverlayText = styled.h2`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: rgba(0, 200, 255, 0.8);
  text-align: center;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  width: 100%;
  max-width: 300px;
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
  width: 100%;
  max-width: 500px;
  background: rgba(0, 20, 40, 0.5);
  border: 1px solid rgba(0, 200, 255, 0.3);
  border-radius: 5px;
  padding: 0.5rem;
`;

const PlayerItem = styled.div`
  padding: 0.8rem;
  margin: 0.3rem 0;
  background: rgba(0, 30, 60, 0.7);
  border-radius: 3px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PlayerInfo = styled.div`
  display: flex;
  align-items: center;
`;

const PlayerAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${props => props.color || "rgba(0, 100, 200, 0.5)"};
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 0.8rem;
  font-weight: bold;
`;

const PlayerStatus = styled.span`
  padding: 0.3rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  background: ${props => props.isReady ? "rgba(56, 142, 60, 0.5)" : "rgba(211, 47, 47, 0.5)"};
`;

const InfoBox = styled.div`
  background: rgba(0, 30, 60, 0.7);
  border: 1px solid rgba(0, 200, 255, 0.3);
  border-radius: 5px;
  padding: 1rem;
  margin-top: 2rem;
  width: 100%;
  max-width: 500px;
`;

const GameOptions = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 1.5rem;
  width: 100%;
  max-width: 500px;
`;

const OptionGroup = styled.div`
  margin-bottom: 1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const NotificationBanner = styled.div`
  background: rgba(0, 150, 255, 0.2);
  border: 1px solid rgba(0, 200, 255, 0.5);
  border-radius: 5px;
  padding: 0.8rem 1.2rem;
  margin-bottom: 1.5rem;
  width: 100%;
  max-width: 500px;
  text-align: center;
`;

const TabMenu = styled.div`
  display: flex;
  background: rgba(0, 20, 40, 0.5);
  border-bottom: 1px solid rgba(0, 200, 255, 0.3);
  margin-bottom: 1.5rem;
  width: 100%;
  max-width: 500px;
`;

const TabButton = styled.button`
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid ${props => props.active ? "rgba(0, 200, 255, 0.8)" : "transparent"};
  color: ${props => props.active ? "rgba(0, 200, 255, 0.8)" : "white"};
  font-weight: ${props => props.active ? "bold" : "normal"};
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  text-align: center;
  font-family: 'Orbitron', sans-serif;
  
  &:hover {
    background: rgba(0, 30, 60, 0.3);
  }
`;

const GameModeCard = styled.div`
  background: rgba(0, 30, 60, 0.7);
  border: 1px solid ${props => props.selected ? "rgba(0, 200, 255, 0.8)" : "rgba(0, 200, 255, 0.3)"};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    border-color: rgba(0, 200, 255, 0.8);
  }
`;

const GameModeTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: rgba(0, 200, 255, 0.8);
`;

const LoadingSpinner = styled.div`
  border: 4px solid rgba(0, 30, 60, 0.3);
  border-top: 4px solid rgba(0, 200, 255, 0.8);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 0 auto;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const MultiPlayer = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('join'); // 'join' or 'create'
  const [gameStarted, setGameStarted] = useState(false);
  const [gameSession, setGameSession] = useState(null);
  const [sessionCode, setSessionCode] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [selectedGameMode, setSelectedGameMode] = useState('classic');
  
  // Game modes available
  const gameModes = [
    { id: 'classic', name: 'Klasik Mod', description: 'Standart politik simülasyon. 5 yıllık bir dönemi kapsayan seçim odaklı oyun.' },
    { id: 'crisis', name: 'Kriz Modu', description: 'Ekonomik, siyasi veya diplomatik krizlerle başa çıkmaya çalışın. Daha zorlu ve hızlı tempolu.' },
    { id: 'coalition', name: 'Koalisyon Modu', description: 'Bölünmüş bir parlamentoda koalisyon kurma ve yönetme üzerine odaklanır.' }
  ];
  
  // Default player list, will be replaced with API data
  const [players, setPlayers] = useState([
    { id: 1, username: 'Oyuncu1', isHost: true, isReady: true, avatarColor: '#1976d2' },
    { id: 2, username: 'Oyuncu2', isHost: false, isReady: false, avatarColor: '#d32f2f' },
  ]);
  
  // Check for authentication on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUsername(user.username || 'Player');
      } catch (e) {
        console.error("Kullanıcı bilgisi ayrıştırılamadı");
      }
    }
    
    if (!token) {
      setNotification('Çok oyunculu mod için giriş yapmanız gerekmektedir.');
    }
    
    // Check for URL params (for direct join links)
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('join');
    if (joinCode) {
      setSessionCode(joinCode);
      setActiveTab('join');
    }
  }, []);
  
  // Create a new game session
  const createSession = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Check authentication
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login', { state: { returnUrl: '/multi-player' } });
        return;
      }
      
      // Create a random session code if using local demo mode
      const sessionId = Math.random().toString(36).substring(7);
      const newSessionCode = Math.random().toString(36).substring(7).toUpperCase();
      
      // In a real app, we would use the API
      // const response = await apiHelper.post('/api/game/create-session', {
      //   gameMode: selectedGameMode,
      //   hostUsername: username
      // });
      
      // if (response.success) {
      //   setGameSession(response.data.session);
      //   setPlayers(response.data.players);
      // }
      
      // For demo purposes, create a mock session
      setGameSession({
        id: sessionId,
        sessionCode: newSessionCode,
        hostId: 1,
        gameMode: selectedGameMode,
        createdAt: new Date().toISOString()
      });
      
      // Update player list for the demo
      setPlayers([
        { id: 1, username: username || 'Host', isHost: true, isReady: true, avatarColor: '#1976d2' }
      ]);
      
      setNotification(`Oturum oluşturuldu! Kod: ${newSessionCode}`);
      
    } catch (error) {
      console.error('Oturum oluşturma hatası:', error);
      setError('Oturum oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };
  
  // Join an existing session
  const joinSession = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!sessionCode.trim()) {
        setError('Lütfen bir oturum kodu girin');
        setLoading(false);
        return;
      }
      
      // Check authentication
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login', { state: { returnUrl: `/multi-player?join=${sessionCode}` } });
        return;
      }
      
      // In a real app, we would use the API
      // const response = await apiHelper.post(`/api/game/join-session/${sessionCode}`, {
      //   username: username
      // });
      
      // if (response.success) {
      //   setGameSession(response.data.session);
      //   setPlayers(response.data.players);
      // }
      
      // For demo purposes, create a mock session
      setGameSession({
        id: Math.random().toString(36).substring(7),
        sessionCode: sessionCode,
        hostId: 2,
        gameMode: 'classic',
        createdAt: new Date().toISOString()
      });
      
      // Update player list for demo
      const randomColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
      setPlayers([
        { id: 1, username: 'Host', isHost: true, isReady: true, avatarColor: '#1976d2' },
        { id: 2, username: username || 'Oyuncu', isHost: false, isReady: false, avatarColor: randomColor }
      ]);
      
      setNotification(`Oturuma katıldınız: ${sessionCode}`);
      
    } catch (error) {
      console.error('Oturuma katılma hatası:', error);
      setError('Oturuma katılırken bir hata oluştu. Kod doğru mu?');
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle ready status
  const toggleReady = () => {
    setIsReady(!isReady);
    
    // Update the player list
    setPlayers(prevPlayers => 
      prevPlayers.map(player => 
        player.username === username ? { ...player, isReady: !isReady } : player
      )
    );
  };
  
  // Start the game
  const startGame = () => {
    // Check if all players are ready
    const allReady = players.every(player => player.isReady);
    
    if (!allReady) {
      setError('Tüm oyuncular hazır değil!');
      return;
    }
    
    setGameStarted(true);
    setError('');
  };
  
  // Return to main menu
  const returnToMenu = () => {
    navigate('/');
  };
  
  // Get player's initial based on their username
  const getPlayerInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };
  
  // Check if current user is host
  const isUserHost = () => {
    if (!gameSession) return false;
    const currentPlayer = players.find(player => player.username === username);
    return currentPlayer?.isHost || false;
  };
  
  // Leave the current session
  const leaveSession = () => {
    if (window.confirm('Oturumdan çıkmak istediğinize emin misiniz?')) {
      setGameSession(null);
      setPlayers([]);
      setSessionCode('');
      setActiveTab('join');
    }
  };
  
  // Copy session code to clipboard
  const copySessionCode = () => {
    if (gameSession) {
      navigator.clipboard.writeText(gameSession.sessionCode);
      setNotification('Oturum kodu panoya kopyalandı!');
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification('');
      }, 3000);
    }
  };

  return (
    <GameContainer>
      <GameHeader>
        <GameTitle>Çok Oyunculu Mod</GameTitle>
        {gameSession && (
          <div>Oturum Kodu: <strong>{gameSession.sessionCode}</strong></div>
        )}
      </GameHeader>
      
      <GameCanvas>
        {!gameSession && (
          <GameOverlay>
            <OverlayText>Çok Oyunculu Oyun</OverlayText>
            
            {notification && (
              <NotificationBanner>{notification}</NotificationBanner>
            )}
            
            <TabMenu>
              <TabButton 
                active={activeTab === 'join'} 
                onClick={() => setActiveTab('join')}
              >
                Oyuna Katıl
              </TabButton>
              <TabButton 
                active={activeTab === 'create'} 
                onClick={() => setActiveTab('create')}
              >
                Yeni Oyun Oluştur
              </TabButton>
            </TabMenu>
            
            {activeTab === 'join' && (
              <>
                <InputGroup>
                  <Label htmlFor="usernameInput">Kullanıcı Adınız</Label>
                  <Input 
                    id="usernameInput"
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Kullanıcı adınızı girin"
                    disabled={!!localStorage.getItem('user')}
                  />
                </InputGroup>
                
                <InputGroup>
                  <Label htmlFor="joinSessionInput">Oturum Kodu</Label>
                  <div style={{ display: 'flex' }}>
                    <Input 
                      id="joinSessionInput"
                      type="text" 
                      value={sessionCode}
                      onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                      placeholder="Oturum kodunu girin"
                      maxLength={7}
                    />
                    <Button 
                      onClick={joinSession} 
                      style={{ marginLeft: '0.5rem' }}
                      disabled={loading || !sessionCode.trim()}
                    >
                      {loading ? <LoadingSpinner /> : 'Katıl'}
                    </Button>
                  </div>
                </InputGroup>
                
                {error && <p style={{ color: '#ff5555', marginTop: '1rem' }}>{error}</p>}
                
                <InfoBox>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'rgba(0, 200, 255, 0.8)' }}>Nasıl Katılınır?</h4>
                  <p style={{ fontSize: '0.9rem', margin: '0' }}>
                    Bir oyuna katılmak için ev sahibinden oturum kodunu alın ve yukarıdaki forma girin.
                    Alternatif olarak, kendi oturumunuzu oluşturmak için "Yeni Oyun Oluştur" sekmesine geçin.
                  </p>
                </InfoBox>
              </>
            )}
            
            {activeTab === 'create' && (
              <>
                <InputGroup>
                  <Label htmlFor="createUsernameInput">Kullanıcı Adınız</Label>
                  <Input 
                    id="createUsernameInput"
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Kullanıcı adınızı girin"
                    disabled={!!localStorage.getItem('user')}
                  />
                </InputGroup>
                
                <GameOptions>
                  <Label>Oyun Modu</Label>
                  {gameModes.map(mode => (
                    <GameModeCard 
                      key={mode.id}
                      selected={selectedGameMode === mode.id}
                      onClick={() => setSelectedGameMode(mode.id)}
                    >
                      <GameModeTitle>{mode.name}</GameModeTitle>
                      <p style={{ margin: '0', fontSize: '0.9rem' }}>{mode.description}</p>
                    </GameModeCard>
                  ))}
                </GameOptions>
                
                <Button 
                  onClick={createSession} 
                  style={{ marginTop: '1rem', width: '100%', maxWidth: '300px' }}
                  disabled={loading || !username.trim()}
                >
                  {loading ? <LoadingSpinner /> : 'Yeni Oyun Oluştur'}
                </Button>
                
                {error && <p style={{ color: '#ff5555', marginTop: '1rem' }}>{error}</p>}
              </>
            )}
          </GameOverlay>
        )}
        
        {gameSession && !gameStarted && (
          <GameOverlay>
            <OverlayText>Oyuncular Bekleniyor</OverlayText>
            
            {notification && (
              <NotificationBanner>{notification}</NotificationBanner>
            )}
            
            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'rgba(0, 200, 255, 0.8)' }}>
                Oyun Modu: {gameModes.find(mode => mode.id === gameSession.gameMode)?.name || 'Klasik Mod'}
              </h3>
              <p>Oyun başlamadan önce tüm oyuncuların hazır olması gerekiyor.</p>
            </div>
            
            <PlayersList>
              {players.map(player => (
                <PlayerItem key={player.id}>
                  <PlayerInfo>
                    <PlayerAvatar color={player.avatarColor}>
                      {getPlayerInitial(player.username)}
                    </PlayerAvatar>
                    <div>
                      <div>{player.username}</div>
                      {player.isHost && (
                        <div style={{ fontSize: '0.8rem', color: '#ffcc00' }}>Host</div>
                      )}
                    </div>
                  </PlayerInfo>
                  <PlayerStatus isReady={player.isReady}>
                    {player.isReady ? 'Hazır' : 'Bekliyor'}
                  </PlayerStatus>
                </PlayerItem>
              ))}
            </PlayersList>
            
            <ButtonGroup>
              {!isUserHost() && (
                <Button 
                  onClick={toggleReady} 
                  style={{ 
                    backgroundColor: isReady ? 'rgba(56, 142, 60, 0.7)' : 'rgba(211, 47, 47, 0.7)'
                  }}
                >
                  {isReady ? 'Hazır ✓' : 'Hazır Değil'}
                </Button>
              )}
              
              {isUserHost() && (
                <Button 
                  onClick={startGame}
                  disabled={!players.every(player => player.isReady)}
                >
                  Oyunu Başlat
                </Button>
              )}
              
              <Button onClick={copySessionCode}>
                Kodu Kopyala
              </Button>
              
              <Button 
                onClick={leaveSession}
                style={{ backgroundColor: 'rgba(211, 47, 47, 0.7)' }}
              >
                Oturumdan Çık
              </Button>
            </ButtonGroup>
            
            {error && <p style={{ color: '#ff5555', marginTop: '1rem' }}>{error}</p>}
            
            <InfoBox>
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'rgba(0, 200, 255, 0.8)' }}>Nasıl Oynanır?</h4>
              <p style={{ fontSize: '0.9rem', margin: '0' }}>
                Oyun başladığında her oyuncu kendi siyasi partisini yönetecek. Her tur, oyuncular politikalarını belirleyecek,
                kampanyalar düzenleyecek ve diğer oyuncularla müzakere edecek. Oyunun amacı bir sonraki seçimlerde
                en yüksek oy oranına ulaşmak!
              </p>
            </InfoBox>
          </GameOverlay>
        )}
        
        {gameStarted && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            padding: '2rem'
          }}>
            <h2>Çok Oyunculu Oyun Aktif</h2>
            <p>Oyun arayüzü burada görüntülenecek...</p>
            <div style={{ 
              width: '80%', 
              height: '60%',
              background: 'rgba(0, 30, 60, 0.7)',
              border: '1px solid rgba(0, 200, 255, 0.3)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <p>Harita ve oyun panosu burada olacak</p>
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              marginTop: '2rem'
            }}>
              <Button>Tur Sonu</Button>
              <Button>Parti Bilgileri</Button>
              <Button>Diplomasi</Button>
            </div>
          </div>
        )}
      </GameCanvas>
      
      <GameControls>
        <Button onClick={returnToMenu}>Ana Menü</Button>
        {gameSession && gameStarted && (
          <Button onClick={() => setGamePaused(prev => !prev)}>
            Oyunu Duraklat
          </Button>
        )}
      </GameControls>
    </GameContainer>
  );
};

export default MultiPlayer;
