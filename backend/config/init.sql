-- MySQL veritabanı şeması

-- Veritabanını oluştur
CREATE DATABASE IF NOT EXISTS game_db;

USE game_db;

-- Kullanıcılar tablosu
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Karakter veritabanı tablosu
CREATE TABLE IF NOT EXISTS game_characters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  game_name VARCHAR(100) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  age INT NOT NULL DEFAULT 40,
  gender VARCHAR(20) NOT NULL DEFAULT 'Erkek',
  birth_place VARCHAR(10) NOT NULL,
  profession VARCHAR(50) NOT NULL,
  ideology JSON,
  stats JSON,
  dynamic_values JSON,
  expertise JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Kayıtlı oyunlar tablosu
CREATE TABLE IF NOT EXISTS saved_games (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  game_name VARCHAR(100) NOT NULL,
  game_data JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Kayıtlı oyun verileri tablosu (genişletilmiş)
CREATE TABLE IF NOT EXISTS game_saves (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  character_id INT NOT NULL,
  save_name VARCHAR(100) NOT NULL,
  save_slot INT NOT NULL DEFAULT 1,
  game_data JSON NOT NULL,
  game_date VARCHAR(50),
  game_version VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (character_id) REFERENCES game_characters(id) ON DELETE CASCADE
);

-- Çok oyunculu oyun oturumları tablosu
CREATE TABLE IF NOT EXISTS game_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_code VARCHAR(10) NOT NULL UNIQUE,
  host_id INT NOT NULL,
  game_state JSON NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  player_count INT DEFAULT 1,
  max_players INT DEFAULT 4,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Oyun oturumlarındaki oyuncular tablosu
CREATE TABLE IF NOT EXISTS session_players (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  user_id INT NOT NULL,
  player_data JSON NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_session_player (session_id, user_id)
);

-- Oyun olayları ve ilerleme verileri tablosu
CREATE TABLE IF NOT EXISTS game_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  character_id INT NOT NULL,
  completed_events JSON,
  available_events JSON,
  relationships JSON,
  political_influence INT DEFAULT 10,
  popularity INT DEFAULT 10,
  current_month INT DEFAULT 0,
  party_status JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (character_id) REFERENCES game_characters(id) ON DELETE CASCADE
);

-- Oyun güncellemeleri ve notlar
CREATE TABLE IF NOT EXISTS game_updates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  character_id INT,
  update_type ENUM('game_event', 'achievement', 'system', 'note') NOT NULL,
  title VARCHAR(100) NOT NULL,
  content TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (character_id) REFERENCES game_characters(id) ON DELETE SET NULL
);

-- Oyuncu istatistikleri tablosu
CREATE TABLE IF NOT EXISTS player_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  games_played INT DEFAULT 0,
  games_won INT DEFAULT 0,
  high_score INT DEFAULT 0,
  total_playtime INT DEFAULT 0, -- Dakika cinsinden
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Başarımlar tablosu
CREATE TABLE IF NOT EXISTS achievements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  achievement_code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kullanıcı başarımları tablosu
CREATE TABLE IF NOT EXISTS user_achievements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  achievement_id INT NOT NULL,
  character_id INT,
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
  FOREIGN KEY (character_id) REFERENCES game_characters(id) ON DELETE SET NULL,
  UNIQUE KEY unique_user_achievement (user_id, achievement_id)
);

-- game_parties tablosu oluşturma
CREATE TABLE IF NOT EXISTS game_parties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  character_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  short_name VARCHAR(10) NOT NULL,
  color_id VARCHAR(30) NOT NULL,
  ideology JSON,
  founder_id INT,
  founder_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (character_id) REFERENCES game_characters(id) ON DELETE CASCADE
);
