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
    // ...
    
    // Örnek veri yükleme tamamlandı
    setLoading(false);
  }, [navigate]);
  
  // Haftayı ilerlet
  const endWeek = () => {
    if (isShowingResults) {
      setIsShowingResults(false);
      setShowResultPanel(false);
      return;
    }
    
    // Sonraki haftaya geç (CalendarSystem bileşeninden gelecek)
    // ...
    
    // Rastgele olay oluştur
    // ...
    
    // Aksiyon haklarını yenile
    setActionPoints(maxActionPoints);
  };
  
  // Hafta seçme işlemi
  const handleWeekClick = (weekData) => {
    // Seçilen haftaya aksiyon planlama mantığı
    // ...
    
    setSelectedWeek(weekData);
    setShowActionModal(true);
  };
  
  // Aksiyon planlama
  const scheduleAction = (action) => {
    // Aksiyon planlama mantığı
    // ...
    
    setShowActionModal(false);
  };
  
  // Olay/karar sonucunu işle
  const handleEventOption = (option) => {
    // Olay/karar sonuçlarını uygulama mantığı
    // ...
    
    setShowEventModal(false);
    
    // Sonuç paneli göster
    setResultContent({
      title: currentEvent.title,
      description: option.effects.description || 'Kararınız uygulandı.',
      icon: currentEvent.image
    });
    setShowResultPanel(true);
    setIsShowingResults(true);
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
              character={{...characterData, name: "Mehmet Yılmaz", party: "Cumhuriyet Halk Partisi", popularity: 42, experience: 0}}
              parameters={gameParameters}
              currentEvents={currentEvents}
            />
          )}
          
          {activeTab === 'character' && (
            <CharacterTab character={{...characterData, name: "Mehmet Yılmaz", skills: {charisma: 6, intelligence: 7, determination: 5, communication: 8, leadership: 6}}} />
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
          onSchedule={scheduleAction}
          onClose={() => setShowActionModal(false)}
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
