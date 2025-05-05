import React from 'react';

const EventOption = ({ option, onClick }) => {
  return (
    <button
      className="event-option"
      onClick={onClick}
    >
      <span className="option-text">{option.text}</span>
      <p className="option-description">{option.description}</p>
    </button>
  );
};

export default EventOption;