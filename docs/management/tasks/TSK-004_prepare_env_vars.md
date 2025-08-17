# タスク詳細: TSK-004

**ID**: `TSK-004`
**タイトル**: 認証情報設定の準備
**ステータス**: 未着手
**優先度**: 高

## 1. タスクの目的

Google, LINE, Resend(Email), Cloudinary といった外部サービス連携に必要な設定項目を `.env.local` ファイルに準備する。これにより、各機能の実装をスムーズに進められるようにする。

## 2. 手順

`/Users/nakayamamasayuki/Documents/GitHub/uch/.env.local` ファイルに、以下の項目を**追記**してください。
実際のキー（値）は現時点では空欄、またはプレースホルダーで構いません。

```env
# NextAuth
# NEXTAUTH_SECRET は `openssl rand -base64 32` 等で生成した値に置き換えることを推奨
NEXTAUTH_SECRET=YOUR_NEXTAUTH_SECRET_HERE

# Google OAuth
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE

# LINE Login
LINE_CLIENT_ID=YOUR_LINE_CLIENT_ID_HERE
LINE_CLIENT_SECRET=YOUR_LINE_CLIENT_SECRET_HERE

# Resend (Email)
RESEND_API_KEY=YOUR_RESEND_API_KEY_HERE

# Cloudinary (Image Hosting)
CLOUDINARY_CLOUD_NAME=YOUR_CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET=YOUR_CLOUDINARY_API_SECRET
```

*注意: `GOOGLE_CLIENT_ID` など、既に存在する項目は値を更新する必要はありません。項目自体を追記してください。*

## 3. 完了の定義

*   `.env.local` に上記で指定された環境変数の項目が追加されていること。

## 4. 検証方法

PMが `.env.local` の内容を読み取り、項目が追加されていることを確認する。
