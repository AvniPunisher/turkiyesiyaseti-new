// backend/routes/game.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const auth = require('../middleware/auth');

// Oyun kaydet
router.post('/save-game', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { gameData, saveName, saveSlot = 2 } = req.body; // Manuel kayıtlar için 2 ve üstü slotları kullanıyoruz
    
    if (!gameData) {
      return res.status(400).json({ success: false, message: 'Oyun verisi eksik' });
    }
    
    // Kullanıcının karakterini kontrol et
    const [characters] = await pool.execute(
      'SELECT * FROM game_characters WHERE user_id = ?',
      [userId]
    );
    
    if (characters.length === 0) {
      return res.status(404).json({ success: false, message: 'Karakter bulunamadı' });
    }
    
    const characterId = characters[0].id;
    
    // Kullanıcının partisini kontrol et
    const [parties] = await pool.execute(
      'SELECT * FROM game_parties WHERE user_id = ? AND character_id = ?',
      [userId, characterId]
    );
    
    const partyId = parties.length > 0 ? parties[0].id : null;
    
    const gameDataJson = JSON.stringify(gameData);
    
    // Belirtilen slot için mevcut kayıt var mı kontrol et
    const [existingSaves] = await pool.execute(
      'SELECT * FROM game_saves WHERE user_id = ? AND save_slot = ? AND is_auto_save = FALSE',
      [userId, saveSlot]
    );
    
    if (existingSaves.length > 0) {
      // Mevcut kaydı güncelle
      await pool.execute(
        `UPDATE game_saves SET 
         save_name = ?, game_data = ?, game_date = ?, game_version = ?, party_id = ?,
         updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ? AND save_slot = ? AND is_auto_save = FALSE`,
        [
          saveName || `Kayıt ${saveSlot}`,
          gameDataJson,
          gameData.gameDate || new Date().toISOString(),
          gameData.gameVersion || '1.0.0',
          partyId,
          userId,
          saveSlot
        ]
      );
      
      return res.status(200).json({
        success: true,
        message: 'Oyun başarıyla güncellendi',
        saveId: existingSaves[0].id
      });
      
    } else {
      // Yeni kayıt oluştur
      const [result] = await pool.execute(
        `INSERT INTO game_saves 
         (user_id, character_id, party_id, save_name, save_slot, game_data, game_date, game_version, is_auto_save) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, FALSE)`,
        [
          userId,
          characterId,
          partyId,
          saveName || `Kayıt ${saveSlot}`,
          saveSlot,
          gameDataJson,
          gameData.gameDate || new Date().toISOString(),
          gameData.gameVersion || '1.0.0'
        ]
      );
      
      return res.status(201).json({
        success: true,
        message: 'Oyun başarıyla kaydedildi',
        saveId: result.insertId
      });
    }
    
  } catch (error) {
    console.error('Oyun kaydetme hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Kayıtlı oyunları getir (otomatik kayıtlar dahil)
router.get('/saved-games', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Kullanıcının kayıtlı oyunlarını getir (karakter ve parti verileriyle birlikte)
    const [savedGames] = await pool.execute(
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
    
    if (savedGames.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Henüz kaydedilmiş oyun bulunmuyor',
        savedGames: []
      });
    }
    
    // Oyun verilerini döndür
    return res.status(200).json({
      success: true,
      savedGames: savedGames.map(game => ({
        id: game.id,
        saveName: game.save_name,
        saveSlot: game.save_slot,
        isAutoSave: game.is_auto_save == 1, // 1/0 yerine boolean değere çevir
        characterName: game.character_name,
        partyName: game.party_name,
        partyShortName: game.party_short_name,
        partyColor: game.party_color,
        gameDate: game.game_date,
        gameVersion: game.game_version,
        createdAt: game.created_at,
        updatedAt: game.updated_at
      }))
    });
    
  } catch (error) {
    console.error('Kayıtlı oyunları getirme hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Kayıtlı oyunu yükle
router.get('/load-game/:saveId', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const saveId = req.params.saveId;
    
    // Kayıtlı oyunu getir (karakter ve parti verileriyle birlikte)
    const [savedGames] = await pool.execute(
      `SELECT gs.*, gc.*, gp.*
       FROM game_saves gs
       JOIN game_characters gc ON gs.character_id = gc.id
       LEFT JOIN game_parties gp ON gs.party_id = gp.id
       WHERE gs.id = ? AND gs.user_id = ? AND gs.is_active = TRUE`,
      [saveId, userId]
    );
    
    if (savedGames.length === 0) {
      return res.status(404).json({ success: false, message: 'Kayıtlı oyun bulunamadı' });
    }
    
    const savedGame = savedGames[0];
    
    // Karakter verisini hazırla
    const character = prepareCharacterData(savedGame);
    
    // Parti verisini hazırla (eğer varsa)
    const party = savedGame.party_id ? preparePartyData(savedGame) : null;
    
    // Oyun verisini hazırla
    const gameData = JSON.parse(savedGame.game_data);
    
    return res.status(200).json({
      success: true,
      saveData: {
        saveId: savedGame.id,
        saveName: savedGame.save_name,
        saveSlot: savedGame.save_slot,
        isAutoSave: savedGame.is_auto_save == 1,
        character,
        party,
        gameData,
        gameDate: savedGame.game_date,
        gameVersion: savedGame.game_version,
        createdAt: savedGame.created_at,
        updatedAt: savedGame.updated_at
      }
    });
    
  } catch (error) {
    console.error('Oyun yükleme hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Kayıtlı oyunu sil
router.delete('/delete-save/:saveId', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const saveId = req.params.saveId;
    
    // Önce otomatik kayıt mı kontrol et
    const [saves] = await pool.execute(
      'SELECT * FROM game_saves WHERE id = ? AND user_id = ?',
      [saveId, userId]
    );
    
    if (saves.length === 0) {
      return res.status(404).json({ success: false, message: 'Kayıtlı oyun bulunamadı' });
    }
    
    const isAutoSave = saves[0].is_auto_save == 1;
    
    if (isAutoSave) {
      return res.status(400).json({ 
        success: false, 
        message: 'Otomatik kayıtlar silinemez' 
      });
    }
    
    // Kayıtlı oyunu sil (soft delete)
    const [result] = await pool.execute(
      'UPDATE game_saves SET is_active = FALSE WHERE id = ? AND user_id = ?',
      [saveId, userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Kayıtlı oyun bulunamadı' });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Kayıtlı oyun başarıyla silindi'
    });
    
  } catch (error) {
    console.error('Kayıtlı oyun silme hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Otomatik kayıt güncelleme (oyun içi ilerleme)
router.post('/update-auto-save', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { gameData } = req.body;
    
    if (!gameData) {
      return res.status(400).json({ success: false, message: 'Oyun verisi eksik' });
    }
    
    // Kullanıcının otomatik kaydını bul
    const [autoSaves] = await pool.execute(
      'SELECT * FROM game_saves WHERE user_id = ? AND is_auto_save = TRUE',
      [userId]
    );
    
    if (autoSaves.length === 0) {
      return res.status(404).json({ success: false, message: 'Otomatik kayıt bulunamadı' });
    }
    
    const autoSave = autoSaves[0];
    const currentGameData = JSON.parse(autoSave.game_data);
    
    // Oyun verisini güncelle
    const updatedGameData = {
      ...currentGameData,
      ...gameData,
      lastSave: new Date().toISOString()
    };
    
    // Otomatik kaydı güncelle
    await pool.execute(
      `UPDATE game_saves SET 
       game_data = ?, 
       updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [JSON.stringify(updatedGameData), autoSave.id]
    );
    
    return res.status(200).json({
      success: true,
      message: 'Otomatik kayıt güncellendi',
      saveId: autoSave.id
    });
    
  } catch (error) {
    console.error('Otomatik kayıt güncelleme hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Veritabanından gelen karakter verisini istemci için hazırla
function prepareCharacterData(dbData) {
  try {
    // Veritabanından gelen JSON string'leri parse et
    const ideology = dbData.ideology ? JSON.parse(dbData.ideology) : {};
    const stats = dbData.stats ? JSON.parse(dbData.stats) : {};
    const dynamicValues = dbData.dynamic_values ? JSON.parse(dbData.dynamic_values) : {};
    const expertise = dbData.expertise ? JSON.parse(dbData.expertise) : [];
    
    // İstemci tarafı için karakter nesnesini oluştur
    return {
      id: dbData.id,
      userId: dbData.user_id,
      gameName: dbData.game_name,
      fullName: dbData.full_name,
      age: dbData.age,
      gender: dbData.gender,
      birthPlace: dbData.birth_place,
      profession: dbData.profession,
      ideology,
      stats,
      dynamicValues,
      expertise,
      createdAt: dbData.created_at,
      updatedAt: dbData.updated_at
    };
  } catch (error) {
    console.error('Karakter verisi hazırlama hatası:', error);
    return null;
  }
}

// Veritabanından gelen parti verisini istemci için hazırla
function preparePartyData(dbData) {
  try {
    // Parti verisi alanlarını tanımla
    const ideology = dbData.ideology ? JSON.parse(dbData.ideology) : {};
    const supportBase = dbData.support_base ? JSON.parse(dbData.support_base) : {};
    
    return {
      id: dbData.id,
      userId: dbData.user_id,
      characterId: dbData.character_id,
      name: dbData.name,
      shortName: dbData.short_name,
      colorId: dbData.color_id,
      ideology,
      founderId: dbData.founder_id,
      founderName: dbData.founder_name,
      supportBase,
      createdAt: dbData.created_at,
      updatedAt: dbData.updated_at
    };
  } catch (error) {
    console.error('Parti verisi hazırlama hatası:', error);
    return null;
  }
}

module.exports = router;
