// src/components/GameDashboard/GameDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import gameStateManager from '../../services/gameStateManager';

// Icon'lar için
import { 
  Calendar, Menu, Settings, ChevronLeft, ChevronRight, 
  Save, Users, TrendingUp, FileText, MessageSquare, Globe
} from 'lucide-react';

// Dashboard ana konteyneri
const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(to bottom, #1a2a3a, #0a1a2a);
  color: white;
  font-family: 'Orbitron', sans-serif;
  overflow: hidden;
`;

// Üst kısım - bilgi ve kontroller
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background: rgba(0, 30, 60, 0.7);
  border-bottom: 1px solid rgba(0, 200, 255, 0.3);
  height: 64px;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Title = styled.h2`
  margin: 0;
  color: rgba(0, 200, 255, 0.8);
  font-size: 1.2rem;
`;

const HeaderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const InfoItem = styled.div`
  padding: 0.35rem 0.75rem;
  background: rgba(0, 40, 80, 0.6);
  border-radius: 4px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

// Ana içerik alanı - yan menü ve oyun paneli
const Content = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

// Yan menü
const Sidebar = styled.div`
  width: 200px;
  background: rgba(0, 20, 40, 0.8);
  border-right: 1px solid rgba(0, 200, 255, 0.3);
  display: flex;
  flex-direction: column;
`;

const SidebarMenu = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const MenuItem = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  background: ${props => props.active ? 'rgba(0, 100, 200, 0.5)' : 'transparent'};
  border: none;
  text-align: left;
  color: white;
  font-family: 'Orbitron', sans-serif;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    background: rgba(0, 100, 200, 0.3);
  }
`;

// Tab'lar ve içerik
const MainPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const TabsContainer = styled.div`
  display: flex;
  background: rgba(0, 30, 60, 0.5);
  border-bottom: 1px solid rgba(0, 200, 255, 0.3);
`;

const Tab = styled.button`
  padding: 0.75rem 1.25rem;
  background: ${props => props.active ? 'rgba(0, 100, 200, 0.5)' : 'transparent'};
  border: none;
  border-bottom: 2px solid ${props => props.active ? 'rgba(0, 200, 255, 0.8)' : 'transparent'};
  color: white;
  font-family: 'Orbitron', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 100, 200, 0.3);
  }
`;

const TabContent = styled.div`
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
`;

// İçerik bileşenleri
const Card = styled.div`
  background: rgba(0, 30, 60, 0.7);
  border-radius: 8px;
  border: 1px solid rgba(0, 200, 255, 0.3);
  padding: 1rem;
  margin-bottom: 1rem;
`;

const CardTitle = styled.h3`
  margin: 0 0 0.75rem 0;
  color: rgba(0, 200, 255, 0.8);
  font-size: 1.1rem;
  border-bottom: 1px solid rgba(0, 200, 255, 0.2);
  padding-bottom: 0.5rem;
`;

// Takvim sistemi
const CalendarContainer = styled.div`
  background: rgba(0, 30, 60, 0.5);
  border-top: 1px solid rgba(0, 200, 255, 0.3);
  padding: 0.75rem 1.5rem;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const DateDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
`;

const CalendarControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
`;

const DayCell = styled.div`
  background: ${props => 
    props.isToday ? 'rgba(0, 200, 255, 0.3)' : 
    props.isActive ? 'rgba(0, 100, 200, 0.5)' : 
    'rgba(0, 40, 80, 0.5)'};
  border: 1px solid ${props => 
    props.isToday ? 'rgba(0, 200, 255, 0.8)' : 
    props.hasEvent ? 'rgba(255, 200, 0, 0.5)' : 
    'rgba(0, 100, 200, 0.3)'};
  border-radius: 4px;
  padding: 0.5rem;
  text-align: center;
  cursor: pointer;
  position: relative;
  
  &:hover {
    background: rgba(0, 100, 200, 0.3);
  }
`;

const DayNumber = styled.div`
  font-weight: ${props => props.isToday ? 'bold' : 'normal'};
`;

const EventIndicator = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${props => props.color || 'rgba(255, 200, 0, 0.8)'};
  position: absolute;
  bottom: 4px;
  right: 4px;
`;

const Button = styled.button`
  background: rgba(0, 100, 200, 0.5);
  border: none;
  border-radius: 4px;
  color: white;
  padding: 0.5rem 1rem;
  font-family: 'Orbitron', sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 150, 255, 0.6);
  }
`;

const IconButton = styled.button`
  background: ${props => props.active ? 'rgba(0, 100, 200, 0.5)' : 'rgba(0, 40, 80, 0.5)'};
  border: none;
  border-radius: 4px;
  color: white;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 100, 200, 0.7);
  }
`;

// Ana bileşen
const GameDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State değişkenleri
  const [activeSection, setActiveSection] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('overview');
  const [gameState, setGameState] = useState(null);
  const [character, setCharacter] = useState(null);
  const [party, setParty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [slotId, setSlotId] = useState(1); // Varsayılan slot
  
  // Tarih hesaplama
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [calendarDays, setCalendarDays] = useState([]);
  
  // Game state'i yükleme
  useEffect(() => {
    const loadGameState = () => {
      // URL'den veya location state'inden slot ID'yi al
      const urlParams = new URLSearchParams(location.search);
      const urlSlotId = parseInt(urlParams.get('slotId') || '1');
      const stateSlotId = location.state?.slotId;
      
      // Slot ID'yi belirle
      const determinedSlotId = stateSlotId || urlSlotId || 1;
      setSlotId(determinedSlotId);
      
      // Game state'i yükle
      gameStateManager.activateSlot(determinedSlotId);
      const state = gameStateManager.getActiveGameState();
      setGameState(state);
      
      // Karakter ve parti verilerini state'ten veya game state'ten al
      let characterData = location.state?.character;
      let partyData = location.state?.party;
      
      if (!characterData) {
        characterData = gameStateManager.getCharacter();
      } else {
        // Yeni karakteri güncelle
        gameStateManager.setCharacter(characterData);
      }
      
      if (!partyData) {
        partyData = gameStateManager.getParty();
      } else {
        // Yeni partiyi güncelle
        gameStateManager.setParty(partyData);
      }
      
      setCharacter(characterData);
      setParty(partyData);
      
      // Takvim için tarih ayarla
      if (state && state.date) {
        const gameDate = new Date(state.date);
        setCurrentMonth(gameDate.getMonth());
        setCurrentYear(gameDate.getFullYear());
      }
      
      setIsLoading(false);
    };
    
    loadGameState();
  }, [location]);
  
  // Takvim günlerini hesapla
  useEffect(() => {
    if (!gameState) return;
    
    const calculateCalendarDays = () => {
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
      
      const days = [];
      
      // Önceki ayın son günleri
      for (let i = 0; i < firstDayOfMonth; i++) {
        const prevMonthLastDays = new Date(currentYear, currentMonth, 0).getDate();
        days.push({
          day: prevMonthLastDays - firstDayOfMonth + i + 1,
          month: currentMonth === 0 ? 11 : currentMonth - 1,
          year: currentMonth === 0 ? currentYear - 1 : currentYear,
          isCurrentMonth: false,
          isToday: false
        });
      }
      
      // Mevcut ayın günleri
      const gameDate = new Date(gameState.date);
      for (let day = 1; day <= daysInMonth; day++) {
        days.push({
          day,
          month: currentMonth,
          year: currentYear,
          isCurrentMonth: true,
          isToday: day === gameDate.getDate() && 
                  currentMonth === gameDate.getMonth() && 
                  currentYear === gameDate.getFullYear(),
          // Demo amaçlı rastgele etkinlikler
          hasEvent: Math.random() > 0.85
        });
      }
      
      // Sonraki ayın ilk günleri (takvimi doldurmak için)
      const daysNeeded = 42 - days.length;
      for (let day = 1; day <= daysNeeded; day++) {
        days.push({
          day,
          month: currentMonth === 11 ? 0 : currentMonth + 1,
          year: currentMonth === 11 ? currentYear + 1 : currentYear,
          isCurrentMonth: false,
          isToday: false
        });
      }
      
      setCalendarDays(days);
    };
    
    calculateCalendarDays();
  }, [currentMonth, currentYear, gameState]);
  
  // Takvimde önceki aya geç
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  // Takvimde sonraki aya geç
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  // Zaman ilerletme (oyun içinde)
  const advanceOneDay = () => {
    const updatedState = gameStateManager.advanceTime(1);
    setGameState(updatedState);
    
    // Takvimi güncel gün için güncelle
    const gameDate = new Date(updatedState.date);
    setCurrentMonth(gameDate.getMonth());
    setCurrentYear(gameDate.getFullYear());
  };
  
  // Oyunu kaydet
  const saveGame = () => {
    gameStateManager.saveToLocalStorage();
    alert(`Oyununuz Slot ${slotId} için başarıyla kaydedildi.`);
  };
  
  // Ana menüye dön
  const returnToMainMenu = () => {
    navigate('/');
  };
  
  // Tab başlıkları
  const getSectionTabs = () => {
    switch (activeSection) {
      case 'dashboard':
        return [
          { id: 'overview', label: 'Genel Bakış' },
          { id: 'polls', label: 'Anketler' },
          { id: 'economy', label: 'Ekonomi' }
        ];
      case 'party':
        return [
          { id: 'members', label: 'Üyeler' },
          { id: 'structure', label: 'Yapı' },
          { id: 'ideology', label: 'İdeoloji' }
        ];
      case 'campaign':
        return [
          { id: 'events', label: 'Etkinlikler' },
          { id: 'strategy', label: 'Strateji' },
          { id: 'regions', label: 'Bölgeler' }
        ];
      case 'legislation':
        return [
          { id: 'bills', label: 'Tasarılar' },
          { id: 'voting', label: 'Oylamalar' },
          { id: 'laws', label: 'Yasalar' }
        ];
      default:
        return [{ id: 'overview', label: 'Genel Bakış' }];
    }
  };
  
  // Yükleme durumu
  if (isLoading) {
    return (
      <DashboardContainer>
        <div style={{
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: '100%'
        }}>
          <div>Oyun yükleniyor...</div>
        </div>
      </DashboardContainer>
    );
  }
  
  // Format tarih
  const formatDate = (date) => {
    if (!date) return '';
    
    const gameDate = new Date(date);
    return gameDate.toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };
  
  const formatMonth = (month) => {
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    return months[month];
  };
  
  return (
    <DashboardContainer>
      {/* Header */}
      <Header>
        <HeaderTitle>
          <Title>Türkiye Siyaset Simülasyonu</Title>
          <div>Slot: {slotId}</div>
        </HeaderTitle>
        
        <HeaderInfo>
          <InfoItem>
            <Calendar size={16} />
            {gameState && formatDate(gameState.date)}
          </InfoItem>
          
          <InfoItem>
            <Users size={16} />
            Popülerlik: %{gameState ? gameState.popularity : 10}
          </InfoItem>
          
          <InfoItem>
            <TrendingUp size={16} />
            Bütçe: {(gameState ? gameState.partyFunds : 1000000).toLocaleString()} ₺
          </InfoItem>
        </HeaderInfo>
      </Header>
      
      {/* Main Content */}
      <Content>
        {/* Sidebar */}
        <Sidebar>
          <SidebarMenu>
            <MenuItem 
              active={activeSection === 'dashboard'} 
              onClick={() => setActiveSection('dashboard')}
            >
              <TrendingUp size={18} />
              Ana Sayfa
            </MenuItem>
            
            <MenuItem 
              active={activeSection === 'party'} 
              onClick={() => setActiveSection('party')}
            >
              <Users size={18} />
              Parti Yönetimi
            </MenuItem>
            
            <MenuItem 
              active={activeSection === 'campaign'} 
              onClick={() => setActiveSection('campaign')}
            >
              <MessageSquare size={18} />
              Kampanya
            </MenuItem>
            
            <MenuItem 
              active={activeSection === 'legislation'} 
              onClick={() => setActiveSection('legislation')}
            >
              <FileText size={18} />
              Yasama
            </MenuItem>
            
            <MenuItem 
              active={activeSection === 'diplomacy'} 
              onClick={() => setActiveSection('diplomacy')}
            >
              <Globe size={18} />
              Diplomasi
            </MenuItem>
          </SidebarMenu>
          
          <div style={{ padding: '0.75rem' }}>
            <Button onClick={returnToMainMenu}>
              Ana Menü
            </Button>
          </div>
        </Sidebar>
        
        {/* Main Panel */}
        <MainPanel>
          {/* Tabs */}
          <TabsContainer>
            {getSectionTabs().map(tab => (
              <Tab 
                key={tab.id}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </Tab>
            ))}
          </TabsContainer>
          
          {/* Content */}
          <TabContent>
            {/* Ana Sayfa İçeriği */}
            {activeSection === 'dashboard' && activeTab === 'overview' && (
              <>
                <Card>
                  <CardTitle>Parti Durumu</CardTitle>
                  <div>
                    {party ? (
                      <div>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          marginBottom: '1rem' 
                        }}>
                          <div style={{ 
                            backgroundColor: party.colorId,
                            color: party.colorId.startsWith('#f') ? '#000' : '#fff',
                            padding: '0.35rem 0.75rem',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            marginRight: '0.75rem'
                          }}>
                            {party.shortName}
                          </div>
                          <h3 style={{ margin: 0 }}>{party.name}</h3>
                        </div>
                        
                        <div style={{ 
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                          gap: '1rem'
                        }}>
                          <div style={{ 
                            padding: '0.75rem',
                            background: 'rgba(0, 40, 80, 0.5)',
                            borderRadius: '6px'
                          }}>
                            <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                              Popülerlik
                            </div>
                            <div style={{ 
                              fontSize: '1.5rem', 
                              fontWeight: 'bold',
                              color: 'rgba(0, 200, 255, 0.8)'
                            }}>
                              %{gameState ? gameState.popularity : 10}
                            </div>
                          </div>
                          
                          <div style={{ 
                            padding: '0.75rem',
                            background: 'rgba(0, 40, 80, 0.5)',
                            borderRadius: '6px'
                          }}>
                            <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                              Parti Fonu
                            </div>
                            <div style={{ 
                              fontSize: '1.5rem', 
                              fontWeight: 'bold',
                              color: 'rgba(0, 200, 255, 0.8)'
                            }}>
                              {(gameState ? gameState.partyFunds : 1000000).toLocaleString()} ₺
                            </div>
                          </div>
                          
                          <div style={{ 
                            padding: '0.75rem',
                            background: 'rgba(0, 40, 80, 0.5)',
                            borderRadius: '6px'
                          }}>
                            <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                              Meclis Koltukları
                            </div>
                            <div style={{ 
                              fontSize: '1.5rem', 
                              fontWeight: 'bold',
                              color: 'rgba(0, 200, 255, 0.8)'
                            }}>
                              {gameState ? gameState.seatCount : 0}/{gameState ? gameState.totalSeats : 600}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>Parti bilgisi bulunamadı.</div>
                    )}
                  </div>
                </Card>
                
                <Card>
                  <CardTitle>Ülke Durumu</CardTitle>
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '1rem'
                  }}>
                    {/* Ülke parametreleri */}
                    <div style={{ 
                      padding: '0.75rem',
                      background: 'rgba(0, 40, 80, 0.5)',
                      borderRadius: '6px'
                    }}>
                      <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                        Ekonomi
                      </div>
                      <div style={{ 
                        fontSize: '1.2rem', 
                        fontWeight: 'bold',
                        color: getStatusColor(gameState?.countryParameters?.economy || 50)
                      }}>
                        {getStatusText(gameState?.countryParameters?.economy || 50)}
                      </div>
                    </div>
                    
                    <div style={{ 
                      padding: '0.75rem',
                      background: 'rgba(0, 40, 80, 0.5)',
                      borderRadius: '6px'
                    }}>
                      <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                        Eğitim
                      </div>
                      <div style={{ 
                        fontSize: '1.2rem', 
                        fontWeight: 'bold',
                        color: getStatusColor(gameState?.countryParameters?.education || 50)
                      }}>
                        {getStatusText(gameState?.countryParameters?.education || 50)}
                      </div>
                    </div>
                    
                    <div style={{ 
                      padding: '0.75rem',
                      background: 'rgba(0, 40, 80, 0.5)',
                      borderRadius: '6px'
                    }}>
                      <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                        Sağlık
                      </div>
                      <div style={{ 
                        fontSize: '1.2rem', 
                        fontWeight: 'bold',
                        color: getStatusColor(gameState?.countryParameters?.health || 50)
                      }}>
                        {getStatusText(gameState?.countryParameters?.health || 50)}
                      </div>
                    </div>
                    
                    <div style={{ 
                      padding: '0.75rem',
                      background: 'rgba(0, 40, 80, 0.5)',
                      borderRadius: '6px'
                    }}>
                      <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                        Güvenlik
                      </div>
                      <div style={{ 
                        fontSize: '1.2rem', 
                        fontWeight: 'bold',
                        color: getStatusColor(gameState?.countryParameters?.security || 50)
                      }}>
                        {getStatusText(gameState?.countryParameters?.security || 50)}
                      </div>
                    </div>
                  </div>
                </Card>
                
                <Card>
                  <CardTitle>Son Olaylar</CardTitle>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}>
                    {/* Demo olaylar */}
                    <div style={{ 
                      padding: '0.75rem',
                      background: 'rgba(0, 40, 80, 0.5)',
                      borderRadius: '6px',
                      borderLeft: '4px solid rgba(0, 200, 255, 0.8)'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem'
                      }}>
                        <div style={{ fontWeight: 'bold' }}>
                          Parti Kuruluşu
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                          {gameState ? formatDate(gameState.date) : ''}
                        </div>
                      </div>
                      <div>
                        {party ? 
                          `${party.name} (${party.shortName}) partisi kuruldu!` : 
                          'Yeni parti kuruldu.'}
                      </div>
                    </div>
                    
                    <div style={{ 
                      padding: '0.75rem',
                      background: 'rgba(0, 40, 80, 0.5)',
                      borderRadius: '6px',
                      borderLeft: '4px solid rgba(255, 200, 0, 0.8)'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem'
                      }}>
                        <div style={{ fontWeight: 'bold' }}>
                          Bütçe Görüşmeleri
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                          Yaklaşan
                        </div>
                      </div>
                      <div>
                        Gelecek hafta bütçe görüşmeleri başlayacak. Hazırlıklarınızı tamamlayın.
                      </div>
                    </div>
                    
                    <div style={{ 
                      padding: '0.75rem',
                      background: 'rgba(0, 40, 80, 0.5)',
                      borderRadius: '6px',
                      borderLeft: '4px solid rgba(255, 100, 100, 0.8)'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem'
                      }}>
                        <div style={{ fontWeight: 'bold' }}>
                          Ekonomik Kriz Riski
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                          Uyarı
                        </div>
                      </div>
                      <div>
                        Ekonomik veriler, yaklaşan bir finansal kriz riskini işaret ediyor. 
                        Önlem almanız gerekebilir.
                      </div>
                    </div>
                  </div>
                </Card>
              </>
            )}
            
            {/* Diğer tab içerikleri burada */}
            {activeSection !== 'dashboard' || activeTab !== 'overview' && (
              <Card>
                <CardTitle>{activeSection} - {activeTab}</CardTitle>
                <p>Bu içerik henüz geliştirme aşamasındadır.</p>
                
                <Button 
                  onClick={() => {
                    setActiveSection('dashboard');
                    setActiveTab('overview');
                  }}
                  style={{ marginTop: '1rem' }}
                >
                  Ana Sayfaya Dön
                </Button>
              </Card>
            )}
          </TabContent>
          
          {/* Calendar */}
          <CalendarContainer>
            <CalendarHeader>
              <DateDisplay>
                <Calendar size={18} />
                <span>{formatMonth(currentMonth)} {currentYear}</span>
              </DateDisplay>
              
              <CalendarControls>
                <IconButton onClick={goToPreviousMonth}>
                  <ChevronLeft size={18} />
                </IconButton>
                
                <IconButton onClick={goToNextMonth}>
                  <ChevronRight size={18} />
                </IconButton>
                
                <Button onClick={saveGame} style={{ marginLeft: '1rem' }}>
                  <Save size={18} />
                  Kaydet
                </Button>
                
                <Button onClick={advanceOneDay} style={{ marginLeft: '0.5rem' }}>
                  Sonraki Gün
                </Button>
              </CalendarControls>
            </CalendarHeader>
            
            <DaysGrid>
              {/* Haftanın günleri başlıkları */}
              {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
                <div 
                  key={day} 
                  style={{ 
                    textAlign: 'center', 
                    padding: '0.5rem', 
                    fontWeight: 'bold', 
                    fontSize: '0.85rem' 
                  }}
                >
                  {day}
                </div>
              ))}
              
              {/* Günler */}
              {calendarDays.map((day, index) => {
                // Oyun tarihi
                const gameDate = gameState ? new Date(gameState.date) : new Date();
                const isActive = day.day === gameDate.getDate() && 
                              day.month === gameDate.getMonth() && 
                              day.year === gameDate.getFullYear();
                
                return (
                  <DayCell 
                    key={index}
                    isToday={day.isToday}
                    isActive={isActive}
                    hasEvent={day.hasEvent}
                    style={{ 
                      opacity: day.isCurrentMonth ? 1 : 0.5 
                    }}
                  >
                    <DayNumber isToday={day.isToday}>
                      {day.day}
                    </DayNumber>
                    
                    {day.hasEvent && (
                      <EventIndicator />
                    )}
                  </DayCell>
                );
              })}
            </DaysGrid>
          </CalendarContainer>
        </MainPanel>
      </Content>
    </DashboardContainer>
  );
};

// Yardımcı fonksiyonlar
function getStatusColor(value) {
  if (value >= 75) return 'rgba(100, 255, 100, 0.9)';
  if (value >= 50) return 'rgba(200, 200, 100, 0.9)';
  if (value >= 25) return 'rgba(255, 150, 50, 0.9)';
  return 'rgba(255, 100, 100, 0.9)';
}

function getStatusText(value) {
  if (value >= 75) return 'Çok İyi';
  if (value >= 50) return 'İyi';
  if (value >= 25) return 'Orta';
  return 'Kötü';
}

export default GameDashboard;
