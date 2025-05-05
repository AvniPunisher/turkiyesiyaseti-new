import React from 'react';
import { useGameContext } from '../../context/GameContext';
import { useCharacterContext } from '../../context/CharacterContext';

const PollsPanel = () => {
  const { parameters } = useGameContext();
  const { character } = useCharacterContext();

  // Dummy data for polls
  const pollsHistory = [
    { week: 4, month: 12, year: 2024, support: 26.8 },
    { week: 1, month: 1, year: 2025, support: 27.2 },
    { week: 2, month: 1, year: 2025, support: 27.6 },
    { week: 3, month: 1, year: 2025, support: 28.0 },
    { week: 4, month: 1, year: 2025, support: 28.5 }
  ];

  // Dummy data for issue polls
  const issuePolls = [
    { issue: 'Ekonomik Politika', approval: 42 },
    { issue: 'Eğitim Reformu', approval: 56 },
    { issue: 'Dış Politika', approval: 48 },
    { issue: 'Sağlık Sistemi', approval: 62 },
    { issue: 'Adalet Sistemi', approval: 38 }
  ];

  return (
    <div className="polls-panel">
      <div className="panel">
        <div className="panel-header">
          <h3>Anketler</h3>
        </div>
        <div className="panel-body">
          <div className="current-polls">
            <div className="polls-overview">
              <div className="poll-item main-poll">
                <div className="poll-title">Toplam Parti Desteği</div>
                <div className="poll-value">{parameters.politics.partySupport}%</div>
                <div className="poll-chart">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${parameters.politics.partySupport}%`,
                        backgroundColor: character.partyColor
                      }}
                    ></div>
                  </div>
                </div>
                <div className="poll-trend">
                  <span className="trend-value">+0.5%</span>
                  <span className="trend-period">Son Hafta</span>
                </div>
              </div>
              
              <div className="poll-item character-poll">
                <div className="poll-title">Kişisel Popülerlik</div>
                <div className="poll-value">{character.popularity}%</div>
                <div className="poll-chart">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${character.popularity}%`,
                        backgroundColor: '#4299e1'
                      }}
                    ></div>
                  </div>
                </div>
                <div className="poll-trend">
                  <span className="trend-value">+1.2%</span>
                  <span className="trend-period">Son Hafta</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="polls-history">
            <h4>Anket Tarihi</h4>
            <div className="history-chart">
              <div className="chart-area">
                {/* Bu kısımda gerçek bir grafik gösterimi olacak */}
                <div className="placeholder-chart">
                  <div className="chart-line" style={{ height: '120px' }}>
                    {pollsHistory.map((poll, index) => (
                      <div 
                        key={index}
                        className="chart-point" 
                        style={{ 
                          left: `${(index / (pollsHistory.length - 1)) * 100}%`,
                          bottom: `${poll.support}%`
                        }}
                        title={`${poll.support}%`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="chart-legend">
                <div className="chart-label">Aralık 2024</div>
                <div className="chart-label">Ocak 2025</div>
              </div>
            </div>
            
            <div className="history-table">
              <table>
                <thead>
                  <tr>
                    <th>Tarih</th>
                    <th>Oran</th>
                    <th>Değişim</th>
                  </tr>
                </thead>
                <tbody>
                  {pollsHistory.map((poll, index) => {
                    const prevPoll = index > 0 ? pollsHistory[index - 1].support : poll.support;
                    const change = poll.support - prevPoll;
                    
                    return (
                      <tr key={index}>
                        <td>{poll.week}. Hafta {poll.month}/2025</td>
                        <td>{poll.support}%</td>
                        <td className={change >= 0 ? 'trend-up' : 'trend-down'}>
                          {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="issue-polls">
            <h4>Konu Bazlı Anketler</h4>
            <div className="issues-grid">
              {issuePolls.map((issue, index) => (
                <div className="issue-poll-item" key={index}>
                  <div className="issue-name">{issue.issue}</div>
                  <div className="issue-approval">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${issue.approval}%`,
                          backgroundColor: issue.approval >= 50 ? '#38a169' : '#e53e3e'
                        }}
                      ></div>
                    </div>
                    <div className="approval-value">{issue.approval}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="poll-actions">
            <h4>Anket Aksiyonları</h4>
            <div className="poll-buttons">
              <button className="poll-action">
                <div className="action-icon">📊</div>
                <div className="action-text">Anket Yaptır</div>
              </button>
              <button className="poll-action">
                <div className="action-icon">🔍</div>
                <div className="action-text">Detaylı Analiz</div>
              </button>
              <button className="poll-action">
                <div className="action-icon">👥</div>
                <div className="action-text">Odak Grup</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollsPanel;