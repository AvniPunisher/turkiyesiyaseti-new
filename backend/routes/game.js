// backend/routes/game.js
// Eksik olan router tanımını ekleyin

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const auth = require('../middleware/auth');

// Mevcut dosyanıza aşağıdaki endpoint'i ekleyin
// Parti bilgisini getir
router.get('/get-party', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // İlk olarak kullanıcının karakterini bul
    const [characters] = await pool.execute(
      'SELECT id FROM game_characters WHERE user_id = ?',
      [userId]
    );
    
    if (characters.length === 0) {
      return res.status(404).json({ success: false, message: 'Karakter bulunamadı' });
    }
    
    const characterId = characters[0].id;
    
    // Önce özel parti tablosunda ara (eğer böyle bir tablo varsa)
    try {
      const [parties] = await pool.execute(
        'SELECT * FROM game_parties WHERE character_id = ?',
        [characterId]
      );
      
      if (parties && parties.length > 0) {
        // Parti bulundu, return et
        const partyData = parties[0];
        
        // JSON alanlarını parse et
        const ideology = partyData.ideology ? JSON.parse(partyData.ideology) : {};
        
        return res.status(200).json({
          success: true,
          party: {
            id: partyData.id,
            name: partyData.name,
            shortName: partyData.short_name,
            colorId: partyData.color_id,
            ideology,
            founderId: partyData.founder_id,
            founderName: partyData.founder_name
          }
        });
      }
    } catch (error) {
      // game_parties tablosu yoksa hata alırız, sessizce devam et
      console.log("Parti tablosu bulunamadı veya sorgu hatası:", error.message);
    }
    
    // Parti bulunamadıysa, kayıtlı oyunlarda JSON olarak ara
    try {
      const [savedGames] = await pool.execute(
        `SELECT game_data FROM game_saves 
         WHERE character_id = ? AND is_active = TRUE 
         ORDER BY updated_at DESC LIMIT 1`,
        [characterId]
      );
      
      if (savedGames && savedGames.length > 0 && savedGames[0].game_data) {
        // Oyun verilerini parse et
        const gameData = JSON.parse(savedGames[0].game_data);
        
        // Parti verilerini kontrol et
        if (gameData.party) {
          return res.status(200).json({
            success: true,
            party: gameData.party
          });
        }
      }
    } catch (error) {
      console.error('Kayıtlı oyundan parti verisi alma hatası:', error);
    }
    
    // Parti bulunamadı
    return res.status(404).json({ success: false, message: 'Parti bulunamadı' });
  } catch (error) {
    console.error('Parti bilgisi getirme hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Parti oluşturma endpoint'i (eğer yoksa ekleyin)
router.post('/create-party', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { party } = req.body;
    
    if (!party || !party.name || !party.shortName || !party.colorId) {
      return res.status(400).json({ success: false, message: 'Gerekli parti bilgileri eksik' });
    }
    
    // İlk olarak kullanıcının karakterini bul
    const [characters] = await pool.execute(
      'SELECT id, full_name FROM game_characters WHERE user_id = ?',
      [userId]
    );
    
    if (characters.length === 0) {
      return res.status(404).json({ success: false, message: 'Karakter bulunamadı. Önce bir karakter oluşturun.' });
    }
    
    const characterId = characters[0].id;
    const characterName = characters[0].full_name;
    
    try {
      // 1. Önce game_parties tablosunun var olup olmadığını kontrol et
      const [tables] = await pool.execute(
        "SHOW TABLES LIKE 'game_parties'"
      );
      
      if (tables.length > 0) {
        // Tablo varsa, partinin zaten var olup olmadığını kontrol et
        const [existingParty] = await pool.execute(
          'SELECT id FROM game_parties WHERE character_id = ?',
          [characterId]
        );
        
        const ideologyJson = JSON.stringify(party.ideology || {});
        
        if (existingParty.length > 0) {
          // Parti varsa güncelle
          await pool.execute(
            `UPDATE game_parties SET 
             name = ?, 
             short_name = ?, 
             color_id = ?, 
             ideology = ?,
             founder_id = ?,
             founder_name = ?,
             updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [
              party.name,
              party.shortName,
              party.colorId,
              ideologyJson,
              characterId,
              party.founderName || characterName,
              existingParty[0].id
            ]
          );
          
          return res.status(200).json({
            success: true,
            message: 'Parti başarıyla güncellendi'
          });
        } else {
          // Parti yoksa yeni kayıt oluştur
          await pool.execute(
            `INSERT INTO game_parties 
             (user_id, character_id, name, short_name, color_id, ideology, founder_id, founder_name)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              userId,
              characterId,
              party.name,
              party.shortName,
              party.colorId,
              ideologyJson,
              characterId,
              party.founderName || characterName
            ]
          );
          
          return res.status(201).json({
            success: true,
            message: 'Parti başarıyla oluşturuldu'
          });
        }
      } else {
        console.log("game_parties tablosu bulunamadı, oyun verisine kaydet");
        
        // 2. Eğer parti tablosu yoksa, verileri game_saves tablosuna ekleyelim
        // Önce mevcut kayıtlı oyunu kontrol et
        const [savedGames] = await pool.execute(
          `SELECT id, game_data FROM game_saves 
           WHERE user_id = ? AND character_id = ? AND is_active = TRUE
           ORDER BY updated_at DESC LIMIT 1`,
          [userId, characterId]
        );
        
        if (savedGames.length > 0) {
          // Mevcut kayıtlı oyunu güncelle
          const gameData = JSON.parse(savedGames[0].game_data || '{}');
          gameData.party = party;
          gameData.hasParty = true;
          
          await pool.execute(
            `UPDATE game_saves SET 
             game_data = ?, 
             updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [
              JSON.stringify(gameData),
              savedGames[0].id
            ]
          );
        } else {
          // Yeni bir oyun kaydı oluştur
          const gameData = {
            party: party,
            hasParty: true,
            score: 0,
            level: 1,
            createdAt: new Date().toISOString()
          };
          
          await pool.execute(
            `INSERT INTO game_saves 
             (user_id, character_id, save_name, save_slot, game_data, game_date, is_active)
             VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
            [
              userId,
              characterId,
              `${characterName}'in Partisi`,
              1, // Varsayılan slot
              JSON.stringify(gameData),
              new Date().toISOString()
            ]
          );
        }
        
        return res.status(201).json({
          success: true,
          message: 'Parti başarıyla oluşturuldu'
        });
      }
    } catch (dbError) {
      console.error('Veritabanı işlemi hatası:', dbError);
      
      // Tablo yok hatası veya başka bir SQL hatası oluştu, 
      // parti verisini game_saves tablosunda JSON olarak sakla
      try {
        console.log("Alternatif yöntem deneniyor: Parti verisini game_data içinde sakla");
        
        // Mevcut kayıtlı oyunu kontrol et
        const [savedGames] = await pool.execute(
          `SELECT id, game_data FROM game_saves 
           WHERE user_id = ? AND character_id = ? AND is_active = TRUE
           ORDER BY updated_at DESC LIMIT 1`,
          [userId, characterId]
        );
        
        const gameData = savedGames.length > 0 && savedGames[0].game_data 
          ? JSON.parse(savedGames[0].game_data) 
          : { score: 0, level: 1 };
        
        gameData.party = party;
        gameData.hasParty = true;
        
        if (savedGames.length > 0) {
          // Mevcut kaydı güncelle
          await pool.execute(
            `UPDATE game_saves SET 
             game_data = ?, 
             updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [
              JSON.stringify(gameData),
              savedGames[0].id
            ]
          );
        } else {
          // Yeni kayıt oluştur
          await pool.execute(
            `INSERT INTO game_saves 
             (user_id, character_id, save_name, save_slot, game_data, game_date, is_active)
             VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
            [
              userId,
              characterId,
              `${characterName || 'Oyuncu'}'nun Partisi`,
              1, // Varsayılan slot
              JSON.stringify(gameData),
              new Date().toISOString()
            ]
          );
        }
        
        return res.status(201).json({
          success: true,
          message: 'Parti başarıyla oluşturuldu'
        });
      } catch (error) {
        console.error('Alternatif yöntem hatası:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'Parti kaydedilirken hata oluştu: ' + error.message
        });
      }
    }
  } catch (error) {
    console.error('Parti oluşturma hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Oyun kaydetme fonksiyonunu güncelleme (mevcut fonksiyonda değişiklik)
router.post('/save-game', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { gameData, saveName, saveSlot = 1 } = req.body;
    
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
    
    // Parti bilgisini de gameData içinde sakla
    const completeGameData = gameData;
    
    // Mevcut kayıt var mı kontrol et
    const [existingSaves] = await pool.execute(
      'SELECT * FROM game_saves WHERE user_id = ? AND save_slot = ?',
      [userId, saveSlot]
    );
    
    const gameDataJson = JSON.stringify(completeGameData);
    
    if (existingSaves.length > 0) {
      // Mevcut kaydı güncelle
      await pool.execute(
        `UPDATE game_saves SET 
         save_name = ?, game_data = ?, game_date = ?, 
         updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ? AND save_slot = ?`,
        [
          saveName || `Kayıt ${saveSlot}`,
          gameDataJson,
          gameData.saveDate || new Date().toISOString(),
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
         (user_id, character_id, save_name, save_slot, game_data, game_date, game_version, is_active) 
         VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
        [
          userId,
          characterId,
          saveName || `Kayıt ${saveSlot}`,
          saveSlot,
          gameDataJson,
          gameData.saveDate || new Date().toISOString(),
          gameData.gameVersion || '1.0.0',
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

// Bu satırı eklemeyi UNUTMAYIN! Tüm rotalarınızın çalışması için gerekli
module.exports = router;
