// backend/routes/game.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const auth = require('../middleware/auth');

// KARAKTER İŞLEMLERİ
// ------------------

// Karakter oluştur veya güncelle
router.post('/create-character', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { character } = req.body;
    
    if (!character || !character.fullName || !character.birthPlace || !character.profession) {
      return res.status(400).json({ success: false, message: 'Gerekli karakter bilgileri eksik' });
    }
    
    // İlk olarak kullanıcının mevcut karakteri olup olmadığını kontrol et
    const [existingCharacters] = await pool.execute(
      'SELECT * FROM game_characters WHERE user_id = ?',
      [userId]
    );
    
    // İdeoloji ve statların JSON formatına çevrilmesi
    const ideologyJson = JSON.stringify(character.ideology || {});
    const statsJson = JSON.stringify(character.stats || {});
    const dynamicValuesJson = JSON.stringify(character.dynamicValues || {});
    const expertiseJson = JSON.stringify(character.expertise || []);
    
    if (existingCharacters.length > 0) {
      // Mevcut karakteri güncelle
      await pool.execute(
        `UPDATE game_characters SET 
         game_name = ?, full_name = ?, age = ?, gender = ?, birth_place = ?, profession = ?,
         ideology = ?, stats = ?, dynamic_values = ?, expertise = ?,
         updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?`,
        [
          character.gameName || `${character.fullName}'in Oyunu`,
          character.fullName,
          character.age || 40,
          character.gender || 'Erkek',
          character.birthPlace,
          character.profession,
          ideologyJson,
          statsJson,
          dynamicValuesJson,
          expertiseJson,
          userId
        ]
      );
      
      // Güncellenmiş karakteri al
      const [updatedCharacter] = await pool.execute(
        'SELECT * FROM game_characters WHERE user_id = ?',
        [userId]
      );
      
      // Döndürülecek karakter verisi
      const characterData = prepareCharacterData(updatedCharacter[0]);
      
      return res.status(200).json({
        success: true,
        message: 'Karakter başarıyla güncellendi',
        character: characterData
      });
      
    } else {
      // Yeni karakter oluştur
      await pool.execute(
        `INSERT INTO game_characters 
         (user_id, game_name, full_name, age, gender, birth_place, profession, ideology, stats, dynamic_values, expertise)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          character.gameName || `${character.fullName}'in Oyunu`,
          character.fullName,
          character.age || 40,
          character.gender || 'Erkek',
          character.birthPlace,
          character.profession,
          ideologyJson,
          statsJson,
          dynamicValuesJson,
          expertiseJson
        ]
      );
      
      // Yeni oluşturulan karakteri al
      const [newCharacter] = await pool.execute(
        'SELECT * FROM game_characters WHERE user_id = ?',
        [userId]
      );
      
      // Döndürülecek karakter verisi
      const characterData = prepareCharacterData(newCharacter[0]);
      
      return res.status(201).json({
        success: true,
        message: 'Karakter başarıyla oluşturuldu',
        character: characterData
      });
    }
    
  } catch (error) {
    console.error('Karakter oluşturma hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Karakteri getir
router.get('/get-character', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Kullanıcının karakterini veritabanından al
    const [characters] = await pool.execute(
      'SELECT * FROM game_characters WHERE user_id = ?',
      [userId]
    );
    
    if (characters.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Karakter bulunamadı' 
      });
    }
    
    // Döndürülecek karakter verisi
    const characterData = prepareCharacterData(characters[0]);
    
    return res.status(200).json({
      success: true,
      character: characterData
    });
    
  } catch (error) {
    console.error('Karakter getirme hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Karakter silme
router.delete('/delete-character', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Karakteri sil
    const [result] = await pool.execute(
      'DELETE FROM game_characters WHERE user_id = ?',
      [userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Karakter bulunamadı'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Karakter başarıyla silindi'
    });
    
  } catch (error) {
    console.error('Karakter silme hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// OYUN KAYIT İŞLEMLERİ
// ------------------

// Oyun kaydet
router.post('/save-game', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { character, gameData, saveName, saveSlot = 1 } = req.body;
    
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
    const gameDataJson = JSON.stringify(gameData);
    
    // Belirtilen slot için mevcut kayıt var mı kontrol et
    const [existingSaves] = await pool.execute(
      'SELECT * FROM game_saves WHERE user_id = ? AND save_slot = ?',
      [userId, saveSlot]
    );
    
    if (existingSaves.length > 0) {
      // Mevcut kaydı güncelle
      await pool.execute(
        `UPDATE game_saves SET 
         save_name = ?, game_data = ?, game_date = ?, game_version = ?, 
         updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ? AND save_slot = ?`,
        [
          saveName || `Kayıt ${saveSlot}`,
          gameDataJson,
          gameData.gameDate || new Date().toISOString(),
          gameData.gameVersion || '1.0.0',
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
         (user_id, character_id, save_name, save_slot, game_data, game_date, game_version) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          characterId,
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

// Kayıtlı oyunları getir
router.get('/saved-games', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Kullanıcının kayıtlı oyunlarını getir
    const [savedGames] = await pool.execute(
      `SELECT gs.*, gc.full_name as character_name 
       FROM game_saves gs
       JOIN game_characters gc ON gs.character_id = gc.id
       WHERE gs.user_id = ? AND gs.is_active = TRUE
       ORDER BY gs.updated_at DESC`,
      [userId]
    );
    
    // Oyun verilerini döndür
    return res.status(200).json({
      success: true,
      savedGames: savedGames.map(game => ({
        id: game.id,
        saveName: game.save_name,
        saveSlot: game.save_slot,
        characterName: game.character_name,
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
    
    // Kayıtlı oyunu getir
    const [savedGames] = await pool.execute(
      `SELECT gs.*, gc.* 
       FROM game_saves gs
       JOIN game_characters gc ON gs.character_id = gc.id
       WHERE gs.id = ? AND gs.user_id = ? AND gs.is_active = TRUE`,
      [saveId, userId]
    );
    
    if (savedGames.length === 0) {
      return res.status(404).json({ success: false, message: 'Kayıtlı oyun bulunamadı' });
    }
    
    const savedGame = savedGames[0];
    
    // Karakter verisini hazırla
    const character = prepareCharacterData(savedGame);
    
    // Oyun verisini hazırla
    const gameData = JSON.parse(savedGame.game_data);
    
    return res.status(200).json({
      success: true,
      saveData: {
        saveId: savedGame.id,
        saveName: savedGame.save_name,
        saveSlot: savedGame.save_slot,
        character,
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

module.exports = router;