import React from 'react';
import { useGameContext } from '../../context/GameContext';

const CountryPanel = () => {
  const { parameters } = useGameContext();

  return (
    <div className="country-panel">
      <div className="panel">
        <div className="panel-header">
          <h3>Ülke Yönetimi</h3>
        </div>
        <div className="panel-body">
          <div className="country-stats">
            <div className="country-info-section">
              <h4>Sosyal Göstergeler</h4>
              <div className="social-grid">
                <div className="social-stat-item">
                  <div className="social-stat-header">
                    <span>Eğitim:</span>
                    <span>{parameters.social.education}/100</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${parameters.social.education}%`, backgroundColor: '#4299e1' }}
                    ></div>
                  </div>
                </div>
                
                <div className="social-stat-item">
                  <div className="social-stat-header">
                    <span>Sağlık:</span>
                    <span>{parameters.social.healthcare}/100</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${parameters.social.healthcare}%`, backgroundColor: '#48bb78' }}
                    ></div>
                  </div>
                </div>
                
                <div className="social-stat-item">
                  <div className="social-stat-header">
                    <span>Güvenlik:</span>
                    <span>{parameters.social.security}/100</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${parameters.social.security}%`, backgroundColor: '#805ad5' }}
                    ></div>
                  </div>
                </div>
                
                <div className="social-stat-item">
                  <div className="social-stat-header">
                    <span>Mutluluk:</span>
                    <span>{parameters.social.happiness}/100</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${parameters.social.happiness}%`, backgroundColor: '#ed8936' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="government-section">
              <h4>Hükümet Durumu</h4>
              <div className="government-stats">
                <div className="government-stat-item">
                  <div className="government-stat-header">
                    <span>Parti Desteği:</span>
                    <span>{parameters.politics.partySupport}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${parameters.politics.partySupport}%`, 
                        backgroundColor: '#E81B23' 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="government-stat-item">
                  <div className="government-stat-header">
                    <span>Koalisyon Gücü:</span>
                    <span>{parameters.politics.coalitionStrength}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${parameters.politics.coalitionStrength}%`, backgroundColor: '#3182ce' }}
                    ></div>
                  </div>
                </div>
                
                <div className="government-stat-item">
                  <div className="government-stat-header">
                    <span>Muhalefet Gücü:</span>
                    <span>{parameters.politics.oppositionStrength}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${parameters.politics.oppositionStrength}%`, backgroundColor: '#e53e3e' }}
                    ></div>
                  </div>
                </div>
                
                <div className="government-stat-item">
                  <div className="government-stat-header">
                    <span>Halk Onayı:</span>
                    <span>{parameters.politics.publicApproval}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${parameters.politics.publicApproval}%`, backgroundColor: '#38a169' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="provinces-section">
            <h4>Şehir Yönetimi</h4>
            <p className="info-text">Farklı şehirlerdeki destek oranları ve yerel yönetim durumu burada gösterilecek.</p>
            
            <div className="provinces-grid">
              <div className="province-item">
                <div className="province-name">İstanbul</div>
                <div className="province-support">CHP: 42%</div>
              </div>
              <div className="province-item">
                <div className="province-name">Ankara</div>
                <div className="province-support">CHP: 45%</div>
              </div>
              <div className="province-item">
                <div className="province-name">İzmir</div>
                <div className="province-support">CHP: 58%</div>
              </div>
              <div className="province-item">
                <div className="province-name">Antalya</div>
                <div className="province-support">CHP: 48%</div>
              </div>
              <div className="province-item">
                <div className="province-name">Adana</div>
                <div className="province-support">CHP: 40%</div>
              </div>
              <div className="province-item">
                <div className="province-name">Trabzon</div>
                <div className="province-support">CHP: 22%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountryPanel;