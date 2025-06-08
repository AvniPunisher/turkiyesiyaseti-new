import React from 'react';

const EconomyIndicators = ({ parameters }) => {
  return (
    <div className="panel economy-panel">
      <div className="panel-header">
        <h3>Ekonomik Göstergeler</h3>
      </div>
      <div className="panel-body">
        <div className="economy-indicators">
          <div className="economy-indicator">
            <div className="indicator-value">
              %{parameters.economy.inflation}
            </div>
            <div className="indicator-label">Enflasyon</div>
            <div className="indicator-trend trend-down">
              0.8% ↓
            </div>
          </div>
          
          <div className="economy-indicator">
            <div className="indicator-value">
              %{parameters.economy.unemployment}
            </div>
            <div className="indicator-label">İşsizlik</div>
            <div className="indicator-trend trend-down">
              0.2% ↓
            </div>
          </div>
          
          <div className="economy-indicator">
            <div className="indicator-value">
              %{parameters.economy.growth}
            </div>
            <div className="indicator-label">Büyüme</div>
            <div className="indicator-trend trend-up">
              0.4% ↑
            </div>
          </div>
          
          <div className="economy-indicator">
            <div className="indicator-value">
              {parameters.economy.stockMarket}
            </div>
            <div className="indicator-label">BIST-100</div>
            <div className="indicator-trend trend-up">
              245 ↑
            </div>
          </div>
        </div>
        
        <div className="economy-additional">
          <div className="economy-info-item">
            <span>Bütçe Açığı:</span>
            <span>{parameters.economy.budget} Milyar TL</span>
          </div>
          <div className="economy-info-item">
            <span>Döviz Kuru (USD):</span>
            <span>32.45 TL</span>
          </div>
          <div className="economy-info-item">
            <span>Döviz Kuru (EUR):</span>
            <span>35.12 TL</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EconomyIndicators;