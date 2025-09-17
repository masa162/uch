-- memoriesテーブルにarticle_idカラムを追加（既存の場合はスキップ）
-- SQLiteでは既存カラムの追加をスキップするため、エラーを無視
-- ALTER TABLE memories ADD COLUMN article_id TEXT;

-- 既存のデータにarticle_idを生成（IDベース）
UPDATE memories SET article_id = '250915-' || printf('%02d', id) WHERE id <= 10 AND article_id IS NULL;
UPDATE memories SET article_id = '250915-' || printf('%02d', id - 10) WHERE id > 10 AND article_id IS NULL;

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_memories_article_id ON memories(article_id);
