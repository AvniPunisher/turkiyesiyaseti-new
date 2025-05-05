import React from 'react';

const SocialIndicators = ({ parameters }) => {
  return (
    <div className="panel social-panel">
      <div className="panel-header">
        <h3>Sosyal Göstergeler</h3>
      </div>
      <div className="panel-body">
        <div className="social-indicators">
          <div className="social-indicator">
            <div className="social-value">
              {parameters.social.education}
            </div>
            <div className="social-label">Eğitim</div>
          </div>
          
          <div className="social-indicator">
            <div className="social-value">
              {parameters.social.healthcare}
            </div>
            <div className="social-label">Sağlık</div>
          </div>
          
          <div className="social-indicator">
            <div className="social-value">
              {parameters.social.security}
            </div>
            <div className="social-label">Güvenlik</div>
          </div>
          
          <div className="social-indicator">
            <div className="social-value">
              {parameters.social.happiness}
            </div>
            <div className="social-label">Mutluluk</div>
          </div>
        </div>
        
        <div className="social-issues">
          <h4>Öne Çıkan Konular</h4>
          <div className="issues-list">
            <div className="social-issue-item">
              <div className="issue-icon">📚</div>
              <div className="issue-content">
                <div className="issue-name">Eğitim Reformu</div>
                <div className="issue-support">Destek: 56%</div>
              </div>
            </div>
            
            <div className="social-issue-item">
              <div className="issue-icon">🏥</div>
              <div className="issue-content">
                <div className="issue-name">Sağlık Sistemi</div>
                <div className="issue-support">Destek: 62%</div>
              </div>
            </div>
            
            <div className="social-issue-item">
              <div className="issue-icon">⚖️</div>
              <div className="issue-content">
                <div className="issue-name">Adalet Sistemi</div>
                <div className="issue-support">Destek: 38%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialIndicators;