
import React, { useState, useEffect } from 'react';
import { 
  MapPin, Settings, Calendar, ChevronRight, Save, 
  HelpCircle, LogOut, Home, ChevronLeft, AlertTriangle 
} from 'lucide-react';

const GameInterface = () => {
  // Ana arayüz state'leri
  const [activeTab, setActiveTab] = useState('turkiye');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Takvim sistemi state'leri
  const [currentYear, setCurrentYear] = useState(2025);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [viewOffset, setViewOffset] = useState(0);
  const [visibleWeeks, setVisibleWeeks] = useState([]);
  const [scheduledActions, setScheduledActions] = useState({});
  const [completedActions, setCompletedActions] = useState({});
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [actionUsedToday, setActionUsedToday] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showResultPanel, setShowResultPanel] = useState(false);
  const [resultContent, setResultContent] = useState(null);
  const [currentActionPanel, setCurrentActionPanel] = useState(null);
  
  // Sonuç görüntüleme yönetimi
  const [isShowingResults, setIsShowingResults] = useState(false);
  const [resultsToShow, setResultsToShow] = useState([]);
  const [currentResultToShowIndex, setCurrentResultToShowIndex] = useState(0);

  // Örnek parti ve lider bilgileri
  const playerInfo = {
    name: "Ahmet Yılmaz",
    party: "Cumhuriyetçi Milli Parti",
    partyShort: "CMP",
    partyColor: "#1976d2", // Mavi renk
    popularity: 32, // Yüzde olarak
    seats: 145
  };
  
  // Parti verileri örneği
  const parties = [
    { id: 'cmp', name: 'Cumhuriyetçi Milli Parti', color: '#1976d2' },
    { id: 'dhp', name: 'Demokratik Halk Partisi', color: '#d32f2f' },
    { id: 'lp', name: 'Liberal Parti', color: '#ff9800' },
    { id: 'mp', name: 'Milliyetçi Parti', color: '#e91e63' }
  ];
  
  // Karakter verileri örneği
  const characters = [
    { id: 'player', name: playerInfo.name, partyId: 'cmp', isPlayer: true },
    { id: 'char1', name: 'Zafer Dal', partyId: 'mp', isPlayer: false },
    { id: 'char2', name: 'Tolga Mola', partyId: 'lp', isPlayer: false },
    { id: 'char3', name: 'Melis Yılmaz', partyId: 'dhp', isPlayer: false },
    { id: 'char4', name: 'Kemal Yıldız', partyId: 'cmp', isPlayer: false }
  ];

  // Seçim ve atama tarihlerinin tanımlanması
  const electionSchedule = {
    parliamentElection: { interval: 104, phase: 20 }, // 2 yıl (104 hafta), 20. haftada
    localElection: { interval: 104, phase: 40 },      // 2 yıl (104 hafta), 40. haftada
    presidentElection: { interval: 156, phase: 30 }   // 3 yıl (156 hafta), 30. haftada
  };

  // Planlanabilecek aksiyonlar
  const possibleActions = [
    { id: 'survey', name: 'Anket Yaptır', icon: '📊', description: 'Güncel parti oylarını gösterir' },
    { id: 'campaign', name: 'Kampanya Düzenle', icon: '📣', description: 'Parti oylarını arttırabilir' },
    { id: 'meeting', name: 'Toplantı Düzenle', icon: '👥', description: 'Parti içi ilişkileri güçlendirir' },
    { id: 'speech', name: 'Konuşma Yap', icon: '🎤', description: 'Halk desteğini arttırır' },
    { id: 'tvProgram', name: 'TV Programına Çık', icon: '📺', description: 'Medya görünürlüğünü arttırır' },
    { id: 'draftLaw', name: 'Yasa Tasarla', icon: '📜', description: 'Yeni bir yasa tasarısı hazırla' }
  ];

  // Oyun içinde mümkün olan özel haftaların tanımlanması
  const specialWeeks = {
    1: "Yeni Yıl",
    13: "Bahar Dönemi",
    26: "Yaz Dönemi",
    39: "Sonbahar Dönemi",
    52: "Yıl Sonu"
  };

  // Karakter aksiyon seçimi
  const [selectedCharacter, setSelectedCharacter] = useState(characters[0]);
  
  // Her tur için tüm aksiyonların saklanması
  const [allWeekActions, setAllWeekActions] = useState({});

  // Yan menü içeriğini seçilen sekmeye göre değiştir
  const renderSidebarContent = () => {
    // Aksiyon paneli açıksa, diğer panelleri gösterme
    if (currentActionPanel) {
      return renderActionPanelContent();
    }
    
    switch(activeTab) {
      case 'turkiye':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Ülke Yönetimi</h3>
            <div className="grid grid-cols-2 gap-2">
              <StatCard title="GSYH" value="1.2 Trilyon $" change="+2.3%" />
              <StatCard title="İşsizlik" value="%9.8" change="-0.4%" positive={false} />
              <StatCard title="Enflasyon" value="%12.5" change="-0.9%" positive={false} />
              <StatCard title="Faiz" value="%15" change="0%" />
            </div>
            <div className="bg-blue-900/50 rounded-lg p-3 mt-4">
              <h4 className="font-semibold">Güncel Konular</h4>
              <ul className="mt-2 space-y-2">
                <li className="flex justify-between">
                  <span>Ekonomik Reform Paketi</span>
                  <span className="text-blue-300">İnceleme</span>
                </li>
                <li className="flex justify-between">
                  <span>Eğitim Sistemi Revizyonu</span>
                  <span className="text-blue-300">İnceleme</span>
                </li>
                <li className="flex justify-between">
                  <span>Dış Politika Gerilimi</span>
                  <span className="text-blue-300">İnceleme</span>
                </li>
              </ul>
            </div>
          </div>
        );
      // Diğer sekmeler için içerikler (dünya, parti, oyuncu) burada...
      default:
        return <div>Menü içeriği</div>;
    }
  };
  
  // Aksiyon paneli içeriğini render et
  const renderActionPanelContent = () => {
    if (!currentActionPanel) return null;
    
    const action = possibleActions.find(a => a.id === currentActionPanel);
    if (!action) return null;
    
    // Aksiyon panellerini action ID'ye göre özelleştir
    switch(action.id) {
      case 'survey':
        return (
          <div className="space-y-4">
            <div className="flex items-center mb-2">
              <button 
                className="mr-2 p-1 rounded hover:bg-blue-800/50"
                onClick={() => setCurrentActionPanel(null)}
              >
                <ChevronLeft size={20} />
              </button>
              <h3 className="text-lg font-bold flex items-center">
                <span className="mr-2 text-xl">{action.icon}</span>
                {action.name}
              </h3>
            </div>
            
            <div className="bg-blue-900/50 rounded-lg p-3">
              <h4 className="font-semibold">Anket Bilgileri</h4>
              <p className="mt-2 text-sm text-gray-300">Kamuoyu araştırması yaptırarak mevcut parti oy oranlarını öğrenebilirsiniz.</p>
              
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Maliyet:</span>
                  <span>1.000 ₺</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Süre:</span>
                  <span>1 Hafta</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Beklenen Sonuç:</span>
                  <span>Tüm partilerin güncel oy oranları</span>
                </div>
              </div>
            </div>
            
            {/* Diğer anket içerikleri... */}
            
            <div className="flex justify-end mt-4">
              <button 
                className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded"
                onClick={() => planActionForNextWeek('survey')}
              >
                Araştırma Başlat
              </button>
            </div>
          </div>
        );
      // Diğer aksiyon panelleri burada olacak...
      default:
        return (
          <div className="space-y-4">
            <div className="flex items-center mb-2">
              <button 
                className="mr-2 p-1 rounded hover:bg-blue-800/50"
                onClick={() => setCurrentActionPanel(null)}
              >
                <ChevronLeft size={20} />
              </button>
              <h3 className="text-lg font-bold flex items-center">
                <span className="mr-2 text-xl">{action.icon}</span>
                {action.name}
              </h3>
            </div>
            
            <div className="bg-blue-900/50 rounded-lg p-3">
              <h4 className="font-semibold">Aksiyon Detayları</h4>
              <p className="mt-2 text-sm text-gray-300">{action.description}</p>
              
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Maliyet:</span>
                  <span>Değişken</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Süre:</span>
                  <span>1 Hafta</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center text-gray-300">
              <p>Bu aksiyon için detaylı bilgiler henüz eklenmemiş.</p>
            </div>
            
            <div className="flex justify-end mt-4">
              <button 
                className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded"
                onClick={() => planActionForNextWeek(action.id)}
              >
                Aksiyonu Planla
              </button>
            </div>
          </div>
        );
    }
  };

  // Tarih formatları
  const formatWeekKey = (year, week) => {
    return `${year}-${week.toString().padStart(2, '0')}`;
  };

  const formatWeekDisplay = (week, year) => {
    return `${week}. Hafta, ${year}`;
  };
  
  // Tarih formatı için gün/ay/yıl hesaplama (demo amaçlı)
  const formatDate = (week, year) => {
    // Basit bir tarih hesaplaması, gerçek uygulamada daha karmaşık olabilir
    const date = new Date(year, 0, 1);
    date.setDate(date.getDate() + ((week - 1) * 7));
    
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Görünen haftaları güncelleme
  const updateVisibleWeeks = () => {
    const weeks = [];
    let weekToShow = currentWeek + viewOffset;
    let yearToShow = currentYear;
    
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

  // Görünüm değiştiğinde hafta listesini güncelle
  useEffect(() => {
    updateVisibleWeeks();
  }, [viewOffset, currentWeek, currentYear]);

  // Hafta geçmiş mi kontrolü
  const isPastWeek = (week, year) => {
    if (year < currentYear) return true;
    if (year === currentYear && week < currentWeek) return true;
    return false;
  };

  // Şu anki hafta mı kontrolü
  const isCurrentWeek = (week, year) => {
    return week === currentWeek && year === currentYear;
  };

  // Aksiyon planlanmış mı kontrolü
  const hasScheduledAction = (week, year) => {
    return scheduledActions[formatWeekKey(year, week)] !== undefined;
  };

  // Zorunlu oyun aksiyonu var mı kontrolü
  const hasMandatoryAction = (week, year) => {
    // Global hafta sayısını hesapla
    const totalWeeks = (year - 2025) * 52 + week;
    
    // Seçim haftası kontrolü
    for (const [type, schedule] of Object.entries(electionSchedule)) {
      if ((totalWeeks - schedule.phase) % schedule.interval === 0) {
        return { type, icon: '🗳️', name: 'Seçim' };
      }
    }
    
    return null;
  };
  
  // Aksiyon sonucu üretme (demo amaçlı)
  const generateActionResult = (actionId, weekData, characterId = 'player') => {
    // Aksiyon ve tarih için tutarlı bir seed oluştur
    const weekKey = formatWeekKey(weekData.year, weekData.week);
    const seed = weekKey + actionId + characterId;
    
    // Karakter ve parti bilgilerini al
    const character = characters.find(c => c.id === characterId) || characters[0];
    const party = parties.find(p => p.id === character.partyId) || parties[0];
    
    // Basit bir seed tabanlı rastgele değer üreteci
    const seededRandom = () => {
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash = hash & hash;
      }
      return Math.abs((Math.sin(hash) + 1) / 2);
    };
    
    const actionPerformer = (
      <div className="mb-3">
        <span className="font-bold cursor-help" title={`${party.name}`}>
          {character.name}
        </span>
        {' '}- {party.name}
      </div>
    );
    
    // Aksiyon tipleri
    switch(actionId) {
      case 'survey':
        return {
          title: 'Anket Sonuçları',
          performer: character,
          party: party,
          content: (
            <div className="p-4">
              {actionPerformer}
              <h3 className="text-lg font-bold mb-2">Parti Oy Oranları</h3>
              <div className="mb-2">
                <div className="flex justify-between mb-1">
                  <span>Cumhuriyetçi Milli Parti</span>
                  <span>%{Math.floor(seededRandom() * 20) + 30}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Demokratik Halk Partisi</span>
                  <span>%{Math.floor(seededRandom() * 20) + 20}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Liberal Parti</span>
                  <span>%{Math.floor(seededRandom() * 15) + 10}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Milliyetçi Parti</span>
                  <span>%{Math.floor(seededRandom() * 10) + 5}</span>
                </div>
              </div>
            </div>
          )
        };
      
      // Diğer aksiyon sonuçları burada...
        
      default:
        return null;
    }
  };

  // AI tarafından yapılan aksiyonları üretme (demo amaçlı)
  const generateAIActions = (weekData) => {
    const weekKey = formatWeekKey(weekData.year, weekData.week);
    
    // Zaten AI aksiyonları varsa tekrar ekleme
    if (allWeekActions[weekKey] && allWeekActions[weekKey].some(action => !action.isPlayerAction)) {
      return [];
    }
    
    // Rastgele AI aksiyon sayısı (0-2)
    const aiActionsCount = Math.floor(Math.random() * 3);
    const aiActions = [];
    
    for (let i = 0; i < aiActionsCount; i++) {
      // Rastgele bir NPC karakteri seç
      const aiCharacters = characters.filter(c => !c.isPlayer);
      const character = aiCharacters[Math.floor(Math.random() * aiCharacters.length)];
      
      // Rastgele bir aksiyon seç
      const action = possibleActions[Math.floor(Math.random() * possibleActions.length)];
      
      aiActions.push({
        characterId: character.id,
        actionId: action.id,
        weekData: { week: weekData.week, year: weekData.year },
        isPlayerAction: false
      });
    }
    
    return aiActions;
  };

  // Haftaya tıklama işlemi
  const handleWeekClick = (weekData) => {
    const weekKey = formatWeekKey(weekData.year, weekData.week);
    
    // Tamamlanmış aksiyonlar varsa sonuçları göster
    if (allWeekActions[weekKey]) {
      // Sadece geçmiş haftalar veya şu anki hafta için sonuçları göster
      if (!isPastWeek(weekData.week, weekData.year) && !isCurrentWeek(weekData.week, weekData.year)) {
        alert("Bu hafta henüz gelmedi, sonuçları göremezsiniz.");
        return;
      }
      
      const actions = allWeekActions[weekKey];
      setResultsToShow(actions);
      setCurrentResultToShowIndex(0);
      
      if (actions.length > 0) {
        const firstAction = actions[0];
        const result = generateActionResult(firstAction.actionId, firstAction.weekData, firstAction.characterId);
        if (result) {
          setResultContent(result);
          setShowResultPanel(true);
        }
      }
      return;
    } else if (completedActions[weekKey]) {
      // Eski veri yapısı desteği
      // Sadece geçmiş haftalar veya şu anki hafta için sonuçları göster
      if (!isPastWeek(weekData.week, weekData.year) && !isCurrentWeek(weekData.week, weekData.year)) {
        alert("Bu hafta henüz gelmedi, sonuçları göremezsiniz.");
        return;
      }
      
      const action = completedActions[weekKey];
      // Sentetik bir hafta sonuç aksiyonu oluştur
      const syntheticAction = {
        characterId: 'player',
        actionId: action.id,
        weekData: weekData,
        isPlayerAction: true
      };
      setResultsToShow([syntheticAction]);
      setCurrentResultToShowIndex(0);
      
      const result = generateActionResult(action.id, weekData);
      if (result) {
        setResultContent(result);
        setShowResultPanel(true);
      }
      return;
    }
    
    // Şu anki veya geçmiş haftalar için aksiyon planlanamaz
    if (isPastWeek(weekData.week, weekData.year) || isCurrentWeek(weekData.week, weekData.year)) {
      return;
    }
    
    // Şu anki haftadan sonraki ilk haftaya aksiyon ekleyebilirsin
    const nextWeekData = getNextWeek({ week: currentWeek, year: currentYear });
    const isNextWeek = weekData.week === nextWeekData.week && weekData.year === nextWeekData.year;
    
    if (!isNextWeek) {
      alert("Sadece bir sonraki haftaya aksiyon planlayabilirsiniz!");
      return;
    }
    
    // Bugün için aksiyon kullandıysa izin verme
    if (actionUsedToday && !scheduledActions[weekKey]) {
      alert("Bu hafta için aksiyon hakkınızı kullandınız!");
      return;
    }
    
    // Bu haftaya zaten aksiyon planlanmışsa izin verme
    if (scheduledActions[weekKey]) {
      alert("Bu haftaya zaten bir aksiyon planladınız!");
      return;
    }
    
    // Tam oyunda burada karakter seçimi olurdu
    setSelectedCharacter(characters[0]);
    
    setSelectedWeek(weekData);
    setShowActionModal(true);
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

  // Aksiyon planla
  const scheduleAction = (actionId) => {
    if (!selectedWeek) return;
    
    const weekKey = formatWeekKey(selectedWeek.year, selectedWeek.week);
    const action = possibleActions.find(a => a.id === actionId);
    
    setScheduledActions(prev => ({
      ...prev,
      [weekKey]: action
    }));
    
    setActionUsedToday(true);
    setShowActionModal(false);
  };
  
  // Sonraki hafta için aksiyon planla (aksiyon ekranından)
  const planActionForNextWeek = (actionId) => {
    const nextWeekData = getNextWeek({ week: currentWeek, year: currentYear });
    const weekKey = formatWeekKey(nextWeekData.year, nextWeekData.week);
    const action = possibleActions.find(a => a.id === actionId);
    
    if (!action) return;
    
    // Bugün için aksiyon kullandıysa izin verme
    if (actionUsedToday) {
      alert("Bu hafta için aksiyon hakkınızı kullandınız!");
      return;
    }
    
    // Bu haftaya zaten aksiyon planlanmışsa izin verme
    if (scheduledActions[weekKey]) {
      alert("Bu haftaya zaten bir aksiyon planladınız!");
      return;
    }
    
    setScheduledActions(prev => ({
      ...prev,
      [weekKey]: action
    }));
    
    setActionUsedToday(true);
    setCurrentActionPanel(null);
    
    // Kullanıcıya bildirim
    alert(`"${action.name}" aksiyonu ${formatWeekDisplay(nextWeekData.week, nextWeekData.year)} için planlandı.`);
  };

  // Önceki haftalara git
  const showPreviousWeeks = () => {
    setViewOffset(viewOffset - 1);
  };

  // Sonraki haftalara git
  const showNextWeeks = () => {
    setViewOffset(viewOffset + 1);
  };

  // Haftayı bitir ve sonraki haftaya geç
  const endWeek = () => {
    // Eğer sonuçlar gösteriliyorsa, sonraki sonuca geç veya sonuçları bitir
    if (isShowingResults) {
      if (currentResultToShowIndex < resultsToShow.length - 1) {
        // Sonraki sonucu göster
        const nextIndex = currentResultToShowIndex + 1;
        setCurrentResultToShowIndex(nextIndex);
        const action = resultsToShow[nextIndex];
        const result = generateActionResult(
          action.actionId, 
          action.weekData, 
          action.characterId
        );
        if (result) {
          setResultContent(result);
          setShowResultPanel(true);
        }
        return;
      } else {
        // Tüm sonuçları gösterdik, sonuç göstermeyi durdur
        setIsShowingResults(false);
        setResultsToShow([]);
        setCurrentResultToShowIndex(0);
        setShowResultPanel(false);
        return;
      }
    }
    
    // Açık sonuç panellerini kapat
    setShowResultPanel(false);
    
    // Sonuçlar için sonraki haftayı hazırla
    const nextWeekData = getNextWeek({ week: currentWeek, year: currentYear });
    const nextWeekKey = formatWeekKey(nextWeekData.year, nextWeekData.week);
    
    // Oyuncu tarafından planlanmış tüm aksiyonları al
    const playerActions = [];
    if (scheduledActions[nextWeekKey]) {
      const action = scheduledActions[nextWeekKey];
      playerActions.push({
        characterId: 'player',
        actionId: action.id,
        weekData: nextWeekData,
        isPlayerAction: true
      });
      
      // Planlanmıştan tamamlanmışa taşı
      setCompletedActions(prev => ({
        ...prev,
        [nextWeekKey]: action
      }));
      
      // Planlanmış aksiyonlardan kaldır
      const newScheduled = {...scheduledActions};
      delete newScheduled[nextWeekKey];
      setScheduledActions(newScheduled);
    }
    
    // AI aksiyonları üret
    const aiActions = generateAIActions(nextWeekData);
    
    // Oyuncu ve AI aksiyonlarını birleştir
    const allActions = [...playerActions, ...aiActions];
    
    // Bu hafta için tüm aksiyonları sakla
    if (allActions.length > 0) {
      setAllWeekActions(prev => ({
        ...prev,
        [nextWeekKey]: allActions
      }));
      
      // Önce sonraki haftaya geç
      setCurrentWeek(nextWeekData.week);
      setCurrentYear(nextWeekData.year);
      setActionUsedToday(false);
      setViewOffset(0);
      
      // Sonra gösterilecek sonuçlar dizisini ayarla
      setTimeout(() => {
        setResultsToShow(allActions);
        setCurrentResultToShowIndex(0);
        setIsShowingResults(true);
        
        // İlk sonucu göster
        if (allActions.length > 0) {
          const firstAction = allActions[0];
          const result = generateActionResult(
            firstAction.actionId, 
            firstAction.weekData, 
            firstAction.characterId
          );
          if (result) {
            setResultContent(result);
            setShowResultPanel(true);
          }
        }
      }, 10);
    } else {
      // Bu hafta için aksiyon yok, sadece ilerle
      setCurrentWeek(nextWeekData.week);
      setCurrentYear(nextWeekData.year);
      setActionUsedToday(false);
      setViewOffset(0);
    }
    
    // Bu haftada özel olaylar var mı kontrol et
    checkForSpecialEvents(nextWeekData);
  };
  
  // Özel oyun olaylarını kontrol et (seçimler, vs.)
  const checkForSpecialEvents = (weekData) => {
    // Global hafta sayısını hesapla
    const totalWeeks = (weekData.year - 2025) * 52 + weekData.week;
    
    // Seçim haftası kontrolü
    for (const [electionType, schedule] of Object.entries(electionSchedule)) {
      if ((totalWeeks - schedule.phase) % schedule.interval === 0) {
        // Burada seçim olayları gerçekleşir
        console.log(`${electionType} seçimi gerçekleşiyor!`);
        // Seçim sonuçlarını göster vs...
      }
    }
  };

  // Aksiyon panelini aç
  const openActionPanel = (actionId) => {
    setCurrentActionPanel(actionId);
    setSidebarOpen(true);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-blue-950 to-indigo-950 text-white">
      {/* Header */}
      <div className="bg-blue-900/40 border-b border-blue-800 p-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="text-xl font-bold text-blue-300 mr-8">TÜRKİYE SİYASETİ</div>
          <div className="flex space-x-1">
            <TabButton active={activeTab === 'turkiye'} onClick={() => {setActiveTab('turkiye'); setSidebarOpen(true); setCurrentActionPanel(null);}}>
              Türkiye
            </TabButton>
            <TabButton active={activeTab === 'dunya'} onClick={() => {setActiveTab('dunya'); setSidebarOpen(true); setCurrentActionPanel(null);}}>
              Dünya
            </TabButton>
            <TabButton active={activeTab === 'parti'} onClick={() => {setActiveTab('parti'); setSidebarOpen(true); setCurrentActionPanel(null);}}>
              Parti
            </TabButton>
            <TabButton active={activeTab === 'oyuncu'} onClick={() => {setActiveTab('oyuncu'); setSidebarOpen(true); setCurrentActionPanel(null);}}>
              Oyuncu
            </TabButton>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right mr-4">
            <div className="font-medium">{playerInfo.name}</div>
            <div className="flex items-center">
              <span className="mr-2">Lider:</span>
              <span className="font-semibold" style={{color: playerInfo.partyColor}}>{playerInfo.party}</span>
            </div>
          </div>
          
          <button 
            className="p-2 rounded-full hover:bg-blue-800/50"
            onClick={() => setSettingsOpen(!settingsOpen)}
          >
            <Settings size={24} />
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-80 bg-blue-950/50 border-r border-blue-800 p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {currentActionPanel ? 
                  possibleActions.find(a => a.id === currentActionPanel)?.name : 
                  activeTab === 'turkiye' ? 'Türkiye' : 
                  activeTab === 'dunya' ? 'Dünya' :
                  activeTab === 'parti' ? 'Parti' : 'Oyuncu'}
              </h2>
              <button 
                className="p-1 rounded hover:bg-blue-800/50"
                onClick={() => setSidebarOpen(false)}
              >
                <ChevronRight size={20} />
              </button>
            </div>
            
            {renderSidebarContent()}
          </div>
        )}
        
        {/* Main map container */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center p-4 relative">
            {/* Sonuç paneli (aksiyon tamamlandığında gösterilir) */}
            {showResultPanel && resultContent && (
              <div className="absolute top-4 left-4 bg-blue-900/90 border border-blue-700 rounded-lg p-4 w-80 shadow-lg z-10">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-bold">{resultContent.title}</h2>
                    {resultsToShow.length > 0 && (
                      <button 
                        className="text-sm bg-blue-800 px-2 py-1 rounded mt-1 hover:bg-blue-700"
                        onClick={() => {
                          const nextIndex = (currentResultToShowIndex + 1) % resultsToShow.length;
                          setCurrentResultToShowIndex(nextIndex);
                          const action = resultsToShow[nextIndex];
                          const result = generateActionResult(
                            action.actionId, 
                            action.weekData, 
                            action.characterId
                          );
                          if (result) {
                            setResultContent(result);
                          }
                        }}
                      >
                        Sonuç {currentResultToShowIndex + 1}/{resultsToShow.length}
                      </button>
                    )}
                  </div>
                  <button 
                    className="text-gray-400 hover:text-white"
                    onClick={() => setShowResultPanel(false)}
                  >
                    ✕
                  </button>
                </div>
                {resultContent.content}
              </div>
            )}
            
            {/* Türkiye Haritası */}
            <div className="relative">
              <svg viewBox="0 0 1000 500" className="w-full max-w-4xl">
                <g className="turkey-map">
                  {/* Türkiye haritasının il sınırlarını temsil eden basitleştirilmiş SVG */}
                  <path d="M500,150 Q650,100 800,150 Q900,200 850,300 Q750,400 500,350 Q250,400 150,300 Q100,200 200,150 Q350,100 500,150" 
                        fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" />
                  
                  {/* Örnek iller (temsili konumlar) */}
                  <CityMarker name="Ankara" x={500} y={250} active={true} />
                  <CityMarker name="İstanbul" x={450} y={180} />
                  <CityMarker name="İzmir" x={350} y={280} />
                  <CityMarker name="Antalya" x={450} y={350} />
                  <CityMarker name="Adana" x={600} y={330} />
                  <CityMarker name="Trabzon" x={700} y={200} />
                  <CityMarker name="Diyarbakır" x={700} y={300} />
                  <CityMarker name="Erzurum" x={750} y={250} />
                  <CityMarker name="Konya" x={520} y={320} />
                  <CityMarker name="Samsun" x={600} y={180} />
                  <CityMarker name="Bursa" x={400} y={220} />
                  <CityMarker name="Gaziantep" x={650} y={350} />
                  <CityMarker name="Kayseri" x={580} y={280} />
                  <CityMarker name="Van" x={820} y={280} />
                </g>
              </svg>
              
              {/* Harita üzerinde bilgi kartı */}
              <div className="absolute right-0 top-0 bg-blue-900/80 rounded-lg border border-blue-700 p-3 shadow-lg w-64">
                <h3 className="font-bold">Ülke Genel Durum</h3>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Memnuniyet:</span>
                    <span className="text-yellow-300">%65</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ekonomik Büyüme:</span>
                    <span className="text-green-300">%3.2</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uluslararası İtibar:</span>
                    <span className="text-blue-300">Orta</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Calendar/Week Turn Controls */}
          <div className="bg-blue-900/40 border-t border-blue-800 p-3">
            {/* Top Calendar Controls */}
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center">
                <Calendar className="mr-2" size={18} />
                <span>{formatDate(currentWeek, currentYear)}</span>
                {actionUsedToday && (
                  <span className="ml-2 bg-yellow-600 text-xs text-white px-2 py-0.5 rounded-full">
                    Aksiyon Kullanıldı
                  </span>
                )}
              </div>
              
              <div className="flex-1 mx-8">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Hafta {currentWeek}/52</span>
                  <div className="flex-1 mx-4 h-3 bg-blue-950 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-600 to-blue-400" 
                      style={{width: `${(currentWeek/52)*100}%`}}>
                    </div>
                  </div>
                  <span className="text-sm">Kalan: {52-currentWeek} hafta</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-sm"
                  onClick={showPreviousWeeks}
                >
                  ◀ Önceki
                </button>
                <button 
                  className="bg-red-700 hover:bg-red-600 px-4 py-1 rounded"
                  onClick={endWeek}
                >
                  {isShowingResults ? "Sonraki Sonuç" : "Haftayı Bitir"}
                </button>
                <button 
                  className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-sm"
                  onClick={showNextWeeks}
                >
                  Sonraki ▶
                </button>
              </div>
            </div>
            
            {/* Haftalar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {visibleWeeks.map((weekData, index) => {
                const weekKey = formatWeekKey(weekData.year, weekData.week);
                const isCurrentWeekItem = isCurrentWeek(weekData.week, weekData.year);
                const isPast = isPastWeek(weekData.week, weekData.year);
                const hasAction = scheduledActions[weekKey] || completedActions[weekKey] || 
                                (allWeekActions[weekKey] && allWeekActions[weekKey].length > 0);
                const specialWeek = specialWeeks[weekData.week] || "-";
                const mandatoryAction = hasMandatoryAction(weekData.week, weekData.year);
                
                // Aksiyon ikonunu al
                let actionIcon = null;
                let actionIconHint = "";
                
                if (mandatoryAction) {
                  actionIcon = mandatoryAction.icon;
                  actionIconHint = mandatoryAction.name;
                } else if (allWeekActions[weekKey] && allWeekActions[weekKey].length > 0) {
                  const firstAction = allWeekActions[weekKey][0];
                  const action = possibleActions.find(a => a.id === firstAction.actionId);
                  if (action) {
                    actionIcon = action.icon;
                    actionIconHint = action.name;
                  }
                } else if (scheduledActions[weekKey]) {
                  actionIcon = scheduledActions[weekKey].icon;
                  actionIconHint = scheduledActions[weekKey].name;
                } else if (completedActions[weekKey]) {
                  actionIcon = completedActions[weekKey].icon;
                  actionIconHint = completedActions[weekKey].name;
                }

                return (
                  <div 
                    key={index}
                    className={`
                      p-2 rounded cursor-pointer transition-all
                      ${isCurrentWeekItem ? 'bg-red-700 border border-red-500' : 'bg-blue-900/60 hover:bg-blue-800/60 border border-blue-800'}
                      ${isPast ? 'opacity-70' : 'opacity-100'}
                    `}
                    onClick={() => handleWeekClick(weekData)}
                    title={`${weekData.week}. Hafta, ${weekData.year}`}
                  >
                    <div className="text-center font-medium text-sm">
                      {weekData.week}. Hafta
                    </div>
                    <div className="text-center text-xs text-gray-300 mb-1">{weekData.year}</div>
                    <div className="h-10 flex items-center justify-center border border-blue-800/50 my-1 rounded">
                      {(hasAction || mandatoryAction) && actionIcon && (
                        <div className="text-xl" title={actionIconHint}>{actionIcon}</div>
                      )}
                      {hasAction && !actionIcon && (
                        <div className="text-xl">🔄</div>
                      )}
                    </div>
                    <div className="text-center text-xs mt-1 border-t border-blue-800/50 pt-1 text-gray-300">{specialWeek}</div>
                  </div>
                );
              })}
            </div>
            
            {/* Action Buttons */}
            <div className="mt-3 grid grid-cols-6 gap-2">
              {possibleActions.map((action) => (
                <button
                  key={action.id}
                  className="flex flex-col items-center justify-center p-2 bg-blue-900/60 hover:bg-blue-800/60 rounded border border-blue-800 transition-all"
                  onClick={() => openActionPanel(action.id)}
                  title={action.description}
                >
                  <div className="text-xl mb-1">{action.icon}</div>
                  <div className="text-xs font-medium">{action.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Settings Popup */}
      {settingsOpen && (
        <div className="absolute right-4 top-16 w-64 bg-blue-900/95 border border-blue-700 rounded-lg shadow-lg p-3 z-10">
          <h3 className="font-bold border-b border-blue-700 pb-2 mb-2">Ayarlar</h3>
          <ul className="space-y-2">
            <SettingsMenuItem icon={<Save size={18} />} text="Oyunu Kaydet" />
            <SettingsMenuItem icon={<Save size={18} />} text="Farklı Kaydet" />
            <SettingsMenuItem icon={<HelpCircle size={18} />} text="Yardım" />
            <li className="border-t border-blue-700 my-2 pt-2">
              <SettingsMenuItem icon={<Home size={18} />} text="Ana Menüye Dön" />
            </li>
            <SettingsMenuItem icon={<LogOut size={18} />} text="Oyundan Çık" />
          </ul>
        </div>
      )}
      
      {/* Aksiyon seçim modalı */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-blue-900 border border-blue-700 rounded-lg p-6 w-1/3 max-w-2xl text-white">
            <h3 className="text-xl font-bold mb-4 text-blue-300">
              {formatWeekDisplay(selectedWeek.week, selectedWeek.year)} için aksiyon seç
            </h3>
            
            {/* Karakter seçimi kısmı */}
            <div className="mb-4 p-3 border border-blue-800 rounded bg-blue-950/70">
              <h4 className="font-bold mb-2 text-blue-300">Aksiyon Yapacak Kişi:</h4>
              <div className="flex items-center">
                <span className="font-semibold">{selectedCharacter.name}</span>
                <span className="mx-2">-</span>
                <span>{parties.find(p => p.id === selectedCharacter.partyId)?.name}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Not: Tam oyunda parti üyeleri arasından seçim yapabileceksiniz.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              {possibleActions.map((action) => (
                <button
                  key={action.id}
                  className="flex items-center p-3 border border-blue-700 rounded hover:bg-blue-800 bg-blue-950/70 transition-all"
                  onClick={() => scheduleAction(action.id)}
                >
                  <span className="text-2xl mr-3">{action.icon}</span>
                  <div>
                    <span className="font-semibold block">{action.name}</span>
                    <p className="text-xs text-gray-400">{action.description}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <button 
                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
                onClick={() => setShowActionModal(false)}
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Yardımcı Bileşenler
const TabButton = ({ children, active, onClick }) => (
  <button
    className={`px-4 py-2 rounded-t-lg ${
      active 
        ? 'bg-blue-800/60 font-medium text-blue-200' 
        : 'bg-transparent hover:bg-blue-800/30'
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

const SettingsMenuItem = ({ icon, text }) => (
  <li>
    <button className="w-full text-left p-2 rounded hover:bg-blue-800/60 flex items-center">
      <span className="mr-3 text-blue-300">{icon}</span>
      <span>{text}</span>
    </button>
  </li>
);

const StatCard = ({ title, value, change, positive = true }) => (
  <div className="bg-blue-900/50 rounded-lg p-2">
    <div className="text-xs text-gray-300">{title}</div>
    <div className="font-semibold text-lg">{value}</div>
    {change && (
      <div className={`text-xs ${positive ? 'text-green-400' : 'text-red-400'}`}>
        {change}
      </div>
    )}
  </div>
);

const CityMarker = ({ name, x, y, active = false }) => (
  <g className="cursor-pointer hover:opacity-80 transition-opacity" transform={`translate(${x}, ${y})`}>
    <circle 
      r={active ? 10 : 8} 
      fill={active ? "#3b82f6" : "#1e3a8a"}
      stroke={active ? "#93c5fd" : "#60a5fa"}
      strokeWidth="2"
    />
    <MapPin 
      className="city-icon" 
      style={{
        color: active ? "#fff" : "#93c5fd",
        transform: "translate(-12px, -12px)",
        width: "24px",
        height: "24px"
      }}
    />
    <text 
      fill="#fff" 
      fontSize="12" 
      textAnchor="middle" 
      y={active ? 28 : 24}
      fontWeight={active ? "bold" : "normal"}
    >
      {name}
    </text>
    {active && (
      <circle r="16" fill="transparent" stroke="#3b82f6" strokeWidth="2" strokeDasharray="3 3" />
    )}
  </g>
);


import React, { useState, useEffect } from 'react';
import { 
  MapPin, Settings, Calendar, ChevronRight, Save, 
  HelpCircle, LogOut, Home, ChevronLeft, AlertTriangle 
} from 'lucide-react';

const GameInterface = () => {
  // Ana arayüz state'leri
  const [activeTab, setActiveTab] = useState('turkiye');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Takvim sistemi state'leri
  const [currentYear, setCurrentYear] = useState(2025);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [viewOffset, setViewOffset] = useState(0);
  const [visibleWeeks, setVisibleWeeks] = useState([]);
  const [scheduledActions, setScheduledActions] = useState({});
  const [completedActions, setCompletedActions] = useState({});
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [actionUsedToday, setActionUsedToday] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showResultPanel, setShowResultPanel] = useState(false);
  const [resultContent, setResultContent] = useState(null);
  const [currentActionPanel, setCurrentActionPanel] = useState(null);
  
  // Sonuç görüntüleme yönetimi
  const [isShowingResults, setIsShowingResults] = useState(false);
  const [resultsToShow, setResultsToShow] = useState([]);
  const [currentResultToShowIndex, setCurrentResultToShowIndex] = useState(0);

  // Örnek parti ve lider bilgileri
  const playerInfo = {
    name: "Ahmet Yılmaz",
    party: "Cumhuriyetçi Milli Parti",
    partyShort: "CMP",
    partyColor: "#1976d2", // Mavi renk
    popularity: 32, // Yüzde olarak
    seats: 145
  };
  
  // Parti verileri örneği
  const parties = [
    { id: 'cmp', name: 'Cumhuriyetçi Milli Parti', color: '#1976d2' },
    { id: 'dhp', name: 'Demokratik Halk Partisi', color: '#d32f2f' },
    { id: 'lp', name: 'Liberal Parti', color: '#ff9800' },
    { id: 'mp', name: 'Milliyetçi Parti', color: '#e91e63' }
  ];
  
  // Karakter verileri örneği
  const characters = [
    { id: 'player', name: playerInfo.name, partyId: 'cmp', isPlayer: true },
    { id: 'char1', name: 'Zafer Dal', partyId: 'mp', isPlayer: false },
    { id: 'char2', name: 'Tolga Mola', partyId: 'lp', isPlayer: false },
    { id: 'char3', name: 'Melis Yılmaz', partyId: 'dhp', isPlayer: false },
    { id: 'char4', name: 'Kemal Yıldız', partyId: 'cmp', isPlayer: false }
  ];

  // Seçim ve atama tarihlerinin tanımlanması
  const electionSchedule = {
    parliamentElection: { interval: 104, phase: 20 }, // 2 yıl (104 hafta), 20. haftada
    localElection: { interval: 104, phase: 40 },      // 2 yıl (104 hafta), 40. haftada
    presidentElection: { interval: 156, phase: 30 }   // 3 yıl (156 hafta), 30. haftada
  };

  // Planlanabilecek aksiyonlar
  const possibleActions = [
    { id: 'survey', name: 'Anket Yaptır', icon: '📊', description: 'Güncel parti oylarını gösterir' },
    { id: 'campaign', name: 'Kampanya Düzenle', icon: '📣', description: 'Parti oylarını arttırabilir' },
    { id: 'meeting', name: 'Toplantı Düzenle', icon: '👥', description: 'Parti içi ilişkileri güçlendirir' },
    { id: 'speech', name: 'Konuşma Yap', icon: '🎤', description: 'Halk desteğini arttırır' },
    { id: 'tvProgram', name: 'TV Programına Çık', icon: '📺', description: 'Medya görünürlüğünü arttırır' },
    { id: 'draftLaw', name: 'Yasa Tasarla', icon: '📜', description: 'Yeni bir yasa tasarısı hazırla' }
  ];

  // Oyun içinde mümkün olan özel haftaların tanımlanması
  const specialWeeks = {
    1: "Yeni Yıl",
    13: "Bahar Dönemi",
    26: "Yaz Dönemi",
    39: "Sonbahar Dönemi",
    52: "Yıl Sonu"
  };

  // Karakter aksiyon seçimi
  const [selectedCharacter, setSelectedCharacter] = useState(characters[0]);
  
  // Her tur için tüm aksiyonların saklanması
  const [allWeekActions, setAllWeekActions] = useState({});

  // Yan menü içeriğini seçilen sekmeye göre değiştir
  const renderSidebarContent = () => {
    // Aksiyon paneli açıksa, diğer panelleri gösterme
    if (currentActionPanel) {
      return renderActionPanelContent();
    }
    
    switch(activeTab) {
      case 'turkiye':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Ülke Yönetimi</h3>
            <div className="grid grid-cols-2 gap-2">
              <StatCard title="GSYH" value="1.2 Trilyon $" change="+2.3%" />
              <StatCard title="İşsizlik" value="%9.8" change="-0.4%" positive={false} />
              <StatCard title="Enflasyon" value="%12.5" change="-0.9%" positive={false} />
              <StatCard title="Faiz" value="%15" change="0%" />
            </div>
            <div className="bg-blue-900/50 rounded-lg p-3 mt-4">
              <h4 className="font-semibold">Güncel Konular</h4>
              <ul className="mt-2 space-y-2">
                <li className="flex justify-between">
                  <span>Ekonomik Reform Paketi</span>
                  <span className="text-blue-300">İnceleme</span>
                </li>
                <li className="flex justify-between">
                  <span>Eğitim Sistemi Revizyonu</span>
                  <span className="text-blue-300">İnceleme</span>
                </li>
                <li className="flex justify-between">
                  <span>Dış Politika Gerilimi</span>
                  <span className="text-blue-300">İnceleme</span>
                </li>
              </ul>
            </div>
          </div>
        );
      // Diğer sekmeler için içerikler (dünya, parti, oyuncu) burada...
      default:
        return <div>Menü içeriği</div>;
    }
  };
  
  // Aksiyon paneli içeriğini render et
  const renderActionPanelContent = () => {
    if (!currentActionPanel) return null;
    
    const action = possibleActions.find(a => a.id === currentActionPanel);
    if (!action) return null;
    
    // Aksiyon panellerini action ID'ye göre özelleştir
    switch(action.id) {
      case 'survey':
        return (
          <div className="space-y-4">
            <div className="flex items-center mb-2">
              <button 
                className="mr-2 p-1 rounded hover:bg-blue-800/50"
                onClick={() => setCurrentActionPanel(null)}
              >
                <ChevronLeft size={20} />
              </button>
              <h3 className="text-lg font-bold flex items-center">
                <span className="mr-2 text-xl">{action.icon}</span>
                {action.name}
              </h3>
            </div>
            
            <div className="bg-blue-900/50 rounded-lg p-3">
              <h4 className="font-semibold">Anket Bilgileri</h4>
              <p className="mt-2 text-sm text-gray-300">Kamuoyu araştırması yaptırarak mevcut parti oy oranlarını öğrenebilirsiniz.</p>
              
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Maliyet:</span>
                  <span>1.000 ₺</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Süre:</span>
                  <span>1 Hafta</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Beklenen Sonuç:</span>
                  <span>Tüm partilerin güncel oy oranları</span>
                </div>
              </div>
            </div>
            
            {/* Diğer anket içerikleri... */}
            
            <div className="flex justify-end mt-4">
              <button 
                className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded"
                onClick={() => planActionForNextWeek('survey')}
              >
                Araştırma Başlat
              </button>
            </div>
          </div>
        );
      // Diğer aksiyon panelleri burada olacak...
      default:
        return (
          <div className="space-y-4">
            <div className="flex items-center mb-2">
              <button 
                className="mr-2 p-1 rounded hover:bg-blue-800/50"
                onClick={() => setCurrentActionPanel(null)}
              >
                <ChevronLeft size={20} />
              </button>
              <h3 className="text-lg font-bold flex items-center">
                <span className="mr-2 text-xl">{action.icon}</span>
                {action.name}
              </h3>
            </div>
            
            <div className="bg-blue-900/50 rounded-lg p-3">
              <h4 className="font-semibold">Aksiyon Detayları</h4>
              <p className="mt-2 text-sm text-gray-300">{action.description}</p>
              
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Maliyet:</span>
                  <span>Değişken</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Süre:</span>
                  <span>1 Hafta</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center text-gray-300">
              <p>Bu aksiyon için detaylı bilgiler henüz eklenmemiş.</p>
            </div>
            
            <div className="flex justify-end mt-4">
              <button 
                className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded"
                onClick={() => planActionForNextWeek(action.id)}
              >
                Aksiyonu Planla
              </button>
            </div>
          </div>
        );
    }
  };

  // Tarih formatları
  const formatWeekKey = (year, week) => {
    return `${year}-${week.toString().padStart(2, '0')}`;
  };

  const formatWeekDisplay = (week, year) => {
    return `${week}. Hafta, ${year}`;
  };
  
  // Tarih formatı için gün/ay/yıl hesaplama (demo amaçlı)
  const formatDate = (week, year) => {
    // Basit bir tarih hesaplaması, gerçek uygulamada daha karmaşık olabilir
    const date = new Date(year, 0, 1);
    date.setDate(date.getDate() + ((week - 1) * 7));
    
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Görünen haftaları güncelleme
  const updateVisibleWeeks = () => {
    const weeks = [];
    let weekToShow = currentWeek + viewOffset;
    let yearToShow = currentYear;
    
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

  // Görünüm değiştiğinde hafta listesini güncelle
  useEffect(() => {
    updateVisibleWeeks();
  }, [viewOffset, currentWeek, currentYear]);

  // Hafta geçmiş mi kontrolü
  const isPastWeek = (week, year) => {
    if (year < currentYear) return true;
    if (year === currentYear && week < currentWeek) return true;
    return false;
  };

  // Şu anki hafta mı kontrolü
  const isCurrentWeek = (week, year) => {
    return week === currentWeek && year === currentYear;
  };

  // Aksiyon planlanmış mı kontrolü
  const hasScheduledAction = (week, year) => {
    return scheduledActions[formatWeekKey(year, week)] !== undefined;
  };

  // Zorunlu oyun aksiyonu var mı kontrolü
  const hasMandatoryAction = (week, year) => {
    // Global hafta sayısını hesapla
    const totalWeeks = (year - 2025) * 52 + week;
    
    // Seçim haftası kontrolü
    for (const [type, schedule] of Object.entries(electionSchedule)) {
      if ((totalWeeks - schedule.phase) % schedule.interval === 0) {
        return { type, icon: '🗳️', name: 'Seçim' };
      }
    }
    
    return null;
  };
  
  // Aksiyon sonucu üretme (demo amaçlı)
  const generateActionResult = (actionId, weekData, characterId = 'player') => {
    // Aksiyon ve tarih için tutarlı bir seed oluştur
    const weekKey = formatWeekKey(weekData.year, weekData.week);
    const seed = weekKey + actionId + characterId;
    
    // Karakter ve parti bilgilerini al
    const character = characters.find(c => c.id === characterId) || characters[0];
    const party = parties.find(p => p.id === character.partyId) || parties[0];
    
    // Basit bir seed tabanlı rastgele değer üreteci
    const seededRandom = () => {
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash = hash & hash;
      }
      return Math.abs((Math.sin(hash) + 1) / 2);
    };
    
    const actionPerformer = (
      <div className="mb-3">
        <span className="font-bold cursor-help" title={`${party.name}`}>
          {character.name}
        </span>
        {' '}- {party.name}
      </div>
    );
    
    // Aksiyon tipleri
    switch(actionId) {
      case 'survey':
        return {
          title: 'Anket Sonuçları',
          performer: character,
          party: party,
          content: (
            <div className="p-4">
              {actionPerformer}
              <h3 className="text-lg font-bold mb-2">Parti Oy Oranları</h3>
              <div className="mb-2">
                <div className="flex justify-between mb-1">
                  <span>Cumhuriyetçi Milli Parti</span>
                  <span>%{Math.floor(seededRandom() * 20) + 30}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Demokratik Halk Partisi</span>
                  <span>%{Math.floor(seededRandom() * 20) + 20}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Liberal Parti</span>
                  <span>%{Math.floor(seededRandom() * 15) + 10}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Milliyetçi Parti</span>
                  <span>%{Math.floor(seededRandom() * 10) + 5}</span>
                </div>
              </div>
            </div>
          )
        };
      
      // Diğer aksiyon sonuçları burada...
        
      default:
        return null;
    }
  };

  // AI tarafından yapılan aksiyonları üretme (demo amaçlı)
  const generateAIActions = (weekData) => {
    const weekKey = formatWeekKey(weekData.year, weekData.week);
    
    // Zaten AI aksiyonları varsa tekrar ekleme
    if (allWeekActions[weekKey] && allWeekActions[weekKey].some(action => !action.isPlayerAction)) {
      return [];
    }
    
    // Rastgele AI aksiyon sayısı (0-2)
    const aiActionsCount = Math.floor(Math.random() * 3);
    const aiActions = [];
    
    for (let i = 0; i < aiActionsCount; i++) {
      // Rastgele bir NPC karakteri seç
      const aiCharacters = characters.filter(c => !c.isPlayer);
      const character = aiCharacters[Math.floor(Math.random() * aiCharacters.length)];
      
      // Rastgele bir aksiyon seç
      const action = possibleActions[Math.floor(Math.random() * possibleActions.length)];
      
      aiActions.push({
        characterId: character.id,
        actionId: action.id,
        weekData: { week: weekData.week, year: weekData.year },
        isPlayerAction: false
      });
    }
    
    return aiActions;
  };

  // Haftaya tıklama işlemi
  const handleWeekClick = (weekData) => {
    const weekKey = formatWeekKey(weekData.year, weekData.week);
    
    // Tamamlanmış aksiyonlar varsa sonuçları göster
    if (allWeekActions[weekKey]) {
      // Sadece geçmiş haftalar veya şu anki hafta için sonuçları göster
      if (!isPastWeek(weekData.week, weekData.year) && !isCurrentWeek(weekData.week, weekData.year)) {
        alert("Bu hafta henüz gelmedi, sonuçları göremezsiniz.");
        return;
      }
      
      const actions = allWeekActions[weekKey];
      setResultsToShow(actions);
      setCurrentResultToShowIndex(0);
      
      if (actions.length > 0) {
        const firstAction = actions[0];
        const result = generateActionResult(firstAction.actionId, firstAction.weekData, firstAction.characterId);
        if (result) {
          setResultContent(result);
          setShowResultPanel(true);
        }
      }
      return;
    } else if (completedActions[weekKey]) {
      // Eski veri yapısı desteği
      // Sadece geçmiş haftalar veya şu anki hafta için sonuçları göster
      if (!isPastWeek(weekData.week, weekData.year) && !isCurrentWeek(weekData.week, weekData.year)) {
        alert("Bu hafta henüz gelmedi, sonuçları göremezsiniz.");
        return;
      }
      
      const action = completedActions[weekKey];
      // Sentetik bir hafta sonuç aksiyonu oluştur
      const syntheticAction = {
        characterId: 'player',
        actionId: action.id,
        weekData: weekData,
        isPlayerAction: true
      };
      setResultsToShow([syntheticAction]);
      setCurrentResultToShowIndex(0);
      
      const result = generateActionResult(action.id, weekData);
      if (result) {
        setResultContent(result);
        setShowResultPanel(true);
      }
      return;
    }
    
    // Şu anki veya geçmiş haftalar için aksiyon planlanamaz
    if (isPastWeek(weekData.week, weekData.year) || isCurrentWeek(weekData.week, weekData.year)) {
      return;
    }
    
    // Şu anki haftadan sonraki ilk haftaya aksiyon ekleyebilirsin
    const nextWeekData = getNextWeek({ week: currentWeek, year: currentYear });
    const isNextWeek = weekData.week === nextWeekData.week && weekData.year === nextWeekData.year;
    
    if (!isNextWeek) {
      alert("Sadece bir sonraki haftaya aksiyon planlayabilirsiniz!");
      return;
    }
    
    // Bugün için aksiyon kullandıysa izin verme
    if (actionUsedToday && !scheduledActions[weekKey]) {
      alert("Bu hafta için aksiyon hakkınızı kullandınız!");
      return;
    }
    
    // Bu haftaya zaten aksiyon planlanmışsa izin verme
    if (scheduledActions[weekKey]) {
      alert("Bu haftaya zaten bir aksiyon planladınız!");
      return;
    }
    
    // Tam oyunda burada karakter seçimi olurdu
    setSelectedCharacter(characters[0]);
    
    setSelectedWeek(weekData);
    setShowActionModal(true);
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

  // Aksiyon planla
  const scheduleAction = (actionId) => {
    if (!selectedWeek) return;
    
    const weekKey = formatWeekKey(selectedWeek.year, selectedWeek.week);
    const action = possibleActions.find(a => a.id === actionId);
    
    setScheduledActions(prev => ({
      ...prev,
      [weekKey]: action
    }));
    
    setActionUsedToday(true);
    setShowActionModal(false);
  };
  
  // Sonraki hafta için aksiyon planla (aksiyon ekranından)
  const planActionForNextWeek = (actionId) => {
    const nextWeekData = getNextWeek({ week: currentWeek, year: currentYear });
    const weekKey = formatWeekKey(nextWeekData.year, nextWeekData.week);
    const action = possibleActions.find(a => a.id === actionId);
    
    if (!action) return;
    
    // Bugün için aksiyon kullandıysa izin verme
    if (actionUsedToday) {
      alert("Bu hafta için aksiyon hakkınızı kullandınız!");
      return;
    }
    
    // Bu haftaya zaten aksiyon planlanmışsa izin verme
    if (scheduledActions[weekKey]) {
      alert("Bu haftaya zaten bir aksiyon planladınız!");
      return;
    }
    
    setScheduledActions(prev => ({
      ...prev,
      [weekKey]: action
    }));
    
    setActionUsedToday(true);
    setCurrentActionPanel(null);
    
    // Kullanıcıya bildirim
    alert(`"${action.name}" aksiyonu ${formatWeekDisplay(nextWeekData.week, nextWeekData.year)} için planlandı.`);
  };

  // Önceki haftalara git
  const showPreviousWeeks = () => {
    setViewOffset(viewOffset - 1);
  };

  // Sonraki haftalara git
  const showNextWeeks = () => {
    setViewOffset(viewOffset + 1);
  };

  // Haftayı bitir ve sonraki haftaya geç
  const endWeek = () => {
    // Eğer sonuçlar gösteriliyorsa, sonraki sonuca geç veya sonuçları bitir
    if (isShowingResults) {
      if (currentResultToShowIndex < resultsToShow.length - 1) {
        // Sonraki sonucu göster
        const nextIndex = currentResultToShowIndex + 1;
        setCurrentResultToShowIndex(nextIndex);
        const action = resultsToShow[nextIndex];
        const result = generateActionResult(
          action.actionId, 
          action.weekData, 
          action.characterId
        );
        if (result) {
          setResultContent(result);
          setShowResultPanel(true);
        }
        return;
      } else {
        // Tüm sonuçları gösterdik, sonuç göstermeyi durdur
        setIsShowingResults(false);
        setResultsToShow([]);
        setCurrentResultToShowIndex(0);
        setShowResultPanel(false);
        return;
      }
    }
    
    // Açık sonuç panellerini kapat
    setShowResultPanel(false);
    
    // Sonuçlar için sonraki haftayı hazırla
    const nextWeekData = getNextWeek({ week: currentWeek, year: currentYear });
    const nextWeekKey = formatWeekKey(nextWeekData.year, nextWeekData.week);
    
    // Oyuncu tarafından planlanmış tüm aksiyonları al
    const playerActions = [];
    if (scheduledActions[nextWeekKey]) {
      const action = scheduledActions[nextWeekKey];
      playerActions.push({
        characterId: 'player',
        actionId: action.id,
        weekData: nextWeekData,
        isPlayerAction: true
      });
      
      // Planlanmıştan tamamlanmışa taşı
      setCompletedActions(prev => ({
        ...prev,
        [nextWeekKey]: action
      }));
      
      // Planlanmış aksiyonlardan kaldır
      const newScheduled = {...scheduledActions};
      delete newScheduled[nextWeekKey];
      setScheduledActions(newScheduled);
    }
    
    // AI aksiyonları üret
    const aiActions = generateAIActions(nextWeekData);
    
    // Oyuncu ve AI aksiyonlarını birleştir
    const allActions = [...playerActions, ...aiActions];
    
    // Bu hafta için tüm aksiyonları sakla
    if (allActions.length > 0) {
      setAllWeekActions(prev => ({
        ...prev,
        [nextWeekKey]: allActions
      }));
      
      // Önce sonraki haftaya geç
      setCurrentWeek(nextWeekData.week);
      setCurrentYear(nextWeekData.year);
      setActionUsedToday(false);
      setViewOffset(0);
      
      // Sonra gösterilecek sonuçlar dizisini ayarla
      setTimeout(() => {
        setResultsToShow(allActions);
        setCurrentResultToShowIndex(0);
        setIsShowingResults(true);
        
        // İlk sonucu göster
        if (allActions.length > 0) {
          const firstAction = allActions[0];
          const result = generateActionResult(
            firstAction.actionId, 
            firstAction.weekData, 
            firstAction.characterId
          );
          if (result) {
            setResultContent(result);
            setShowResultPanel(true);
          }
        }
      }, 10);
    } else {
      // Bu hafta için aksiyon yok, sadece ilerle
      setCurrentWeek(nextWeekData.week);
      setCurrentYear(nextWeekData.year);
      setActionUsedToday(false);
      setViewOffset(0);
    }
    
    // Bu haftada özel olaylar var mı kontrol et
    checkForSpecialEvents(nextWeekData);
  };
  
  // Özel oyun olaylarını kontrol et (seçimler, vs.)
  const checkForSpecialEvents = (weekData) => {
    // Global hafta sayısını hesapla
    const totalWeeks = (weekData.year - 2025) * 52 + weekData.week;
    
    // Seçim haftası kontrolü
    for (const [electionType, schedule] of Object.entries(electionSchedule)) {
      if ((totalWeeks - schedule.phase) % schedule.interval === 0) {
        // Burada seçim olayları gerçekleşir
        console.log(`${electionType} seçimi gerçekleşiyor!`);
        // Seçim sonuçlarını göster vs...
      }
    }
  };

  // Aksiyon panelini aç
  const openActionPanel = (actionId) => {
    setCurrentActionPanel(actionId);
    setSidebarOpen(true);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-blue-950 to-indigo-950 text-white">
      {/* Header */}
      <div className="bg-blue-900/40 border-b border-blue-800 p-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="text-xl font-bold text-blue-300 mr-8">TÜRKİYE SİYASETİ</div>
          <div className="flex space-x-1">
            <TabButton active={activeTab === 'turkiye'} onClick={() => {setActiveTab('turkiye'); setSidebarOpen(true); setCurrentActionPanel(null);}}>
              Türkiye
            </TabButton>
            <TabButton active={activeTab === 'dunya'} onClick={() => {setActiveTab('dunya'); setSidebarOpen(true); setCurrentActionPanel(null);}}>
              Dünya
            </TabButton>
            <TabButton active={activeTab === 'parti'} onClick={() => {setActiveTab('parti'); setSidebarOpen(true); setCurrentActionPanel(null);}}>
              Parti
            </TabButton>
            <TabButton active={activeTab === 'oyuncu'} onClick={() => {setActiveTab('oyuncu'); setSidebarOpen(true); setCurrentActionPanel(null);}}>
              Oyuncu
            </TabButton>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right mr-4">
            <div className="font-medium">{playerInfo.name}</div>
            <div className="flex items-center">
              <span className="mr-2">Lider:</span>
              <span className="font-semibold" style={{color: playerInfo.partyColor}}>{playerInfo.party}</span>
            </div>
          </div>
          
          <button 
            className="p-2 rounded-full hover:bg-blue-800/50"
            onClick={() => setSettingsOpen(!settingsOpen)}
          >
            <Settings size={24} />
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-80 bg-blue-950/50 border-r border-blue-800 p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {currentActionPanel ? 
                  possibleActions.find(a => a.id === currentActionPanel)?.name : 
                  activeTab === 'turkiye' ? 'Türkiye' : 
                  activeTab === 'dunya' ? 'Dünya' :
                  activeTab === 'parti' ? 'Parti' : 'Oyuncu'}
              </h2>
              <button 
                className="p-1 rounded hover:bg-blue-800/50"
                onClick={() => setSidebarOpen(false)}
              >
                <ChevronRight size={20} />
              </button>
            </div>
            
            {renderSidebarContent()}
          </div>
        )}
        
        {/* Main map container */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center p-4 relative">
            {/* Sonuç paneli (aksiyon tamamlandığında gösterilir) */}
            {showResultPanel && resultContent && (
              <div className="absolute top-4 left-4 bg-blue-900/90 border border-blue-700 rounded-lg p-4 w-80 shadow-lg z-10">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-bold">{resultContent.title}</h2>
                    {resultsToShow.length > 0 && (
                      <button 
                        className="text-sm bg-blue-800 px-2 py-1 rounded mt-1 hover:bg-blue-700"
                        onClick={() => {
                          const nextIndex = (currentResultToShowIndex + 1) % resultsToShow.length;
                          setCurrentResultToShowIndex(nextIndex);
                          const action = resultsToShow[nextIndex];
                          const result = generateActionResult(
                            action.actionId, 
                            action.weekData, 
                            action.characterId
                          );
                          if (result) {
                            setResultContent(result);
                          }
                        }}
                      >
                        Sonuç {currentResultToShowIndex + 1}/{resultsToShow.length}
                      </button>
                    )}
                  </div>
                  <button 
                    className="text-gray-400 hover:text-white"
                    onClick={() => setShowResultPanel(false)}
                  >
                    ✕
                  </button>
                </div>
                {resultContent.content}
              </div>
            )}
            
            {/* Türkiye Haritası */}
            <div className="relative">
              <svg viewBox="0 0 1000 500" className="w-full max-w-4xl">
                <g className="turkey-map">
                  {/* Türkiye haritasının il sınırlarını temsil eden basitleştirilmiş SVG */}
                  <path d="M500,150 Q650,100 800,150 Q900,200 850,300 Q750,400 500,350 Q250,400 150,300 Q100,200 200,150 Q350,100 500,150" 
                        fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" />
                  
                  {/* Örnek iller (temsili konumlar) */}
                  <CityMarker name="Ankara" x={500} y={250} active={true} />
                  <CityMarker name="İstanbul" x={450} y={180} />
                  <CityMarker name="İzmir" x={350} y={280} />
                  <CityMarker name="Antalya" x={450} y={350} />
                  <CityMarker name="Adana" x={600} y={330} />
                  <CityMarker name="Trabzon" x={700} y={200} />
                  <CityMarker name="Diyarbakır" x={700} y={300} />
                  <CityMarker name="Erzurum" x={750} y={250} />
                  <CityMarker name="Konya" x={520} y={320} />
                  <CityMarker name="Samsun" x={600} y={180} />
                  <CityMarker name="Bursa" x={400} y={220} />
                  <CityMarker name="Gaziantep" x={650} y={350} />
                  <CityMarker name="Kayseri" x={580} y={280} />
                  <CityMarker name="Van" x={820} y={280} />
                </g>
              </svg>
              
              {/* Harita üzerinde bilgi kartı */}
              <div className="absolute right-0 top-0 bg-blue-900/80 rounded-lg border border-blue-700 p-3 shadow-lg w-64">
                <h3 className="font-bold">Ülke Genel Durum</h3>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Memnuniyet:</span>
                    <span className="text-yellow-300">%65</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ekonomik Büyüme:</span>
                    <span className="text-green-300">%3.2</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uluslararası İtibar:</span>
                    <span className="text-blue-300">Orta</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Calendar/Week Turn Controls */}
          <div className="bg-blue-900/40 border-t border-blue-800 p-3">
            {/* Top Calendar Controls */}
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center">
                <Calendar className="mr-2" size={18} />
                <span>{formatDate(currentWeek, currentYear)}</span>
                {actionUsedToday && (
                  <span className="ml-2 bg-yellow-600 text-xs text-white px-2 py-0.5 rounded-full">
                    Aksiyon Kullanıldı
                  </span>
                )}
              </div>
              
              <div className="flex-1 mx-8">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Hafta {currentWeek}/52</span>
                  <div className="flex-1 mx-4 h-3 bg-blue-950 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-600 to-blue-400" 
                      style={{width: `${(currentWeek/52)*100}%`}}>
                    </div>
                  </div>
                  <span className="text-sm">Kalan: {52-currentWeek} hafta</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-sm"
                  onClick={showPreviousWeeks}
                >
                  ◀ Önceki
                </button>
                <button 
                  className="bg-red-700 hover:bg-red-600 px-4 py-1 rounded"
                  onClick={endWeek}
                >
                  {isShowingResults ? "Sonraki Sonuç" : "Haftayı Bitir"}
                </button>
                <button 
                  className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-sm"
                  onClick={showNextWeeks}
                >
                  Sonraki ▶
                </button>
              </div>
            </div>
            
            {/* Haftalar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {visibleWeeks.map((weekData, index) => {
                const weekKey = formatWeekKey(weekData.year, weekData.week);
                const isCurrentWeekItem = isCurrentWeek(weekData.week, weekData.year);
                const isPast = isPastWeek(weekData.week, weekData.year);
                const hasAction = scheduledActions[weekKey] || completedActions[weekKey] || 
                                (allWeekActions[weekKey] && allWeekActions[weekKey].length > 0);
                const specialWeek = specialWeeks[weekData.week] || "-";
                const mandatoryAction = hasMandatoryAction(weekData.week, weekData.year);
                
                // Aksiyon ikonunu al
                let actionIcon = null;
                let actionIconHint = "";
                
                if (mandatoryAction) {
                  actionIcon = mandatoryAction.icon;
                  actionIconHint = mandatoryAction.name;
                } else if (allWeekActions[weekKey] && allWeekActions[weekKey].length > 0) {
                  const firstAction = allWeekActions[weekKey][0];
                  const action = possibleActions.find(a => a.id === firstAction.actionId);
                  if (action) {
                    actionIcon = action.icon;
                    actionIconHint = action.name;
                  }
                } else if (scheduledActions[weekKey]) {
                  actionIcon = scheduledActions[weekKey].icon;
                  actionIconHint = scheduledActions[weekKey].name;
                } else if (completedActions[weekKey]) {
                  actionIcon = completedActions[weekKey].icon;
                  actionIconHint = completedActions[weekKey].name;
                }

                return (
                  <div 
                    key={index}
                    className={`
                      p-2 rounded cursor-pointer transition-all
                      ${isCurrentWeekItem ? 'bg-red-700 border border-red-500' : 'bg-blue-900/60 hover:bg-blue-800/60 border border-blue-800'}
                      ${isPast ? 'opacity-70' : 'opacity-100'}
                    `}
                    onClick={() => handleWeekClick(weekData)}
                    title={`${weekData.week}. Hafta, ${weekData.year}`}
                  >
                    <div className="text-center font-medium text-sm">
                      {weekData.week}. Hafta
                    </div>
                    <div className="text-center text-xs text-gray-300 mb-1">{weekData.year}</div>
                    <div className="h-10 flex items-center justify-center border border-blue-800/50 my-1 rounded">
                      {(hasAction || mandatoryAction) && actionIcon && (
                        <div className="text-xl" title={actionIconHint}>{actionIcon}</div>
                      )}
                      {hasAction && !actionIcon && (
                        <div className="text-xl">🔄</div>
                      )}
                    </div>
                    <div className="text-center text-xs mt-1 border-t border-blue-800/50 pt-1 text-gray-300">{specialWeek}</div>
                  </div>
                );
              })}
            </div>
            
            {/* Action Buttons */}
            <div className="mt-3 grid grid-cols-6 gap-2">
              {possibleActions.map((action) => (
                <button
                  key={action.id}
                  className="flex flex-col items-center justify-center p-2 bg-blue-900/60 hover:bg-blue-800/60 rounded border border-blue-800 transition-all"
                  onClick={() => openActionPanel(action.id)}
                  title={action.description}
                >
                  <div className="text-xl mb-1">{action.icon}</div>
                  <div className="text-xs font-medium">{action.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Settings Popup */}
      {settingsOpen && (
        <div className="absolute right-4 top-16 w-64 bg-blue-900/95 border border-blue-700 rounded-lg shadow-lg p-3 z-10">
          <h3 className="font-bold border-b border-blue-700 pb-2 mb-2">Ayarlar</h3>
          <ul className="space-y-2">
            <SettingsMenuItem icon={<Save size={18} />} text="Oyunu Kaydet" />
            <SettingsMenuItem icon={<Save size={18} />} text="Farklı Kaydet" />
            <SettingsMenuItem icon={<HelpCircle size={18} />} text="Yardım" />
            <li className="border-t border-blue-700 my-2 pt-2">
              <SettingsMenuItem icon={<Home size={18} />} text="Ana Menüye Dön" />
            </li>
            <SettingsMenuItem icon={<LogOut size={18} />} text="Oyundan Çık" />
          </ul>
        </div>
      )}
      
      {/* Aksiyon seçim modalı */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-blue-900 border border-blue-700 rounded-lg p-6 w-1/3 max-w-2xl text-white">
            <h3 className="text-xl font-bold mb-4 text-blue-300">
              {formatWeekDisplay(selectedWeek.week, selectedWeek.year)} için aksiyon seç
            </h3>
            
            {/* Karakter seçimi kısmı */}
            <div className="mb-4 p-3 border border-blue-800 rounded bg-blue-950/70">
              <h4 className="font-bold mb-2 text-blue-300">Aksiyon Yapacak Kişi:</h4>
              <div className="flex items-center">
                <span className="font-semibold">{selectedCharacter.name}</span>
                <span className="mx-2">-</span>
                <span>{parties.find(p => p.id === selectedCharacter.partyId)?.name}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Not: Tam oyunda parti üyeleri arasından seçim yapabileceksiniz.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              {possibleActions.map((action) => (
                <button
                  key={action.id}
                  className="flex items-center p-3 border border-blue-700 rounded hover:bg-blue-800 bg-blue-950/70 transition-all"
                  onClick={() => scheduleAction(action.id)}
                >
                  <span className="text-2xl mr-3">{action.icon}</span>
                  <div>
                    <span className="font-semibold block">{action.name}</span>
                    <p className="text-xs text-gray-400">{action.description}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <button 
                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
                onClick={() => setShowActionModal(false)}
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Yardımcı Bileşenler
const TabButton = ({ children, active, onClick }) => (
  <button
    className={`px-4 py-2 rounded-t-lg ${
      active 
        ? 'bg-blue-800/60 font-medium text-blue-200' 
        : 'bg-transparent hover:bg-blue-800/30'
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

const SettingsMenuItem = ({ icon, text }) => (
  <li>
    <button className="w-full text-left p-2 rounded hover:bg-blue-800/60 flex items-center">
      <span className="mr-3 text-blue-300">{icon}</span>
      <span>{text}</span>
    </button>
  </li>
);

const StatCard = ({ title, value, change, positive = true }) => (
  <div className="bg-blue-900/50 rounded-lg p-2">
    <div className="text-xs text-gray-300">{title}</div>
    <div className="font-semibold text-lg">{value}</div>
    {change && (
      <div className={`text-xs ${positive ? 'text-green-400' : 'text-red-400'}`}>
        {change}
      </div>
    )}
  </div>
);

const CityMarker = ({ name, x, y, active = false }) => (
  <g className="cursor-pointer hover:opacity-80 transition-opacity" transform={`translate(${x}, ${y})`}>
    <circle 
      r={active ? 10 : 8} 
      fill={active ? "#3b82f6" : "#1e3a8a"}
      stroke={active ? "#93c5fd" : "#60a5fa"}
      strokeWidth="2"
    />
    <MapPin 
      className="city-icon" 
      style={{
        color: active ? "#fff" : "#93c5fd",
        transform: "translate(-12px, -12px)",
        width: "24px",
        height: "24px"
      }}
    />
    <text 
      fill="#fff" 
      fontSize="12" 
      textAnchor="middle" 
      y={active ? 28 : 24}
      fontWeight={active ? "bold" : "normal"}
    >
      {name}
    </text>
    {active && (
      <circle r="16" fill="transparent" stroke="#3b82f6" strokeWidth="2" strokeDasharray="3 3" />
    )}
  </g>
);


export default GameInterface;