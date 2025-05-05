import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import CalendarView from '../Calendar/Calendar';
import { useGameContext } from '../../context/GameContext';

const GameFooter = () => {
  const { 
    currentWeek, 
    currentMonth, 
    currentYear, 
    actionsLeft,
    viewOffset,
    isShowingResults,
    showPreviousWeeks,
    showNextWeeks,
    endWeek,
    getMonthName
  } = useGameContext();

  return (
    <div className="game-footer">
      {/* Calendar Controls */}
      <div className="calendar-controls">
        <div className="current-date">
          <Calendar size={18} />
          <span>
            {getMonthName(currentMonth)} {currentYear} - {currentWeek}. Hafta
          </span>
          <span className="actions-left">
            Kalan Aksiyon: {actionsLeft}/3
          </span>
        </div>
        
        <div className="week-controls">
          <button 
            className="prev-week-button"
            onClick={showPreviousWeeks}
          >
            <ChevronLeft size={16} /> Önceki
          </button>
          <button 
            className="end-week-button"
            onClick={endWeek}
          >
            {isShowingResults ? "Sonuçları Kapat" : "Haftayı Bitir"}
          </button>
          <button 
            className="next-week-button"
            onClick={showNextWeeks}
          >
            Sonraki <ChevronRight size={16} />
          </button>
        </div>
      </div>
      
      {/* Calendar View */}
      <CalendarView />
      
      {/* Action Categories */}
      <div className="action-categories">
        {/* ActionCategory bileşenleri buraya gelecek */}
      </div>
    </div>
  );
};

export default GameFooter;