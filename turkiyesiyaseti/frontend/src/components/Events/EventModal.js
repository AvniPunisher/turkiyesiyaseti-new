import React from 'react';
import EventOption from './EventOption';

const EventModal = ({ event, onSelectOption }) => {
  return (
    <div className="event-modal-overlay">
      <div className="event-modal">
        <div className="event-header">
          <div className="event-icon">{event.image}</div>
          <h3 className="event-title">{event.title}</h3>
          <p className="event-description">{event.description}</p>
        </div>
        
        <div className="event-options">
          {event.options.map((option) => (
            <EventOption 
              key={option.id}
              option={option}
              onClick={() => onSelectOption(option)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventModal;