-- 既存のusersテーブルを削除して再作成
-- idの型をINTEGERからTEXTに変更

DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id TEXT PRIMARY KEY, -- ULID文字列
    provider TEXT NOT NULL, -- 'google' or 'line'
    provider_user_id TEXT NOT NULL, -- OAuth プロバイダーのユーザーID
    email TEXT,
    name TEXT,
    picture_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- プロバイダーとユーザーIDの組み合わせは一意
    UNIQUE(provider, provider_user_id)
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_provider_user_id ON users(provider_user_id);

-- updated_atを自動更新するトリガー
CREATE TRIGGER IF NOT EXISTS update_users_updated_at
    AFTER UPDATE ON users
    FOR EACH ROW
    BEGIN
        UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
