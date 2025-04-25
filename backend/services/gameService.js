// backend/services/gameService.js dosyasını düzeltelim
const { pool } = require('../config/db');

const gameService = {
  // Oyun kaydetme fonksiyonu
  saveGame: async (saveData) => {
    try {
      const { 
        userId, characterId, partyId, slotId, saveName, saveSlot, 
        gameData, gameDate, gameVersion, isAutoSave 
      } = saveData;
      
      // Önce bu slot için kayıt var mı kontrol et
      const [existingSave] = await pool.execute(
        'SELECT id FROM game_saves WHERE user_id = ? AND save_slot = ? AND is_auto_save = ?',
        [userId, saveSlot, isAutoSave ? 1 : 0]
      );
      
      if (existingSave && existingSave.length > 0) {
        // Mevcut kaydı güncelle
        const [result] = await pool.execute(
          `UPDATE game_saves SET 
           save_name = ?, party_id = ?, game_data = ?, game_date = ?, game_version = ?, 
           updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [saveName, partyId, JSON.stringify(gameData), gameDate, gameVersion, existingSave[0].id]
        );
        
        return existingSave[0].id;
      } else {
        // Yeni kayıt oluştur
        const [result] = await pool.execute(
          `INSERT INTO game_saves 
           (user_id, character_id, party_id, slot_id, save_name, save_slot, game_data, game_date, game_version, is_auto_save)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId, characterId, partyId, slotId || 1, saveName, saveSlot, 
            JSON.stringify(gameData), gameDate, gameVersion, 
            isAutoSave ? 1 : 0
          ]
        );
        
        return result.insertId;
      }
    } catch (error) {
      console.error('Oyun kaydetme hatası:', error);
      throw error;
    }
  },
  
  // Oyun yükleme fonksiyonu
  loadGame: async (saveId, userId) => {
    try {
      const [saved] = await pool.execute(
        `SELECT gs.*, gc.*, gp.*
         FROM game_saves gs
         JOIN game_characters gc ON gs.character_id = gc.id
         LEFT JOIN game_parties gp ON gs.party_id = gp.id
         WHERE gs.id = ? AND gs.user_id = ? AND gs.is_active = TRUE`,
        [saveId, userId]
      );
      
      if (saved.length === 0) {
        throw new Error('Kayıtlı oyun bulunamadı');
      }
      
      // Karakter, parti ve oyun verilerini JSON parse et
      const saveData = saved[0];
      
      // GameData JSON olarak parse et
      saveData.game_data = JSON.parse(saveData.game_data);
      
      // Karakter ve parti JSON alanlarını parse et
      if (saveData.ideology) saveData.ideology = JSON.parse(saveData.ideology);
      if (saveData.stats) saveData.stats = JSON.parse(saveData.stats);
      if (saveData.dynamic_values) saveData.dynamic_values = JSON.parse(saveData.dynamic_values);
      if (saveData.expertise) saveData.expertise = JSON.parse(saveData.expertise);
      
      if (saveData.support_base) saveData.support_base = JSON.parse(saveData.support_base);
      
      return saveData;
    } catch (error) {
      console.error('Oyun yükleme hatası:', error);
      throw error;
    }
  }
};

module.exports = gameService;
