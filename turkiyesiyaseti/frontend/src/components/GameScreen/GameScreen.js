import React, { useState } from 'react';
import GameHeader from './GameHeader';
import GameSidebar from './GameSidebar';
import GameContent from './GameContent';
import GameFooter from './GameFooter';
import ActionModal from '../ActionSystem/ActionModal';
import EventModal from '../Events/EventModal';
import { useGameContext } from '../../context/GameContext';

import './GameScreen.css';

const GameScreen = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { 
    showActionModal, 
    showEventModal,
    currentEvent,
    handleEventOption,
    resultContent,
    showResultPanel,
    setShowResultPanel,
    isShowingResults
  } = useGameContext();
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="game-screen">
      <GameHeader 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
        toggleSidebar={toggleSidebar}
      />
      
      <div className="game-main">
        {sidebarOpen && (
          <GameSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        )}
        
        <GameContent 
          activeTab={activeTab}
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          resultContent={resultContent}
          showResultPanel={showResultPanel}
          setShowResultPanel={setShowResultPanel}
          isShowingResults={isShowingResults}
        />
      </div>
      
      <GameFooter />
      
      {showActionModal && <ActionModal />}
      
      {showEventModal && currentEvent && (
        <EventModal 
          event={currentEvent} 
          onSelectOption={handleEventOption} 
        />
      )}
    </div>
  );
};

export default GameScreen;
