# Cloudflare R2 セットアップガイド

## 概要

このドキュメントでは、Next.jsプロジェクトでCloudflare R2（Object Storage）を使用するための設定手順を説明します。

## 前提条件

- Cloudflareアカウント
- R2バケットが作成済み
- APIトークンが生成済み

## 環境変数の設定

`.env.local`ファイルに以下の環境変数を追加してください：

```bash
# Cloudflare R2 (Object Storage)
CLOUDFLARE_R2_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key
CLOUDFLARE_R2_BUCKET_NAME=your_bucket_name
CLOUDFLARE_R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com
CLOUDFLARE_R2_PUBLIC_URL=https://pub-your_account_id.r2.dev
```

### 環境変数の説明

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `CLOUDFLARE_R2_ACCOUNT_ID` | CloudflareアカウントID | `c677241d7d66ff80103bab9f142128ab` |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | R2アクセスキーID | `dbe71580377b19eccdc8234e389c222b` |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | R2シークレットアクセスキー | `6b655ca4c4a7a26047a461463bdf2628a40af478f2caf428247c6777fa24ebe5` |
| `CLOUDFLARE_R2_BUCKET_NAME` | R2バケット名 | `uch-assets` |
| `CLOUDFLARE_R2_ENDPOINT` | R2エンドポイントURL | `https://c677241d7d66ff80103bab9f142128ab.r2.cloudflarestorage.com` |
| `CLOUDFLARE_R2_PUBLIC_URL` | 公開アクセス用URL | `https://pub-c677241d7d66ff80103bab9f142128ab.r2.dev` |

## 必要なパッケージのインストール

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

## 使用方法

### 1. ファイルアップロード

```typescript
import { uploadToR2, generateFileKey } from '@/lib/cloudflare-r2'

// ファイルキーを生成
const fileKey = generateFileKey(fileName, userId)

// R2にアップロード
const result = await uploadToR2(fileKey, fileBuffer, contentType, metadata)

if (result.success) {
  console.log('アップロード成功:', result.url)
} else {
  console.error('アップロード失敗:', result.error)
}
```

### 2. 署名付きURLの取得

```typescript
import { getSignedUrlForFile } from '@/lib/cloudflare-r2'

// 1時間有効な署名付きURLを取得
const signedUrl = await getSignedUrlForFile(fileKey, 3600)
```

### 3. ファイルの削除

```typescript
import { deleteFromR2 } from '@/lib/cloudflare-r2'

const result = await deleteFromR2(fileKey)
if (result.success) {
  console.log('削除成功')
}
```

## セキュリティ設定

### 1. バケットの公開設定

R2バケットを公開アクセス可能にするには、以下の設定が必要です：

1. CloudflareダッシュボードでR2バケットを選択
2. 「Settings」タブをクリック
3. 「Public Access」を有効化
4. カスタムドメインを設定（オプション）

### 2. CORS設定

必要に応じて、CORS設定を追加してください：

```json
[
  {
    "AllowedOrigins": ["https://uchinokiroku.com"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
]
```

## トラブルシューティング

### よくある問題

1. **認証エラー**
   - 環境変数が正しく設定されているか確認
   - APIトークンの権限を確認

2. **バケットが見つからない**
   - バケット名が正しいか確認
   - アカウントIDが正しいか確認

3. **ファイルがアップロードできない**
   - ファイルサイズ制限（5MB）を確認
   - ファイル形式が対応しているか確認

### ログの確認

アップロードAPIのログを確認するには：

```bash
# Next.jsサーバーのログを確認
npm run dev

# ブラウザの開発者ツールでコンソールログを確認
```

## パフォーマンス最適化

1. **画像の最適化**
   - WebP形式の使用を推奨
   - 適切な画像サイズでのアップロード

2. **キャッシュ戦略**
   - 静的アセットの長期キャッシュ
   - CDNの活用

## 参考リンク

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [AWS S3 SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/s3-examples.html)
- [Next.js Image Optimization](https://nextjs.org/docs/basic-features/image-optimization)
