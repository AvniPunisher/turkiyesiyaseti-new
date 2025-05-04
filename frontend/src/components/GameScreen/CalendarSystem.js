import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import ActionButton from './ActionButton';

const CalendarSystem = ({ 
  currentDate, 
  setCurrentDate, 
  actionPoints, 
  scheduledActions, 
  onWeekClick, 
  onEndWeek,
  onActionCategorySelect
}) => {
  const [viewOffset, setViewOffset] = useState(0);
  const [visibleWeeks, setVisibleWeeks] = useState([]);
  
  // Görünen haftaları güncelleme
  useEffect(() => {
    updateVisibleWeeks();
  }, [viewOffset, currentDate]);

  // Görünen haftaları oluştur
  const updateVisibleWeeks = () => {
    const weeks = [];
    let weekToShow = currentDate.week + viewOffset;
    let yearToShow = currentDate.year;
    let monthToShow = currentDate.month;
    
    // Yıl değişikliklerini hesapla
    while (weekToShow > 52) {
      weekToShow -= 52;
      yearToShow += 1;
    }
    
    while (weekToShow < 1) {
      weekToShow += 52;
      yearToShow -= 1;
    }
    
    // Ay hesapla (basit bir yaklaşım)
    monthToShow = Math.ceil(weekToShow / 4.33);
    if (monthToShow > 12) monthToShow = 12;
    
    // 7 hafta göster
    for (let i = 0; i < 7; i++) {
      let week = weekToShow + i;
      let year = yearToShow;
      let month = Math.ceil(week / 4.33);
      
      // Yıl değişimini kontrol et
      if (week > 52) {
        week = week - 52;
        year = year + 1;
        month = Math.ceil(week / 4.33);
      }
      
      if (month > 12) month = 12;
      
      weeks.push({ week, month, year });
    }
    
    setVisibleWeeks(weeks);
  };

  // Ay ismini getir
  const getMonthName = (month) => {
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    return months[month - 1];
  };

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

  // Hafta anahtarı oluştur
  const formatWeekKey = (year, month, week) => {
    return `${year}-${month.toString().padStart(2, '0')}-${week.toString().padStart(2, '0')}`;
  };

  // Aksiyon planlanmış mı kontrolü
  const hasScheduledAction = (week, month, year) => {
    return scheduledActions[formatWeekKey(year, month, week)] !== undefined;
  };

  // Özel bir hafta mı kontrolü (seçim, önemli gün, vb.)
  const isSpecialWeek = (week, month, year) => {
    // Seçim haftaları
    if (month === 6 && week === 2 && (year % 5 === 0)) return { type: 'election', name: 'Genel Seçim', icon: '🗳️' };
    if (month === 3 && week === 3 && (year % 5 === 1)) return { type: 'election', name: 'Yerel Seçim', icon: '🏛️' };
    
    // Özel günler
    if (month === 10 && week === 4) return { type: 'national', name: 'Cumhuriyet Bayramı', icon: '🇹🇷' };
    if (month === 4 && week === 4) return { type: 'national', name: 'Ulusal Egemenlik', icon: '🇹🇷' };
    if (month === 5 && week === 3) return { type: 'national', name: '19 Mayıs', icon: '🇹🇷' };
    if (month === 8 && week === 4) return { type: 'national', name: '30 Ağustos', icon: '🇹🇷' };
    
    // Önemli ekonomik olaylar
    if (month === 2 && week === 1) return { type: 'economic', name: 'Bütçe Görüşmeleri', icon: '💰' };
    if (month === 7 && week === 2) return { type: 'economic', name: 'Ekonomik Program', icon: '📊' };
    
    return null;
  };

  // Önceki haftalara git
  const showPreviousWeeks = () => {
    setViewOffset(viewOffset - 3);
  };

  // Sonraki haftalara git
  const showNextWeeks = () => {
    setViewOffset(viewOffset + 3);
  };

  // ActionButton tıklama işleyici
  const onActionButtonClick = (categoryId) => {
    // Aksiyon puanı kontrolü
    if (actionPoints <= 0) {
      alert("Bu hafta için aksiyon puanınız kalmadı!");
      return;
    }
    
    // Kategoriyi seçme
    onActionCategorySelect(categoryId);
  };

  return (
    <div className="bg-blue-900/40 border-t border-blue-800 p-3">
      {/* Top Calendar Controls */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <Calendar className="mr-2" size={18} />
          <span>
            {getMonthName(currentDate.month)} {currentDate.year} - {currentDate.week}. Hafta
          </span>
          <span className="ml-4 bg-blue-700 text-xs px-2 py-0.5 rounded-full">
            Kalan Aksiyon: {actionPoints}/3
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-sm"
            onClick={showPreviousWeeks}
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            className="bg-red-700 hover:bg-red-600 px-4 py-1 rounded"
            onClick={onEndWeek}
          >
            Haftayı Bitir
          </button>
          <button 
            className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-sm"
            onClick={showNextWeeks}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      
      {/* Haftalar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {visibleWeeks.map((weekData, index) => {
          const weekKey = formatWeekKey(weekData.year, weekData.month, weekData.week);
          const isCurrentWeekItem = isCurrentWeek(weekData.week, weekData.month, weekData.year);
          const isPast = isPastWeek(weekData.week, weekData.month, weekData.year);
          const hasAction = hasScheduledAction(weekData.week, weekData.month, weekData.year);
          const specialWeek = isSpecialWeek(weekData.week, weekData.month, weekData.year);
          
          return (
            <div 
              key={index}
              className={`
                p-2 rounded cursor-pointer transition-all
                ${isCurrentWeekItem ? 'bg-red-700 border border-red-500' : 'bg-blue-900/60 hover:bg-blue-800/60 border border-blue-800'}
                ${isPast ? 'opacity-70' : 'opacity-100'}
              `}
              onClick={() => onWeekClick(weekData)}
              title={`${weekData.week}. Hafta, ${getMonthName(weekData.month)} ${weekData.year}`}
            >
              <div className="text-center font-medium text-sm">
                {weekData.week}. Hafta
              </div>
              <div className="text-center text-xs text-gray-300 mb-1">{getMonthName(weekData.month)}</div>
              <div className="h-10 flex items-center justify-center border border-blue-800/50 my-1 rounded">
                {hasAction && (
                  <div className="text-xl" title={scheduledActions[weekKey]?.name}>
                    {scheduledActions[weekKey]?.icon || '🔄'}
                  </div>
                )}
                {specialWeek && (
                  <div className="text-xl" title={specialWeek.name}>{specialWeek.icon}</div>
                )}
              </div>
              <div className="text-center text-xs mt-1 border-t border-blue-800/50 pt-1 text-gray-300">
                {specialWeek ? specialWeek.name : weekData.year}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Action Buttons */}
      <div className="mt-3 grid grid-cols-6 gap-2">
        <ActionButton icon="📺" name="Medya" onClick={() => onActionButtonClick('media')} />
        <ActionButton icon="👥" name="Parti" onClick={() => onActionButtonClick('party')} />
        <ActionButton icon="🗣️" name="Saha" onClick={() => onActionButtonClick('field')} />
        <ActionButton icon="📜" name="Meclis" onClick={() => onActionButtonClick('parliament')} />
        <ActionButton icon="📊" name="Ekonomi" onClick={() => onActionButtonClick('economy')} />
        <ActionButton icon="🌐" name="Diplomasi" onClick={() => onActionButtonClick('diplomacy')} />
      </div>
    </div>
  );
};

export default CalendarSystem;