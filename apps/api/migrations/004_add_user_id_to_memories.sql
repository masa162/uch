-- memoriesテーブルにuser_idカラムを追加（既存の場合はスキップ）
-- SQLiteでは既存カラムの追加をスキップするため、エラーを無視
-- ALTER TABLE memories ADD COLUMN user_id TEXT;

-- 既存のデータのuser_idを'システム'に設定（user_idカラムが存在する場合のみ）
UPDATE memories SET user_id = 'システム' WHERE user_id IS NULL;

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);
