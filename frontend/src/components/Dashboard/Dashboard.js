import React from 'react';
import { useGameContext } from '../../context/GameContext';
import { useCharacterContext } from '../../context/CharacterContext';
import PoliticsPanel from './PoliticsPanel';
import EconomyIndicators from './EconomyIndicators';
import SocialIndicators from './SocialIndicators';
import CurrentEvents from './CurrentEvents';

const Dashboard = () => {
  const { parameters } = useGameContext();
  const { character } = useCharacterContext();

  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        {/* Politik Durum */}
        <PoliticsPanel parameters={parameters} />
        
        {/* Ekonomik Durum */}
        <EconomyIndicators parameters={parameters} />
        
        {/* Sosyal Durum */}
        <SocialIndicators parameters={parameters} />
      </div>
      
      {/* Güncel Olaylar */}
      <CurrentEvents />
      
      {/* Kariyeriniz */}
      <div className="career-panel">
        <h3>Siyasi Kariyeriniz</h3>
        <div className="character-header">
          <div className="character-avatar">
            {character.name.charAt(0)}
          </div>
          <div className="character-info">
            <h4>{character.name}</h4>
            <p>{character.role}</p>
          </div>
        </div>
        
        <div className="character-stats">
          <div className="stat-item">
            <div className="stat-header">
              <span>Tecrübe:</span>
              <span>{character.experience}/100</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${character.experience}%` }}
              ></div>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-header">
              <span>Popülerlik:</span>
              <span>{character.popularity}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${character.popularity}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="skill-development">
          <h4>Karakter Yeteneği Geliştirme</h4>
          <div className="skills-grid">
            <div className="skill-item">
              <div className="skill-icon">🎤</div>
              <div className="skill-name">Hitabet</div>
            </div>
            <div className="skill-item">
              <div className="skill-icon">🧠</div>
              <div className="skill-name">Strateji</div>
            </div>
            <div className="skill-item">
              <div className="skill-icon">👥</div>
              <div className="skill-name">Diplomasi</div>
            </div>
            <div className="skill-item">
              <div className="skill-icon">📊</div>
              <div className="skill-name">Ekonomi</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
