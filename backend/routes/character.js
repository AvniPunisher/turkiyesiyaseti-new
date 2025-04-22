// backend/routes/character.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const auth = require('../middleware/auth');

// Karakter oluştur veya güncelle
router.post('/create-character', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { character, slotId = 1 } = req.body; // slotId parametresi ekleyelim (varsayılan slot 1)
    
    if (!character || !character.fullName || !character.birthPlace || !character.profession) {
      return res.status(400).json({ success: false, message: 'Gerekli karakter bilgileri eksik' });
    }
    
    // Bu slot için kullanıcının karakterini kontrol et
    const [existingCharacters] = await pool.execute(
      'SELECT * FROM game_characters WHERE user_id = ? AND slot_id = ?',
      [userId, slotId]
    );
    
    // İdeoloji ve statların JSON formatına çevrilmesi
    const ideologyJson = JSON.stringify(character.ideology || {});
    const statsJson = JSON.stringify(character.stats || {});
    const dynamicValuesJson = JSON.stringify(character.dynamicValues || {});
    const expertiseJson = JSON.stringify(character.expertise || []);
    
    let characterId;
    
    if (existingCharacters.length > 0) {
      // Mevcut karakteri güncelle
      await pool.execute(
        `UPDATE game_characters SET 
         game_name = ?, full_name = ?, age = ?, gender = ?, birth_place = ?, profession = ?,
         ideology = ?, stats = ?, dynamic_values = ?, expertise = ?,
         updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ? AND slot_id = ?`,
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
          userId,
          slotId
        ]
      );
      
      // Güncellenmiş karakteri al
      const [updatedCharacter] = await pool.execute(
        'SELECT * FROM game_characters WHERE user_id = ? AND slot_id = ?',
        [userId, slotId]
      );
      
      characterId = updatedCharacter[0].id;
      
      // Döndürülecek karakter verisi
      const characterData = prepareCharacterData(updatedCharacter[0]);
      
      // Otomatik kayıt oluştur (mevcut karakteri güncellediğimizde)
      await createAutoSave(userId, characterId, slotId);
      
      return res.status(200).json({
        success: true,
        message: 'Karakter başarıyla güncellendi',
        character: characterData
      });
      
    } else {
      // Yeni karakter oluştur
      const [result] = await pool.execute(
        `INSERT INTO game_characters 
         (user_id, slot_id, game_name, full_name, age, gender, birth_place, profession, ideology, stats, dynamic_values, expertise)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          slotId,
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
      
      characterId = result.insertId;
      
      // Yeni oluşturulan karakteri al
      const [newCharacter] = await pool.execute(
        'SELECT * FROM game_characters WHERE id = ?',
        [characterId]
      );
      
      // Döndürülecek karakter verisi
      const characterData = prepareCharacterData(newCharacter[0]);
      
      // Otomatik kayıt oluştur (yeni karakter oluşturulduğunda)
      await createAutoSave(userId, characterId, slotId);
      
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

// Karakteri getir (mevcut endpoint, geriye dönük uyumluluk için)
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

// Slot bazlı karakter getirme fonksiyonu
router.get('/get-character/:slotId', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const slotId = req.params.slotId || 1;
    
    // Kullanıcının belirli slottaki karakterini veritabanından al
    const [characters] = await pool.execute(
      'SELECT * FROM game_characters WHERE user_id = ? AND slot_id = ?',
      [userId, slotId]
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

// Bir kullanıcının tüm karakter slotlarını getiren endpoint
router.get('/get-all-characters', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Kullanıcının tüm karakterlerini getir
    const [characters] = await pool.execute(
      'SELECT * FROM game_characters WHERE user_id = ? ORDER BY slot_id ASC',
      [userId]
    );
    
    // Karakter verisini hazırla
    const characterData = characters.map(char => prepareCharacterData(char));
    
    return res.status(200).json({
      success: true,
      characters: characterData
    });
    
  } catch (error) {
    console.error('Karakterleri getirme hatası:', error);
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

// Otomatik kayıt oluşturan yardımcı fonksiyon
async function createAutoSave(userId, characterId, slotId) {
  try {
    // Önce bu slot için otomatik kayıt var mı kontrol et
    const [existingAutoSaves] = await pool.execute(
      'SELECT * FROM game_saves WHERE user_id = ? AND character_id = ? AND slot_id = ? AND is_auto_save = TRUE',
      [userId, characterId, slotId]
    );
    
    // Başlangıç oyun verisi
    const initialGameData = {
      score: 0,
      level: 1,
      gameDate: new Date().toISOString(),
      gameVersion: '1.0.0',
      gameState: 'created',
      lastSave: new Date().toISOString()
    };
    
    const gameDataJson = JSON.stringify(initialGameData);
    const saveName = `Otomatik Kayıt (Slot ${slotId})`;
    
    if (existingAutoSaves.length > 0) {
      // Mevcut otomatik kaydı güncelle
      await pool.execute(
        `UPDATE game_saves SET 
         game_data = ?, 
         updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [gameDataJson, existingAutoSaves[0].id]
      );
      
      console.log(`Otomatik kayıt güncellendi, id: ${existingAutoSaves[0].id}`);
    } else {
      // Yeni otomatik kayıt oluştur
      const [result] = await pool.execute(
        `INSERT INTO game_saves 
         (user_id, character_id, save_name, save_slot, slot_id, game_data, game_date, game_version, is_auto_save) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
        [
          userId,
          characterId,
          saveName,
          1, // Otomatik kayıt için save_slot 1 kullanılıyor
          slotId, // Karakter slotu
          gameDataJson,
          initialGameData.gameDate,
          initialGameData.gameVersion
        ]
      );
      
      console.log(`Yeni otomatik kayıt oluşturuldu, id: ${result.insertId}`);
    }
    
    return true;
  } catch (error) {
    console.error('Otomatik kayıt oluşturma hatası:', error);
    return false;
  }
}

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
      slotId: dbCharacter.slot_id,
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
