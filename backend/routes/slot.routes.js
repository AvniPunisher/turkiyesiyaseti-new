// routes/slot.routes.js
const express = require('express');
const router = express.Router();
const slotController = require('../controllers/slot.controller');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, slotController.getSlots);
router.post('/', authMiddleware, slotController.createSlot);

router.get('/:slotId/character', authenticateToken, getCharacterBySlot);


module.exports = router;
