// backend/routes/game.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const auth = require('../middleware/auth');

// Kayıtlı oyunları getir
router.get('/saved-games', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const [savedGames] = await pool.execute(
      'SELECT * FROM saved_games WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    
    res.status(200).json(savedGames);
  } catch (error) {
    console.error('Kayıtlı oyunları getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Oyun kaydet
router.post('/save-game', auth, async (req, res) => {
  try {
    const { gameName, gameData } = req.body;
    const userId = req.user.userId;
    
    const [result] = await pool.execute(
      'INSERT INTO saved_games (user_id, game_name, game_data) VALUES (?, ?, ?)',
      [userId, gameName, JSON.stringify(gameData)]
    );
    
    res.status(201).json({ 
      message: 'Oyun başarıyla kaydedildi',
      gameId: result.insertId
    });
  } catch (error) {
    console.error('Oyun kaydetme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kayıtlı oyunu yükle
router.get('/load-game/:id', auth, async (req, res) => {
  try {
    const gameId = req.params.id;
    const userId = req.user.userId;
    
    const [games] = await pool.execute(
      'SELECT * FROM saved_games WHERE id = ? AND user_id = ?',
      [gameId, userId]
    );
    
    if (games.length === 0) {
      return res.status(404).json({ message: 'Oyun bulunamadı' });
    }
    
    const game = games[0];
    
    res.status(200).json({
      id: game.id,
      gameName: game.game_name,
      gameData: JSON.parse(game.game_data),
      createdAt: game.created_at
    });
  } catch (error) {
    console.error('Oyun yükleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;