-- --------------------------------------------------------------------------------
-- schema.sql
--
-- This is the single, consolidated schema initialization file.
-- It contains the final, correct CREATE TABLE statements for all tables
-- in the correct dependency order.
-- To be executed directly with `wrangler d1 execute`.
-- --------------------------------------------------------------------------------

-- --------------------------------------------------------------------------------
-- Table: users
-- --------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  provider_user_id TEXT NOT NULL,
  email TEXT,
  name TEXT,
  picture_url TEXT,
  email_login_enabled INTEGER NOT NULL DEFAULT 0,
  email_verified INTEGER NOT NULL DEFAULT 0,
  password_hash TEXT,
  last_login_at TEXT,
  verification_token TEXT,
  verification_expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE(provider, provider_user_id)
);

-- --------------------------------------------------------------------------------
-- Table: password_reset_tokens
-- --------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  used_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- --------------------------------------------------------------------------------
-- Table: tags
-- --------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

-- --------------------------------------------------------------------------------
-- Table: memories (without foreign key constraint)
-- --------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS memories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    article_id TEXT UNIQUE,
    title TEXT NOT NULL,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------------------
-- Table: media (without foreign key constraint)
-- --------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT,
  thumbnail_url TEXT,
  file_content TEXT,
  width INTEGER,
  height INTEGER,
  duration INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------------------
-- Table: memory_tags (without foreign key constraints)
-- --------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS memory_tags (
    memory_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (memory_id, tag_id)
);

-- Indexes and Triggers are removed to avoid execution order issues
-- They should be added in a separate migration file after tables are created
