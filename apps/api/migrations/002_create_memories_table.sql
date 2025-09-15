-- メモリーテーブルの作成
-- 既存のmemoriesテーブルが存在しない場合に作成

CREATE TABLE IF NOT EXISTS memories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at);

-- updated_atを自動更新するトリガー
CREATE TRIGGER IF NOT EXISTS update_memories_updated_at
    AFTER UPDATE ON memories
    FOR EACH ROW
    BEGIN
        UPDATE memories SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

-- サンプルデータの挿入（テスト用）
INSERT OR IGNORE INTO memories (title, content) VALUES 
('サンプルメモリー1', 'これは最初のメモリーです。'),
('サンプルメモリー2', 'これは2番目のメモリーです。'),
('サンプルメモリー3', 'これは3番目のメモリーです。');
