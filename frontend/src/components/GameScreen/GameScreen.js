import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import CountryManagementPanel from '../CountryManagementPanel/CountryManagementPanel';
import apiHelper from '../../services/apiHelper';


// Yeni alt bileşenler
import DashboardTab from './DashboardTab';
import CharacterTab from './CharacterTab';
import CountryTab from './CountryTab';
import CalendarSystem from './CalendarSystem';
import HeaderComponent from './HeaderComponent';
import SidebarComponent from './SidebarComponent';
import ActionModal from './ActionModal';
import ResultPanel from './ResultPanel';
import EventModal from './EventModal';
import ActionButton from './ActionButton';
import SettingsPopup from './SettingsPopup';

// Stil tanımları (mevcut styled-components tanımları burada kalabilir)
const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(to bottom, #1a2a3a, #0a1a2a);
  color: white;
  font-family: 'Orbitron', sans-serif;
  overflow: hidden;
`;

const GameCanvas = styled.div`
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
`;

const GameScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [characterData, setCharacterData] = useState(null);
  const [partyData, setPartyData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // UI state'leri
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showResultPanel, setShowResultPanel] = useState(false);
  const [resultContent, setResultContent] = useState(null);
  const [isShowingResults, setIsShowingResults] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [currentActionCategory, setCurrentActionCategory] = useState(null);
  
  // Takvim ve oyun zamanı state'leri
  const [currentDate, setCurrentDate] = useState({
    week: 1,
    month: 1,
    year: 2025
  });
  
  // Aksiyon puanları state'i
  const [actionPoints, setActionPoints] = useState(3);
  const [maxActionPoints, setMaxActionPoints] = useState(3);
  const [scheduledActions, setScheduledActions] = useState({});
  const [selectedWeek, setSelectedWeek] = useState(null);
  
  // Oyun parametreleri state'i
  const [gameParameters, setGameParameters] = useState({
    economy: {
      inflation: 63,
      unemployment: 12.5,
      growth: 3.2,
      budget: -40,
      stockMarket: 8650
    },
    politics: {
      partySupport: 28.5,
      coalitionStrength: 52,
      oppositionStrength: 47,
      publicApproval: 35
    },
    social: {
      education: 68,
      healthcare: 72,
      security: 76,
      happiness: 54
    },
    international: {
      relations: {
        us: 65,
        eu: 58,
        russia: 42,
        china: 70,
        middleEast: 75
      },
      reputation: 65
    }
  });
  
  // Olaylar state'i
  const [currentEvents, setCurrentEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  
  // Karakter ve oyun verilerini yükle
  useEffect(() => {
    // Oyun verilerini yükleme mantığı
    const loadGameData = async () => {
      try {
        setLoading(true);
        
        // Karakter bilgilerini al
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const slotId = location.state?.slotId || 1;
            const response = await apiHelper.get(`/api/game/get-character/${slotId}`);
            
            if (response.success && response.data.character) {
              setCharacterData(response.data.character);
            }
          } catch (error) {
            console.error("Karakter verileri alınamadı:", error);
            
            // Test amaçlı varsayılan karakter verileri
            setCharacterData({
              name: "Mehmet Yılmaz",
              party: "Cumhuriyet Halk Partisi",
              partyShort: "CHP",
              partyColor: "#E81B23",
              role: "Milletvekili",
              popularity: 42,
              experience: 0,
              skills: {
                charisma: 6,
                intelligence: 7,
                determination: 5,
                communication: 8,
                leadership: 6
              }
            });
          }
        } else {
          // Test amaçlı varsayılan karakter verileri
          setCharacterData({
            name: "Mehmet Yılmaz",
            party: "Cumhuriyet Halk Partisi",
            partyShort: "CHP",
            partyColor: "#E81B23",
            role: "Milletvekili",
            popularity: 42,
            experience: 0,
            skills: {
              charisma: 6,
              intelligence: 7,
              determination: 5,
              communication: 8,
              leadership: 6
            }
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Oyun verileri yüklenirken hata oluştu:", error);
        setLoading(false);
      }
    };
    
    loadGameData();
  }, [navigate, location.state]);
  
  // Bir sonraki haftayı hesapla
  const getNextWeek = (weekData) => {
    let nextWeek = weekData.week + 1;
    let nextMonth = weekData.month;
    let nextYear = weekData.year;
    
    // Ay sonu kontrolü (her ay 4 hafta varsayıyoruz)
    if (nextWeek > 4) {
      nextWeek = 1;
      nextMonth += 1;
    }
    
    // Yıl sonu kontrolü
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    
    return { week: nextWeek, month: nextMonth, year: nextYear };
  };
  
  // Haftayı ilerlet
  const endWeek = () => {
    if (isShowingResults) {
      setIsShowingResults(false);
      setShowResultPanel(false);
      return;
    }
    
    // Sonraki haftaya geç
    const nextWeekData = getNextWeek(currentDate);
    setCurrentDate(nextWeekData);
    
    // Rastgele bir olay oluştur (yüzde 20 şans)
    if (Math.random() < 0.2) {
      // Örnek olay listesi
      const events = [
        {
          id: 'economicCrisis',
          title: 'Ekonomik Dalgalanma',
          description: 'Küresel piyasalardaki dalgalanmalar TL üzerinde baskı oluşturuyor. Ekonomik istikrar için bir önlem almanız gerekiyor.',
          image: '💹',
          options: [
            { 
              id: 'increaseInterest', 
              text: 'Faiz artışı', 
              description: 'Merkez Bankası\'nın faizleri artırmasını destekleyin.',
              effects: {
                economy: { inflation: -3, stockMarket: -500 },
                politics: { publicApproval: -5 },
                description: 'Faiz artışı enflasyonu düşürdü ancak borsa düştü ve halkın tepkisini çekti.'
              }
            },
            { 
              id: 'fiscalSupport', 
              text: 'Mali destek paketi', 
              description: 'Ekonomiye mali destek paketi açıklayın.',
              effects: {
                economy: { inflation: 2, budget: -10, growth: 1 },
                politics: { publicApproval: 8 },
                description: 'Mali destek paketi büyümeyi artırdı ve halkın desteğini kazandı, ancak bütçe açığı arttı ve enflasyon yükseldi.'
              }
            }
          ]
        },
        {
          id: 'educationReform',
          title: 'Eğitim Reformu Tartışmaları',
          description: 'Eğitim sistemindeki sorunlar kamuoyunda tartışılıyor ve bir reform talebi var. Partinizin pozisyonu ne olacak?',
          image: '📚',
          options: [
            { 
              id: 'comprehensiveReform', 
              text: 'Kapsamlı reform', 
              description: 'Eğitim sisteminde köklü değişiklikler içeren reform paketi.',
              effects: {
                social: { education: 8 },
                politics: { publicApproval: 5, partySupport: 3 },
                description: 'Kapsamlı eğitim reformu halkın desteğini kazandı ve eğitim kalitesini artırdı.'
              }
            },
            { 
              id: 'gradualChanges', 
              text: 'Aşamalı değişiklikler', 
              description: 'Sistemde aşamalı iyileştirmeler yapın.',
              effects: {
                social: { education: 3 },
                politics: { publicApproval: 2, coalitionStrength: 3 },
                description: 'Aşamalı değişiklikler koalisyon ortaklarınız tarafından desteklendi, ancak radikal bir iyileşme sağlanamadı.'
              }
            }
          ]
        }
      ];
      
      // Rastgele bir olay seç
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      setCurrentEvent(randomEvent);
      setShowEventModal(true);
    }
    
    // Aksiyon haklarını yenile
    setActionPoints(maxActionPoints);
  };
  
  // Hafta seçme işlemi
  const handleWeekClick = (weekData) => {
    // Hafta geçmiş mi kontrolü
    const isPastWeek = (week, month, year) => {
      if (year < currentDate.year) return true;
      if (year === currentDate.year && month < currentDate.month) return true;
      if (year === currentDate.year && month === currentDate.month && week < currentDate.week) return true;
      return false;
    };
    
    // Şu anki hafta mı kontrolü
    const isCurrentWeek = (week, month, year) => {
      return week === currentDate.week && month === currentDate.month && year === currentDate.year;
    };
    
    // Geçmiş veya şu anki haftalar için işlem yapma
    if (isPastWeek(weekData.week, weekData.month, weekData.year) || 
        isCurrentWeek(weekData.week, weekData.month, weekData.year)) {
      return;
    }
    
    // Sonraki hafta mı kontrolü
    const nextWeekData = getNextWeek(currentDate);
    const isNextWeek = weekData.week === nextWeekData.week && 
                        weekData.month === nextWeekData.month && 
                        weekData.year === nextWeekData.year;
    
    if (!isNextWeek) {
      alert("Sadece bir sonraki haftaya aksiyon planlayabilirsiniz!");
      return;
    }
    
    // Aksiyon puanı kontrolü
    if (actionPoints <= 0) {
      alert("Bu hafta için aksiyon puanınız kalmadı!");
      return;
    }
    
    setSelectedWeek(weekData);
    setShowActionModal(true);
  };
  
  // Aksiyon butonlarına tıklama işlemi
  const handleActionCategorySelect = (categoryId) => {
    // Aksiyon puanı kontrolü
    if (actionPoints <= 0) {
      alert("Bu hafta için aksiyon puanınız kalmadı!");
      return;
    }
    
    // Sonraki hafta için aksiyon planla
    const nextWeekData = getNextWeek(currentDate);
    setSelectedWeek(nextWeekData);
    setCurrentActionCategory(categoryId);
    setShowActionModal(true);
  };
  
  // Aksiyon planlama
  const scheduleAction = (action) => {
    if (!selectedWeek) return;
    
    // Hafta anahtarı oluştur
    const formatWeekKey = (year, month, week) => {
      return `${year}-${month.toString().padStart(2, '0')}-${week.toString().padStart(2, '0')}`;
    };
    
    const weekKey = formatWeekKey(selectedWeek.year, selectedWeek.month, selectedWeek.week);
    
    // Aksiyon puanı kontrolü
    if (action.cost > actionPoints) {
      alert(`Bu aksiyon için yeterli puanınız yok! (Gereken: ${action.cost}, Mevcut: ${actionPoints})`);
      return;
    }
    
    // Aksiyon planla
    setScheduledActions(prev => ({
      ...prev,
      [weekKey]: action
    }));
    
    // Aksiyon puanını harca
    setActionPoints(prev => prev - action.cost);
    
    // Modalı kapat
    setShowActionModal(false);
    
    // Kullanıcıya bildir
    alert(`"${action.name}" aksiyonu planlandı.`);
  };
  
  // Olay/karar sonucunu işle
  const handleEventOption = (option) => {
    if (!currentEvent || !option.effects) return;
    
    // Ekonomik etkileri uygula
    if (option.effects.economy) {
      setGameParameters(prev => ({
        ...prev,
        economy: {
          ...prev.economy,
          ...Object.entries(option.effects.economy).reduce((acc, [key, value]) => {
            acc[key] = prev.economy[key] + value;
            return acc;
          }, {})
        }
      }));
    }
    
    // Politik etkileri uygula
    if (option.effects.politics) {
      setGameParameters(prev => ({
        ...prev,
        politics: {
          ...prev.politics,
          ...Object.entries(option.effects.politics).reduce((acc, [key, value]) => {
            acc[key] = prev.politics[key] + value;
            return acc;
          }, {})
        }
      }));
    }
    
    // Sosyal etkileri uygula
    if (option.effects.social) {
      setGameParameters(prev => ({
        ...prev,
        social: {
          ...prev.social,
          ...Object.entries(option.effects.social).reduce((acc, [key, value]) => {
            acc[key] = prev.social[key] + value;
            return acc;
          }, {})
        }
      }));
    }
    
    // Uluslararası etkileri uygula
    if (option.effects.international) {
      setGameParameters(prev => ({
        ...prev,
        international: {
          ...prev.international,
          ...Object.entries(option.effects.international).reduce((acc, [key, value]) => {
            if (key === 'relations') {
              acc.relations = {
                ...prev.international.relations,
                ...value
              };
            } else {
              acc[key] = prev.international[key] + value;
            }
            return acc;
          }, {relations: {...prev.international.relations}})
        }
      }));
    }
    
    // Modalı kapat
    setShowEventModal(false);
    
    // Sonuç paneli göster
    setResultContent({
      title: currentEvent.title,
      description: option.effects.description || 'Kararınız uygulandı.',
      icon: currentEvent.image
    });
    setShowResultPanel(true);
    setIsShowingResults(true);
    
    // Olayı geçmiş olaylara ekle
    setPastEvents(prev => [{
      id: currentEvent.id,
      title: currentEvent.title,
      description: currentEvent.description,
      selectedOption: option.text,
      date: new Date().toISOString()
    }, ...prev]);
  };
  
  // Yükleme durumu
  if (loading) {
    return (
      <GameContainer>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
          <div>Oyun verileri yükleniyor, lütfen bekleyin...</div>
        </div>
      </GameContainer>
    );
  }

  return (
    <GameContainer>
      {/* Header Component */}
      <HeaderComponent 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        character={characterData || {name: "Mehmet Yılmaz", party: "Cumhuriyet Halk Partisi", partyShort: "CHP", partyColor: "#E81B23", popularity: 42}}
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
      />
      
      <GameCanvas>
        {/* Sidebar Component */}
        {sidebarOpen && (
          <SidebarComponent 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            setSidebarOpen={setSidebarOpen}
            parameters={gameParameters}
          />
        )}
        
        {/* Main Content Area */}
        <MainContent>
          {/* Sonuç paneli */}
          {showResultPanel && resultContent && (
            <ResultPanel 
              content={resultContent}
              onClose={() => setShowResultPanel(false)}
            />
          )}
          
          {/* Tab Contents */}
          {activeTab === 'dashboard' && (
            <DashboardTab 
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              character={characterData || {name: "Mehmet Yılmaz", party: "Cumhuriyet Halk Partisi", popularity: 42, experience: 0}}
              parameters={gameParameters}
              currentEvents={currentEvents}
            />
          )}
          
          {activeTab === 'character' && (
            <CharacterTab character={characterData || {name: "Mehmet Yılmaz", skills: {charisma: 6, intelligence: 7, determination: 5, communication: 8, leadership: 6}}} />
          )}
          
          {activeTab === 'country' && (
            <CountryTab parameters={gameParameters} />
          )}
          
          {/* Other tabs here... */}
        </MainContent>
      </GameCanvas>
      
      {/* Calendar System */}
      <CalendarSystem 
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        actionPoints={actionPoints}
        scheduledActions={scheduledActions}
        onWeekClick={handleWeekClick}
        onEndWeek={endWeek}
        onActionCategorySelect={handleActionCategorySelect}
      />
      
      {/* Settings Popup */}
      {settingsOpen && (
        <SettingsPopup onClose={() => setSettingsOpen(false)} />
      )}
      
      {/* Modals */}
      {showActionModal && (
        <ActionModal 
          selectedWeek={selectedWeek}
          actionPoints={actionPoints}
          initialCategory={currentActionCategory}
          onSchedule={scheduleAction}
          onClose={() => {
            setShowActionModal(false);
            setCurrentActionCategory(null);
          }}
        />
      )}
      
      {showEventModal && currentEvent && (
        <EventModal 
          event={currentEvent}
          onSelectOption={handleEventOption}
          onClose={() => setShowEventModal(false)}
        />
      )}
    </GameContainer>
  );
};

export default GameScreen;
