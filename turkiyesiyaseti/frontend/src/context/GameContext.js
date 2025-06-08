import React, { createContext, useContext, useState, useEffect } from 'react';
import { actionCategories, actionsByCategory } from '../data/actions';
import { events } from '../data/events';
import { initialParameters } from '../data/gameParameters';
import { 
  getMonthName, 
  formatWeekKey, 
  formatWeekDisplay,
  isPastWeek,
  isCurrentWeek,
  isSpecialWeek,
  getNextWeek,
  updateVisibleWeeks
} from '../utils/timeUtils';

// Context oluştur
const GameContext = createContext();

// Provider bileşeni
export const GameProvider = ({ children }) => {
  // Ana state değerleri
  const [currentYear, setCurrentYear] = useState(2025);
  const [currentMonth, setCurrentMonth] = useState(1);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [viewOffset, setViewOffset] = useState(0);
  const [visibleWeeks, setVisibleWeeks] = useState([]);
  const [scheduledActions, setScheduledActions] = useState({});
  const [actionsLeft, setActionsLeft] = useState(3);
  const [actionUsedToday, setActionUsedToday] = useState(false);
  const [parameters, setParameters] = useState(initialParameters);
  
  // UI state değerleri
  const [showActionModal, setShowActionModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [currentActionCategory, setCurrentActionCategory] = useState(null);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [isShowingResults, setIsShowingResults] = useState(false);
  const [resultContent, setResultContent] = useState(null);
  const [showResultPanel, setShowResultPanel] = useState(false);
  
  // Haftaları güncelle
  useEffect(() => {
    const weeks = updateVisibleWeeks(viewOffset, currentWeek, currentMonth, currentYear);
    setVisibleWeeks(weeks);
  }, [viewOffset, currentWeek, currentMonth, currentYear]);
  
  // Önceki haftalara git
  const showPreviousWeeks = () => {
    setViewOffset(viewOffset - 3);
  };

  // Sonraki haftalara git
  const showNextWeeks = () => {
    setViewOffset(viewOffset + 3);
  };
  
  // Haftaya tıklama işlemi
  const handleWeekClick = (weekData) => {
    const weekKey = formatWeekKey(weekData.year, weekData.month, weekData.week);
    
    // Geçmiş haftalara aksiyon planlanamaz
    if (isPastWeek(weekData.week, weekData.month, weekData.year, currentWeek, currentMonth, currentYear) || 
        isCurrentWeek(weekData.week, weekData.month, weekData.year, currentWeek, currentMonth, currentYear)) {
      return;
    }
    
    // Şu anki haftadan sonraki ilk haftaya aksiyon ekleyebilirsin
    const nextWeekData = getNextWeek({ week: currentWeek, month: currentMonth, year: currentYear });
    const isNextWeek = weekData.week === nextWeekData.week && 
                     weekData.month === nextWeekData.month && 
                     weekData.year === nextWeekData.year;
    
    if (!isNextWeek) {
      alert("Sadece bir sonraki haftaya aksiyon planlayabilirsiniz!");
      return;
    }
    
    // Bu hafta için aksiyon hakkı kalmadıysa
    if (actionsLeft <= 0 && !scheduledActions[weekKey]) {
      alert("Bu hafta için aksiyon hakkınız kalmadı!");
      return;
    }
    
    setSelectedWeek(weekData);
    setShowActionModal(true);
  };
  
  // Haftayı bitir ve sonraki haftaya geç
  const endWeek = () => {
    if (isShowingResults) {
      setIsShowingResults(false);
      setShowResultPanel(false);
      return;
    }
    
    // Sonraki haftaya geç
    const nextWeekData = getNextWeek({ week: currentWeek, month: currentMonth, year: currentYear });
    setCurrentWeek(nextWeekData.week);
    setCurrentMonth(nextWeekData.month);
    setCurrentYear(nextWeekData.year);
    setViewOffset(0);
    
    // Rastgele bir olay oluştur (20% şans)
    if (Math.random() < 0.2) {
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      setCurrentEvent(randomEvent);
      setShowEventModal(true);
    }
    
    // Aksiyon haklarını yenile
    setActionsLeft(3);
    setActionUsedToday(false);
  };
  
  // Yeni aksiyon planlama
  const scheduleAction = (action) => {
    if (!selectedWeek) return;
    
    const weekKey = formatWeekKey(selectedWeek.year, selectedWeek.month, selectedWeek.week);
    
    // Aksiyon hakkını kullan
    setActionsLeft(prev => prev - action.cost);
    
    // Aksiyon planla
    setScheduledActions(prev => ({
      ...prev,
      [weekKey]: action
    }));
    
    setShowActionModal(false);
  };
  
  // Olay seçeneği seç
  const handleEventOption = (option) => {
    if (!currentEvent) return;
    
    // Seçilen seçeneğin etkilerini uygula
    if (option.effects) {
      // Ekonomik etkiler
      if (option.effects.economy) {
        setParameters(prev => ({
          ...prev,
          economy: {
            ...prev.economy,
            ...Object.keys(option.effects.economy).reduce((acc, key) => {
              acc[key] = prev.economy[key] + option.effects.economy[key];
              return acc;
            }, {})
          }
        }));
      }
      
      // Politik etkiler
      if (option.effects.politics) {
        setParameters(prev => ({
          ...prev,
          politics: {
            ...prev.politics,
            ...Object.keys(option.effects.politics).reduce((acc, key) => {
              acc[key] = prev.politics[key] + option.effects.politics[key];
              return acc;
            }, {})
          }
        }));
      }
      
      // Sosyal etkiler
      if (option.effects.social) {
        setParameters(prev => ({
          ...prev,
          social: {
            ...prev.social,
            ...Object.keys(option.effects.social).reduce((acc, key) => {
              acc[key] = prev.social[key] + option.effects.social[key];
              return acc;
            }, {})
          }
        }));
      }
      
      // Sonuç içeriğini göster
      setResultContent({
        title: currentEvent.title,
        description: option.effects.description || 'Kararınız uygulandı.',
        icon: currentEvent.image
      });
      setShowResultPanel(true);
      setIsShowingResults(true);
    }
    
    setShowEventModal(false);
  };
  
  // Context değerlerini dışa aktar
  const value = {
    // State değerleri
    currentYear,
    currentMonth,
    currentWeek,
    viewOffset,
    visibleWeeks,
    scheduledActions,
    actionsLeft,
    actionUsedToday,
    parameters,
    showActionModal,
    showEventModal,
    selectedWeek,
    currentActionCategory,
    currentEvent,
    isShowingResults,
    resultContent,
    showResultPanel,
    
    // State güncelleyicileri
    setCurrentYear,
    setCurrentMonth,
    setCurrentWeek,
    setViewOffset,
    setVisibleWeeks,
    setScheduledActions,
    setActionsLeft,
    setActionUsedToday,
    setParameters,
    setShowActionModal,
    setShowEventModal,
    setSelectedWeek,
    setCurrentActionCategory,
    setCurrentEvent,
    setIsShowingResults,
    setResultContent,
    setShowResultPanel,
    
    // Yardımcı fonksiyonlar
    getMonthName,
    formatWeekKey,
    formatWeekDisplay,
    isPastWeek: (week, month, year) => isPastWeek(week, month, year, currentWeek, currentMonth, currentYear),
    isCurrentWeek: (week, month, year) => isCurrentWeek(week, month, year, currentWeek, currentMonth, currentYear),
    isSpecialWeek,
    getNextWeek,
    updateVisibleWeeks,
    
    // Aksiyon ve olaylar
    actionCategories,
    actionsByCategory,
    showPreviousWeeks,
    showNextWeeks,
    handleWeekClick,
    endWeek,
    scheduleAction,
    handleEventOption
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

// Context hook
export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};