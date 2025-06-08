import React from 'react';

const ActionItem = ({ action, disabled, onClick }) => {
  return (
    <button
      className={`action-item ${disabled ? 'disabled' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="action-icon">{action.icon}</span>
      <div className="action-details">
        <span className="action-name">{action.name}</span>
        <p className="action-description">{action.description}</p>
      </div>
      <span className="action-cost" title="Aksiyon puanı">
        {action.cost}AP
      </span>
    </button>
  );
};

export default ActionItem;