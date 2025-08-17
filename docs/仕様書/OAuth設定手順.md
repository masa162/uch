# OAuth設定手順

## 🔐 Google OAuth 2.0 設定

### 1. Google Cloud Console設定

1. **Google Cloud Console** にアクセス: https://console.cloud.google.com/
2. **新規プロジェクト作成** または既存プロジェクト選択
3. **APIとサービス** → **認証情報** に移動
4. **認証情報を作成** → **OAuth 2.0 クライアント ID** を選択

### 2. OAuth同意画面の設定

1. **OAuth同意画面** タブをクリック
2. **外部** を選択（テスト用途の場合）
3. 必要事項を入力：
   - **アプリ名**: うちのきろく
   - **ユーザーサポートメール**: あなたのGmailアドレス
   - **承認済みドメイン**: `localhost` (開発時)
   - **デベロッパーの連絡先情報**: あなたのGmailアドレス

### 3. OAuth 2.0 クライアント ID作成

1. **アプリケーションの種類**: ウェブアプリケーション
2. **名前**: うちのきろく Web Client
3. **承認済みの JavaScript 生成元**:
   - `http://localhost:3000`
4. **承認済みのリダイレクト URI**:
   - `http://localhost:3000/api/auth/callback/google`

### 4. 環境変数に設定

`.env.local` ファイルに設定：
```env
GOOGLE_CLIENT_ID=あなたのクライアントID
GOOGLE_CLIENT_SECRET=あなたのクライアントシークレット
```

---

## 📱 LINE Login 設定

### 1. LINE Developers Console設定

1. **LINE Developers** にアクセス: https://developers.line.biz/
2. **新規プロバイダー作成** または既存プロバイダー選択
3. **新規チャネル作成** → **LINEログイン** を選択

### 2. チャネル基本設定

1. **チャネル名**: うちのきろく
2. **チャネル説明**: 家族のアーカイブサイト
3. **アプリタイプ**: ウェブアプリ

### 3. LINEログイン設定

1. **LINEログイン設定** タブに移動
2. **コールバックURL**:
   - `http://localhost:3000/api/auth/callback/line`
3. **スコープ設定**:
   - `profile` (必須)
   - `openid` (必須)

### 4. 環境変数に設定

`.env.local` ファイルに追加：
```env
LINE_CHANNEL_ID=あなたのチャネルID
LINE_CHANNEL_SECRET=あなたのチャネルシークレット
```

---

## 📧 Email (SMTP) 設定

### 1. Gmail SMTP設定

1. **Googleアカウント** → **セキュリティ** に移動
2. **2段階認証プロセス** を有効化
3. **アプリパスワード** を生成:
   - **アプリを選択**: メール
   - **デバイスを選択**: その他（カスタム名）
   - **カスタム名**: うちのきろく
   - 生成された16文字のパスワードをコピー

### 2. 環境変数に設定

`.env.local` ファイルに追加：
```env
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=あなたのGmailアドレス
EMAIL_SERVER_PASSWORD=生成されたアプリパスワード
EMAIL_FROM=あなたのGmailアドレス
```

---

## ✅ 設定確認方法

### 1. 開発サーバー起動
```bash
npm run dev
```

### 2. 認証テスト
1. `http://localhost:3000/auth/signin` にアクセス
2. 各認証方法をテスト:
   - LINEログインボタンをクリック
   - Googleログインボタンをクリック
   - メール認証でメールアドレス入力

### 3. 動作確認ポイント
- [ ] リダイレクトが正常に動作する
- [ ] 認証後、メインページに戻る
- [ ] ユーザー情報が正しく表示される
- [ ] メール送信が正常に動作する

---

## 🏠 本番環境での注意点

### 1. ドメイン設定の変更
開発環境 → 本番環境移行時：

**Google OAuth**:
- 承認済みドメイン: `uchinokiroku.com`
- リダイレクトURI: `https://uchinokiroku.com/api/auth/callback/google`

**LINE Login**:
- コールバックURL: `https://uchinokiroku.com/api/auth/callback/line`

### 2. 環境変数
```env
NEXTAUTH_URL=https://uchinokiroku.com
```

### 3. HTTPS必須
本番環境では必ずHTTPSを使用してください。

---

## 💡 トラブルシューティング

### よくあるエラーと解決法

**Google OAuth エラー**: 
- `redirect_uri_mismatch` → リダイレクトURIの確認
- `invalid_client` → クライアントID/シークレットの確認

**LINE Login エラー**:
- `invalid_request` → コールバックURLの確認
- `unauthorized_client` → チャネルID/シークレットの確認

**メール送信エラー**:
- `Authentication failed` → アプリパスワードの確認
- `Connection timeout` → SMTPホスト/ポート設定の確認

---

*最終更新: 2025年8月9日*  
*「家族みんなが使いやすい認証システム」を目指して 🏠💝*