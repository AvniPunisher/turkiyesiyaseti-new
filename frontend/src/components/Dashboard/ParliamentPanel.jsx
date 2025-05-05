import React from 'react';
import { useGameContext } from '../../context/GameContext';

const ParliamentPanel = () => {
  const { parameters } = useGameContext();

  // Dummy data for parliament seats
  const parliamentSeats = {
    chp: 168,
    akp: 200,
    mhp: 50,
    iyi: 37,
    others: 45
  };

  // Dummy data for legislation
  const legislations = [
    {
      id: 1,
      title: 'Ekonomik Reform Paketi',
      status: 'progress',
      support: 52,
      against: 48,
      stage: 'committee',
      category: 'economy'
    },
    {
      id: 2,
      title: 'Eğitim Sistemi Reformu',
      status: 'pending',
      support: 45,
      against: 55,
      stage: 'proposal',
      category: 'social'
    },
    {
      id: 3,
      title: 'Demokratikleşme Yasası',
      status: 'passed',
      support: 62,
      against: 38,
      stage: 'completed',
      category: 'political'
    }
  ];

  return (
    <div className="parliament-panel">
      <div className="panel">
        <div className="panel-header">
          <h3>Meclis Faaliyetleri</h3>
        </div>
        <div className="panel-body">
          <div className="parliament-composition">
            <h4>Meclis Dağılımı</h4>
            <div className="parliament-chart">
              <div className="parliament-seats">
                <div className="parliament-party chp" style={{ width: `${(parliamentSeats.chp / 550) * 100}%` }}>
                  CHP: {parliamentSeats.chp}
                </div>
                <div className="parliament-party akp" style={{ width: `${(parliamentSeats.akp / 550) * 100}%` }}>
                  AKP: {parliamentSeats.akp}
                </div>
                <div className="parliament-party mhp" style={{ width: `${(parliamentSeats.mhp / 550) * 100}%` }}>
                  MHP: {parliamentSeats.mhp}
                </div>
                <div className="parliament-party iyi" style={{ width: `${(parliamentSeats.iyi / 550) * 100}%` }}>
                  İYİ: {parliamentSeats.iyi}
                </div>
                <div className="parliament-party others" style={{ width: `${(parliamentSeats.others / 550) * 100}%` }}>
                  Diğer: {parliamentSeats.others}
                </div>
              </div>
              <div className="parliament-info">
                <div className="parliament-item">
                  <span>Toplam Milletvekili:</span>
                  <span>550</span>
                </div>
                <div className="parliament-item">
                  <span>Hükümet:</span>
                  <span>CHP+İYİ Parti Koalisyonu</span>
                </div>
                <div className="parliament-item">
                  <span>Koalisyon Çoğunluğu:</span>
                  <span>{parliamentSeats.chp + parliamentSeats.iyi} Sandalye</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="legislation-section">
            <h4>Mevcut Yasama Faaliyetleri</h4>
            <div className="legislation-list">
              {legislations.map(law => (
                <div className={`legislation-item ${law.category}`} key={law.id}>
                  <div className="legislation-content">
                    <div className="legislation-title">{law.title}</div>
                    <div className="legislation-details">
                      <span className={`legislation-status ${law.status}`}>
                        {law.status === 'progress' ? 'Görüşülüyor' : 
                         law.status === 'pending' ? 'Beklemede' : 'Kabul Edildi'}
                      </span>
                      <span className="legislation-stage">
                        {law.stage === 'proposal' ? 'Teklif Aşaması' : 
                         law.stage === 'committee' ? 'Komisyon' : 'Tamamlandı'}
                      </span>
                    </div>
                  </div>
                  <div className="legislation-support">
                    <div className="support-label">Destek</div>
                    <div className="support-bar">
                      <div 
                        className="support-fill"
                        style={{ width: `${law.support}%` }}
                      ></div>
                      <div className="support-text">{law.support}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="parliament-actions">
            <h4>Meclis Aksiyonları</h4>
            <div className="action-buttons">
              <button className="parliament-action">
                <div className="action-icon">📜</div>
                <div className="action-text">Kanun Teklifi</div>
              </button>
              <button className="parliament-action">
                <div className="action-icon">🗣️</div>
                <div className="action-text">Meclis Konuşması</div>
              </button>
              <button className="parliament-action">
                <div className="action-icon">👨‍⚖️</div>
                <div className="action-text">Komisyon Çalışması</div>
              </button>
              <button className="parliament-action">
                <div className="action-icon">🤝</div>
                <div className="action-text">Lobi Faaliyeti</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParliamentPanel;