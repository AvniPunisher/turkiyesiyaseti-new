// src/components/GameDashboard/GameDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import apiHelper from '../../services/apiHelper';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(to bottom, #1a2a3a, #0a1a2a);
  color: white;
  font-family: 'Orbitron', sans-serif;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(0, 30, 60, 0.7);
  border-bottom: 1px solid rgba(0, 200, 255, 0.3);
`;

const HeaderTitle = styled.h2`
  margin: 0;
  color: rgba(0, 200, 255, 0.8);
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 100, 200, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border: 2px solid rgba(0, 200, 255, 0.5);
`;

const UserName = styled.div`
  font-weight: 500;
`;

const DashboardContent = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const Sidebar = styled.div`
  width: 250px;
  background: rgba(0, 20, 40, 0.8);
  border-right: 1px solid rgba(0, 200, 255, 0.3);
  padding: 1.5rem 0;
`;

const SidebarMenu = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const MenuItem = styled.li`
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 4px solid transparent;
  
  &:hover {
    background: rgba(0, 50, 100, 0.5);
    border-left-color: rgba(0, 200, 255, 0.7);
  }
  
  &.active {
    background: rgba(0, 70, 130, 0.7);
    border-left-color: rgba(0, 200, 255, 1);
  }
`;

const MainContent = styled.div`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
`;

const DashboardCard = styled.div`
  background: rgba(0, 30, 60, 0.7);
  border-radius: 8px;
  border: 1px solid rgba(0, 200, 255, 0.3);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 1rem;
  color: rgba(0, 200, 255, 0.8);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const StatItem = styled.div`
  background: rgba(0, 40, 80, 0.6);
  padding: 1rem;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: rgba(0, 200, 255, 0.9);
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(0, 30, 60, 0.8);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 0.5rem;
`;

const ProgressFill = styled.div`
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(to right, #3498db, #2ecc71);
  width: ${props => props.value}%;
`;

const ActionButton = styled.button`
  padding: 0.7rem 1.5rem;
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
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const EventContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
`;

const EventItem = styled.div`
  background: rgba(0, 40, 80, 0.6);
  padding: 1rem;
  border-radius: 5px;
  border-left: 4px solid ${props => props.color || "rgba(0, 200, 255, 0.7)"};
`;

const EventTitle = styled.div`
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const EventDescription = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
`;

const EventActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const TabButton = styled.button`
  padding: 0.5rem 1rem;
  background: ${props => props.active ? "rgba(0, 100, 200, 0.5)" : "rgba(0, 40, 80, 0.6)"};
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Orbitron', sans-serif;
  
  &:hover {
    background: rgba(0, 150, 255, 0.7);
  }
`;

const GameDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [charData, setCharData] = useState(null);
  const [partyData, setPartyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState('dashboard');
  
  // Save game functionality state
  const [savingGame, setSavingGame] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(null);
  const [saveError, setSaveError] = useState(null);
  
  // Karakter ve parti verilerini al
  useEffect(() => {
    // Gerçek uygulamada bu veriler API'dan çekilecek
    // Şimdilik localStorage'dan yükleyelim
    try {
      const storedCharacter = localStorage.getItem('characterData');
      const storedParty = localStorage.getItem('partyData');
      
      if (storedCharacter) {
        setCharData(JSON.parse(storedCharacter));
      }
      
      if (storedParty) {
        setPartyData(JSON.parse(storedParty));
      } else {
        // Test için demo parti verisi
        setPartyData({
          name: "Milli Kalkınma Partisi",
          shortName: "MKP",
          colorId: "#1976d2",
          popularity: 12,
          seats: 0,
          ideology: {
            economic: 3,
            cultural: 4,
            diplomatic: 4,
            social: 3,
            government: 4
          }
        });
      }
      
      // Location state'inden veri kontrolü
      if (location.state?.character) {
        setCharData(location.state.character);
      }
      
      if (location.state?.party) {
        setPartyData(location.state.party);
      }
      
    } catch (error) {
      console.error("Veri yükleme hatası:", error);
    } finally {
      setIsLoading(false);
    }
  }, [location]);
  
  // Karakter adından avatar oluştur
  const getInitials = (name) => {
    if (!name) return "X";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  // Ana menüye dön
  const returnToMainMenu = () => {
    navigate('/');
  };
  
  // Oyundan çık
  const exitGame = () => {
    if (window.confirm("Oyundan çıkmak istediğinizden emin misiniz?")) {
      navigate('/');
    }
  };
  
  // Oyunu kaydetme işlevi
  const handleSaveGame = async () => {
    try {
      setSavingGame(true);
      setSaveSuccess(null);
      setSaveError(null);
      
      // Oyun verilerini hazırla
      const gameDataToSave = {
        character: charData,
        party: partyData,
        gameState: 'saved',
        gameDate: new Date().toISOString(),
        gameVersion: '1.0.0',
        // Diğer oyun ilerleme bilgileri burada eklenebilir
        lastUpdated: new Date().toISOString()
      };
      
      // Kayıt adı oluştur
      const saveName = partyData ? 
        `${charData?.fullName || 'Karakter'} - ${partyData.name}` :
        `${charData?.fullName || 'Karakter'} - ${new Date().toLocaleDateString('tr-TR')}`;
      
      // Oyunu kaydet
      const response = await apiHelper.post('/api/game/save-game', {
        gameData: gameDataToSave,
        saveName: saveName,
        saveSlot: 2 // Manuel kayıtlar için 2 ve üstü slotları kullanıyoruz
      });
      
      if (response.success) {
        setSaveSuccess('Oyun başarıyla kaydedildi!');
        
        // 3 saniye sonra mesajı kaldır
        setTimeout(() => {
          setSaveSuccess(null);
        }, 3000);
      } else {
        setSaveError(`Kayıt hatası: ${response.message || 'Bilinmeyen hata'}`);
      }
    } catch (error) {
      console.error('Oyun kaydetme hatası:', error);
      setSaveError('Sunucu bağlantı hatası: ' + (error.message || 'Bilinmeyen hata'));
      
      // Çevrimdışı kayıt, localStorage'a yedekle
      try {
        const offlineSaveData = {
          character: charData,
          party: partyData,
          gameState: 'saved',
          gameDate: new Date().toISOString(),
          savedOffline: true
        };
        
        localStorage.setItem('offlineSaveData', JSON.stringify(offlineSaveData));
        setSaveSuccess('Oyun çevrimdışı olarak kaydedildi. İnternet bağlantısı tekrar kurulduğunda senkronize edilecek.');
        
        // 3 saniye sonra mesajı kaldır
        setTimeout(() => {
          setSaveSuccess(null);
        }, 3000);
      } catch (localStorageError) {
        console.error('Çevrimdışı kayıt hatası:', localStorageError);
        setSaveError('Çevrimdışı kayıt yapılamadı: ' + (localStorageError.message || 'Bilinmeyen hata'));
      }
    } finally {
      setSavingGame(false);
    }
  };

  // Oyunu dışa aktarma işlevi
  const handleExportGame = async () => {
    try {
      setSavingGame(true);
      setSaveSuccess(null);
      setSaveError(null);
      
      // Oyun verilerini hazırla
      const gameDataToExport = {
        saveInfo: {
          saveName: partyData ? 
            `${charData?.fullName || 'Karakter'} - ${partyData.name}` :
            `${charData?.fullName || 'Karakter'} - ${new Date().toLocaleDateString('tr-TR')}`,
          gameDate: new Date().toISOString(),
          gameVersion: '1.0.0',
          exportDate: new Date().toISOString(),
          exportVersion: '1.0'
        },
        character: charData,
        party: partyData,
        gameData: {
          // Oyun ilerleme bilgileri
          gameState: 'exported',
          lastUpdated: new Date().toISOString()
        }
      };
      
      // Dosya adı oluştur
      const fileName = partyData ? 
        `${charData?.fullName || 'Karakter'}-${partyData.shortName}`.toLowerCase().replace(/\s+/g, '-') :
        `${charData?.fullName || 'Karakter'}-save`.toLowerCase().replace(/\s+/g, '-');
      
      // JSON'ı dosyaya dönüştür
      const blob = new Blob([JSON.stringify(gameDataToExport, null, 2)], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      
      // Dosyayı indirme
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Temizlik
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
      
      setSaveSuccess('Oyun başarıyla dışa aktarıldı!');
      
      // 3 saniye sonra mesajı kaldır
      setTimeout(() => {
        setSaveSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Oyun dışa aktarma hatası:', error);
      setSaveError('Dışa aktarma hatası: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setSavingGame(false);
    }
  };
  
  // Demo olay verileri
  const events = [
    {
      id: 1,
      title: "Ekonomik Reform Paketi",
      description: "Ekonomi Bakanı yeni bir reform paketi açıkladı. Partinizin tutumu ne olacak?",
      color: "rgba(46, 204, 113, 0.8)",
      type: "policy"
    },
    {
      id: 2,
      title: "Miting Talebi",
      description: "Parti üyeleri İzmir'de büyük bir miting düzenlenmesini istiyor. Katılacak mısınız?",
      color: "rgba(52, 152, 219, 0.8)",
      type: "event"
    },
    {
      id: 3,
      title: "Koalisyon Görüşmesi",
      description: "İYİ Parti lideri koalisyon görüşmesi için randevu talep ediyor.",
      color: "rgba(155, 89, 182, 0.8)",
      type: "diplomacy"
    }
  ];
  
  // Yükleme durumu
  if (isLoading) {
    return (
      <DashboardContainer>
        <DashboardHeader>
          <HeaderTitle>Oyun Yükleniyor...</HeaderTitle>
        </DashboardHeader>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div>Yükleniyor...</div>
        </div>
      </DashboardContainer>
    );
  }
  
  return (
    <DashboardContainer>
      <DashboardHeader>
        <HeaderTitle>Türkiye Siyaset Simülasyonu</HeaderTitle>
        <UserInfo>
          <UserName>{charData?.fullName || "Oyuncu"}</UserName>
          <UserAvatar>{getInitials(charData?.fullName)}</UserAvatar>
        </UserInfo>
      </DashboardHeader>
      
      <DashboardContent>
        <Sidebar>
          <SidebarMenu>
            <MenuItem 
              className={selectedMenu === 'dashboard' ? 'active' : ''}
              onClick={() => setSelectedMenu('dashboard')}
            >
              Ana Sayfa
            </MenuItem>
            <MenuItem 
              className={selectedMenu === 'party' ? 'active' : ''}
              onClick={() => setSelectedMenu('party')}
            >
              Parti Yönetimi
            </MenuItem>
            <MenuItem 
              className={selectedMenu === 'campaign' ? 'active' : ''}
              onClick={() => setSelectedMenu('campaign')}
            >
              Seçim Kampanyası
            </MenuItem>
            <MenuItem 
              className={selectedMenu === 'relations' ? 'active' : ''}
              onClick={() => setSelectedMenu('relations')}
            >
              Siyasi İlişkiler
            </MenuItem>
            <MenuItem 
              className={selectedMenu === 'poll' ? 'active' : ''}
              onClick={() => setSelectedMenu('poll')}
            >
              Anketler
            </MenuItem>
            <MenuItem 
              className={selectedMenu === 'media' ? 'active' : ''}
              onClick={() => setSelectedMenu('media')}
            >
              Medya İlişkileri
            </MenuItem>
            <MenuItem 
              className={selectedMenu === 'map' ? 'active' : ''}
              onClick={() => setSelectedMenu('map')}
            >
              Türkiye Haritası
            </MenuItem>
            <MenuItem 
              className={selectedMenu === 'character' ? 'active' : ''}
              onClick={() => setSelectedMenu('character')}
            >
              Karakter Bilgileri
            </MenuItem>
            <MenuItem 
              className={selectedMenu === 'settings' ? 'active' : ''}
              onClick={() => setSelectedMenu('settings')}
            >
              Oyun Ayarları
            </MenuItem>
            <MenuItem 
              style={{ marginTop: '2rem', color: 'rgba(255, 100, 100, 0.9)' }}
              onClick={exitGame}
            >
              Oyundan Çık
            </MenuItem>
          </SidebarMenu>
        </Sidebar>
        
        <MainContent>
          {selectedMenu === 'dashboard' && (
            <>
              {/* Parti ve Karakter Bilgileri */}
              <DashboardCard>
                <CardTitle>Parti Bilgileri</CardTitle>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                  <div 
                    style={{ 
                      backgroundColor: partyData?.colorId || "#1976d2", 
                      padding: '0.5rem 1rem', 
                      borderRadius: '4px', 
                      fontWeight: 'bold',
                      color: partyData?.colorId ? getContrastColor(partyData.colorId) : 'white'
                    }}
                  >
                    {partyData?.shortName || "MKP"}
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '500' }}>
                    {partyData?.name || "Milli Kalkınma Partisi"}
                  </div>
                </div>
                
                <StatsGrid>
                  <StatItem>
                    <StatValue>{partyData?.popularity || 12}%</StatValue>
                    <StatLabel>Parti Desteği</StatLabel>
                    <ProgressBar>
                      <ProgressFill value={partyData?.popularity || 12} />
                    </ProgressBar>
                  </StatItem>
                  <StatItem>
                    <StatValue>{partyData?.seats || 0}</StatValue>
                    <StatLabel>Meclis Koltuğu</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>{partyData?.members || 150}K</StatValue>
                    <StatLabel>Parti Üyeleri</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>{partyData?.funds || "₺2.5M"}</StatValue>
                    <StatLabel>Parti Kasası</StatLabel>
                  </StatItem>
                </StatsGrid>
              </DashboardCard>
              
              {/* Oyun Kayıt Kartı - Yeni Eklenen */}
              <DashboardCard>
                <CardTitle>Oyun Kayıt</CardTitle>
                <div style={{ marginTop: '1rem' }}>
                  <p>Oyun ilerlemenizi kaydedebilir veya dışa aktarabilirsiniz.</p>
                  
                  {saveSuccess && (
                    <div style={{ 
                      padding: '0.75rem',
                      margin: '1rem 0',
                      backgroundColor: 'rgba(40, 167, 69, 0.2)',
                      borderRadius: '4px',
                      borderLeft: '4px solid rgba(40, 167, 69, 0.8)'
                    }}>
                      {saveSuccess}
                    </div>
                  )}
                  
                  {saveError && (
                    <div style={{ 
                      padding: '0.75rem',
                      margin: '1rem 0',
                      backgroundColor: 'rgba(220, 53, 69, 0.2)',
                      borderRadius: '4px',
                      borderLeft: '4px solid rgba(220, 53, 69, 0.8)'
                    }}>
                      {saveError}
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <ActionButton 
                      onClick={handleSaveGame}
                      disabled={savingGame}
                    >
                      {savingGame ? (
                        <>
                          <div style={{ 
                            display: 'inline-block',
                            width: '16px',
                            height: '16px',
                            border: '2px solid rgba(255, 255, 255, 0.3)',
                            borderTop: '2px solid white',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            marginRight: '0.5rem'
                          }} />
                          Kaydediliyor...
                        </>
                      ) : (
                        'Oyunu Kaydet'
                      )}
                    </ActionButton>
                    
                    <ActionButton
                      onClick={handleExportGame}
                      disabled={savingGame}
                    >
                      Oyunu Dışa Aktar
                    </ActionButton>
                  </div>
                </div>
              </DashboardCard>
              
              {/* Güncel Olaylar */}
              <DashboardCard>
                <CardTitle>Güncel Olaylar</CardTitle>
                <TabContainer>
                  <TabButton 
                    active={activeTab === 'overview'} 
                    onClick={() => setActiveTab('overview')}
                  >
                    Tüm Olaylar
                  </TabButton>
                  <TabButton 
                    active={activeTab === 'policy'} 
                    onClick={() => setActiveTab('policy')}
                  >
                    Politika
                  </TabButton>
                  <TabButton 
                    active={activeTab === 'events'} 
                    onClick={() => setActiveTab('events')}
                  >
                    Etkinlikler
                  </TabButton>
                  <TabButton 
                    active={activeTab === 'diplomacy'} 
                    onClick={() => setActiveTab('diplomacy')}
                  >
                    Diplomasi
                  </TabButton>
                </TabContainer>
                
                <EventContainer>
                  {events
                    .filter(event => activeTab === 'overview' || event.type === activeTab)
                    .map(event => (
                      <EventItem key={event.id} color={event.color}>
                        <EventTitle>{event.title}</EventTitle>
                        <EventDescription>{event.description}</EventDescription>
                        <EventActions>
                          <ActionButton>Görüntüle</ActionButton>
                        </EventActions>
                      </EventItem>
                    ))}
                </EventContainer>
              </DashboardCard>
              
              {/* Güncel Seçim Anketi */}
              <DashboardCard>
                <CardTitle>Güncel Seçim Anketi</CardTitle>
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div>AK Parti</div>
                    <div>35%</div>
                  </div>
                  <ProgressBar>
                    <ProgressFill value={35} style={{ background: '#FFC107' }} />
                  </ProgressBar>
                </div>
                
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div>CHP</div>
                    <div>28%</div>
                  </div>
                  <ProgressBar>
                    <ProgressFill value={28} style={{ background: '#E81B23' }} />
                  </ProgressBar>
                </div>
                
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div>{partyData?.name || "MKP"}</div>
                    <div>{partyData?.popularity || 12}%</div>
                  </div>
                  <ProgressBar>
                    <ProgressFill value={partyData?.popularity || 12} style={{ background: partyData?.colorId || '#1976d2' }} />
                  </ProgressBar>
                </div>
                
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div>MHP</div>
                    <div>9%</div>
                  </div>
                  <ProgressBar>
                    <ProgressFill value={9} style={{ background: '#D31919' }} />
                  </ProgressBar>
                </div>
                
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div>İYİ Parti</div>
                    <div>8%</div>
                  </div>
                  <ProgressBar>
                    <ProgressFill value={8} style={{ background: '#1976D2' }} />
                  </ProgressBar>
                </div>
                
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                  <ActionButton>Detaylı Analiz</ActionButton>
                </div>
              </DashboardCard>
            </>
          )}
          
          {selectedMenu !== 'dashboard' && (
            <DashboardCard>
              <CardTitle>{getMenuTitle(selectedMenu)}</CardTitle>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '3rem' 
              }}>
                <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                  Bu özellik geliştirme aşamasındadır.
                </div>
                <ActionButton onClick={() => setSelectedMenu('dashboard')}>
                  Ana Sayfaya Dön
                </ActionButton>
              </div>
            </DashboardCard>
          )}
        </MainContent>
      </DashboardContent>
    </DashboardContainer>
  );
};

// Menü başlığını al
function getMenuTitle(menu) {
  switch(menu) {
    case 'party': return 'Parti Yönetimi';
    case 'campaign': return 'Seçim Kampanyası';
    case 'relations': return 'Siyasi İlişkiler';
    case 'poll': return 'Anketler';
    case 'media': return 'Medya İlişkileri';
    case 'map': return 'Türkiye Haritası';
    case 'character': return 'Karakter Bilgileri';
    case 'settings': return 'Oyun Ayarları';
    default: return 'Ana Sayfa';
  }
}

// Kontrast renk hesaplama yardımcı fonksiyonu
function getContrastColor(hexColor) {
  // Varsayılan değer
  if (!hexColor) return "#ffffff";
  
  // HEX'i RGB'ye dönüştür
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Rengin parlaklığını hesapla (basit formül: 0.299R + 0.587G + 0.114B)
  const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
  
  // Parlaklık 128'den düşükse (0-255 aralığında) beyaz döndür, değilse siyah
  return brightness < 128 ? "#ffffff" : "#000000";
}

export default GameDashboard;
