// backend/routes/game.js'e eklenecek yeni API endpoint'leri

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
