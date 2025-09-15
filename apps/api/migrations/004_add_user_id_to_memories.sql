-- memoriesテーブルにuser_idカラムを追加
ALTER TABLE memories ADD COLUMN user_id TEXT;

-- 既存のデータのuser_idを'システム'に設定
UPDATE memories SET user_id = 'システム' WHERE user_id IS NULL;

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);
