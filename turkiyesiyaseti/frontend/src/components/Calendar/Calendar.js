import React from 'react';
import WeekItem from './WeekItem';
import { useGameContext } from '../../context/GameContext';
import './Calendar.css';

const Calendar = () => {
  const { 
    visibleWeeks,
    handleWeekClick
  } = useGameContext();

  return (
    <div className="calendar-container">
      <div className="weeks-grid">
        {visibleWeeks.map((weekData, index) => (
          <WeekItem 
            key={index}
            weekData={weekData}
            onClick={() => handleWeekClick(weekData)}
          />
        ))}
      </div>
    </div>
  );
};

export default Calendar;