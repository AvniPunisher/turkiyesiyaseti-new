// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Config
dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');

app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Oyun API çalışıyor!');
});

// Port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});