# ULID移行・認証API追加ガイド

## 概要

この移行により、以下の変更が行われました：

1. **ユーザーIDの移行**: `INTEGER AUTOINCREMENT` → `TEXT (ULID/UUID)`
2. **認証API追加**: `GET /auth/me` と `POST /auth/logout`
3. **Cookie Domain設定**: 本番環境のみ `.uchinokiroku.com` を付与
4. **メールログイン対応**: パスワードカラム追加、リセット用テーブル新設

## 変更内容

### 1. データベース移行

- **マイグレーションファイル**: `migrations/20250915_users_ulid.sql`
- 既存の `users` テーブルを `users_old` に退避
- 新しい `users` テーブルを `TEXT` 主キーで作成
- 既存データを仮IDで移行（アプリケーション層でULID再発行推奨）

#### 追加: メールログイン対応 (2025-09-27)

- **マイグレーションファイル**: `migrations/20250927_email_login.sql`
- `users` テーブルに以下カラムを追加:
  - `email_login_enabled INTEGER NOT NULL DEFAULT 0`
  - `email_verified INTEGER NOT NULL DEFAULT 0`
  - `password_hash TEXT`
  - `last_login_at TEXT`
  - `verification_token TEXT`
  - `verification_expires_at TEXT`
- `password_reset_tokens` テーブルを新規作成し、ユーザーごとのリセットトークンを管理
- 新しいインデックス: `idx_users_email_login`, `idx_password_reset_tokens_user_id`, `idx_password_reset_tokens_expires_at`

### 2. 新しいファイル

- `src/lib/id.ts`: ULID生成ユーティリティ
- `src/routes/auth/me.ts`: ユーザー情報取得API
- `src/routes/auth/logout.ts`: ログアウトAPI

### 3. 更新されたファイル

- `src/lib/users.ts`: ULID対応、文字列ID使用
- `src/lib/session.ts`: 文字列ID対応、Cookie Domain設定
- `src/index.ts`: 新しいルート追加、環境変数追加
- `src/routes/auth/google.ts`: 新しいセッション管理API使用
- `src/routes/auth/line.ts`: 新しいセッション管理API使用
- `wrangler.toml`: 新しい環境変数追加

## 環境変数設定

### ローカル・Preview環境

```bash
# .dev.vars または wrangler.toml
SESSION_SECRET = "development-secret-key-change-in-production"
SESSION_MAX_AGE_SEC = "2592000"
# COOKIE_DOMAIN は設定しない（Domain属性なし）
```

### 本番環境

Cloudflare Dashboard の Secrets/Vars で設定：

```bash
SESSION_SECRET = "your-production-secret-key"
SESSION_MAX_AGE_SEC = "2592000"
COOKIE_DOMAIN = ".uchinokiroku.com"
```

## 動作確認手順

### 1. ローカル環境での確認

```bash
# 1. マイグレーション実行
wrangler d1 migrations apply uch-db --local

# 2. ローカルサーバー起動
wrangler dev

# 3. 認証フロー確認
curl -i "http://localhost:8787/auth/google/start"
# → Google認証画面にリダイレクト

# 4. 認証成功後、ユーザー情報確認
curl -i "http://localhost:8787/auth/me" \
  -H "Cookie: uk_session=YOUR_SESSION_TOKEN"
# → { "ok": true, "user": { "id": "01HF...", "name": "...", "email": "..." } }

# 5. ログアウト確認
curl -i -X POST "http://localhost:8787/auth/logout"
# → 204 + Set-Cookie: uk_session=; Max-Age=0
```

### 2. 本番環境での確認

```bash
# 1. マイグレーション実行
wrangler d1 migrations apply uch-db

# 2. デプロイ
wrangler deploy

# 3. 認証フロー確認
curl -i "https://uch-api.your-subdomain.workers.dev/auth/google/start"

# 4. 認証成功後、ユーザー情報確認
curl -i "https://uch-api.your-subdomain.workers.dev/auth/me" \
  -H "Cookie: uk_session=YOUR_SESSION_TOKEN"

# 5. Cookie Domain確認
# レスポンスの Set-Cookie に Domain=.uchinokiroku.com が含まれていることを確認
```

## API仕様

### GET /auth/me

現在のユーザー情報を取得

**レスポンス:**
- 成功時 (200): `{ "ok": true, "user": { "id": "string", "name": "string", "email": "string" } }`
- 未認証時 (401): `{ "ok": false, "message": "ログインが必要です。" }`

### POST /auth/logout

セッションを終了

**レスポンス:**
- 成功時 (204): セッションクッキーを削除

## 注意事項

1. **既存データ**: 移行後、既存ユーザーのIDは仮のUUID形式になります。必要に応じて、アプリケーション層でULIDを再発行してください。

2. **Cookie Domain**: 本番環境でのみ `Domain=.uchinokiroku.com` が設定されます。Preview環境では設定されません。

3. **セッション名**: クッキー名が `uch_session` から `uk_session` に変更されました。

4. **環境変数**: 新しい環境変数 `SESSION_SECRET`, `SESSION_MAX_AGE_SEC`, `COOKIE_DOMAIN` が必要です。

## ロールバック手順

問題が発生した場合のロールバック手順：

```sql
-- 1. 新しいテーブルを削除
DROP TABLE users;

-- 2. 旧テーブルを復元
ALTER TABLE users_old RENAME TO users;

-- 3. アプリケーションを以前のバージョンにデプロイ
```

## トラブルシューティング

### よくある問題

1. **セッションが無効**: クッキー名が `uk_session` に変更されていることを確認
2. **Cookie Domain問題**: 本番環境で `COOKIE_DOMAIN` が設定されていることを確認
3. **ID型エラー**: データベースのマイグレーションが完了していることを確認

### ログ確認

```bash
# ローカル環境
wrangler dev --log-level debug

# 本番環境
wrangler tail uch-api
```
