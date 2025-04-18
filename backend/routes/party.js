// backend/routes/party.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const auth = require('../middleware/auth');

// Yeni parti oluştur
router.post('/create-party', auth, async (req, res) => {
  try {
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
    
    if (characters.length === 0) {
      return res.status(404).json({ success: false, message: 'Önce bir karakter oluşturmalısınız' });
    }
    
    const characterId = characters[0].id;
    
    // İlk olarak kullanıcının mevcut partisi olup olmadığını kontrol et
    const [existingParties] = await pool.execute(
      'SELECT * FROM game_parties WHERE user_id = ? AND character_id = ?',
      [userId, characterId]
    );
    
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
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
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
    // Önce otomatik kayıt var mı kontrol et
    const [existingAutoSaves] = await pool.execute(
      'SELECT * FROM game_saves WHERE user_id = ? AND character_id = ? AND is_auto_save = TRUE',
      [userId, characterId]
    );
    
    if (existingAutoSaves.length > 0) {
      // Mevcut oyun verisini al
      let gameData = JSON.parse(existingAutoSaves[0].game_data);
      
      // Oyun verisini güncelle
      gameData = {
        ...gameData,
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
        [partyId, JSON.stringify(gameData), existingAutoSaves[0].id]
      );
      
      console.log(`Otomatik kayıt parti bilgisiyle güncellendi, id: ${existingAutoSaves[0].id}`);
    } else {
      // Yeni otomatik kayıt oluştur (eğer otomatik kayıt yoksa)
      const initialGameData = {
        score: 0,
        level: 1,
        partyId: partyId,
        gameState: 'party_created',
        gameDate: new Date().toISOString(),
        gameVersion: '1.0.0',
        lastSave: new Date().toISOString()
      };
      
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
          JSON.stringify(initialGameData),
          initialGameData.gameDate,
          initialGameData.gameVersion
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