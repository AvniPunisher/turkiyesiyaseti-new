import React from 'react';
import { useGameContext } from '../../context/GameContext';

const ForeignPanel = () => {
  const { parameters } = useGameContext();

  // Helper function to get relation color
  const getRelationColor = (value) => {
    if (value >= 80) return '#38a169'; // green
    if (value >= 60) return '#4299e1'; // blue
    if (value >= 40) return '#ed8936'; // orange
    return '#e53e3e'; // red
  };

  return (
    <div className="foreign-panel">
      <div className="panel">
        <div className="panel-header">
          <h3>Dış İlişkiler</h3>
        </div>
        <div className="panel-body">
          <div className="foreign-overview">
            <div className="overview-card">
              <div className="overview-icon">🌍</div>
              <div className="overview-content">
                <div className="overview-title">Uluslararası İtibar</div>
                <div className="overview-value">{parameters.international.reputation}/100</div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${parameters.international.reputation}%`,
                      backgroundColor: getRelationColor(parameters.international.reputation)
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="foreign-relations">
            <h4>Ülke İlişkileri</h4>
            <div className="relations-grid">
              <div className="relation-item">
                <div className="relation-flag">🇺🇸</div>
                <div className="relation-content">
                  <div className="relation-name">Amerika Birleşik Devletleri</div>
                  <div className="relation-value">{parameters.international.relations.us}/100</div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${parameters.international.relations.us}%`,
                        backgroundColor: getRelationColor(parameters.international.relations.us)
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="relation-item">
                <div className="relation-flag">🇪🇺</div>
                <div className="relation-content">
                  <div className="relation-name">Avrupa Birliği</div>
                  <div className="relation-value">{parameters.international.relations.eu}/100</div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${parameters.international.relations.eu}%`,
                        backgroundColor: getRelationColor(parameters.international.relations.eu)
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="relation-item">
                <div className="relation-flag">🇷🇺</div>
                <div className="relation-content">
                  <div className="relation-name">Rusya</div>
                  <div className="relation-value">{parameters.international.relations.russia}/100</div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${parameters.international.relations.russia}%`,
                        backgroundColor: getRelationColor(parameters.international.relations.russia)
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="relation-item">
                <div className="relation-flag">🇨🇳</div>
                <div className="relation-content">
                  <div className="relation-name">Çin</div>
                  <div className="relation-value">{parameters.international.relations.china}/100</div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${parameters.international.relations.china}%`,
                        backgroundColor: getRelationColor(parameters.international.relations.china)
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="relation-item">
                <div className="relation-flag">🕋</div>
                <div className="relation-content">
                  <div className="relation-name">Orta Doğu</div>
                  <div className="relation-value">{parameters.international.relations.middleEast}/100</div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${parameters.international.relations.middleEast}%`,
                        backgroundColor: getRelationColor(parameters.international.relations.middleEast)
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="foreign-issues">
            <h4>Güncel Konular</h4>
            <div className="issues-list">
              <div className="issue-item">
                <div className="issue-icon">🤝</div>
                <div className="issue-content">
                  <div className="issue-title">AB Müzakereleri</div>
                  <div className="issue-description">
                    Avrupa Birliği ile devam eden üyelik müzakereleri sürüyor.
                  </div>
                  <div className="issue-status">Devam Ediyor</div>
                </div>
              </div>
              
              <div className="issue-item">
                <div className="issue-icon">💰</div>
                <div className="issue-content">
                  <div className="issue-title">Ekonomik İşbirliği Anlaşması</div>
                  <div className="issue-description">
                    Çin ile yeni ekonomik işbirliği anlaşması görüşmeleri.
                  </div>
                  <div className="issue-status">Planlama Aşamasında</div>
                </div>
              </div>
              
              <div className="issue-item">
                <div className="issue-icon">⚡</div>
                <div className="issue-content">
                  <div className="issue-title">Enerji Hattı Projesi</div>
                  <div className="issue-description">
                    Rusya ile doğalgaz boru hattı projesi görüşmeleri.
                  </div>
                  <div className="issue-status">Teklif Sunuldu</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="international-actions">
            <h4>Diplomatik Aksiyonlar</h4>
            <div className="diplomatic-buttons">
              <button className="diplomatic-action">
                <div className="action-icon">✈️</div>
                <div className="action-text">Ziyaret Düzenle</div>
              </button>
              <button className="diplomatic-action">
                <div className="action-icon">🌐</div>
                <div className="action-text">Heyeti Ağırla</div>
              </button>
              <button className="diplomatic-action">
                <div className="action-icon">🗂️</div>
                <div className="action-text">Anlaşma İmzala</div>
              </button>
              <button className="diplomatic-action">
                <div className="action-icon">🎪</div>
                <div className="action-text">Konferansa Katıl</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForeignPanel;