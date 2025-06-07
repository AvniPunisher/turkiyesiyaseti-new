// routes/slot.routes.js
const express = require('express');
const router = express.Router();
const slotController = require('../controllers/slot.controller');
const authenticateToken = require('../middleware/auth');

// Slotları getir
router.get('/', authenticateToken, slotController.getSlots);

// Yeni slot oluştur
router.post('/', authenticateToken, slotController.createSlot);

// Slot'a ait karakteri getir
router.get('/:slotId/character', authenticateToken, slotController.getCharacterBySlot);

module.exports = router;
