# タスク詳細: TSK-030

**ID**: `TSK-030`
**タイトル**: 検索・タグ・アーカイブページのUI連携
**ステータス**: 未着手
**優先度**: 高

## 1. タスクの目的

検索結果ページ、タグ別記事ページ、月別アーカイブページを、それぞれのAPIと連携させ、ユーザーが特定の条件で記事を閲覧できるようにする。

## 2. 手順

### 2.1. 検索結果ページ (`src/app/search/page.tsx`) の新規作成

*   **目的**: 記事検索API (`/api/articles/search`) と連携し、検索結果を表示する。
*   **手順**: `/Users/nakayamamasayuki/Documents/GitHub/uch/src/app/search/page.tsx` を新規作成し、検索結果を表示するコンポーネントを実装する。

### 2.2. タグ別記事ページ (`src/app/tags/[tag]/page.tsx`) の新規作成

*   **目的**: 特定タグの記事取得API (`/api/articles/tag/[tag]`) と連携し、タグに紐づく記事一覧を表示する。
*   **手順**: `/Users/nakayamamasayuki/Documents/GitHub/uch/src/app/tags/[tag]/page.tsx` を新規作成し、タグ別記事一覧を表示するコンポーネントを実装する。

### 2.3. 月別アーカイブページ (`src/app/archive/[yearMonth]/page.tsx`) の新規作成

*   **目的**: 特定月記事取得API (`/api/articles/archive/[yearMonth]`) と連携し、月別の記事一覧を表示する。
*   **手順**: `/Users/nakayamamasayuki/Documents/GitHub/uch/src/app/archive/[yearMonth]/page.tsx` を新規作成し、月別記事一覧を表示するコンポーネントを実装する。

## 3. 完了の定義

*   検索結果ページが実装され、検索結果が表示されること。
*   タグ別記事ページが実装され、タグに紐づく記事一覧が表示されること。
*   月別アーカイブページが実装され、月別の記事一覧が表示されること。

## 4. 検証方法

PMがコードを読み取り、API連携ロジックが意図通りに実装されていることを確認する。
