// backend/services/gameService.js
/**
 * Oyun kayıt ve yükleme servisi
 * Bu modül, oyun kayıt işlemlerini güvenli şekilde gerçekleştirir
 */

const { pool } = require('../config/db');

/**
 * Oyunu kaydet
 * @param {Object} saveData - Kayıt verileri
 * @returns {Promise<number>} - Kayıt ID'si
 */
const saveGame = async (saveData) => {
  const { 
    userId, characterId, partyId, saveName, saveSlot, gameData, 
    gameDate, gameVersion, isAutoSave 
  } = saveData;
  
  // Karakter ID'si olmadan kayıt kabul edilmez
  if (!characterId) {
    throw new Error('Karakter verisi eksik');
  }
  
  // Bağlantı al ve transaction başlat
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  
  try {
    // Önce bu slot'ta kayıt var mı kontrol et
    const [existingSaves] = await connection.query(
      'SELECT id FROM game_saves WHERE user_id = ? AND save_slot = ? AND is_auto_save = ?',
      [userId, saveSlot, isAutoSave ? 1 : 0]
    );
    
    let saveId;
    
    if (existingSaves.length > 0) {
      // Mevcut kaydı güncelle
      await connection.query(
        `UPDATE game_saves SET 
         save_name = ?, party_id = ?, game_data = ?, game_date = ?, game_version = ?, 
         updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [saveName, partyId, JSON.stringify(gameData), gameDate, gameVersion, existingSaves[0].id]
      );
      
      saveId = existingSaves[0].id;
    } else {
      // Yeni kayıt oluştur
      const [result] = await connection.query(
        `INSERT INTO game_saves 
         (user_id, character_id, party_id, save_name, save_slot, game_data, game_date, game_version, is_auto_save)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId, characterId, partyId, saveName, saveSlot, 
          JSON.stringify(gameData), gameDate, gameVersion, 
          isAutoSave ? 1 : 0
        ]
      );
      
      saveId = result.insertId;
    }
    
    // Karakter ve parti verilerini kayıt tablosunda sakla
    await storeCharacterSnapshot(connection, saveId, characterId);
    
    if (partyId) {
      await storePartySnapshot(connection, saveId, partyId);
    }
    
    // Transaction'ı tamamla
    await connection.commit();
    return saveId;
  } catch (error) {
    // Hata durumunda geri al
    await connection.rollback();
    throw error;
  } finally {
    // Bağlantıyı serbest bırak
    connection.release();
  }
};

/**
 * Kayıtlı oyunu yükle
 * @param {number} saveId - Kayıt ID'si
 * @param {number} userId - Kullanıcı ID'si
 * @returns {Promise<Object>} - Kayıt verileri
 */
const loadGame = async (saveId, userId) => {
  try {
    // Kayıt, karakter snapshot ve parti snapshot verilerini al
    const [gameSaves] = await pool.query(
      `SELECT gs.*, cs.character_data, ps.party_data
       FROM game_saves gs
       LEFT JOIN character_snapshots cs ON gs.id = cs.save_id
       LEFT JOIN party_snapshots ps ON gs.id = ps.save_id
       WHERE gs.id = ? AND gs.user_id = ? AND gs.is_active = TRUE`,
      [saveId, userId]
    );
    
    if (gameSaves.length === 0) {
      throw new Error('Kayıtlı oyun bulunamadı');
    }
    
    const savedGame = gameSaves[0];
    
    // Karakter verilerini hazırla - önce snapshot'tan, yoksa veritabanından al
    let character;
    if (savedGame.character_data) {
      // Snapshot'tan karakter verisini kullan
      character = JSON.parse(savedGame.character_data);
    } else {
      // Veritabanından güncel karakter verisini al
      const [characters] = await pool.query(
        'SELECT * FROM game_characters WHERE id = ?',
        [savedGame.character_id]
      );
      
      if (characters.length === 0) {
        throw new Error('Karakter bulunamadı');
      }
      
      character = prepareCharacterData(characters[0]);
      
      // Bu karakteri snapshot'a kaydet
      await storeCharacterSnapshot(pool, saveId, savedGame.character_id);
    }
    
    // Parti verilerini hazırla - önce snapshot'tan, yoksa veritabanından al
    let party = null;
    if (savedGame.party_id) {
      if (savedGame.party_data) {
        // Snapshot'tan parti verisini kullan
        party = JSON.parse(savedGame.party_data);
      } else {
        // Veritabanından güncel parti verisini al
        const [parties] = await pool.query(
          'SELECT * FROM game_parties WHERE id = ?',
          [savedGame.party_id]
        );
        
        if (parties.length > 0) {
          party = preparePartyData(parties[0]);
          
          // Bu partiyi snapshot'a kaydet
          await storePartySnapshot(pool, saveId, savedGame.party_id);
        }
      }
    }
    
    // Oyun verisini hazırla
    const gameData = JSON.parse(savedGame.game_data);
    
    return {
      saveId: savedGame.id,
      saveName: savedGame.save_name,
      saveSlot: savedGame.save_slot,
      isAutoSave: savedGame.is_auto_save === 1,
      character,
      party,
      gameData,
      gameDate: savedGame.game_date,
      gameVersion: savedGame.game_version,
      createdAt: savedGame.created_at,
      updatedAt: savedGame.updated_at
    };
  } catch (error) {
    console.error('Oyun yükleme hatası:', error);
    throw error;
  }
};

/**
 * Karakter snapshot'ını oluştur/güncelle
 * @param {Object} connection - Veritabanı bağlantısı
 * @param {number} saveId - Kayıt ID'si
 * @param {number} characterId - Karakter ID'si
 */
const storeCharacterSnapshot = async (connection, saveId, characterId) => {
  try {
    // Karakter verilerini al
    const [characters] = await connection.query(
      'SELECT * FROM game_characters WHERE id = ?',
      [characterId]
    );
    
    if (characters.length === 0) {
      throw new Error('Karakter bulunamadı');
    }
    
    const characterData = prepareCharacterData(characters[0]);
    const characterJson = JSON.stringify(characterData);
    
    // Snapshot var mı kontrol et
    const [existingSnapshots] = await connection.query(
      'SELECT id FROM character_snapshots WHERE save_id = ?',
      [saveId]
    );
    
    if (existingSnapshots.length > 0) {
      // Mevcut snapshot'ı güncelle
      await connection.query(
        'UPDATE character_snapshots SET character_data = ?, updated_at = CURRENT_TIMESTAMP WHERE save_id = ?',
        [characterJson, saveId]
      );
    } else {
      // Yeni snapshot oluştur
      await connection.query(
        'INSERT INTO character_snapshots (save_id, character_id, character_data) VALUES (?, ?, ?)',
        [saveId, characterId, characterJson]
      );
    }
  } catch (error) {
    console.error('Karakter snapshot oluşturma hatası:', error);
    throw error;
  }
};

/**
 * Parti snapshot'ını oluştur/güncelle
 * @param {Object} connection - Veritabanı bağlantısı
 * @param {number} saveId - Kayıt ID'si
 * @param {number} partyId - Parti ID'si
 */
const storePartySnapshot = async (connection, saveId, partyId) => {
  try {
    // Parti verilerini al
    const [parties] = await connection.query(
      'SELECT * FROM game_parties WHERE id = ?',
      [partyId]
    );
    
    if (parties.length === 0) {
      throw new Error('Parti bulunamadı');
    }
    
    const partyData = preparePartyData(parties[0]);
    const partyJson = JSON.stringify(partyData);
    
    // Snapshot var mı kontrol et
    const [existingSnapshots] = await connection.query(
      'SELECT id FROM party_snapshots WHERE save_id = ?',
      [saveId]
    );
    
    if (existingSnapshots.length > 0) {
      // Mevcut snapshot'ı güncelle
      await connection.query(
        'UPDATE party_snapshots SET party_data = ?, updated_at = CURRENT_TIMESTAMP WHERE save_id = ?',
        [partyJson, saveId]
      );
    } else {
      // Yeni snapshot oluştur
      await connection.query(
        'INSERT INTO party_snapshots (save_id, party_id, party_data) VALUES (?, ?, ?)',
        [saveId, partyId, partyJson]
      );
    }
  } catch (error) {
    console.error('Parti snapshot oluşturma hatası:', error);
    // Bu hata kritik değil, oyun kaydı hala oluşturulabilir
  }
};

// Veritabanından gelen karakter verisini istemci için hazırla
function prepareCharacterData(dbCharacter) {
  if (!dbCharacter) return null;
  
  try {
    // Veritabanından gelen JSON string'leri parse et
    const ideology = dbCharacter.ideology ? JSON.parse(dbCharacter.ideology) : {};
    const stats = dbCharacter.stats ? JSON.parse(dbCharacter.stats) : {};
    const dynamicValues = dbCharacter.dynamic_values ? JSON.parse(dbCharacter.dynamic_values) : {};
    const expertise = dbCharacter.expertise ? JSON.parse(dbCharacter.expertise) : [];
    
    // İstemci tarafı için karakter nesnesini oluştur
    return {
      id: dbCharacter.id,
      userId: dbCharacter.user_id,
      gameName: dbCharacter.game_name,
      fullName: dbCharacter.full_name,
      age: dbCharacter.age,
      gender: dbCharacter.gender,
      birthPlace: dbCharacter.birth_place,
      profession: dbCharacter.profession,
      ideology,
      stats,
      dynamicValues,
      expertise,
      createdAt: dbCharacter.created_at,
      updatedAt: dbCharacter.updated_at
    };
  } catch (error) {
    console.error('Karakter verisi hazırlama hatası:', error);
    return null;
  }
}

// Veritabanından gelen parti verisini istemci için hazırla
function preparePartyData(dbParty) {
  if (!dbParty) return null;
  
  try {
    // Veritabanından gelen JSON string'leri parse et
    const ideology = dbParty.ideology ? JSON.parse(dbParty.ideology) : {};
    const supportBase = dbParty.support_base ? JSON.parse(dbParty.support_base) : {};
    
    // İstemci tarafı için parti nesnesini oluştur
    return {
      id: dbParty.id,
      userId: dbParty.user_id,
      characterId: dbParty.character_id,
      name: dbParty.name,
      shortName: dbParty.short_name,
      colorId: dbParty.color_id,
      ideology,
      founderId: dbParty.founder_id,
      founderName: dbParty.founder_name,
      supportBase,
      createdAt: dbParty.created_at,
      updatedAt: dbParty.updated_at
    };
  } catch (error) {
    console.error('Parti verisi hazırlama hatası:', error);
    return null;
  }
}

module.exports = {
  saveGame,
  loadGame,
  storeCharacterSnapshot,
  storePartySnapshot
};