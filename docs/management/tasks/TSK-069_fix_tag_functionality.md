# TSK-069: [本番バグ] タグ機能が動作しない問題を調査・修正

## 概要
本番環境でタグ機能が動作しない問題の調査と修正を実施。

## 実施内容

### 1. 問題調査
- **APIレベル確認**: タグ関連API（`/api/articles/tags`, `/api/articles/tag/{tag}`）は正常動作を確認
- **フロントエンド確認**: Sidebar.tsx でのタグクリック処理に問題を発見

### 2. 根本原因特定
- **問題箇所**: `src/components/Sidebar.tsx:108`
- **原因**: 日本語タグ名（「家族」「夏休み」等）がURLエンコードされずに`/tags/${tagName}`に直接渡されていた
- **影響**: 本番環境で日本語文字を含むURLが正しく処理されない

### 3. 修正実装
```typescript
// 修正前
const handleTagClick = (tagName: string) => {
  router.push(`/tags/${tagName}`)
}

// 修正後  
const handleTagClick = (tagName: string) => {
  router.push(`/tags/${encodeURIComponent(tagName)}`)
}
```

### 4. 確認事項
- **APIテスト**: 本番環境でタグ関連API正常動作確認済み
  - `/api/articles/tags`: 3つのタグ（家族、夏休み、夏）取得成功
  - `/api/articles/tag/家族`: 該当記事1件取得成功
- **ビルドテスト**: ローカルビルド成功確認

## ステータス
- ✅ 修正実装完了
- ✅ ローカルテスト完了  
- ✅ コミット完了（00bd145）
- ⏳ VPSデプロイ待ち
- ⏳ 本番環境での動作確認待ち

## 次回作業
1. VPSへのデプロイ実施
2. 本番環境でのタグクリック動作確認
3. 他の日本語タグでの動作確認

## 備考
- バックエンドAPIは正常であることを確認済み
- 問題はフロントエンドのURL生成処理のみ
- encodeURIComponent使用により日本語タグ名の安全な処理を実現