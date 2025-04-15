-- Karakter ve Oyun tabloları için SQL şeması

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

-- Kayıtlı oyun verileri tablosu
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