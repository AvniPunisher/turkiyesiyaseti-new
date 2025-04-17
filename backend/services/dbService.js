// backend/services/dbService.js
const { pool } = require('../config/db');

// Genel sorgular için yardımcı fonksiyonlar
const dbService = {
  /**
   * Genel sorgu çalıştırma fonksiyonu
   * @param {string} sql - SQL sorgusu
   * @param {Array} params - Sorgu parametreleri
   * @returns {Promise} Sorgu sonucu
   */
  query: async (sql, params = []) => {
    try {
      const [results] = await pool.query(sql, params);
      return results;
    } catch (error) {
      console.error('Veritabanı sorgu hatası:', error);
      throw error;
    }
  },
  
  /**
   * Tek bir satır veya değer getirme
   * @param {string} sql - SQL sorgusu
   * @param {Array} params - Sorgu parametreleri
   * @returns {Promise} Bulunan satır veya null
   */
  queryOne: async (sql, params = []) => {
    try {
      const [results] = await pool.query(sql, params);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Veritabanı sorgu hatası:', error);
      throw error;
    }
  },
  
  /**
   * Transaction başlatma
   * @returns {Promise} Transaction bağlantısı
   */
  beginTransaction: async () => {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    return connection;
  },
  
  /**
   * Transaction içinde sorgu çalıştırma
   * @param {Object} connection - Transaction bağlantısı
   * @param {string} sql - SQL sorgusu
   * @param {Array} params - Sorgu parametreleri
   * @returns {Promise} Sorgu sonucu
   */
  queryTransaction: async (connection, sql, params = []) => {
    try {
      const [results] = await connection.query(sql, params);
      return results;
    } catch (error) {
      console.error('Transaction sorgu hatası:', error);
      throw error;
    }
  },
  
  /**
   * Transaction'ı tamamlama
   * @param {Object} connection - Transaction bağlantısı
   * @returns {Promise} void
   */
  commitTransaction: async (connection) => {
    await connection.commit();
    connection.release();
  },
  
  /**
   * Transaction'ı geri alma
   * @param {Object} connection - Transaction bağlantısı
   * @returns {Promise} void
   */
  rollbackTransaction: async (connection) => {
    await connection.rollback();
    connection.release();
  }
};

// Özel domain servisleri
const userService = {
  findByEmail: async (email) => {
    return dbService.queryOne('SELECT * FROM users WHERE email = ?', [email]);
  },
  
  findById: async (id) => {
    return dbService.queryOne('SELECT * FROM users WHERE id = ?', [id]);
  },
  
  create: async (userData) => {
    const { username, email, password } = userData;
    const result = await dbService.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, password]
    );
    return result.insertId;
  },
  
  update: async (id, userData) => {
    const allowedFields = ['username', 'email'];
    const fields = Object.keys(userData)
      .filter(key => allowedFields.includes(key))
      .map(key => `${key} = ?`);
    
    if (fields.length === 0) return false;
    
    const values = fields.map(field => userData[field.split(' = ')[0]]);
    values.push(id);
    
    const result = await dbService.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }
};

const characterService = {
  findByUserId: async (userId) => {
    return dbService.queryOne('SELECT * FROM game_characters WHERE user_id = ?', [userId]);
  },
  
  create: async (characterData) => {
    const { 
      userId, gameName, fullName, age, gender, birthPlace, 
      profession, ideology, stats, dynamicValues, expertise 
    } = characterData;
    
    const result = await dbService.query(
      `INSERT INTO game_characters 
       (user_id, game_name, full_name, age, gender, birth_place, profession, 
        ideology, stats, dynamic_values, expertise)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, gameName, fullName, age, gender, birthPlace, profession,
        JSON.stringify(ideology),
        JSON.stringify(stats),
        JSON.stringify(dynamicValues),
        JSON.stringify(expertise)
      ]
    );
    
    return result.insertId;
  },
  
  update: async (id, characterData) => {
    // Update işlemi...
  },
  
  delete: async (id) => {
    const result = await dbService.query('DELETE FROM game_characters WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

const gameService = {
  saveGame: async (saveData) => {
    const { userId, characterId, saveName, saveSlot, gameData, gameDate, gameVersion } = saveData;
    
    // Önce bu slot'ta kayıt var mı kontrol et
    const existingSave = await dbService.queryOne(
      'SELECT id FROM game_saves WHERE user_id = ? AND save_slot = ?',
      [userId, saveSlot]
    );
    
    if (existingSave) {
      // Mevcut kaydı güncelle
      const result = await dbService.query(
        `UPDATE game_saves SET 
         save_name = ?, game_data = ?, game_date = ?, game_version = ?, 
         updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [saveName, JSON.stringify(gameData), gameDate, gameVersion, existingSave.id]
      );
      
      return existingSave.id;
    } else {
      // Yeni kayıt oluştur
      const result = await dbService.query(
        `INSERT INTO game_saves 
         (user_id, character_id, save_name, save_slot, game_data, game_date, game_version)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, characterId, saveName, saveSlot, JSON.stringify(gameData), gameDate, gameVersion]
      );
      
      return result.insertId;
    }
  },
  
  getSavedGames: async (userId) => {
    return dbService.query(
      `SELECT gs.*, gc.full_name as character_name 
       FROM game_saves gs
       JOIN game_characters gc ON gs.character_id = gc.id
       WHERE gs.user_id = ? AND gs.is_active = TRUE
       ORDER BY gs.updated_at DESC`,
      [userId]
    );
  },
  
  loadGame: async (saveId, userId) => {
    return dbService.queryOne(
      `SELECT gs.*, gc.* 
       FROM game_saves gs
       JOIN game_characters gc ON gs.character_id = gc.id
       WHERE gs.id = ? AND gs.user_id = ? AND gs.is_active = TRUE`,
      [saveId, userId]
    );
  },
  
  deleteGame: async (saveId, userId) => {
    // Soft delete - is_active = FALSE olarak işaretle
    const result = await dbService.query(
      'UPDATE game_saves SET is_active = FALSE WHERE id = ? AND user_id = ?',
      [saveId, userId]
    );
    
    return result.affectedRows > 0;
  }
};

module.exports = {
  dbService,
  userService,
  characterService,
  gameService
};
