import React from 'react';

const PoliticsPanel = ({ parameters }) => {
  return (
    <div className="panel politics-panel">
      <div className="panel-header">
        <h3>Politik Durum</h3>
      </div>
      <div className="panel-body">
        <div className="politics-chart">
          {/* Basit bir parti desteği gösterimi */}
          <div className="party-bars">
            <div className="party-bar">
              <div className="party-name">CHP</div>
              <div className="progress-bar">
                <div 
                  className="progress-fill chp"
                  style={{ width: `${parameters.politics.partySupport}%` }}
                ></div>
              </div>
              <div className="party-percentage">{parameters.politics.partySupport}%</div>
            </div>
            
            <div className="party-bar">
              <div className="party-name">AKP</div>
              <div className="progress-bar">
                <div 
                  className="progress-fill akp"
                  style={{ width: '34.2%' }}
                ></div>
              </div>
              <div className="party-percentage">34.2%</div>
            </div>
            
            <div className="party-bar">
              <div className="party-name">MHP</div>
              <div className="progress-bar">
                <div 
                  className="progress-fill mhp"
                  style={{ width: '9.3%' }}
                ></div>
              </div>
              <div className="party-percentage">9.3%</div>
            </div>
            
            <div className="party-bar">
              <div className="party-name">İYİ</div>
              <div className="progress-bar">
                <div 
                  className="progress-fill iyi"
                  style={{ width: '10.8%' }}
                ></div>
              </div>
              <div className="party-percentage">10.8%</div>
            </div>
          </div>
        </div>
        
        <div className="politics-info">
          <div className="politics-item">
            <span>Hükümet Onayı:</span>
            <span>{parameters.politics.publicApproval}%</span>
          </div>
          <div className="approval-meter">
            <div 
              className="approval-fill"
              style={{ width: `${parameters.politics.publicApproval}%` }}
            ></div>
          </div>
          
          <div className="politics-item">
            <span>Koalisyon Gücü:</span>
            <span>{parameters.politics.coalitionStrength}%</span>
          </div>
          <div className="approval-meter">
            <div 
              className="approval-fill"
              style={{ width: `${parameters.politics.coalitionStrength}%` }}
            ></div>
          </div>
          
          <div className="politics-item">
            <span>Muhalefet Gücü:</span>
            <span>{parameters.politics.oppositionStrength}%</span>
          </div>
          <div className="approval-meter">
            <div 
              className="approval-fill"
              style={{ width: `${parameters.politics.oppositionStrength}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoliticsPanel;