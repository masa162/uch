-- tagsテーブルの作成（タグ名を一意に保存）
CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

-- memory_tagsテーブルの作成（メモリーとタグの中間テーブル）
CREATE TABLE IF NOT EXISTS memory_tags (
    memory_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (memory_id, tag_id),
    FOREIGN KEY (memory_id) REFERENCES memories(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_memory_tags_memory_id ON memory_tags(memory_id);
CREATE INDEX IF NOT EXISTS idx_memory_tags_tag_id ON memory_tags(tag_id);
