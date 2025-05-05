import React from 'react';
import { 
  BarChart2, User, Globe, Building, 
  AlignLeft, ChevronLeft 
} from 'lucide-react';
import { useGameContext } from '../../context/GameContext';

const GameSidebar = ({ activeTab, setActiveTab }) => {
  const { parameters } = useGameContext();

  return (
    <div className="game-sidebar">
      <div className="sidebar-menu">
        <div className="menu-section">
          <div className="section-title">Menü</div>
          <div className="menu-items">
            <div 
              className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <BarChart2 size={18} className="item-icon" />
              <span>Genel Durum</span>
            </div>
            <div 
              className={`menu-item ${activeTab === 'character' ? 'active' : ''}`}
              onClick={() => setActiveTab('character')}
            >
              <User size={18} className="item-icon" />
              <span>Karakter</span>
            </div>
            <div 
              className={`menu-item ${activeTab === 'economy' ? 'active' : ''}`}
              onClick={() => setActiveTab('economy')}
            >
              <BarChart2 size={18} className="item-icon" />
              <span>Ekonomi</span>
            </div>
            <div 
              className={`menu-item ${activeTab === 'foreign' ? 'active' : ''}`}
              onClick={() => setActiveTab('foreign')}
            >
              <Globe size={18} className="item-icon" />
              <span>Dış İlişkiler</span>
            </div>
            <div 
              className={`menu-item ${activeTab === 'parliament' ? 'active' : ''}`}
              onClick={() => setActiveTab('parliament')}
            >
              <Building size={18} className="item-icon" />
              <span>Meclis</span>
            </div>
            <div 
              className={`menu-item ${activeTab === 'polls' ? 'active' : ''}`}
              onClick={() => setActiveTab('polls')}
            >
              <AlignLeft size={18} className="item-icon" />
              <span>Anketler</span>
            </div>
          </div>
        </div>

        {/* Ekonomik Durum */}
        <div className="sidebar-section">
          <h3>Ekonomik Durum</h3>
          <div className="info-panel">
            <div className="info-row">
              <span>Enflasyon:</span>
              <span className="value-negative">%{parameters.economy.inflation}</span>
            </div>
            <div className="info-row">
              <span>İşsizlik:</span>
              <span className="value-warning">%{parameters.economy.unemployment}</span>
            </div>
            <div className="info-row">
              <span>Büyüme:</span>
              <span className="value-positive">%{parameters.economy.growth}</span>
            </div>
            <div className="info-row">
              <span>BIST-100:</span>
              <span>{parameters.economy.stockMarket}</span>
            </div>
          </div>
        </div>
        
        {/* Parti Desteği */}
        <div className="sidebar-section">
          <h3>Parti Desteği</h3>
          <div className="info-panel">
            <div className="party-support-item">
              <div className="party-row">
                <span>CHP:</span>
                <span>{parameters.politics.partySupport}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill chp"
                  style={{ width: `${parameters.politics.partySupport}%` }}
                ></div>
              </div>
            </div>
            
            <div className="party-support-item">
              <div className="party-row">
                <span>AK Parti:</span>
                <span>34.2%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill akp"
                  style={{ width: '34.2%' }}
                ></div>
              </div>
            </div>
            
            <div className="party-support-item">
              <div className="party-row">
                <span>MHP:</span>
                <span>9.3%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill mhp"
                  style={{ width: '9.3%' }}
                ></div>
              </div>
            </div>
            
            <div className="party-support-item">
              <div className="party-row">
                <span>İYİ Parti:</span>
                <span>10.8%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill iyi"
                  style={{ width: '10.8%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameSidebar;