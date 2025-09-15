-- 1) 既存テーブル退避
ALTER TABLE users RENAME TO users_old;

-- 2) TEXT主キーで新規テーブル作成（ULID/UUIDを格納）
CREATE TABLE users (
  id TEXT PRIMARY KEY,                          -- ULID/UUID
  provider TEXT NOT NULL,                       -- 'google' | 'line'
  provider_user_id TEXT NOT NULL,               -- sub | userId
  email TEXT,
  name TEXT,
  picture_url TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE(provider, provider_user_id)
);

-- 3) 旧データを一括移行（暫定IDとして 32桁hex を付与）
INSERT INTO users (id, provider, provider_user_id, email, name, picture_url, created_at, updated_at)
SELECT lower(hex(randomblob(16))), provider, provider_user_id, email, name, picture_url,
       COALESCE(DATETIME(created_at), strftime('%Y-%m-%dT%H:%M:%fZ','now')),
       strftime('%Y-%m-%dT%H:%M:%fZ','now')
FROM users_old;

-- 4) 旧テーブルは保険で残す（後日 DROP TABLE users_old;）

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_provider_user_id ON users(provider_user_id);

-- updated_atを自動更新するトリガー
CREATE TRIGGER IF NOT EXISTS update_users_updated_at
    AFTER UPDATE ON users
    FOR EACH ROW
    BEGIN
        UPDATE users SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = NEW.id;
    END;