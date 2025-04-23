// src/components/GameDashboard/GameDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { 
  Settings, Calendar, ChevronLeft, ChevronRight, Save, 
  LogOut, Home, BarChart2, FileText, Users, MessageCircle, 
  Award, Map, Clock, AlertTriangle, Check, X, HelpCircle, Activity, Globe, User
} from 'lucide-react';

// API yardımcı servisi
import apiHelper from '../../services/apiHelper';

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
  padding: 0.75rem 1.5rem;
  background: rgba(0, 30, 60, 0.7);
  border-bottom: 1px solid rgba(0, 200, 255, 0.3);
  height: 60px;
  z-index: 10;
`;

const GameTitle = styled.h2`
  margin: 0;
  color: rgba(0, 200, 255, 0.8);
  font-size: 1.2rem;
`;

const HeaderControls = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: center;
`;

const HeaderInfo = styled.div`
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  padding: 0.3rem 0.8rem;
  background: rgba(0, 20, 40, 0.5);
  border-radius: 4px;
  border: 1px solid rgba(0, 100, 150, 0.3);
`;

const HeaderIconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 60, 120, 0.5);
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 100, 200, 0.6);
  }
`;

const GameContent = styled.div`
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
`;

const SideMenu = styled.div`
  width: 220px;
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
    background: ${(props) => (props.active ? 'rgba(0, 100, 200, 0.5)' : 'rgba(0, 100, 200, 0.3)')};
  }
  
  & svg {
    margin-right: 0.75rem;
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ContentHeader = styled.div`
  padding: 1rem 1.5rem;
  background: rgba(0, 25, 50, 0.7);
  border-bottom: 1px solid rgba(0, 200, 255, 0.2);
`;

const ContentTitle = styled.h2`
  margin: 0;
  font-size: 1.3rem;
  color: rgba(0, 200, 255, 0.9);
`;

const ContentBody = styled.div`
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const DashboardCard = styled.div`
  background: rgba(0, 40, 80, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(0, 200, 255, 0.3);
  padding: 1.25rem;
  
  h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: rgba(0, 200, 255, 0.8);
    font-size: 1.1rem;
  }
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const StatLabel = styled.span`
  color: rgba(255, 255, 255, 0.7);
`;

const StatValue = styled.span`
  font-weight: 500;
  ${props => props.color && `color: ${props.color};`}
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(0, 30, 60, 0.8);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 0.4rem;
`;

const ProgressFill = styled.div`
  height: 100%;
  border-radius: 3px;
  background: ${props => props.color || 'linear-gradient(to right, #3498db, #2ecc71)'};
  width: ${props => props.value}%;
`;

const Button = styled.button`
  padding: 0.6rem 1.2rem;
  background: rgba(0, 100, 200, 0.5);
  border: none;
  border-radius: 5px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Orbitron', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    background: rgba(0, 150, 255, 0.7);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Alert = styled.div`
  background: ${props => {
    switch(props.type) {
      case 'success': return 'rgba(46, 204, 113, 0.2)';
      case 'warning': return 'rgba(241, 196, 15, 0.2)';
      case 'danger': return 'rgba(231, 76, 60, 0.2)';
      default: return 'rgba(52, 152, 219, 0.2)';
    }
  }};
  border-left: 4px solid ${props => {
    switch(props.type) {
      case 'success': return 'rgba(46, 204, 113, 0.8)';
      case 'warning': return 'rgba(241, 196, 15, 0.8)';
      case 'danger': return 'rgba(231, 76, 60, 0.8)';
      default: return 'rgba(52, 152, 219, 0.8)';
    }
  }};
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
`;

const EventItem = styled.div`
  padding: 1rem;
  border-bottom: 1px solid rgba(0, 200, 255, 0.15);
  
  &:last-child {
    border-bottom: none;
  }
  
  h4 {
    margin-top: 0;
    margin-bottom: 0.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  p {
    margin: 0;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
  }
`;

const EventDate = styled.span`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
`;

const EventActions = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 0.75rem;
`;

// Takvim/Zaman Yönetimi Bileşenleri
const CalendarContainer = styled.div`
  background: rgba(0, 30, 60, 0.7);
  border-top: 1px solid rgba(0, 200, 255, 0.3);
  padding: 1rem 1.5rem;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const CalendarDate = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const DateDisplay = styled.span`
  font-weight: 500;
  font-size: 1.1rem;
`;

const CalendarProgress = styled.div`
  flex: 1;
  margin: 0 1.5rem;
  
  .progress-label {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 0.25rem;
  }
`;

const CalendarControls = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const WeeksContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
`;

const WeekItem = styled.div`
  background: ${props => 
    props.isCurrent ? 'rgba(231, 76, 60, 0.5)' : 
    props.isPast ? 'rgba(0, 30, 60, 0.7)' : 
    'rgba(0, 60, 120, 0.5)'
  };
  border: 1px solid ${props => 
    props.isCurrent ? 'rgba(231, 76, 60, 0.8)' : 
    'rgba(0, 200, 255, 0.3)'
  };
  border-radius: 6px;
  padding: 0.75rem 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  
  &:hover {
    background: ${props => 
      props.isCurrent ? 'rgba(231, 76, 60, 0.6)' : 
      'rgba(0, 80, 150, 0.6)'
    };
  }
`;

const WeekNumber = styled.div`
  font-weight: 500;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
`;

const WeekYear = styled.div`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.5rem;
`;

const WeekAction = styled.div`
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
`;

const WeekSpecial = styled.div`
  font-size: 0.75rem;
  color: rgba(255, 255, 200, 0.8);
  margin-top: 0.25rem;
`;

// Modal bileşenleri
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 10, 20, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

const ModalContent = styled.div`
  background: rgba(0, 30, 60, 0.95);
  border: 1px solid rgba(0, 200, 255, 0.5);
  border-radius: 8px;
  padding: 1.5rem;
  width: ${props => props.width || '500px'};
  max-width: 95vw;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: rgba(0, 200, 255, 0.9);
  font-size: 1.2rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(0, 200, 255, 0.3);
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 200, 255, 0.3);
`;

const ModalCloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: white;
  }
`;

// SettingsMenu bileşeni
const SettingsMenu = styled.div`
  position: absolute;
  top: 70px;
  right: 20px;
  background: rgba(0, 30, 60, 0.95);
  border: 1px solid rgba(0, 200, 255, 0.3);
  border-radius: 8px;
  padding: 0.75rem 0;
  width: 200px;
  z-index: 50;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
`;

const SettingsMenuItem = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.6rem 1rem;
  background: transparent;
  border: none;
  color: white;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 100, 200, 0.3);
  }
  
  & svg {
    margin-right: 0.75rem;
    color: rgba(0, 200, 255, 0.8);
  }
`;

const SettingsDivider = styled.div`
  height: 1px;
  background: rgba(0, 200, 255, 0.3);
  margin: 0.5rem 0;
`;

// Ana Oyun Bileşeni
const GameDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Genel state'ler
  const [activeTab, setActiveTab] = useState('overview');
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Game state'leri
  const [gameState, setGameState] = useState({
    paused: false,
    saveSlot: 1, // Varsayılan olarak slot 1'i kullan
    saveId: null
  });
  
  // Karakter ve parti verileri
  const [characterData, setCharacterData] = useState(null);
  const [partyData, setPartyData] = useState(null);
  
  // Oyun verileri
  const [gameData, setGameData] = useState({
    currentDate: "1 Ocak 2025",
    currentWeek: 1,
    currentMonth: 1,
    currentYear: 2025,
    nextElection: {
      type: "Genel Seçim",
      weeksLeft: 52
    },
    economy: {
      gdp: 1200000000000,
      growth: 3.2,
      inflation: 42.8,
      unemployment: 12.3,
      exchangeRate: 32.5,
      interestRate: 35,
      budgetDeficit: -52
    },
    partyPopularity: 30,
    partyFunds: 1500000,
    seats: 0,
    totalSeats: 600
  });
  
  // Takvim sistemi state'leri
  const [viewOffset, setViewOffset] = useState(0);
  const [visibleWeeks, setVisibleWeeks] = useState([]);
  const [scheduledActions, setScheduledActions] = useState({});
  const [completedActions, setCompletedActions] = useState({});
  const [actionUsedToday, setActionUsedToday] = useState(false);
  
  // Modal state'leri
  const [showActionModal, setShowActionModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [modalContent, setModalContent] = useState(null);
  
  // Haftalık olaylar (simüle edilmiş)
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Bütçe Görüşmeleri",
      description: "Meclis'te bütçe görüşmeleri başladı. Partinizden bu konuda bir açıklama yapmanız bekleniyor.",
      date: "2 gün önce",
      type: "legislation",
      status: "pending"
    },
    {
      id: 2,
      title: "Medya Röportaj Daveti",
      description: "Haber TV'den röportaj talebi geldi. Yarın saat 18:00'de katılabilirsiniz.",
      date: "5 saat önce",
      type: "media",
      status: "pending"
    },
    {
      id: 3,
      title: "Ekonomik Veriler Açıklandı",
      description: "TÜİK yeni ekonomik verileri açıkladı. Enflasyon %42.8 olarak gerçekleşti.",
      date: "Dün",
      type: "economy",
      status: "info"
    }
  ]);
  
  // Özel hafta tanımları
  const specialWeeks = {
    1: "Yeni Yıl",
    13: "Bahar Dönemi",
    26: "Yaz Dönemi",
    39: "Sonbahar Dönemi",
    52: "Yıl Sonu"
  };
  
  // Aksiyonlar
  const possibleActions = [
    { id: 'speech', name: 'Konuşma Yap', icon: '🎤', description: 'Halk desteğini arttırır', category: 'public' },
    { id: 'campaign', name: 'Kampanya Düzenle', icon: '📣', description: 'Parti oylarını arttırabilir', category: 'public' },
    { id: 'tvProgram', name: 'TV Programına Çık', icon: '📺', description: 'Medya görünürlüğünü arttırır', category: 'media' },
    { id: 'meeting', name: 'Parti Toplantısı', icon: '👥', description: 'Parti içi ilişkileri güçlendirir', category: 'party' },
    { id: 'survey', name: 'Anket Yaptır', icon: '📊', description: 'Güncel parti oylarını gösterir', category: 'info' },
    { id: 'draftLaw', name: 'Yasa Tasarla', icon: '📜', description: 'Yeni bir yasa tasarısı hazırla', category: 'legislation' }
  ];
  
  // Sayfa yüklendiğinde oyun verilerini yükle
  useEffect(() => {
    const loadGameData = async () => {
      try {
        setIsLoading(true);
        
        // URL'den save slot'u al (varsa)
        const params = new URLSearchParams(location.search);
        const slotFromUrl = params.get('slot');
        const saveIdFromUrl = params.get('saveId');
        
        // URL'den veya state'den slot bilgisini al
        const saveSlot = slotFromUrl ? parseInt(slotFromUrl) : 
                      location.state?.saveSlot ? location.state.saveSlot : 1;
                      
        // URL'den veya state'den saveId bilgisini al
        const saveId = saveIdFromUrl ? parseInt(saveIdFromUrl) : 
                     location.state?.saveId ? location.state.saveId : null;
        
        setGameState(prev => ({
          ...prev,
          saveSlot,
          saveId
        }));
        
        console.log(`Oyun yükleniyor: Slot ${saveSlot}, Save ID: ${saveId}`);
        
        if (saveId) {
          // Kaydedilmiş oyunu yükle
          await loadSavedGame(saveId);
        } else {
          // Bu slot için en son otomatik kaydı ara
          await loadAutoSaveForSlot(saveSlot);
        }
        
        // Karakter ve parti verilerini yükle
        await Promise.all([loadCharacterData(), loadPartyData()]);
        
        // Görünen haftaları güncelle
        updateVisibleWeeks();
        
      } catch (error) {
        console.error("Oyun verisi yükleme hatası:", error);
        // Hata oluşsa bile devam etmek için basit bir oyun verisi oluştur
        initializeNewGame(1);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadGameData();
  }, [location]);
  
  // Kaydedilmiş oyunu yükle
  const loadSavedGame = async (saveId) => {
    try {
      console.log(`Oyun yükleniyor, Save ID: ${saveId}`);
      
      // API'dan oyun verilerini al
      const response = await apiHelper.get(`/api/game/load-game/${saveId}`);
      
      if (response.success) {
        const saveData = response.data.saveData;
        
        // Karakter ve parti verilerini ayarla
        setCharacterData(saveData.character);
        setPartyData(saveData.party);
        
        // Oyun verilerini ayarla
        setGameData(saveData.gameData);
        
        console.log("Kaydedilmiş oyun başarıyla yüklendi:", saveData);
      } else {
        console.error("Kaydedilmiş oyun yüklenemedi:", response.message);
        
        // API hatası durumunda basit bir oyun verisi oluştur
        initializeNewGame(gameState.saveSlot);
      }
    } catch (error) {
      console.error("Kaydedilmiş oyun yükleme hatası:", error);
      
      // Hata durumunda basit bir oyun verisi oluştur
      initializeNewGame(gameState.saveSlot);
    }
  };
  
  // Belirli bir slot için otomatik kaydı yükle
  const loadAutoSaveForSlot = async (slot) => {
    try {
      console.log(`Slot ${slot} için otomatik kayıt aranıyor...`);
      
      // API'dan otomatik kayıtları al
      const response = await apiHelper.get('/api/game/saved-games');
      
      if (response.success && response.data.savedGames?.length > 0) {
        // Slot'a ait otomatik kayıtları filtrele
        const autoSaves = response.data.savedGames.filter(
          save => save.isAutoSave && save.saveSlot === slot
        );
        
        if (autoSaves.length > 0) {
          // En son otomatik kaydı al
          const latestAutoSave = autoSaves[0];
          console.log(`Slot ${slot} için otomatik kayıt bulundu:`, latestAutoSave);
          
          // Otomatik kaydı yükle
          await loadSavedGame(latestAutoSave.id);
          return;
        }
      }
      
      // Otomatik kayıt yoksa, yeni bir oyun başlat
      console.log(`Slot ${slot} için otomatik kayıt bulunamadı, yeni oyun başlatılıyor...`);
      initializeNewGame(slot);
      
    } catch (error) {
      console.error("Otomatik kayıt yükleme hatası:", error);
      initializeNewGame(slot);
    }
  };
  
  // Yeni bir oyun başlat
  const initializeNewGame = (slot) => {
    console.log(`Slot ${slot} için yeni oyun başlatılıyor...`);
    
    // Varsayılan oyun verilerini ayarla
    setGameData({
      currentDate: "1 Ocak 2025",
      currentWeek: 1,
      currentMonth: 1,
      currentYear: 2025,
      nextElection: {
        type: "Genel Seçim",
        weeksLeft: 52
      },
      economy: {
        gdp: 1200000000000,
        growth: 3.2,
        inflation: 42.8,
        unemployment: 12.3,
        exchangeRate: 32.5,
        interestRate: 35,
        budgetDeficit: -52
      },
      partyPopularity: 30,
      partyFunds: 1500000,
      seats: 0,
      totalSeats: 600,
      gameState: 'new',
      lastSave: new Date().toISOString()
    });
    
    // Aksiyon kullanımını sıfırla
    setActionUsedToday(false);
    
    // Görünen haftaları güncelle
    updateVisibleWeeks();
  };
  
  // Karakter verilerini yükle
  const loadCharacterData = async () => {
    try {
      const response = await apiHelper.get('/api/game/get-character');
      
      if (response.success) {
        setCharacterData(response.data.character);
        return response.data.character;
      } else {
        console.error("Karakter verileri yüklenemedi:", response.message);
        return null;
      }
    } catch (error) {
      console.error("Karakter verileri yükleme hatası:", error);
      return null;
    }
  };
  
  // Parti verilerini yükle
  const loadPartyData = async () => {
    try {
      const response = await apiHelper.get('/api/game/get-party');
      
      if (response.success) {
        setPartyData(response.data.party);
        return response.data.party;
      } else {
        console.error("Parti verileri yüklenemedi:", response.message);
        return null;
      }
    } catch (error) {
      console.error("Parti verileri yükleme hatası:", error);
      return null;
    }
  };
  
  // Görünen haftaları güncelle
  const updateVisibleWeeks = () => {
    const weeks = [];
    let weekToShow = gameData.currentWeek + viewOffset;
    let yearToShow = gameData.currentYear;
    
    // Yıl değişikliklerini hesapla
    while (weekToShow > 52) {
      weekToShow -= 52;
      yearToShow += 1;
    }
    
    while (weekToShow < 1) {
      weekToShow += 52;
      yearToShow -= 1;
    }
    
    // 7 hafta göster
    for (let i = 0; i < 7; i++) {
      let week = weekToShow + i;
      let year = yearToShow;
      
      // Yıl değişimini kontrol et
      if (week > 52) {
        week = week - 52;
        year = year + 1;
      }
      
      weeks.push({ week, year });
    }
    
    setVisibleWeeks(weeks);
  };
  
  // Tarih formatları
  const formatWeekKey = (year, week) => {
    return `${year}-${week.toString().padStart(2, '0')}`;
  };

  const formatWeekDisplay = (week, year) => {
    return `${week}. Hafta, ${year}`;
  };
  
  // Tarih formatı için gün/ay/yıl hesaplama
  const formatDate = (week, year) => {
    // Basit bir tarih hesaplaması
    const date = new Date(year, 0, 1);
    date.setDate(date.getDate() + ((week - 1) * 7));
    
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Hafta geçmiş mi kontrolü
  const isPastWeek = (week, year) => {
    if (year < gameData.currentYear) return true;
    if (year === gameData.currentYear && week < gameData.currentWeek) return true;
    return false;
  };

  // Şu anki hafta mı kontrolü
  const isCurrentWeek = (week, year) => {
    return week === gameData.currentWeek && year === gameData.currentYear;
  };
  
  // Önceki haftalara git
  const showPreviousWeeks = () => {
    setViewOffset(viewOffset - 1);
    updateVisibleWeeks();
  };

  // Sonraki haftalara git
  const showNextWeeks = () => {
    setViewOffset(viewOffset + 1);
    updateVisibleWeeks();
  };
  
  // Haftaya tıklama işlemi
  const handleWeekClick = (weekData) => {
    // Geçmiş veya şu anki hafta ise sadece bilgi göster
    if (isPastWeek(weekData.week, weekData.year) || isCurrentWeek(weekData.week, weekData.year)) {
      setModalContent({
        title: formatWeekDisplay(weekData.week, weekData.year),
        content: (
          <div>
            <p>Bu haftada gerçekleşen olaylar:</p>
            {/* Burada geçmiş hafta olayları gösterilebilir */}
            <p>Henüz bu haftaya özel kayıtlı olay bulunmuyor.</p>
          </div>
        )
      });
      setShowResultModal(true);
      return;
    }
    
    // Şu anki haftadan sonraki ilk haftayı kontrol et
    const nextWeekData = getNextWeek({ week: gameData.currentWeek, year: gameData.currentYear });
    const isNextWeek = weekData.week === nextWeekData.week && weekData.year === nextWeekData.year;
    
    if (!isNextWeek) {
      setModalContent({
        title: "Uyarı",
        content: (
          <div>
            <p>Sadece bir sonraki haftaya aksiyon planlayabilirsiniz.</p>
          </div>
        )
      });
      setShowResultModal(true);
      return;
    }
    
    // Aksiyon planlama modunu başlat
    setSelectedWeek(weekData);
    setShowActionModal(true);
  };
  
  // Sonraki haftayı hesapla
  const getNextWeek = (weekData) => {
    let nextWeek = weekData.week + 1;
    let nextYear = weekData.year;
    
    if (nextWeek > 52) {
      nextWeek = 1;
      nextYear += 1;
    }
    
    return { week: nextWeek, year: nextYear };
  };
  
  // Aksiyon seç ve planla
  const planAction = (actionId) => {
    if (!selectedWeek) return;
    
    const weekKey = formatWeekKey(selectedWeek.year, selectedWeek.week);
    const action = possibleActions.find(a => a.id === actionId);
    
    if (!action) return;
    
    setScheduledActions(prev => ({
      ...prev,
      [weekKey]: action
    }));
    
    setActionUsedToday(true);
    setShowActionModal(false);
    
    // Kullanıcıya bildirim
    setModalContent({
      title: "Aksiyon Planlandı",
      content: (
        <div>
          <p>{formatWeekDisplay(selectedWeek.week, selectedWeek.year)} için <strong>{action.name}</strong> aksiyonu planlandı.</p>
          <p>Haftayı sonlandırdığınızda bu aksiyon otomatik olarak gerçekleştirilecektir.</p>
        </div>
      )
    });
    setShowResultModal(true);
  };
  
  // Haftayı sonlandır ve sonraki haftaya geç
  const endWeek = () => {
    // Sonraki hafta bilgilerini hazırla
    const nextWeekData = getNextWeek({ week: gameData.currentWeek, year: gameData.currentYear });
    const nextWeekKey = formatWeekKey(nextWeekData.year, nextWeekData.week);
    
    // Planlanmış aksiyonları uygula
    if (scheduledActions[nextWeekKey]) {
      const action = scheduledActions[nextWeekKey];
      
      // Aksiyonu tamamlanan aksiyonlar listesine ekle
      setCompletedActions(prev => ({
        ...prev,
        [nextWeekKey]: action
      }));
      
      // Planlanmış aksiyonlardan kaldır
      const newScheduled = {...scheduledActions};
      delete newScheduled[nextWeekKey];
      setScheduledActions(newScheduled);
      
      // Aksiyon sonuçlarını göster
      handleActionResult(action, nextWeekData);
    }
    
    // Oyun verilerini güncelle
    updateGameData(nextWeekData);
    
    // Oyunu kaydet
    saveGame(true); // Otomatik kayıt
  };
  
  // Aksiyon sonuçlarını göster
  const handleActionResult = (action, weekData) => {
    // Örnek sonuç üret
    const results = [];
    
    // Aksiyon tipine göre sonuçlar
    switch(action.id) {
      case 'speech':
        results.push("Konuşmanız başarılı geçti, parti popüleritesi %2 arttı.");
        
        // Oyun verilerini güncelle
        setGameData(prev => ({
          ...prev,
          partyPopularity: (prev.partyPopularity || 30) + 2
        }));
        break;
        
      case 'campaign':
        results.push("Kampanya sonucunda parti tanınırlığı arttı. Bir sonraki anket sonuçlarını bekleyin.");
        break;
        
      case 'tvProgram':
        results.push("TV programına katıldınız, medya etkisi %5 arttı.");
        break;
        
      case 'meeting':
        results.push("Parti toplantısı verimli geçti, iç dinamikler güçlendi.");
        break;
        
      case 'survey':
        // Anket sonuçları
        results.push("Anket sonuçları:");
        results.push("Partiniz: %22");
        results.push("AK Parti: %32");
        results.push("CHP: %25");
        results.push("İYİ Parti: %12");
        results.push("MHP: %8");
        results.push("Diğer: %1");
        break;
        
      case 'draftLaw':
        results.push("Yasa tasarısı hazırlandı, mecliste oylanmayı bekliyor.");
        break;
        
      default:
        results.push("Aksiyon tamamlandı.");
    }
    
    // Sonuçları göster
    setModalContent({
      title: `${action.name} Sonuçları`,
      content: (
        <div>
          {results.map((result, index) => (
            <p key={index}>{result}</p>
          ))}
        </div>
      )
    });
    setShowResultModal(true);
  };
  
  // Oyun verilerini güncelle
  const updateGameData = (nextWeekData) => {
    setGameData(prev => ({
      ...prev,
      currentWeek: nextWeekData.week,
      currentYear: nextWeekData.year,
      currentDate: formatDate(nextWeekData.week, nextWeekData.year),
      nextElection: {
        ...prev.nextElection,
        weeksLeft: Math.max(0, prev.nextElection.weeksLeft - 1)
      }
    }));
    
    // Yeni ayın ilk haftasıysa, ayı güncelle
    if (nextWeekData.week % 4 === 1) {
      const newMonth = Math.floor((nextWeekData.week - 1) / 4) + 1;
      setGameData(prev => ({
        ...prev,
        currentMonth: newMonth
      }));
      
      // Ay başı olayları
      generateMonthlyEvents(newMonth, nextWeekData.year);
    }
    
    setActionUsedToday(false);
    setViewOffset(0);
    
    // Görünen haftaları güncelle
    updateVisibleWeeks();
  };
  
  // Aylık olayları üret
  const generateMonthlyEvents = (month, year) => {
    // Ayın ilk günü için rastgele olaylar
    const newEvents = [
      {
        id: events.length + 1,
        title: `${month}. Ay Ekonomik Raporu`,
        description: "Ekonomik veriler açıklandı. Detaylar için tıklayın.",
        date: "Bugün",
        type: "economy",
        status: "info"
      }
    ];
    
    // Rastgele bir politik olay
    if (Math.random() > 0.5) {
      newEvents.push({
        id: events.length + 2,
        title: "Politik Gerilim",
        description: "İktidar ve muhalefet arasında yeni bir gerilim yaşanıyor.",
        date: "Bugün",
        type: "politics",
        status: "pending"
      });
    }
    
    // Rastgele bir parti içi olay
    if (Math.random() > 0.7) {
      newEvents.push({
        id: events.length + 3,
        title: "Parti İçi Anlaşmazlık",
        description: "Parti üyeleri arasında belirli konularda görüş ayrılıkları yaşanıyor.",
        date: "Bugün",
        type: "party",
        status: "pending"
      });
    }
    
    // Olayları ekle
    setEvents(prev => [...newEvents, ...prev]);
  };
  
  // Oyunu kaydet
  const saveGame = async (isAutoSave = false) => {
    try {
      // Oyun verilerini güncelle
      const updatedGameData = {
        ...gameData,
        lastSave: new Date().toISOString()
      };
      
      // API'ye gönder
      const saveSlot = isAutoSave ? gameState.saveSlot : null; // Otomatik kaydı mevcut slot'a, manuel kaydı yeni slot'a
      const saveName = isAutoSave ? "Otomatik Kayıt" : `${characterData?.fullName || 'Oyuncu'} - ${updatedGameData.currentDate}`;
      
      if (isAutoSave) {
        // Otomatik kayıt
        const response = await apiHelper.post('/api/game/update-auto-save', {
          gameData: updatedGameData
        });
        
        if (response.success) {
          console.log("Otomatik kayıt başarılı:", response.data);
          
          // Oyun verilerini güncelle
          setGameData(updatedGameData);
        } else {
          console.error("Otomatik kayıt başarısız:", response.message);
        }
      } else {
        // Manuel kayıt
        const response = await apiHelper.post('/api/game/save-game', {
          gameData: updatedGameData,
          saveName,
          saveSlot: gameState.saveSlot + 1 // Manuel kayıtlar için yeni slot
        });
        
        if (response.success) {
          console.log("Manuel kayıt başarılı:", response.data);
          
          // Oyun verilerini güncelle
          setGameData(updatedGameData);
          
          setModalContent({
            title: "Oyun Kaydedildi",
            content: (
              <div>
                <p>Oyun başarıyla kaydedildi!</p>
                <p>Kayıt Adı: {saveName}</p>
              </div>
            )
          });
          setShowResultModal(true);
        } else {
          console.error("Manuel kayıt başarısız:", response.message);
          
          setModalContent({
            title: "Kayıt Hatası",
            content: (
              <div>
                <p>Oyun kaydedilirken bir hata oluştu:</p>
                <p>{response.message}</p>
              </div>
            )
          });
          setShowResultModal(true);
        }
      }
    } catch (error) {
      console.error("Oyun kaydetme hatası:", error);
      
      if (!isAutoSave) {
        setModalContent({
          title: "Kayıt Hatası",
          content: (
            <div>
              <p>Oyun kaydedilirken bir hata oluştu:</p>
              <p>{error.message}</p>
            </div>
          )
        });
        setShowResultModal(true);
      }
    }
  };
  
  // Ana menüye dön
  const returnToMainMenu = () => {
    navigate('/');
  };
  
  // Takvim yardımcıları
  const getProgressPercentage = () => {
    return (gameData.currentWeek / 52) * 100;
  };
  
  const getElectionCountdown = () => {
    return gameData.nextElection.weeksLeft;
  };
  
  // Renk yardımcıları
  const getContrastColor = (hexColor) => {
    if (!hexColor) return "#ffffff";
    
    try {
      const r = parseInt(hexColor.slice(1, 3), 16);
      const g = parseInt(hexColor.slice(3, 5), 16);
      const b = parseInt(hexColor.slice(5, 7), 16);
      
      const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
      
      return brightness < 128 ? "#ffffff" : "#000000";
    } catch (e) {
      return "#ffffff";
    }
  };
  
  // İçerik oluşturucular
  const renderDashboardContent = () => {
    switch(activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'party':
        return renderPartyTab();
      case 'campaign':
        return renderCampaignTab();
      case 'diplomacy':
        return renderDiplomacyTab();
      case 'legislation':
        return renderLegislationTab();
      case 'economy':
        return renderEconomyTab();
      case 'media':
        return renderMediaTab();
      case 'character':
        return renderCharacterTab();
      default:
        return renderOverviewTab();
    }
  };
  
  // Ana Sayfa sekmesi içeriği
  const renderOverviewTab = () => (
    <>
      <ContentHeader>
        <ContentTitle>Genel Durum</ContentTitle>
      </ContentHeader>
      
      <ContentBody>
        <DashboardGrid>
          {/* Parti Durumu */}
          <DashboardCard>
            <h3>Parti Durumu</h3>
            <StatItem>
              <StatLabel>Parti Adı:</StatLabel>
              <StatValue>{partyData?.name || "Parti bulunamadı"}</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Popülerlik:</StatLabel>
              <StatValue>{gameData.partyPopularity || 30}%</StatValue>
            </StatItem>
            <ProgressBar>
              <ProgressFill 
                value={gameData.partyPopularity || 30} 
                color={partyData?.colorId || "#1976d2"}
              />
            </ProgressBar>
            <StatItem style={{ marginTop: '0.75rem' }}>
              <StatLabel>Parti Fonu:</StatLabel>
              <StatValue>{(gameData.partyFunds || 1500000).toLocaleString()} ₺</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Koltuk Sayısı:</StatLabel>
              <StatValue>{gameData.seats || 0}/{gameData.totalSeats || 600}</StatValue>
            </StatItem>
          </DashboardCard>
          
          {/* Karakteriniz */}
          <DashboardCard>
            <h3>Karakter Bilgileri</h3>
            <StatItem>
              <StatLabel>İsim:</StatLabel>
              <StatValue>{characterData?.fullName || "Karakter bulunamadı"}</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Yaş:</StatLabel>
              <StatValue>{characterData?.age || 40}</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Meslek:</StatLabel>
              <StatValue>{characterData?.profession || "Bilinmiyor"}</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Pozisyon:</StatLabel>
              <StatValue>{partyData ? "Genel Başkan" : "Bilinmiyor"}</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Siyasi Tecrübe:</StatLabel>
              <StatValue>Başlangıç</StatValue>
            </StatItem>
          </DashboardCard>
          
          {/* Ekonomik Durum */}
          <DashboardCard>
            <h3>Ekonomik Göstergeler</h3>
            <StatItem>
              <StatLabel>GSYH:</StatLabel>
              <StatValue>{(gameData.economy?.gdp / 1000000000).toFixed(1)} Trilyon ₺</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Büyüme:</StatLabel>
              <StatValue color={gameData.economy?.growth > 0 ? "#4caf50" : "#f44336"}>
                %{gameData.economy?.growth.toFixed(1)}
              </StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Enflasyon:</StatLabel>
              <StatValue color={gameData.economy?.inflation > 10 ? "#f44336" : "#4caf50"}>
                %{gameData.economy?.inflation.toFixed(1)}
              </StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>İşsizlik:</StatLabel>
              <StatValue color={gameData.economy?.unemployment > 10 ? "#f44336" : "#4caf50"}>
                %{gameData.economy?.unemployment.toFixed(1)}
              </StatValue>
            </StatItem>
          </DashboardCard>
          
          {/* Seçim Bilgileri */}
          <DashboardCard>
            <h3>Seçim Bilgileri</h3>
            <StatItem>
              <StatLabel>Sonraki Seçim:</StatLabel>
              <StatValue>{gameData.nextElection?.type || "Genel Seçim"}</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Kalan Süre:</StatLabel>
              <StatValue>{getElectionCountdown()} hafta</StatValue>
            </StatItem>
            <ProgressBar>
              <ProgressFill 
                value={100 - (getElectionCountdown() / 52 * 100)} 
                color={getElectionCountdown() < 8 ? "#f44336" : "#2196f3"}
              />
            </ProgressBar>
            <StatItem style={{ marginTop: '0.75rem' }}>
              <StatLabel>Son Anket:</StatLabel>
              <StatValue>{gameData.lastPoll || "Bulunmuyor"}</StatValue>
            </StatItem>
          </DashboardCard>
        </DashboardGrid>
        
        {/* Güncel Olaylar */}
        <DashboardCard>
          <h3>Güncel Olaylar</h3>
          
          {events.length > 0 ? (
            events.map(event => (
              <EventItem key={event.id}>
                <h4>
                  {event.title}
                  <EventDate>{event.date}</EventDate>
                </h4>
                <p>{event.description}</p>
                
                {event.status === 'pending' && (
                  <EventActions>
                    <Button>
                      <Check size={16} /> Onayla
                    </Button>
                    <Button>
                      <X size={16} /> Reddet
                    </Button>
                  </EventActions>
                )}
              </EventItem>
            ))
          ) : (
            <p>Şu anda aktif bir olay bulunmuyor.</p>
          )}
        </DashboardCard>
      </ContentBody>
    </>
  );
  
  // Parti sekmesi içeriği
  const renderPartyTab = () => (
    <>
      <ContentHeader>
        <ContentTitle>Parti Yönetimi</ContentTitle>
      </ContentHeader>
      
      <ContentBody>
        <Alert type="info">
          <p>Parti sayfası, parti verilerinizi yönetmenizi sağlar. Buradan parti üyelerini, ideolojinizi, politikalarınızı ve gelişim stratejinizi belirleyebilirsiniz.</p>
        </Alert>
        
        <DashboardCard>
          <h3>Parti Bilgileri</h3>
          
          {partyData ? (
            <>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '1rem',
                background: 'rgba(0, 30, 60, 0.5)',
                padding: '1rem',
                borderRadius: '6px'
              }}>
                <div style={{ 
                  backgroundColor: partyData.colorId || "#1976d2", 
                  color: getContrastColor(partyData.colorId),
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  marginRight: '1rem'
                }}>
                  {partyData.shortName}
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: '500' }}>
                  {partyData.name}
                </div>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <StatItem>
                  <StatLabel>Kurucu:</StatLabel>
                  <StatValue>{partyData.founderName || characterData?.fullName || "Bilinmiyor"}</StatValue>
                </StatItem>
                <StatItem>
                  <StatLabel>Kuruluş Tarihi:</StatLabel>
                  <StatValue>
                    {new Date(partyData.createdAt).toLocaleDateString('tr-TR')}
                  </StatValue>
                </StatItem>
                <StatItem>
                  <StatLabel>Üye Sayısı:</StatLabel>
                  <StatValue>{(partyData.members || 25000).toLocaleString()}</StatValue>
                </StatItem>
                <StatItem>
                  <StatLabel>İdeolojik Konum:</StatLabel>
                  <StatValue>
                    {partyData.ideology?.overallPosition < 35 ? "Sol" :
                     partyData.ideology?.overallPosition < 48 ? "Merkez Sol" :
                     partyData.ideology?.overallPosition < 52 ? "Merkez" :
                     partyData.ideology?.overallPosition < 65 ? "Merkez Sağ" : "Sağ"}
                  </StatValue>
                </StatItem>
              </div>
              
              {/* İdeoloji Grafiği */}
              <h3>İdeolojik Pozisyon</h3>
              {partyData.ideology && (
                <div style={{ marginTop: '0.5rem' }}>
                  {Object.entries(partyData.ideology).filter(([key]) => key !== 'overallPosition').map(([axis, value]) => (
                    <div key={axis} style={{ marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span>{axis === 'economic' ? 'Ekonomik' : 
                              axis === 'cultural' ? 'Kültürel' : 
                              axis === 'identity' ? 'Kimlik' : 
                              axis === 'religion' ? 'Din-Devlet' : 
                              axis === 'foreign' ? 'Dış Politika' : 
                              axis === 'governance' ? 'Yönetim' : 
                              axis === 'change' ? 'Değişim' : axis}</span>
                        <span>{value}/100</span>
                      </div>
                      <ProgressBar>
                        <ProgressFill value={value} />
                      </ProgressBar>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div>
              <p>Henüz bir parti oluşturmadınız.</p>
              <Button style={{ marginTop: '1rem' }} onClick={() => navigate('/party-creator')}>
                Parti Oluştur
              </Button>
            </div>
          )}
        </DashboardCard>
      </ContentBody>
    </>
  );
  
  // Kampanya sekmesi içeriği
  const renderCampaignTab = () => (
    <>
      <ContentHeader>
        <ContentTitle>Seçim Kampanyası</ContentTitle>
      </ContentHeader>
      
      <ContentBody>
        <Alert type="info">
          <p>Seçim kampanyası sayfası, seçim stratejilerinizi yönetmenizi sağlar. Buradan kampanya etkinlikleri düzenleyebilir, bütçe ayırabilir ve seçim vaatlerinizi belirleyebilirsiniz.</p>
        </Alert>
        
        <DashboardCard>
          <h3>Kampanya Planlaması</h3>
          <p>Bu kısım geliştirme aşamasındadır.</p>
        </DashboardCard>
      </ContentBody>
    </>
  );
  
  // Diplomasi sekmesi içeriği
  const renderDiplomacyTab = () => (
    <>
      <ContentHeader>
        <ContentTitle>Siyasi İlişkiler</ContentTitle>
      </ContentHeader>
      
      <ContentBody>
        <Alert type="info">
          <p>Siyasi ilişkiler sayfası, diğer partiler ve siyasi aktörlerle ilişkilerinizi yönetmenizi sağlar.</p>
        </Alert>
        
        <DashboardCard>
          <h3>Mevcut İlişkiler</h3>
          <p>Bu kısım geliştirme aşamasındadır.</p>
        </DashboardCard>
      </ContentBody>
    </>
  );
  
  // Yasama sekmesi içeriği
  const renderLegislationTab = () => (
    <>
      <ContentHeader>
        <ContentTitle>Yasama Faaliyetleri</ContentTitle>
      </ContentHeader>
      
      <ContentBody>
        <Alert type="info">
          <p>Yasama faaliyetleri sayfası, yasa tekliflerinizi ve mecliste devam eden yasama çalışmalarını takip etmenizi sağlar.</p>
        </Alert>
        
        <DashboardCard>
          <h3>Mevcut Yasalar</h3>
          <p>Bu kısım geliştirme aşamasındadır.</p>
        </DashboardCard>
      </ContentBody>
    </>
  );
  
  // Ekonomi sekmesi içeriği
  const renderEconomyTab = () => (
    <>
      <ContentHeader>
        <ContentTitle>Ekonomik Göstergeler</ContentTitle>
      </ContentHeader>
      
      <ContentBody>
        <Alert type="info">
          <p>Ekonomik göstergeler sayfası, ülke ekonomisinin genel durumunu ve ekonomik politikaları takip etmenizi sağlar.</p>
        </Alert>
        
        <DashboardCard>
          <h3>Temel Göstergeler</h3>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <StatItem>
              <StatLabel>GSYH:</StatLabel>
              <StatValue>{(gameData.economy?.gdp / 1000000000).toFixed(1)} Trilyon ₺</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Kişi Başı GSYH:</StatLabel>
              <StatValue>{Math.round(gameData.economy?.gdp / 85000000).toLocaleString()} ₺</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Büyüme:</StatLabel>
              <StatValue color={gameData.economy?.growth > 0 ? "#4caf50" : "#f44336"}>
                %{gameData.economy?.growth.toFixed(1)}
              </StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Enflasyon:</StatLabel>
              <StatValue color={gameData.economy?.inflation > 10 ? "#f44336" : "#4caf50"}>
                %{gameData.economy?.inflation.toFixed(1)}
              </StatValue>
            </StatItem>
          </div>
          
          <h3>Diğer Göstergeler</h3>
          
          <div>
            <StatItem>
              <StatLabel>İşsizlik:</StatLabel>
              <StatValue color={gameData.economy?.unemployment > 10 ? "#f44336" : "#4caf50"}>
                %{gameData.economy?.unemployment.toFixed(1)}
              </StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Döviz Kuru (USD/TL):</StatLabel>
              <StatValue>₺{gameData.economy?.exchangeRate.toFixed(2)}</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Faiz Oranı:</StatLabel>
              <StatValue>%{gameData.economy?.interestRate}</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Bütçe Açığı:</StatLabel>
              <StatValue color={gameData.economy?.budgetDeficit < 0 ? "#f44336" : "#4caf50"}>
                {gameData.economy?.budgetDeficit < 0 ? '-' : ''}{Math.abs(gameData.economy?.budgetDeficit).toLocaleString()} Milyar ₺
              </StatValue>
            </StatItem>
          </div>
        </DashboardCard>
      </ContentBody>
    </>
  );
  
  // Medya sekmesi içeriği
  const renderMediaTab = () => (
    <>
      <ContentHeader>
        <ContentTitle>Medya ve Halkla İlişkiler</ContentTitle>
      </ContentHeader>
      
      <ContentBody>
        <Alert type="info">
          <p>Medya ve halkla ilişkiler sayfası, basın açıklamaları, medya görünürlüğü ve kamuoyu algısını yönetmenizi sağlar.</p>
        </Alert>
        
        <DashboardCard>
          <h3>Medya Etkinlikleri</h3>
          <p>Bu kısım geliştirme aşamasındadır.</p>
        </DashboardCard>
      </ContentBody>
    </>
  );
  
  // Karakter sekmesi içeriği
  const renderCharacterTab = () => (
    <>
      <ContentHeader>
        <ContentTitle>Karakter Bilgileri</ContentTitle>
      </ContentHeader>
      
      <ContentBody>
        {characterData ? (
          <>
            <DashboardCard>
              <h3>Genel Bilgiler</h3>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <StatItem>
                  <StatLabel>Ad Soyad:</StatLabel>
                  <StatValue>{characterData.fullName}</StatValue>
                </StatItem>
                <StatItem>
                  <StatLabel>Yaş:</StatLabel>
                  <StatValue>{characterData.age}</StatValue>
                </StatItem>
                <StatItem>
                  <StatLabel>Cinsiyet:</StatLabel>
                  <StatValue>{characterData.gender}</StatValue>
                </StatItem>
                <StatItem>
                  <StatLabel>Doğum Yeri:</StatLabel>
                  <StatValue>{characterData.birthPlace}</StatValue>
                </StatItem>
                <StatItem>
                  <StatLabel>Meslek:</StatLabel>
                  <StatValue>{characterData.profession}</StatValue>
                </StatItem>
              </div>
              
              <h3>Karakter Özellikleri</h3>
              
              {characterData.stats && (
                <div style={{ marginTop: '0.5rem' }}>
                  {Object.entries(characterData.stats).map(([stat, value]) => (
                    <div key={stat} style={{ marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span>{stat.charAt(0).toUpperCase() + stat.slice(1)}</span>
                        <span>{value}/10</span>
                      </div>
                      <ProgressBar>
                        <ProgressFill value={value * 10} />
                      </ProgressBar>
                    </div>
                  ))}
                </div>
              )}
            </DashboardCard>
            
            <DashboardCard>
              <h3>İdeolojik Görüşler</h3>
              
              {characterData.ideology && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ 
                    background: 'rgba(0, 30, 60, 0.5)',
                    padding: '1rem',
                    borderRadius: '6px',
                    marginBottom: '1rem'
                  }}>
                    <StatItem>
                      <StatLabel>Genel İdeolojik Konum:</StatLabel>
                      <StatValue>
                        {characterData.ideology.overallPosition < 35 ? "Sol" :
                        characterData.ideology.overallPosition < 48 ? "Merkez Sol" :
                        characterData.ideology.overallPosition < 52 ? "Merkez" :
                        characterData.ideology.overallPosition < 65 ? "Merkez Sağ" : "Sağ"}
                      </StatValue>
                    </StatItem>
                    <div style={{ marginTop: '0.5rem' }}>
                      <ProgressBar>
                        <ProgressFill 
                          value={characterData.ideology.overallPosition} 
                          color="linear-gradient(to right, #d32f2f 0%, #7b1fa2 25%, #1976d2 50%, #ff9100 75%, #388e3c 100%)"
                        />
                      </ProgressBar>
                    </div>
                  </div>
                  
                  {Object.entries(characterData.ideology).filter(([key]) => key !== 'overallPosition').map(([axis, value]) => (
                    <div key={axis} style={{ marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span>{axis === 'economic' ? 'Ekonomik' : 
                              axis === 'cultural' ? 'Kültürel' : 
                              axis === 'identity' ? 'Kimlik' : 
                              axis === 'religion' ? 'Din-Devlet' : 
                              axis === 'foreign' ? 'Dış Politika' : 
                              axis === 'governance' ? 'Yönetim' : 
                              axis === 'change' ? 'Değişim' : axis}</span>
                        <span>{value}/100</span>
                      </div>
                      <ProgressBar>
                        <ProgressFill value={value} />
                      </ProgressBar>
                    </div>
                  ))}
                </div>
              )}
            </DashboardCard>
          </>
        ) : (
          <Alert type="warning">
            <p>Karakter verileri yüklenemedi. Lütfen daha sonra tekrar deneyin.</p>
          </Alert>
        )}
      </ContentBody>
    </>
  );
  
  // Yükleme gösterimi
  if (isLoading) {
    return (
      <GameContainer>
        <GameHeader>
          <GameTitle>Türkiye Siyaset Simülasyonu</GameTitle>
        </GameHeader>
        
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          flexDirection: 'column'
        }}>
          <div style={{ marginBottom: '1rem' }}>Oyun yükleniyor...</div>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '3px solid rgba(0, 200, 255, 0.3)',
            borderTop: '3px solid rgba(0, 200, 255, 0.8)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      </GameContainer>
    );
  }
  
  return (
    <GameContainer>
      <GameHeader>
        <GameTitle>Türkiye Siyaset Simülasyonu</GameTitle>
        
        <HeaderControls>
          <HeaderInfo>
            <Calendar size={16} style={{ marginRight: '8px' }} />
            {gameData.currentDate}
          </HeaderInfo>
          
          <HeaderInfo>
            <BarChart2 size={16} style={{ marginRight: '8px' }} />
            %{gameData.partyPopularity || 30}
          </HeaderInfo>
          
          <HeaderInfo>
            <FileText size={16} style={{ marginRight: '8px' }} />
            {(gameData.partyFunds || 1500000).toLocaleString()} ₺
          </HeaderInfo>
          
          <HeaderIconButton onClick={() => setShowSettings(!showSettings)}>
            <Settings size={20} />
          </HeaderIconButton>
        </HeaderControls>
        
        {/* Ayarlar Menüsü */}
        {showSettings && (
          <SettingsMenu>
            <SettingsMenuItem onClick={() => saveGame(false)}>
              <Save size={18} /> Manuel Kaydet
            </SettingsMenuItem>
            <SettingsMenuItem>
              <HelpCircle size={18} /> Yardım
            </SettingsMenuItem>
            <SettingsDivider />
            <SettingsMenuItem onClick={returnToMainMenu}>
              <Home size={18} /> Ana Menüye Dön
            </SettingsMenuItem>
            <SettingsMenuItem onClick={returnToMainMenu}>
              <LogOut size={18} /> Çıkış Yap
            </SettingsMenuItem>
          </SettingsMenu>
        )}
      </GameHeader>
      
      <GameContent>
        <SideMenu>
          <MenuButton 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')}
          >
            <Home size={18} /> Ana Sayfa
          </MenuButton>
          <MenuButton 
            active={activeTab === 'party'} 
            onClick={() => setActiveTab('party')}
          >
            <Users size={18} /> Parti Yönetimi
          </MenuButton>
          <MenuButton 
            active={activeTab === 'campaign'} 
            onClick={() => setActiveTab('campaign')}
          >
            <BarChart2 size={18} /> Kampanya
          </MenuButton>
          <MenuButton 
            active={activeTab === 'legislation'} 
            onClick={() => setActiveTab('legislation')}
          >
            <FileText size={18} /> Yasama
          </MenuButton>
          <MenuButton 
            active={activeTab === 'economy'} 
            onClick={() => setActiveTab('economy')}
          >
            <Activity size={18} /> Ekonomi
          </MenuButton>
          <MenuButton 
            active={activeTab === 'media'} 
            onClick={() => setActiveTab('media')}
          >
            <MessageCircle size={18} /> Medya
          </MenuButton>
          <MenuButton 
            active={activeTab === 'diplomacy'} 
            onClick={() => setActiveTab('diplomacy')}
          >
            <Globe size={18} /> Diplomasi
          </MenuButton>
          <MenuButton 
            active={activeTab === 'character'} 
            onClick={() => setActiveTab('character')}
          >
            <User size={18} /> Karakter
          </MenuButton>
        </SideMenu>
        
        <MainContent>
          {renderDashboardContent()}
        </MainContent>
      </GameContent>
      
      {/* Takvim/Zaman Yönetimi */}
      <CalendarContainer>
        <CalendarHeader>
          <CalendarDate>
            <Clock size={20} />
            <DateDisplay>{gameData.currentDate}</DateDisplay>
          </CalendarDate>
          
          <CalendarProgress>
            <div className="progress-label">
              <span>1. Hafta</span>
              <span>52. Hafta</span>
            </div>
            <ProgressBar>
              <ProgressFill value={getProgressPercentage()} />
            </ProgressBar>
          </CalendarProgress>
          
          <CalendarControls>
            <Button onClick={showPreviousWeeks}>
              <ChevronLeft size={16} /> Önceki
            </Button>
            
            <Button 
              onClick={endWeek}
              style={{ background: 'rgba(231, 76, 60, 0.6)' }}
            >
              Haftayı Bitir
            </Button>
            
            <Button onClick={showNextWeeks}>
              Sonraki <ChevronRight size={16} />
            </Button>
          </CalendarControls>
        </CalendarHeader>
        
        <WeeksContainer>
          {visibleWeeks.map((weekData, index) => {
            const isPast = isPastWeek(weekData.week, weekData.year);
            const isCurrent = isCurrentWeek(weekData.week, weekData.year);
            const weekKey = formatWeekKey(weekData.year, weekData.week);
            const hasAction = scheduledActions[weekKey] || completedActions[weekKey];
            const specialWeek = specialWeeks[weekData.week];
            
            return (
              <WeekItem 
                key={index}
                isPast={isPast}
                isCurrent={isCurrent}
                onClick={() => handleWeekClick(weekData)}
              >
                <WeekNumber>
                  {weekData.week}. Hafta
                </WeekNumber>
                <WeekYear>{weekData.year}</WeekYear>
                
                <WeekAction>
                  {hasAction && (
                    <span title={scheduledActions[weekKey]?.name || completedActions[weekKey]?.name}>
                      {scheduledActions[weekKey]?.icon || completedActions[weekKey]?.icon || '✓'}
                    </span>
                  )}
                  {!hasAction && isCurrent && <AlertTriangle size={20} color="#f39c12" />}
                </WeekAction>
                
                {specialWeek && <WeekSpecial>{specialWeek}</WeekSpecial>}
              </WeekItem>
            );
          })}
        </WeeksContainer>
      </CalendarContainer>
      
      {/* Aksiyon Seçim Modalı */}
      {showActionModal && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>
              {formatWeekDisplay(selectedWeek.week, selectedWeek.year)} için Aksiyon Seç
            </ModalTitle>
            
            <ModalCloseButton onClick={() => setShowActionModal(false)}>
              <X size={20} />
            </ModalCloseButton>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              {possibleActions.map(action => (
                <div 
                  key={action.id}
                  style={{
                    background: 'rgba(0, 40, 80, 0.5)',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(0, 200, 255, 0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => planAction(action.id)}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {action.icon}
                  </div>
                  <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                    {action.name}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                    {action.description}
                  </div>
                </div>
              ))}
            </div>
            
            <ModalFooter>
              <Button onClick={() => setShowActionModal(false)}>
                İptal Et
              </Button>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
      
      {/* Sonuç Gösterim Modalı */}
      {showResultModal && modalContent && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>{modalContent.title}</ModalTitle>
            
            <ModalCloseButton onClick={() => setShowResultModal(false)}>
              <X size={20} />
            </ModalCloseButton>
            
            {modalContent.content}
            
            <ModalFooter>
              <Button onClick={() => setShowResultModal(false)}>
                Kapat
              </Button>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </GameContainer>
  );
};

export default GameDashboard;
