# メディア表示問題 根本原因分析・修正ガイド

**作成日**: 2025年9月28日
**対象**: 記事ページ・ギャラリーページでのメディア表示問題
**影響範囲**: フロントエンド全体のメディア表示機能

## 🔍 根本原因

### 問題の詳細
**フロントエンドでAPIから返されるfile_urlを無視し、独自のURL生成ロジックを使用**

### 技術的な原因

#### 1. APIレスポンス（正常）
```json
{
  "media": [
    {
      "id": 87,
      "file_url": "/api/media/06CN9Z2T33E70TH22BSCQ3ZP%2F1758592688654_1000009450.png",
      "original_filename": "1000009450.png",
      "mime_type": "image/png"
    }
  ]
}
```

#### 2. フロントエンド実装（問題あり）
**ファイル**: `frontend/src/components/ArticleDetailContent.tsx:130-136`

```typescript
const getMediaDisplayUrl = (item: MediaItem) => {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uchinokiroku.com'
  if (item.mime_type.startsWith('video/') && item.file_url.endsWith('.m3u8')) {
    return item.file_url
  }
  return `${apiBase}/api/media/${item.id}/image`  // ❌ APIの file_url を無視
}
```

#### 3. 結果として生成される間違ったURL
```
期待値: https://api.uchinokiroku.com/api/media/06CN9Z2T33E70TH22BSCQ3ZP%2F1758592688654_1000009450.png
実際値: https://api.uchinokiroku.com/api/media/87/image
```

### 影響分析

#### なぜ問題が発生したか
1. **APIとフロントエンドの設計方針不統一**
   - APIは `file_url` でファイルパスを返している
   - フロントエンドは独自のURL生成ロジックを使用

2. **認証要件の相違**
   - `/api/media/{id}/image` は認証が必要
   - `/api/media/{path}` の認証要件が不明確

3. **開発・テスト不足**
   - APIレスポンスとフロントエンド実装の連携テスト不足
   - エンドツーエンドテストの欠如

## 🛠️ 修正方法

### 1. 即座の修正（ArticleDetailContent.tsx）

```typescript
const getMediaDisplayUrl = (item: MediaItem) => {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uchinokiroku.com'

  // APIから返された file_url を優先使用
  if (item.file_url) {
    // 絶対URLの場合はそのまま
    if (item.file_url.startsWith('http')) {
      return item.file_url
    }
    // 相対URLの場合はベースURLを追加
    return `${apiBase}${item.file_url}`
  }

  // フォールバック: file_url がない場合のみ ID ベース
  return `${apiBase}/api/media/${item.id}/image`
}
```

### 2. 同様の修正が必要な箇所

#### ギャラリーページ
**ファイル**: `frontend/src/app/gallery/page.tsx:88`
```typescript
return `${apiBase}/api/media/${item.id}/image`  // ❌ 同じ問題
```

#### サムネイル表示関数
**ファイル**: `frontend/src/components/ArticleDetailContent.tsx:138-144`
```typescript
const getMediaThumbnailUrl = (item: MediaItem) => {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uchinokiroku.com'
  if (item.thumbnail_url) {
    return item.thumbnail_url  // ✅ 正しい実装例
  }
  return `${apiBase}/api/media/${item.id}/image`  // ❌ 同じ問題
}
```

### 3. 共通ユーティリティ関数の作成

**新ファイル**: `frontend/src/utils/media.ts`

```typescript
export function getMediaUrl(
  mediaItem: { file_url?: string; id: number },
  apiBase: string = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uchinokiroku.com'
): string {
  // APIから返された file_url を優先
  if (mediaItem.file_url) {
    if (mediaItem.file_url.startsWith('http')) {
      return mediaItem.file_url
    }
    return `${apiBase}${mediaItem.file_url}`
  }

  // フォールバック
  return `${apiBase}/api/media/${mediaItem.id}/image`
}

export function getThumbnailUrl(
  mediaItem: { thumbnail_url?: string; file_url?: string; id: number },
  apiBase: string = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uchinokiroku.com'
): string {
  // thumbnail_url が明示的に設定されている場合
  if (mediaItem.thumbnail_url) {
    if (mediaItem.thumbnail_url.startsWith('http')) {
      return mediaItem.thumbnail_url
    }
    return `${apiBase}${mediaItem.thumbnail_url}`
  }

  // フォールバック: 元ファイルのURLを使用
  return getMediaUrl(mediaItem, apiBase)
}
```

## 🏥 修正手順

### Phase 1: 緊急修正
1. **ArticleDetailContent.tsx の getMediaDisplayUrl 関数修正**
2. **gallery/page.tsx の同様箇所修正**
3. **動作確認**

### Phase 2: 根本的な改善
1. **共通ユーティリティ関数作成**
2. **全ページでの統一**
3. **TypeScript型定義の強化**

### Phase 3: テスト・予防策
1. **エンドツーエンドテスト追加**
2. **APIレスポンス形式の文書化**
3. **開発ガイドライン更新**

## 🔒 予防策

### 1. 設計原則の明確化

#### APIレスポンス設計原則
- **file_url は常に使用可能な完全パスを返す**
- **相対パスの場合は API ベースからの相対パス**
- **認証が必要な場合は明示的にドキュメント化**

#### フロントエンド実装原則
- **APIレスポンスの file_url を優先使用**
- **独自URL生成は最後の手段として実装**
- **共通ユーティリティ関数を使用**

### 2. 開発プロセス改善

#### コードレビューポイント
- [ ] APIレスポンスの field 使用確認
- [ ] URL生成ロジックの統一性確認
- [ ] 認証要件の明示確認

#### テスト要件
- [ ] メディア表示のE2Eテスト
- [ ] 認証ありなしでの動作確認
- [ ] 複数ブラウザでの表示確認

### 3. 監視・アラート

#### 実装すべき監視
- **メディア読み込み失敗率**
- **404エラーの発生パターン**
- **認証エラーの発生頻度**

## 📋 チェックリスト

### 修正作業
- [ ] ArticleDetailContent.tsx の getMediaDisplayUrl 修正
- [ ] ArticleDetailContent.tsx の getMediaThumbnailUrl 修正
- [ ] gallery/page.tsx の getThumbUrl 修正
- [ ] 共通ユーティリティ関数作成
- [ ] 型定義の更新

### 確認作業
- [ ] 記事ページでのメディア表示確認
- [ ] ギャラリーページでのメディア表示確認
- [ ] 動画ファイルの表示確認
- [ ] サムネイル表示確認
- [ ] 複数ブラウザでの動作確認

### 文書化
- [ ] API仕様書の更新
- [ ] フロントエンド実装ガイドの更新
- [ ] トラブルシューティングガイドの作成

## 🔧 技術仕様

### API エンドポイント仕様

#### メディア取得 (認証必要)
```
GET /api/media/{id}/image
Authentication: Required (Cookie-based)
Response: Binary image data
```

#### ファイルパス取得 (認証必要)
```
GET /api/media/{userId}/{filename}
Authentication: Required (Cookie-based)
Response: Binary file data
```

### フロントエンド実装仕様

#### MediaItem 型定義
```typescript
type MediaItem = {
  id: number
  file_url: string          // API提供の完全パス（優先使用）
  thumbnail_url?: string    // サムネイル専用URL（任意）
  original_filename: string
  mime_type: string
  // ... other fields
}
```

#### URL生成ルール
1. **file_url が存在** → そのまま使用（絶対URLならそのまま、相対URLならベース追加）
2. **thumbnail_url が存在** → サムネイル用途で使用
3. **どちらも存在しない** → ID ベースのフォールバック URL

---

**作成者**: Claude Code
**承認者**: nakayamamasayuki
**最終更新**: 2025年9月28日