-- memoriesテーブルにarticle_idカラムを追加
ALTER TABLE memories ADD COLUMN article_id TEXT;

-- 既存のデータにarticle_idを生成（IDベース）
UPDATE memories SET article_id = '250915-' || printf('%02d', id) WHERE id <= 10;
UPDATE memories SET article_id = '250915-' || printf('%02d', id - 10) WHERE id > 10;

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_memories_article_id ON memories(article_id);
