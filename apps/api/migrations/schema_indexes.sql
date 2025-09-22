-- --------------------------------------------------------------------------------
-- Indexes for all tables
-- --------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_article_id ON memories(article_id);
CREATE INDEX IF NOT EXISTS idx_media_user_id ON media(user_id);

-- --------------------------------------------------------------------------------
-- Triggers
-- --------------------------------------------------------------------------------
CREATE TRIGGER IF NOT EXISTS update_users_updated_at
    AFTER UPDATE ON users
    FOR EACH ROW
    BEGIN
        UPDATE users SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_memories_updated_at
    AFTER UPDATE ON memories
    FOR EACH ROW
    BEGIN
        UPDATE memories SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;