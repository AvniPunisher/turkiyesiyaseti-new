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
  
  // gameData kontrol et ve düzelt
  let sanitizedGameData = gameData;
  
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
    let gameDataJson;
    
    // gameData'nın JSON formatına dönüştürülmesi
    try {
      // Eğer gameData zaten bir string ise ve JSON formatındaysa, tekrar stringleştirme
      if (typeof gameData === 'string') {
        try {
          // Test amaçlı parse et
          JSON.parse(gameData);
          gameDataJson = gameData;
        } catch (e) {
          // Parse edilemiyorsa, muhtemelen geçersiz bir JSON string'i
          gameDataJson = JSON.stringify(sanitizedGameData);
        }
      } else {
        // Obje ise JSON string'e dönüştür
        gameDataJson = JSON.stringify(sanitizedGameData);
      }
    } catch (jsonError) {
      console.error('JSON dönüştürme hatası:', jsonError);
      // Hata durumunda boş bir obje kaydet
      gameDataJson = '{}';
    }
    
    if (existingSaves.length > 0) {
      // Mevcut kaydı güncelle
      await connection.query(
        `UPDATE game_saves SET 
         save_name = ?, party_id = ?, game_data = ?, game_date = ?, game_version = ?, 
         updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [saveName, partyId, gameDataJson, gameDate, gameVersion, existingSaves[0].id]
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
          gameDataJson, gameDate, gameVersion, 
          isAutoSave ? 1 : 0
        ]
      );
      
      saveId = result.insertId;
    }
    
    try {
      // Character_snapshots tablosunun varlığını kontrol et
      await connection.query('SELECT 1 FROM character_snapshots LIMIT 1');
      
      // Karakter ve parti verilerini kayıt tablosunda sakla
      await storeCharacterSnapshot(connection, saveId, characterId);
      
      if (partyId) {
        await storePartySnapshot(connection, saveId, partyId);
      }
    } catch (snapshotError) {
      // Snapshot tabloları yoksa bir şey yapma, sadece loglama yap
      console.log('Snapshot tabloları bulunamadı, atlanıyor:', snapshotError.message);
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
    let character = null;
    let party = null;
    let savedGame = null;
    
    try {
      // Önce snapshot tabloları var mı kontrol et
      const [checkSnapshots] = await pool.query(
        "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'character_snapshots'"
      );
      
      if (checkSnapshots.length > 0) {
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
        
        savedGame = gameSaves[0];
        
        // Karakter verilerini hazırla - önce snapshot'tan, yoksa veritabanından al
        if (savedGame.character_data) {
          // Snapshot'tan karakter verisini kullan
          character = JSON.parse(savedGame.character_data);
        }
        
        // Parti verilerini hazırla - önce snapshot'tan, yoksa veritabanından al
        if (savedGame.party_id && savedGame.party_data) {
          // Snapshot'tan parti verisini kullan
          party = JSON.parse(savedGame.party_data);
        }
      }
    } catch (snapshotError) {
      console.log('Snapshot işlemi başarısız, normal yükleme deneniyor:', snapshotError.message);
    }
    
    if (!savedGame) {
      // Temel game_saves verisini al
      const [gameSaves] = await pool.query(
        `SELECT * FROM game_saves 
         WHERE id = ? AND user_id = ? AND is_active = TRUE`,
        [saveId, userId]
      );
      
      if (gameSaves.length === 0) {
        throw new Error('Kayıtlı oyun bulunamadı');
      }
      
      savedGame = gameSaves[0];
    }
    
    // Karakter verisini al (eğer snapshot'tan alınmadıysa)
    if (!character) {
      const [characters] = await pool.query(
        'SELECT * FROM game_characters WHERE id = ?',
        [savedGame.character_id]
      );
      
      if (characters.length === 0) {
        throw new Error('Karakter bulunamadı');
      }
      
      character = prepareCharacterData(characters[0]);
    }
    
    // Parti verisini al (eğer snapshot'tan alınmadıysa)
    if (savedGame.party_id && !party) {
      const [parties] = await pool.query(
        'SELECT * FROM game_parties WHERE id = ?',
        [savedGame.party_id]
      );
      
      if (parties.length > 0) {
        party = preparePartyData(parties[0]);
      }
    }
    
    // Oyun verisini hazırla
    let gameData = {};
    try {
      // Önce veri tipini kontrol et
      if (typeof savedGame.game_data === 'string') {
        // String olduğunda, çift JSON formatı kontrolü yap
        if (savedGame.game_data.startsWith('"') && savedGame.game_data.endsWith('"') &&
            savedGame.game_data.includes('\\')) {
          // Çift tırnak içindeki escape edilmiş JSON'ı düzelt
          const unescapedData = savedGame.game_data.substr(1, savedGame.game_data.length - 2)
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\');
          gameData = JSON.parse(unescapedData);
        } else {
          // Normal JSON string
          gameData = JSON.parse(savedGame.game_data);
        }
      } else if (typeof savedGame.game_data === 'object') {
        // Zaten obje ise doğrudan kullan
        gameData = savedGame.game_data;
      }
    } catch (jsonError) {
      console.error('Oyun verisi JSON parse hatası:', jsonError);
      console.error('Problematik veri:', savedGame.game_data);
      throw new Error(`JSON parse hatası: ${jsonError.message}`);
    }
    
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
 * Tüm kayıtlı oyunları listele
 * @param {number} userId - Kullanıcı ID'si
 * @returns {Promise<Array>} - Kayıtlı oyunlar listesi
 */
const listSavedGames = async (userId) => {
  try {
    // Kullanıcının kayıtlı oyunlarını getir
    const [savedGames] = await pool.query(
      `SELECT gs.*, 
       gc.full_name as character_name,
       gp.name as party_name, 
       gp.short_name as party_short_name,
       gp.color_id as party_color 
       FROM game_saves gs
       LEFT JOIN game_characters gc ON gs.character_id = gc.id
       LEFT JOIN game_parties gp ON gs.party_id = gp.id
       WHERE gs.user_id = ? AND gs.is_active = TRUE
       ORDER BY gs.is_auto_save ASC, gs.updated_at DESC`,
      [userId]
    );
    
    // İstemci tarafı için veri dönüşümü
    return savedGames.map(game => ({
      id: game.id,
      saveName: game.save_name,
      saveSlot: game.save_slot,
      isAutoSave: game.is_auto_save === 1,
      characterName: game.character_name,
      partyName: game.party_name,
      partyShortName: game.party_short_name,
      partyColor: game.party_color,
      gameDate: game.game_date,
      gameVersion: game.game_version,
      createdAt: game.created_at,
      updatedAt: game.updated_at
    }));
  } catch (error) {
    console.error('Kayıtlı oyunları listeleme hatası:', error);
    throw error;
  }
};

/**
 * Kayıtlı oyunu sil (soft delete)
 * @param {number} saveId - Kayıt ID'si
 * @param {number} userId - Kullanıcı ID'si
 * @returns {Promise<boolean>} - Başarılı ise true
 */
const deleteSavedGame = async (saveId, userId) => {
  try {
    // Önce kaydı kontrol et
    const [saves] = await pool.query(
      'SELECT * FROM game_saves WHERE id = ? AND user_id = ?',
      [saveId, userId]
    );
    
    if (saves.length === 0) {
      throw new Error('Kayıtlı oyun bulunamadı');
    }
    
    const isAutoSave = saves[0].is_auto_save === 1;
    
    if (isAutoSave) {
      throw new Error('Otomatik kayıtlar silinemez');
    }
    
    // Soft delete işlemi
    const [result] = await pool.query(
      'UPDATE game_saves SET is_active = FALSE WHERE id = ? AND user_id = ?',
      [saveId, userId]
    );
    
    if (result.affectedRows === 0) {
      throw new Error('Kayıt silme başarısız oldu');
    }
    
    return true;
  } catch (error) {
    console.error('Kayıtlı oyun silme hatası:', error);
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

/**
 * Snapshot tablolarını oluştur (eğer yoksa)
 * @returns {Promise<boolean>} - Başarılı ise true
 */
const createSnapshotTables = async () => {
  try {
    // Character_snapshots tablosunu oluştur
    await pool.query(`
      CREATE TABLE IF NOT EXISTS character_snapshots (
        id INT AUTO_INCREMENT PRIMARY KEY,
        save_id INT NOT NULL,
        character_id INT NOT NULL,
        character_data JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (save_id) REFERENCES game_saves(id),
        FOREIGN KEY (character_id) REFERENCES game_characters(id)
      )
    `);
    
    // Party_snapshots tablosunu oluştur
    await pool.query(`
      CREATE TABLE IF NOT EXISTS party_snapshots (
        id INT AUTO_INCREMENT PRIMARY KEY,
        save_id INT NOT NULL,
        party_id INT NOT NULL,
        party_data JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (save_id) REFERENCES game_saves(id),
        FOREIGN KEY (party_id) REFERENCES game_parties(id)
      )
    `);
    
    console.log('Snapshot tabloları başarıyla oluşturuldu');
    return true;
  } catch (error) {
    console.error('Snapshot tabloları oluşturma hatası:', error);
    return false;
  }
};

/**
 * Veritabanındaki game_data sütununu düzelt
 * @returns {Promise<number>} - Düzeltilen kayıt sayısı
 */
const fixGameDataInDatabase = async () => {
  try {
    // Tüm kayıtları al
    const [saves] = await pool.query('SELECT id, game_data FROM game_saves');
    let fixedCount = 0;
    
    // Her kayıt için kontrol et ve düzelt
    for (const save of saves) {
      try {
        let gameData = save.game_data;
        
        // Eğer string ise JSON parse etmeyi dene
        if (typeof gameData === 'string') {
          // Eğer tırnaklarla çevrili bir string ise (çift JSON)
          if (gameData.startsWith('"') && gameData.endsWith('"') &&
              gameData.includes('\\')) {
            try {
              // Önce dış tırnakları kaldır, sonra parse et
              const unescapedData = gameData.substr(1, gameData.length - 2)
                .replace(/\\"/g, '"')
                .replace(/\\\\/g, '\\');
              const parsedData = JSON.parse(unescapedData);
              
              // Düzeltilmiş veriyi güncelle
              await pool.query(
                'UPDATE game_saves SET game_data = ? WHERE id = ?',
                [JSON.stringify(parsedData), save.id]
              );
              
              fixedCount++;
              console.log(`Kayıt ID ${save.id} düzeltildi.`);
            } catch (parseError) {
              console.error(`Kayıt ID ${save.id} için parse hatası:`, parseError.message);
            }
          }
        }
      } catch (error) {
        console.error(`Kayıt ID ${save.id} için hata:`, error.message);
      }
    }
    
    console.log(`Toplam ${fixedCount} kayıt düzeltildi.`);
    return fixedCount;
  } catch (error) {
    console.error('Veritabanı düzeltme işlemi hatası:', error);
    throw error;
  }
};

// Veritabanından gelen karakter verisini istemci için hazırla
function prepareCharacterData(dbCharacter) {
  if (!dbCharacter) return null;
  
  try {
    // Veritabanından gelen JSON string'leri parse et
    const ideology = dbCharacter.ideology ? 
      (typeof dbCharacter.ideology === 'string' ? JSON.parse(dbCharacter.ideology) : dbCharacter.ideology) : {};
      
    const stats = dbCharacter.stats ? 
      (typeof dbCharacter.stats === 'string' ? JSON.parse(dbCharacter.stats) : dbCharacter.stats) : {};
      
    const dynamicValues = dbCharacter.dynamic_values ? 
      (typeof dbCharacter.dynamic_values === 'string' ? JSON.parse(dbCharacter.dynamic_values) : dbCharacter.dynamic_values) : {};
      
    const expertise = dbCharacter.expertise ? 
      (typeof dbCharacter.expertise === 'string' ? JSON.parse(dbCharacter.expertise) : dbCharacter.expertise) : [];
    
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
    const ideology = dbParty.ideology ? 
      (typeof dbParty.ideology === 'string' ? JSON.parse(dbParty.ideology) : dbParty.ideology) : {};
      
    const supportBase = dbParty.support_base ? 
      (typeof dbParty.support_base === 'string' ? JSON.parse(dbParty.support_base) : dbParty.support_base) : {};
    
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
  listSavedGames,
  deleteSavedGame,
  createSnapshotTables,
  fixGameDataInDatabase
};
