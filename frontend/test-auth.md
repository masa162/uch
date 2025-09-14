# 認証機能テスト手順

## 実装完了項目

### ✅ Google OAuth サインイン
- サインインページ: `/signin`
- Google OAuth ボタン実装済み
- NextAuth.js 設定完了

### ✅ LINE Login サインイン
- LINE Login ボタン実装済み
- NextAuth.js 設定完了

### ✅ 認証フロー統合
- AuthContext で NextAuth.js セッション管理
- AuthenticatedLayout で認証チェック
- サイドバーでサインアウト機能

## テスト手順

### 1. 開発サーバー起動
```bash
cd D:\github\uch-frontend
npm run dev
```

### 2. 認証テスト
1. `http://localhost:3000` にアクセス
2. 認証されていない場合は `/signin` にリダイレクト
3. Google OAuth ボタンをクリック
4. Google 認証画面でログイン
5. 認証成功後、ホームページにリダイレクト
6. サイドバーでユーザー情報表示確認
7. サインアウト機能テスト

### 3. LINE Login テスト
1. `/signin` ページで LINE ボタンをクリック
2. LINE 認証画面でログイン
3. 認証成功後の動作確認

## 環境変数設定が必要

フロントエンドの `.env.local` ファイルに以下を設定：

```env
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# API Base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

# Site Password
NEXT_PUBLIC_SITE_PASSWORD=きぼう

# Skip Auth for Development
NEXT_PUBLIC_SKIP_AUTH=false
```

## 期待される動作

1. **未認証時**: `/signin` ページにリダイレクト
2. **Google OAuth**: Google 認証後、ホームページにリダイレクト
3. **LINE Login**: LINE 認証後、ホームページにリダイレクト
4. **認証済み**: ホームページ表示、サイドバーにユーザー情報
5. **サインアウト**: `/signin` ページにリダイレクト

## トラブルシューティング

### よくあるエラー
1. **Configuration エラー**: 環境変数が設定されていない
2. **OAuthCallback エラー**: リダイレクトURIが正しく設定されていない
3. **SessionRequired エラー**: セッション管理に問題がある

### 解決方法
1. 環境変数の確認
2. Google Cloud Console のリダイレクトURI設定確認
3. LINE Developers Console のコールバックURL設定確認
