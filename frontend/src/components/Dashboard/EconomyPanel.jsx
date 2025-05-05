import React from 'react';
import { useGameContext } from '../../context/GameContext';

const EconomyPanel = () => {
  const { parameters } = useGameContext();

  return (
    <div className="economy-panel">
      <div className="panel">
        <div className="panel-header">
          <h3>Ekonomi Detayları</h3>
        </div>
        <div className="panel-body">
          <div className="economy-summary">
            <div className="main-indicators">
              <div className="main-indicator-item">
                <div className="indicator-icon">💰</div>
                <div className="indicator-value">
                  %{parameters.economy.inflation}
                </div>
                <div className="indicator-label">Enflasyon</div>
                <div className="indicator-trend trend-down">
                  0.8% ↓
                </div>
              </div>
              
              <div className="main-indicator-item">
                <div className="indicator-icon">👥</div>
                <div className="indicator-value">
                  %{parameters.economy.unemployment}
                </div>
                <div className="indicator-label">İşsizlik</div>
                <div className="indicator-trend trend-down">
                  0.2% ↓
                </div>
              </div>
              
              <div className="main-indicator-item">
                <div className="indicator-icon">📈</div>
                <div className="indicator-value">
                  %{parameters.economy.growth}
                </div>
                <div className="indicator-label">Büyüme</div>
                <div className="indicator-trend trend-up">
                  0.4% ↑
                </div>
              </div>
              
              <div className="main-indicator-item">
                <div className="indicator-icon">📉</div>
                <div className="indicator-value">
                  {parameters.economy.stockMarket}
                </div>
                <div className="indicator-label">Borsa</div>
                <div className="indicator-trend trend-up">
                  245 ↑
                </div>
              </div>
            </div>
          </div>
          
          <div className="economy-details">
            <div className="economy-section">
              <h4>Bütçe Durumu</h4>
              <div className="budget-info">
                <div className="budget-item">
                  <span>Bütçe Açığı:</span>
                  <span className="value-negative">{parameters.economy.budget} Milyar TL</span>
                </div>
                <div className="budget-item">
                  <span>Vergi Geliri:</span>
                  <span>1,850 Milyar TL</span>
                </div>
                <div className="budget-item">
                  <span>Toplam Harcama:</span>
                  <span>1,890 Milyar TL</span>
                </div>
                <div className="budget-item">
                  <span>Kamu Borç Stoku:</span>
                  <span>2,540 Milyar TL</span>
                </div>
              </div>
            </div>
            
            <div className="economy-section">
              <h4>Sektörel Durum</h4>
              <div className="sectors-grid">
                <div className="sector-item">
                  <div className="sector-icon">🏭</div>
                  <div className="sector-name">Sanayi</div>
                  <div className="sector-growth trend-up">+2.8%</div>
                </div>
                <div className="sector-item">
                  <div className="sector-icon">🌾</div>
                  <div className="sector-name">Tarım</div>
                  <div className="sector-growth trend-up">+1.2%</div>
                </div>
                <div className="sector-item">
                  <div className="sector-icon">🏙️</div>
                  <div className="sector-name">İnşaat</div>
                  <div className="sector-growth trend-down">-1.5%</div>
                </div>
                <div className="sector-item">
                  <div className="sector-icon">🏨</div>
                  <div className="sector-name">Turizm</div>
                  <div className="sector-growth trend-up">+4.3%</div>
                </div>
                <div className="sector-item">
                  <div className="sector-icon">💻</div>
                  <div className="sector-name">Teknoloji</div>
                  <div className="sector-growth trend-up">+6.2%</div>
                </div>
                <div className="sector-item">
                  <div className="sector-icon">🚢</div>
                  <div className="sector-name">İhracat</div>
                  <div className="sector-growth trend-up">+3.1%</div>
                </div>
              </div>
            </div>
            
            <div className="economy-section">
              <h4>Ekonomik Projeler</h4>
              <div className="projects-list">
                <div className="project-item">
                  <div className="project-name">Yeni Sanayi Bölgesi</div>
                  <div className="project-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: '45%', backgroundColor: '#4299e1' }}
                      ></div>
                    </div>
                    <span>45%</span>
                  </div>
                </div>
                
                <div className="project-item">
                  <div className="project-name">Tarım Modernizasyonu</div>
                  <div className="project-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: '62%', backgroundColor: '#4299e1' }}
                      ></div>
                    </div>
                    <span>62%</span>
                  </div>
                </div>
                
                <div className="project-item">
                  <div className="project-name">Teknoloji Vadisi</div>
                  <div className="project-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: '28%', backgroundColor: '#4299e1' }}
                      ></div>
                    </div>
                    <span>28%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EconomyPanel;