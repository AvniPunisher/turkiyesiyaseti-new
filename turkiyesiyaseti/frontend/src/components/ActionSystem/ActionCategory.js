import React from 'react';

const ActionCategory = ({ category, onClick }) => {
  return (
    <button
      className="action-category"
      onClick={onClick}
    >
      <div className="category-icon">{category.icon}</div>
      <div className="category-name">{category.name}</div>
    </button>
  );
};

export default ActionCategory;