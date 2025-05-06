import React from 'react';
import { ChevronRight } from 'lucide-react';
// Tüm panel bileşenlerinin Dashboard klasöründe olduğunu varsayıyoruz
import Dashboard from '../Dashboard/Dashboard';
import CharacterPanel from '../Dashboard/CharacterPanel';
import CountryPanel from '../Dashboard/CountryPanel';
import EconomyPanel from '../Dashboard/EconomyPanel';
import ParliamentPanel from '../Dashboard/ParliamentPanel';
import ForeignPanel from '../Dashboard/ForeignPanel';
import PollsPanel from '../Dashboard/PollsPanel';

const GameContent = ({ 
  activeTab, 
  sidebarOpen, 
  toggleSidebar,
  resultContent,
  showResultPanel,
  setShowResultPanel,
  isShowingResults
}) => {
  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'character':
        return <CharacterPanel />;
      case 'country':
        return <CountryPanel />;
      case 'economy':
        return <EconomyPanel />;
      case 'parliament':
        return <ParliamentPanel />;
      case 'foreign':
        return <ForeignPanel />;
      case 'polls':
        return <PollsPanel />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="game-content">
      {/* Sonuç paneli */}
      {showResultPanel && resultContent && (
        <div className="result-panel">
          <div className="result-header">
            <h2>{resultContent.title}</h2>
            <button 
              className="close-button"
              onClick={() => setShowResultPanel(false)}
            >
              ✕
            </button>
          </div>
          <div className="result-body">
            <div className="result-icon">{resultContent.icon}</div>
            <p>{resultContent.description}</p>
          </div>
          <button 
            className="close-result-button"
            onClick={() => setShowResultPanel(false)}
          >
            Kapat
          </button>
        </div>
      )}
      
      <div className="content-header">
        <h2>
          {activeTab === 'dashboard' ? 'Genel Durum Paneli' : 
           activeTab === 'character' ? 'Karakter Bilgileri' : 
           activeTab === 'country' ? 'Ülke Yönetimi' : 
           activeTab === 'economy' ? 'Ekonomi Detayları' : 
           activeTab === 'parliament' ? 'Meclis Faaliyetleri' : 
           activeTab === 'foreign' ? 'Dış İlişkiler' : 'Anketler'}
        </h2>
        
        {!sidebarOpen && (
          <button 
            className="toggle-sidebar-button"
            onClick={toggleSidebar}
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>
      
      <div className="content-body">
        {renderContent()}
      </div>
    </div>
  );
};

export default GameContent;
