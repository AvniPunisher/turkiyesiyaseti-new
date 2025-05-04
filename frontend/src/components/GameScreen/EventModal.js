import React from 'react';

const EventModal = ({ event, onSelectOption, onClose }) => {
  if (!event) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-blue-900 border border-blue-700 rounded-lg p-6 w-11/12 max-w-3xl text-white">
        <div className="text-center mb-4">
          <div className="text-5xl mb-2">{event.image}</div>
          <h3 className="text-2xl font-bold mb-2 text-blue-300">{event.title}</h3>
          <p className="text-lg">{event.description}</p>
        </div>
        
        <div className="mt-6 space-y-3">
          {event.options.map((option) => (
            <button
              key={option.id}
              className="w-full text-left p-4 border border-blue-700 rounded hover:bg-blue-800 bg-blue-950/70 transition-all flex items-start"
              onClick={() => onSelectOption(option)}
            >
              <div className="flex-1">
                <span className="font-bold text-lg block">{option.text}</span>
                <p className="text-sm text-gray-300 mt-1">{option.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventModal;