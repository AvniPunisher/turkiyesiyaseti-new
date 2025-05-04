import React from 'react';

const ResultPanel = ({ content, onClose }) => {
  if (!content) return null;

  return (
    <div className="absolute top-4 left-4 bg-blue-900/90 border border-blue-700 rounded-lg p-4 w-80 shadow-lg z-10">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">{content.title}</h2>
        </div>
        <button 
          className="text-gray-400 hover:text-white"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
      <div className="mb-4">
        <div className="text-center text-4xl mb-2">{content.icon}</div>
        <p>{content.description}</p>
      </div>
      <button 
        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded"
        onClick={onClose}
      >
        Kapat
      </button>
    </div>
  );
};

export default ResultPanel;
