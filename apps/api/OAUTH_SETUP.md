# OAuth認証API セットアップガイド

## 概要

このAPIはGoogle/LINE OAuth認証を提供するスタンドアロン認証サービスです。

## エンドポイント

### 認証ルート

- `GET /auth/google/start` - Google認証開始
- `GET /auth/google/callback` - Google認証コールバック
- `GET /auth/line/start` - LINE認証開始  
- `GET /auth/line/callback` - LINE認証コールバック

### 既存ルート

- `GET /health` - ヘルスチェック
- `GET /memories` - メモリー一覧取得

## 環境変数設定

### 開発環境

`wrangler.toml`で以下の値を設定：

```toml
[vars]
FRONTEND_URL = "http://localhost:3000"
JWT_SECRET = "development-secret-key-change-in-production"
GOOGLE_CLIENT_ID = "your-google-client-id"
GOOGLE_CLIENT_SECRET = "your-google-client-secret"
GOOGLE_REDIRECT_URI = "http://localhost:8787/auth/google/callback"
LINE_CLIENT_ID = "your-line-client-id"
LINE_CLIENT_SECRET = "your-line-client-secret"
LINE_REDIRECT_URI = "http://localhost:8787/auth/line/callback"
```

### 本番環境

Secretsで以下の値を設定：

```bash
# Google OAuth設定
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET

# LINE OAuth設定  
wrangler secret put LINE_CLIENT_ID
wrangler secret put LINE_CLIENT_SECRET

# セッション署名用秘密鍵
wrangler secret put JWT_SECRET

# フロントエンドURL
wrangler secret put FRONTEND_URL
```

## OAuthアプリケーション設定

### Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com/)でプロジェクトを作成
2. OAuth同意画面を設定
3. 認証情報 > OAuth 2.0 クライアントIDを作成
4. 承認済みのリダイレクトURIに以下を追加：
   - 開発: `http://localhost:8787/auth/google/callback`
   - 本番: `https://api.uchinokiroku.com/auth/google/callback`

### LINE OAuth

1. [LINE Developers Console](https://developers.line.biz/)でチャネルを作成
2. チャネル設定で以下を設定：
   - Callback URL:
     - 開発: `http://localhost:8787/auth/line/callback`
     - 本番: `https://api.uchinokiroku.com/auth/line/callback`
   - OpenID Connect: 有効
   - Bot permissions: なし（Messaging API不要）

## データベーススキーマ

usersテーブルが自動作成されます：

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider TEXT NOT NULL, -- 'google' or 'line'
    provider_user_id TEXT NOT NULL,
    email TEXT,
    name TEXT,
    picture_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_user_id)
);
```

## 認証フロー

### Google認証フロー

1. ユーザーが `/auth/google/start` にアクセス
2. Google認可画面にリダイレクト
3. ユーザーが認証を完了
4. `/auth/google/callback` でコールバック受信
5. アクセストークンを取得してユーザー情報を取得
6. ユーザー情報をD1にupsert
7. セッションクッキーを発行
8. フロントエンドにリダイレクト

### LINE認証フロー

1. ユーザーが `/auth/line/start` にアクセス
2. LINE認可画面にリダイレクト
3. ユーザーが認証を完了
4. `/auth/line/callback` でコールバック受信
5. アクセストークンを取得してプロフィール情報を取得
6. ユーザー情報をD1にupsert
7. セッションクッキーを発行
8. フロントエンドにリダイレクト

## セッション管理

- HttpOnlyクッキーでセッション管理
- JWT形式でセッション情報を署名
- 有効期限: 7日間
- セキュア設定: Secure, SameSite=Lax

## 動作確認

### ローカル開発

```bash
# 依存関係インストール
npm install

# ローカル開発サーバー起動
npm run dev

# 別ターミナルでヘルスチェック
curl http://localhost:8787/health

# Google認証開始（ブラウザで）
open http://localhost:8787/auth/google/start

# LINE認証開始（ブラウザで）
open http://localhost:8787/auth/line/start
```

### 本番デプロイ

```bash
# 本番デプロイ
npm run deploy

# ヘルスチェック
curl https://api.uchinokiroku.com/health
```

## エラーハンドリング

すべてのエラーメッセージは「やさしい文言」で返されます：

```json
{
  "error": "認証エラー",
  "message": "Google認証で問題が発生しました。もう一度お試しください。"
}
```

## セキュリティ考慮事項

- CSRF攻撃対策: stateパラメータ検証
- XSS攻撃対策: HttpOnlyクッキー
- セッションハイジャック対策: セキュアクッキー設定
- タイミング攻撃対策: 一貫したエラーレスポンス

## トラブルシューティング

### よくある問題

1. **環境変数が設定されていない**
   - wrangler.tomlまたはSecretsで正しく設定されているか確認

2. **リダイレクトURI不一致**
   - OAuthアプリケーション設定とwrangler.tomlのURIが一致しているか確認

3. **D1データベースエラー**
   - マイグレーションが実行されているか確認: `npx wrangler d1 execute DB --file=./migrations/001_create_users_table.sql`

4. **セッションクッキーが設定されない**
   - JWT_SECRETが設定されているか確認
   - HTTPS環境ではSecureフラグが必須
