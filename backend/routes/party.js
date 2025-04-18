// backend/routes/party.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const auth = require('../middleware/auth');

// Yeni parti oluştur
router.post('/create-party', auth, async (req, res) => {
  try {
    // Debug için logla
    console.log('Parti oluşturma isteği alındı:', req.body);
    
    const userId = req.user.userId;
    const { party } = req.body;
    
    if (!party || !party.name || !party.shortName || !party.colorId || !party.founderId) {
      return res.status(400).json({ success: false, message: 'Gerekli parti bilgileri eksik' });
    }
    
    // Kullanıcının karakterini kontrol et
    const [characters] = await pool.execute(
      'SELECT * FROM game_characters WHERE user_id = ?',
      [userId]
    );
    
    console.log('Kullanıcı karakteri:', characters.length > 0 ? 'Bulundu' : 'Bulunamadı');
    
    if (characters.length === 0) {
      return res.status(404).json({ success: false, message: 'Önce bir karakter oluşturmalısınız' });
    }
    
    const characterId = characters[0].id;
    
    // İlk olarak kullanıcının mevcut partisi olup olmadığını kontrol et
    const [existingParties] = await pool.execute(
      'SELECT * FROM game_parties WHERE user_id = ? AND character_id = ?',
      [userId, characterId]
    );
    
    console.log('Mevcut parti:', existingParties.length > 0 ? 'Bulundu' : 'Bulunamadı');
    
    // İdeoloji JSON formatına çevrilmesi
    const ideologyJson = JSON.stringify(party.ideology || {});
    // Varsayılan destek tabanı oluştur
    const supportBase = {
      urban: 10,
      rural: 10,
      youth: 10,
      elderly: 10,
      middleClass: 10,
      workingClass: 10,
      religious: 10,
      secular: 10
    };
    const supportBaseJson = JSON.stringify(supportBase);
    
    let partyId;
    
    if (existingParties.length > 0) {
      // Mevcut partiyi güncelle
      console.log('Mevcut parti güncelleniyor...');
      await pool.execute(
        `UPDATE game_parties SET 
         name = ?, short_name = ?, color_id = ?, 
         ideology = ?, founder_id = ?, founder_name = ?,
         updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ? AND character_id = ?`,
        [
          party.name,
          party.shortName,
          party.colorId,
          ideologyJson,
          party.founderId,
          party.founderName,
          userId,
          characterId
        ]
      );
      
      // Güncellenmiş partiyi al
      const [updatedParty] = await pool.execute(
        'SELECT * FROM game_parties WHERE user_id = ? AND character_id = ?',
        [userId, characterId]
      );
      
      partyId = updatedParty[0].id;
      
      // Döndürülecek parti verisi
      const partyData = preparePartyData(updatedParty[0]);
      
      // Otomatik kayıt güncelle veya oluştur
      await updateGameSaveWithParty(userId, characterId, partyId);
      
      return res.status(200).json({
        success: true,
        message: 'Parti başarıyla güncellendi',
        party: partyData
      });
      
    } else {
      // Yeni parti oluştur
      console.log('Yeni parti oluşturuluyor...');
      const [result] = await pool.execute(
        `INSERT INTO game_parties 
         (user_id, character_id, name, short_name, color_id, ideology, founder_id, founder_name, support_base)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          characterId,
          party.name,
          party.shortName,
          party.colorId,
          ideologyJson,
          party.founderId,
          party.founderName,
          supportBaseJson
        ]
      );
      
      partyId = result.insertId;
      console.log('Yeni parti oluşturuldu, ID:', partyId);
      
      // Yeni oluşturulan partiyi al
      const [newParty] = await pool.execute(
        'SELECT * FROM game_parties WHERE id = ?',
        [partyId]
      );
      
      // Döndürülecek parti verisi
      const partyData = preparePartyData(newParty[0]);
      
      // Otomatik kayıt güncelle veya oluştur
      await updateGameSaveWithParty(userId, characterId, partyId);
      
      return res.status(201).json({
        success: true,
        message: 'Parti başarıyla oluşturuldu',
        party: partyData
      });
    }
    
  } catch (error) {
    console.error('Parti oluşturma hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası: ' + error.message });
  }
});

// Parti bilgilerini getir
router.get('/get-party', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Kullanıcının karakterini kontrol et
    const [characters] = await pool.execute(
      'SELECT * FROM game_characters WHERE user_id = ?',
      [userId]
    );
    
    if (characters.length === 0) {
      return res.status(404).json({ success: false, message: 'Karakter bulunamadı' });
    }
    
    const characterId = characters[0].id;
    
    // Kullanıcının partisini veritabanından al
    const [parties] = await pool.execute(
      'SELECT * FROM game_parties WHERE user_id = ? AND character_id = ?',
      [userId, characterId]
    );
    
    if (parties.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Parti bulunamadı' 
      });
    }
    
    // Döndürülecek parti verisi
    const partyData = preparePartyData(parties[0]);
    
    return res.status(200).json({
      success: true,
      party: partyData
    });
    
  } catch (error) {
    console.error('Parti getirme hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Oyun kaydını parti bilgileriyle güncelle
async function updateGameSaveWithParty(userId, characterId, partyId) {
  try {
    // Önce game_saves tablosunun var olup olmadığını kontrol et
    try {
      await pool.execute('SELECT 1 FROM game_saves LIMIT 1');
    } catch (tableError) {
      console.error('game_saves tablosu mevcut değil:', tableError.message);
      // Tablo yoksa oluştur
      await createGameSavesTable();
    }
    
    // Tabloyu oluşturduktan sonra devam et
    // Önce otomatik kayıt var mı kontrol et
    const [existingAutoSaves] = await pool.execute(
      'SELECT * FROM game_saves WHERE user_id = ? AND character_id = ? AND is_auto_save = TRUE',
      [userId, characterId]
    );
    
    const gameData = {
      score: 0,
      level: 1,
      partyId: partyId,
      gameState: 'party_created',
      gameDate: new Date().toISOString(),
      gameVersion: '1.0.0',
      lastSave: new Date().toISOString()
    };
    
    if (existingAutoSaves.length > 0) {
      // Mevcut oyun verisini al
      let currentGameData = JSON.parse(existingAutoSaves[0].game_data);
      
      // Oyun verisini güncelle
      currentGameData = {
        ...currentGameData,
        partyId: partyId,
        gameState: 'party_created',
        lastSave: new Date().toISOString()
      };
      
      // Otomatik kaydı güncelle
      await pool.execute(
        `UPDATE game_saves SET 
         party_id = ?,
         game_data = ?, 
         updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [partyId, JSON.stringify(currentGameData), existingAutoSaves[0].id]
      );
      
      console.log(`Otomatik kayıt parti bilgisiyle güncellendi, id: ${existingAutoSaves[0].id}`);
    } else {
      // Yeni otomatik kayıt oluştur (eğer otomatik kayıt yoksa)
      const [result] = await pool.execute(
        `INSERT INTO game_saves 
         (user_id, character_id, party_id, save_name, save_slot, game_data, game_date, game_version, is_auto_save) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
        [
          userId,
          characterId,
          partyId,
          'Otomatik Kayıt',
          1, // Otomatik kayıtlar için slot 1'i kullanıyoruz
          JSON.stringify(gameData),
          gameData.gameDate,
          gameData.gameVersion
        ]
      );
      
      console.log(`Yeni otomatik kayıt oluşturuldu, id: ${result.insertId}`);
    }
    
    return true;
  } catch (error) {
    console.error('Oyun kaydı güncelleme hatası:', error);
    return false;
  }
}

// game_saves tablosunu oluştur
async function createGameSavesTable() {
  try {
    console.log('game_saves tablosu oluşturuluyor...');
    
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS game_saves (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        character_id INT NOT NULL,
        party_id INT,
        save_name VARCHAR(100) NOT NULL,
        save_slot INT NOT NULL DEFAULT 1,
        game_data JSON NOT NULL,
        game_date VARCHAR(50),
        game_version VARCHAR(20),
        is_active BOOLEAN DEFAULT TRUE,
        is_auto_save BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    console.log('game_saves tablosu başarıyla oluşturuldu.');
    return true;
  } catch (error) {
    console.error('game_saves tablosu oluşturma hatası:', error);
    return false;
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

module.exports = router;
