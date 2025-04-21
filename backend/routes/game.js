// backend/routes/game.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const auth = require('../middleware/auth');

// Yeni karakter oluştur
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
    
    let characterId;
    
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
      
      characterId = updatedCharacter[0].id;
      
      // Döndürülecek karakter verisi
      const characterData = prepareCharacterData(updatedCharacter[0]);
      
      // Otomatik kayıt oluştur (mevcut karakteri güncellediğimizde)
      await createAutoSave(userId, characterId);
      
      return res.status(200).json({
        success: true,
        message: 'Karakter başarıyla güncellendi',
        character: characterData
      });
      
    } else {
      // Yeni karakter oluştur
      const [result] = await pool.execute(
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
      
      characterId = result.insertId;
      
      // Yeni oluşturulan karakteri al
      const [newCharacter] = await pool.execute(
        'SELECT * FROM game_characters WHERE id = ?',
        [characterId]
      );
      
      // Döndürülecek karakter verisi
      const characterData = prepareCharacterData(newCharacter[0]);
      
      // Otomatik kayıt oluştur (yeni karakter oluşturulduğunda)
      await createAutoSave(userId, characterId);
      
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

// Parti oluştur veya güncelle
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
    const supportBaseJson = JSON.stringify(party.supportBase || supportBase);
    
    let partyId;
    
    if (existingParties.length > 0) {
      // Mevcut partiyi güncelle
      console.log('Mevcut parti güncelleniyor...');
      await pool.execute(
        `UPDATE game_parties SET 
         name = ?, short_name = ?, color_id = ?, 
         ideology = ?, founder_id = ?, founder_name = ?,
         support_base = ?,
         updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ? AND character_id = ?`,
        [
          party.name,
          party.shortName,
          party.colorId,
          ideologyJson,
          party.founderId,
          party.founderName,
          supportBaseJson,
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
    
    // Önce kayıt bilgilerini kontrol et
    const [savedGameCheck] = await pool.execute(
      `SELECT * FROM game_saves WHERE id = ? AND user_id = ? AND is_active = TRUE`,
      [saveId, userId]
    );
    
    if (savedGameCheck.length === 0) {
      return res.status(404).json({ success: false, message: 'Kayıtlı oyun bulunamadı' });
    }
    
    const savedGameInfo = savedGameCheck[0];
    
    // Karakter bilgilerini ayrı al
    const [characters] = await pool.execute(
      `SELECT * FROM game_characters WHERE id = ?`,
      [savedGameInfo.character_id]
    );
    
    if (characters.length === 0) {
      return res.status(404).json({ success: false, message: 'Karakter bilgisi bulunamadı' });
    }
    
    const character = prepareCharacterData(characters[0]);
    
    // Parti bilgilerini ayrı al (eğer varsa)
    let party = null;
    if (savedGameInfo.party_id) {
      const [parties] = await pool.execute(
        `SELECT * FROM game_parties WHERE id = ?`,
        [savedGameInfo.party_id]
      );
      
      if (parties.length > 0) {
        party = preparePartyData(parties[0]);
      }
    }
    
    // Oyun verisini hazırla
    let gameData = {};
    try {
      gameData = JSON.parse(savedGameInfo.game_data);
    } catch (jsonError) {
      console.error('Oyun verisi JSON parse hatası:', jsonError);
      gameData = { error: 'Oyun verisi çözümlenemedi' };
    }
    
    return res.status(200).json({
      success: true,
      saveData: {
        saveId: savedGameInfo.id,
        saveName: savedGameInfo.save_name,
        saveSlot: savedGameInfo.save_slot,
        isAutoSave: savedGameInfo.is_auto_save == 1,
        character,
        party,
        gameData,
        gameDate: savedGameInfo.game_date,
        gameVersion: savedGameInfo.game_version,
        createdAt: savedGameInfo.created_at,
        updatedAt: savedGameInfo.updated_at
      }
    });
    
  } catch (error) {
    console.error('Oyun yükleme hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Sunucu hatası: ' + error.message,
      error: error.stack
    });
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

// Kayıt dosyasını dışa aktarma (export)
router.get('/export-save/:saveId', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const saveId = req.params.saveId;
    
    // Kaydı veritabanından al
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
    
    // Dışa aktarma için veri yapısı
    const exportData = {
      saveInfo: {
        id: savedGame.id,
        saveName: savedGame.save_name,
        saveSlot: savedGame.save_slot,
        isAutoSave: savedGame.is_auto_save == 1,
        gameDate: savedGame.game_date,
        gameVersion: savedGame.game_version,
        exportDate: new Date().toISOString(),
        exportVersion: '1.0'
      },
      character,
      party,
      gameData,
      createdAt: savedGame.created_at,
      updatedAt: savedGame.updated_at
    };
    
    return res.status(200).json({
      success: true,
      message: 'Kayıt başarıyla dışa aktarıldı',
      saveData: exportData,
      saveName: savedGame.save_name
    });
    
  } catch (error) {
    console.error('Kayıt dışa aktarma hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası: ' + error.message });
  }
});

// Kayıt dosyasını içe aktarma (import)
router.post('/import-save', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { saveData } = req.body;
    
    if (!saveData || !saveData.character || !saveData.saveInfo) {
      return res.status(400).json({ success: false, message: 'Geçersiz kayıt dosyası formatı' });
    }
    
    // İlk olarak karakteri doğrula veya oluştur
    let characterId;
    let character = saveData.character;
    
    // Önce varolan karakter kontrolü yap
    const [existingCharacters] = await pool.execute(
      'SELECT * FROM game_characters WHERE user_id = ?',
      [userId]
    );
    
    if (existingCharacters.length > 0) {
      // Karakteri güncelle
      characterId = existingCharacters[0].id;
      
      await pool.execute(
        `UPDATE game_characters SET 
         game_name = ?, full_name = ?, age = ?, gender = ?, birth_place = ?, profession = ?,
         ideology = ?, stats = ?, dynamic_values = ?, expertise = ?,
         updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          character.gameName || `${character.fullName}'in Oyunu`,
          character.fullName,
          character.age || 40,
          character.gender || 'Erkek',
          character.birthPlace,
          character.profession,
          JSON.stringify(character.ideology || {}),
          JSON.stringify(character.stats || {}),
          JSON.stringify(character.dynamicValues || {}),
          JSON.stringify(character.expertise || []),
          characterId
        ]
      );
    } else {
      // Yeni karakter oluştur
      const [result] = await pool.execute(
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
          JSON.stringify(character.ideology || {}),
          JSON.stringify(character.stats || {}),
          JSON.stringify(character.dynamicValues || {}),
          JSON.stringify(character.expertise || [])
        ]
      );
      
      characterId = result.insertId;
    }
    
    // Parti işlemleri (eğer varsa)
    let partyId = null;
    
    if (saveData.party) {
      const party = saveData.party;
      
      // Önce varolan parti kontrolü yap
      const [existingParties] = await pool.execute(
        'SELECT * FROM game_parties WHERE user_id = ? AND character_id = ?',
        [userId, characterId]
      );
      
      if (existingParties.length > 0) {
        // Partiyi güncelle
        partyId = existingParties[0].id;
        
        await pool.execute(
          `UPDATE game_parties SET 
           name = ?, short_name = ?, color_id = ?, ideology = ?, 
           founder_id = ?, founder_name = ?, support_base = ?,
           updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [
            party.name,
            party.shortName,
            party.colorId,
            JSON.stringify(party.ideology || {}),
            party.founderId || characterId,
            party.founderName || character.fullName,
            JSON.stringify(party.supportBase || {}),
            partyId
          ]
        );
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
            JSON.stringify(party.ideology || {}),
            party.founderId || characterId,
            party.founderName || character.fullName,
            JSON.stringify(party.supportBase || {})
          ]
        );
        
        partyId = result.insertId;
      }
    }
    
    // Kayıt oluştur
    const saveInfo = saveData.saveInfo;
    const gameData = saveData.gameData || {};
    
    // Bir sonraki boş kayıt slotu bul
    const [existingSaveSlots] = await pool.execute(
      'SELECT save_slot FROM game_saves WHERE user_id = ? AND is_auto_save = FALSE ORDER BY save_slot',
      [userId]
    );
    
    const usedSlots = existingSaveSlots.map(slot => slot.save_slot);
    let nextSlot = 2; // 2'den başla, 1 otomatik kayıt için ayrılmış
    
    while (usedSlots.includes(nextSlot)) {
      nextSlot++;
    }
    
    // Yeni kayıt oluştur
    const [result] = await pool.execute(
      `INSERT INTO game_saves 
       (user_id, character_id, party_id, save_name, save_slot, game_data, game_date, game_version, is_auto_save) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, FALSE)`,
      [
        userId,
        characterId,
        partyId,
        saveInfo.saveName || `İçe Aktarılan Kayıt ${nextSlot}`,
        nextSlot,
        JSON.stringify(gameData),
        saveInfo.gameDate || new Date().toISOString(),
        saveInfo.gameVersion || '1.0.0'
      ]
    );
    
    return res.status(201).json({
      success: true,
      message: 'Kayıt başarıyla içe aktarıldı',
      saveId: result.insertId
    });
    
  } catch (error) {
    console.error('Kayıt içe aktarma hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası: ' + error.message });
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

// Otomatik kayıt oluşturan yardımcı fonksiyon
async function createAutoSave(userId, characterId) {
  try {
    // Önce bu kullanıcı için otomatik kayıt var mı kontrol et
    const [existingAutoSaves] = await pool.execute(
      'SELECT * FROM game_saves WHERE user_id = ? AND character_id = ? AND is_auto_save = TRUE',
      [userId, characterId]
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
    const saveName = 'Otomatik Kayıt';
    
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
         (user_id, character_id, save_name, save_slot, game_data, game_date, game_version, is_auto_save) 
         VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
        [
          userId,
          characterId,
          saveName,
          1, // Otomatik kayıtlar için slot 1'i kullanıyoruz
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

module.exports = router;
