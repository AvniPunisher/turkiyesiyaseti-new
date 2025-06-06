// controllers/slot.controller.js
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/db');

exports.getSlots = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM game_slots WHERE user_id = ? ORDER BY slot_number ASC',
      [userId]
    );

    const slots = [null, null, null];
    rows.forEach(slot => {
      slots[slot.slot_number] = slot;
    });

    res.json(slots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

exports.createSlot = async (req, res) => {
  const userId = req.user.id;
  const { slotNumber, gameName } = req.body;

  try {
    const [existing] = await pool.query(
      'SELECT * FROM game_slots WHERE user_id = ? AND slot_number = ?',
      [userId, slotNumber]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Bu slot zaten dolu' });
    }

    const id = uuidv4();

    await pool.query(
      'INSERT INTO game_slots (id, user_id, slot_number, game_name) VALUES (?, ?, ?, ?)',
      [id, userId, slotNumber, gameName]
    );

    res.status(201).json({ id, slotNumber, gameName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};
