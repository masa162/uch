-- mediaテーブルにfile_contentカラムを追加
ALTER TABLE media ADD COLUMN file_content TEXT;

-- インデックスの作成（必要に応じて）
CREATE INDEX IF NOT EXISTS idx_media_file_content ON media(file_content);
