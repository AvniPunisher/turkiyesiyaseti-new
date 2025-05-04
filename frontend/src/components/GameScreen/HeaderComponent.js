import React from 'react';
import styled from 'styled-components';
import { Settings } from 'lucide-react';

const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(0, 30, 60, 0.7);
  border-bottom: 1px solid rgba(0, 200, 255, 0.3);
  height: 64px;
  z-index: 10;
`;

const GameTitle = styled.h2`
  margin: 0;
  color: rgba(0, 200, 255, 0.8);
`;

const HeaderControls = styled.div`
  display: flex;
  gap: 1rem;
`;

const TabButton = styled.button`
  padding: 0.6rem 1.2rem;
  background: ${(props) => (props.active ? 'rgba(0, 100, 200, 0.5)' : 'transparent')};
  border: none;
  border-radius: 5px;
  color: white;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 100, 200, 0.3);
  }
`;

const PartyBadge = styled.span`
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  margin-right: 4px;
  font-weight: bold;
`;

const HeaderComponent = ({ activeTab, setActiveTab, character, settingsOpen, setSettingsOpen }) => {
  const getContrastTextColor = (hexColor) => {
    if (!hexColor) return '#ffffff';
    
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
    return brightness < 128 ? '#ffffff' : '#000000';
  };

  return (
    <GameHeader>
      <div className="flex items-center">
        <GameTitle>TÜRKİYE SİYASET SİMÜLASYONU</GameTitle>
        <div className="ml-8 flex space-x-2">
          <TabButton 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')}
          >
            Genel Durum
          </TabButton>
          <TabButton 
            active={activeTab === 'character'} 
            onClick={() => setActiveTab('character')}
          >
            Karakter
          </TabButton>
          <TabButton 
            active={activeTab === 'country'} 
            onClick={() => setActiveTab('country')}
          >
            Ülke
          </TabButton>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="text-right mr-4">
          <div className="flex items-center">
            <span className="mr-2">Parti:</span>
            <PartyBadge 
              style={{ 
                backgroundColor: character.partyColor, 
                color: getContrastTextColor(character.partyColor) 
              }}
            >
              {character.partyShort}
            </PartyBadge>
            <span className="font-semibold">{character.party}</span>
          </div>
          <div className="text-sm">Popülerlik: {character.popularity}%</div>
        </div>
        
        <button 
          className="p-2 rounded-full hover:bg-blue-800/50"
          onClick={() => setSettingsOpen(!settingsOpen)}
        >
          <Settings size={24} />
        </button>
      </div>
    </GameHeader>
  );
};

export default HeaderComponent;