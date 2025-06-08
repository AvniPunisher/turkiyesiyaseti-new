import React from 'react';
import ActionCategory from './ActionCategory';
import ActionItem from './ActionItem';
import { useGameContext } from '../../context/GameContext';

const ActionModal = () => {
  const { 
    selectedWeek, 
    currentActionCategory,
    setCurrentActionCategory,
    actionCategories,
    actionsByCategory,
    actionsLeft,
    scheduleAction,
    setShowActionModal,
    formatWeekDisplay
  } = useGameContext();

  return (
    <div className="action-modal-overlay">
      <div className="action-modal">
        <h3 className="modal-title">
          {formatWeekDisplay(selectedWeek.month, selectedWeek.week, selectedWeek.year)} için aksiyon seç
        </h3>
        
        {currentActionCategory ? (
          <>
            <h4 className="category-title">
              {actionCategories.find(cat => cat.id === currentActionCategory)?.name} Aksiyonları
            </h4>
            <div className="actions-grid">
              {actionsByCategory[currentActionCategory].map((action) => (
                <ActionItem 
                  key={action.id}
                  action={action}
                  disabled={action.cost > actionsLeft}
                  onClick={() => scheduleAction(action)}
                />
              ))}
            </div>
            <div className="modal-footer">
              <button 
                className="back-button"
                onClick={() => setCurrentActionCategory(null)}
              >
                Geri
              </button>
              <button 
                className="cancel-button"
                onClick={() => setShowActionModal(false)}
              >
                İptal
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="info-panel">
              <h4>Aksiyon Kategorisi Seçin:</h4>
              <p className="info-text">
                Her aksiyon 1-3 arası aksiyon puanı harcar. Bu hafta için {actionsLeft}/3 puanınız kaldı.
              </p>
            </div>
            
            <div className="categories-grid">
              {actionCategories.map((category) => (
                <ActionCategory 
                  key={category.id}
                  category={category}
                  onClick={() => setCurrentActionCategory(category.id)}
                />
              ))}
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-button"
                onClick={() => setShowActionModal(false)}
              >
                İptal
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ActionModal;