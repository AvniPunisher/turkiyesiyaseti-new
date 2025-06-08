import React from 'react';
import { useGameContext } from '../../context/GameContext';

const WeekItem = ({ weekData, onClick }) => {
  const { 
    isCurrentWeek,
    isPastWeek,
    formatWeekKey,
    getMonthName,
    isSpecialWeek,
    scheduledActions
  } = useGameContext();
  
  const weekKey = formatWeekKey(weekData.year, weekData.month, weekData.week);
  const isCurrentWeekItem = isCurrentWeek(weekData.week, weekData.month, weekData.year);
  const isPast = isPastWeek(weekData.week, weekData.month, weekData.year);
  const hasAction = scheduledActions[weekKey];
  const specialWeek = isSpecialWeek(weekData.week, weekData.month, weekData.year);
  
  return (
    <div 
      className={`week-item ${isCurrentWeekItem ? 'current' : ''} 
                 ${isPast ? 'past' : ''} ${hasAction ? 'has-action' : ''}`}
      onClick={onClick}
    >
      <div className="week-number">
        {weekData.week}. Hafta
      </div>
      <div className="week-month">
        {getMonthName(weekData.month)}
      </div>
      <div className="week-content">
        {hasAction && (
          <div className="week-action" title={hasAction.name}>
            {hasAction.icon}
          </div>
        )}
        {specialWeek && (
          <div className="week-special" title={specialWeek.name}>
            {specialWeek.icon}
          </div>
        )}
      </div>
      <div className="week-footer">
        {specialWeek ? specialWeek.name : weekData.year}
      </div>
    </div>
  );
};

export default WeekItem;