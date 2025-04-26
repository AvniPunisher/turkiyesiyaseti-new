// backend/services/gameService.js
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
      const [existingSaves] = await pool.execute(
        'SELECT id FROM game_saves WHERE user_id = ? AND save_slot = ? AND is_auto_save = ?',
        [userId, saveSlot, isAutoSave ? 1 : 0]
      );
      
      if (existingSaves && existingSaves.length > 0) {
        // Mevcut kaydı güncelle
        const [result] = await pool.execute(
          `UPDATE game_saves SET 
           save_name = ?, party_id = ?, game_data = ?, game_date = ?, game_version = ?, 
           updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [saveName, partyId, JSON.stringify(gameData), gameDate, gameVersion, existingSaves[0].id]
        );
        
        return existingSaves[0].id;
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
  },
  
  // Otomatik kayıt oluşturan yardımcı fonksiyon
  createAutoSave: async (userId, characterId, partyId, slotId = 1) => {
    try {
      // Önce bu kullanıcı için otomatik kayıt var mı kontrol et
      const [existingAutoSaves] = await pool.execute(
        'SELECT * FROM game_saves WHERE user_id = ? AND character_id = ? AND slot_id = ? AND is_auto_save = TRUE',
        [userId, characterId, slotId]
      );
      
      // Başlangıç oyun verisi
      const initialGameData = {
        currentDate: "1 Ocak 2025",
        currentWeek: 1,
        currentMonth: 1,
        currentYear: 2025,
        score: 0,
        level: 1,
        partyId: partyId,
        gameState: partyId ? 'party_created' : 'created',
        gameDate: new Date().toISOString(),
        gameVersion: '1.0.0',
        lastSave: new Date().toISOString()
      };
      
      const gameDataJson = JSON.stringify(initialGameData);
      const saveName = 'Otomatik Kayıt';
      
      if (existingAutoSaves.length > 0) {
        // Mevcut otomatik kaydı güncelle
        await pool.execute(
          `UPDATE game_saves SET 
           party_id = ?,
           game_data = ?, 
           updated_at = CURRENT_TIMESTAMP 
           WHERE id = ?`,
          [partyId, gameDataJson, existingAutoSaves[0].id]
        );
        
        console.log(`Otomatik kayıt güncellendi, id: ${existingAutoSaves[0].id}`);
        return existingAutoSaves[0].id;
      } else {
        // Yeni otomatik kayıt oluştur
        const [result] = await pool.execute(
          `INSERT INTO game_saves 
           (user_id, character_id, party_id, slot_id, save_name, save_slot, game_data, game_date, game_version, is_auto_save) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
          [
            userId,
            characterId,
            partyId,
            slotId,
            saveName,
            1, // Otomatik kayıtlar için slot 1'i kullanıyoruz
            gameDataJson,
            initialGameData.gameDate,
            initialGameData.gameVersion
          ]
        );
        
        console.log(`Yeni otomatik kayıt oluşturuldu, id: ${result.insertId}`);
        return result.insertId;
      }
    } catch (error) {
      console.error('Otomatik kayıt oluşturma hatası:', error);
      return null;
    }
  }
};

module.exports = gameService;
