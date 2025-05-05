import React from 'react';
import { Settings } from 'lucide-react';
import { useCharacterContext } from '../../context/CharacterContext';

const GameHeader = ({ 
  activeTab, 
  setActiveTab, 
  settingsOpen, 
  setSettingsOpen 
}) => {
  const { character } = useCharacterContext();

  return (
    <div className="game-header">
      <div className="header-left">
        <div className="game-title">TÜRKİYE SİYASET SİMÜLASYONU</div>
        <div className="tab-buttons">
          <button
            className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Genel Durum
          </button>
          <button
            className={`tab-button ${activeTab === 'character' ? 'active' : ''}`}
            onClick={() => setActiveTab('character')}
          >
            Karakter
          </button>
          <button
            className={`tab-button ${activeTab === 'country' ? 'active' : ''}`}
            onClick={() => setActiveTab('country')}
          >
            Ülke
          </button>
        </div>
      </div>
      
      <div className="header-right">
        <div className="character-info">
          <div className="party-info">
            <span>Parti:</span>
            <span 
              className="party-badge"
              style={{ backgroundColor: character.partyColor }}
            >
              {character.partyShort}
            </span>
            <span className="party-name">{character.party}</span>
          </div>
          <div className="popularity-info">
            Popülerlik: {character.popularity}%
          </div>
        </div>
        
        <button 
          className="settings-button"
          onClick={() => setSettingsOpen(!settingsOpen)}
        >
          <Settings size={24} />
        </button>
      </div>
      
      {settingsOpen && (
        <div className="settings-popup">
          <h3>Ayarlar</h3>
          <ul>
            <li><button>Oyunu Kaydet</button></li>
            <li><button>Yardım</button></li>
            <li><button>Ana Menüye Dön</button></li>
            <li><button>Oyundan Çık</button></li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default GameHeader;