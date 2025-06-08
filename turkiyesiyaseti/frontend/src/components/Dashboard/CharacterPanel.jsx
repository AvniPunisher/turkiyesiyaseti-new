import React from 'react';
import { useCharacterContext } from '../../context/CharacterContext';

const CharacterPanel = () => {
  const { character } = useCharacterContext();

  return (
    <div className="character-panel">
      <div className="panel">
        <div className="panel-header">
          <h3>Karakter Bilgileri</h3>
        </div>
        <div className="panel-body">
          <div className="character-profile">
            <div className="character-header">
              <div className="character-avatar">
                {character.name.charAt(0)}
              </div>
              <div className="character-info">
                <h4>{character.name}</h4>
                <p>{character.role}</p>
                <div className="party-info">
                  <span 
                    className="party-badge"
                    style={{ backgroundColor: character.partyColor }}
                  >
                    {character.partyShort}
                  </span>
                  <span className="party-name">{character.party}</span>
                </div>
              </div>
            </div>
            
            <div className="character-stats">
              <div className="stat-item">
                <div className="stat-header">
                  <span>Popülerlik:</span>
                  <span>{character.popularity}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${character.popularity}%`, backgroundColor: '#3182ce' }}
                  ></div>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-header">
                  <span>Tecrübe:</span>
                  <span>{character.experience}/100</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${character.experience}%`, backgroundColor: '#48bb78' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="skill-section">
            <h4>Yetenekler</h4>
            <div className="skills-list">
              {Object.entries(character.skills).map(([skill, value]) => (
                <div className="skill-item" key={skill}>
                  <div className="skill-name">
                    {skill === 'charisma' ? 'Karizma' : 
                     skill === 'intelligence' ? 'Zeka' : 
                     skill === 'determination' ? 'Kararlılık' : 
                     skill === 'communication' ? 'İletişim' : 
                     skill === 'leadership' ? 'Liderlik' : skill}
                  </div>
                  <div className="skill-bar">
                    <div className="skill-level" style={{ width: `${value * 10}%` }}>
                      {value}/10
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="character-actions">
            <h4>Karakter Gelişimi</h4>
            <p>Her hafta karakter yeteneklerinizi geliştirebilirsiniz. Yeni yetenekler edinmek için deneyim puanı kazanın.</p>
            
            <div className="skills-grid">
              <div className="skill-development-item">
                <div className="skill-icon">🎤</div>
                <div className="skill-name">Hitabet</div>
                <button className="develop-button">Geliştir</button>
              </div>
              <div className="skill-development-item">
                <div className="skill-icon">🧠</div>
                <div className="skill-name">Strateji</div>
                <button className="develop-button">Geliştir</button>
              </div>
              <div className="skill-development-item">
                <div className="skill-icon">👥</div>
                <div className="skill-name">Diplomasi</div>
                <button className="develop-button">Geliştir</button>
              </div>
              <div className="skill-development-item">
                <div className="skill-icon">📊</div>
                <div className="skill-name">Ekonomi</div>
                <button className="develop-button">Geliştir</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterPanel;