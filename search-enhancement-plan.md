# うちのきろく検索機能拡張 実行計画書

**作成日**: 2025-09-23
**対象プロジェクト**: うちのきろく (https://uchinokiroku.com/)

## 1. 現状分析

### 1.1 既存実装状況
- ✅ **検索ページ**: `/search` - 実装済み
- ✅ **リアルタイム検索**: `RealtimeSearch.tsx` - 実装済み
- ✅ **基本API**: `/api/articles?q=...` - 記事検索のみ対応
- ✅ **技術スタック**: Next.js 14 + TypeScript + Tailwind CSS + DaisyUI

### 1.2 現在の制限事項
- 🔴 検索対象が記事のみ（メディアファイル未対応）
- 🔴 検索ボタンが未実装（フォーム送信のみ）
- 🔴 検索結果フィルタリング機能なし
- 🔴 統一検索API未実装（コンテンツタイプ別API）

### 1.3 将来連携要件
- 🔄 VPS上でのDify AI執事による自動タグ付け機能
- 🔄 AI検索結果の精度向上
- 🔄 セマンティック検索機能

## 2. 実装計画

### Phase 1: 基盤機能強化 (優先度: 高)
**期間**: 2-3日

#### 2.1 検索UI改善
- **検索ボタン実装**
  - 現在のリアルタイム検索に明示的な検索ボタンを追加
  - フォーム送信とキーボードショートカット（Enter）の両対応
  - ファイル: `frontend/src/components/RealtimeSearch.tsx`

- **検索フィルタUI実装**
  - コンテンツタイプフィルタ（記事、画像、動画、全て）
  - 日付範囲フィルタ
  - タグフィルタ
  - ファイル: `frontend/src/components/SearchFilters.tsx` (新規作成)

#### 2.2 統一検索API開発
- **新API設計**: `/api/search` (従来の `/api/articles` を拡張)
- **対応コンテンツ**:
  - 記事（articles）
  - 画像（images）
  - 動画（videos）
  - その他ファイル（documents）

### Phase 2: メディア検索機能 (優先度: 高)
**期間**: 3-4日

#### 2.1 バックエンドAPI拡張
- **新エンドポイント**:
  ```
  GET /api/search?q=keyword&type=all|articles|media|images|videos
  GET /api/search?q=keyword&date_from=YYYY-MM-DD&date_to=YYYY-MM-DD
  GET /api/search?q=keyword&tags=tag1,tag2
  ```

- **データベース設計拡張**:
  - メディアファイルメタデータテーブル
  - 検索インデックス最適化
  - ファイル: `apps/api/src/models/` (拡張)

#### 2.2 メディア検索ロジック
- **ファイル名検索**
- **メタデータ検索**（EXIF、作成日時等）
- **AI生成タグとの連携準備**

### Phase 3: 高度なフィルタリング (優先度: 中)
**期間**: 2-3日

#### 3.1 動的フィルタ機能
- **検索結果数に応じたフィルタ表示**
- **Ajax based フィルタ更新**
- **フィルタ状態の永続化**（URLパラメータ）

#### 3.2 検索結果表示改善
- **統一カードレイアウト**（記事・メディア共通）
- **プレビュー機能**
- **ソート機能**（関連度、日付、ファイルサイズ等）

### Phase 4: AI連携準備 (優先度: 中-低)
**期間**: 2-3日

#### 4.1 タグシステム強化
- **自動タグAPI受け入れインターフェース**
- **タグ精度向上のためのフィードバック機能**
- **タグベース検索精度向上**

#### 4.2 セマンティック検索準備
- **全文検索エンジン検討**（Elasticsearch/Algolia等）
- **ベクトル検索インフラ検討**

## 3. 技術仕様

### 3.1 フロントエンド
```typescript
// 新しい検索インターフェース
interface UnifiedSearchRequest {
  query: string
  type: 'all' | 'articles' | 'media' | 'images' | 'videos'
  dateFrom?: string
  dateTo?: string
  tags?: string[]
  sortBy?: 'relevance' | 'date' | 'size'
  page?: number
  limit?: number
}

interface UnifiedSearchResult {
  id: string
  title: string
  type: 'article' | 'image' | 'video' | 'document'
  content?: string
  url: string
  thumbnailUrl?: string
  createdAt: string
  tags: string[]
  author: {
    name: string
    displayName?: string
  }
  metadata?: Record<string, any>
}
```

### 3.2 バックエンド
```typescript
// Cloudflare Workers API
interface SearchQuery {
  q: string
  type?: ContentType
  date_from?: string
  date_to?: string
  tags?: string
  sort_by?: SortOption
  page?: number
  limit?: number
}

enum ContentType {
  ALL = 'all',
  ARTICLES = 'articles',
  MEDIA = 'media',
  IMAGES = 'images',
  VIDEOS = 'videos'
}
```

## 4. 実装順序

### 優先順位1: 即座に実装すべき機能
1. **検索ボタン追加** - RealtimeSearchコンポーネント改修
2. **基本フィルタUI** - コンテンツタイプ選択
3. **統一検索API** - 既存記事検索の拡張

### 優先順位2: 2週間以内
1. **メディア検索機能**
2. **高度なフィルタリング**
3. **検索結果表示改善**

### 優先順位3: 1ヶ月以内
1. **AI連携インターフェース**
2. **セマンティック検索準備**
3. **パフォーマンス最適化**

## 5. リスクと対策

### 5.1 技術的リスク
- **Cloudflare Workers制限**: データベースクエリ最適化が必要
- **メディアファイル処理**: ファイルサイズとパフォーマンスのバランス
- **検索インデックス**: 大量データでの検索速度低下

### 5.2 対策
- **段階的実装**: MVP から始めて段階的に機能拡張
- **キャッシュ戦略**: 検索結果と静的リソースのキャッシュ
- **非同期処理**: 重い処理はバックグラウンドで実行

## 6. 成功指標

### 6.1 定量指標
- 検索実行回数: 現在値から50%向上
- 検索結果クリック率: 30%以上
- 平均検索結果表示時間: 2秒以下

### 6.2 定性指標
- ユーザビリティテスト評価: 4/5以上
- 検索結果満足度: 高い評価

## 7. 次のアクション

### 即座に開始可能
1. `RealtimeSearch.tsx` への検索ボタン追加
2. `SearchFilters.tsx` 新規コンポーネント作成
3. 統一検索API設計文書作成

### 準備が必要
1. メディアファイル管理方法の調査
2. データベーススキーマ設計
3. AI連携仕様の詳細検討

---

**備考**: 本計画書は現在の実装状況を基に作成しています。実装前に各フェーズで詳細な技術検証を行うことを推奨します。

**最終更新**: 2025-09-23
**作成者**: Claude Code Assistant