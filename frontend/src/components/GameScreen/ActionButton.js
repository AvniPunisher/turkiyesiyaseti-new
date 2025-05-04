import React from 'react';

const ActionButton = ({ icon, name, onClick }) => {
  return (
    <button
      className="flex flex-col items-center justify-center p-2 bg-blue-900/60 hover:bg-blue-800/60 rounded border border-blue-800 transition-all"
      onClick={onClick}
      title={name}
    >
      <div className="mb-1">{icon}</div>
      <div className="text-xs font-medium">{name}</div>
    </button>
  );
};

export default ActionButton;