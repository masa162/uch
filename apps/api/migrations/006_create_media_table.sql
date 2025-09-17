-- メディアテーブルを作成
CREATE TABLE IF NOT EXISTS media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  width INTEGER,
  height INTEGER,
  duration INTEGER, -- 動画の長さ（秒）
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_media_user_id ON media(user_id);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at);
CREATE INDEX IF NOT EXISTS idx_media_mime_type ON media(mime_type);
