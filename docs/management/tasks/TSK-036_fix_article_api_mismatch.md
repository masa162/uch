# 作業指示書: TSK-036

**件名:** 新規記事投稿APIの契約不一致に起因するエラーの修正

## 1. タスク概要

- **タスクID:** TSK-036
- **担当者:** Claude Code
- **期日:** 可及的速やかに
- **関連チケット:** なし

## 2. 背景・目的

現在、新規記事投稿ページ (`/articles/new`) において、記事を投稿しようとするとエラーが発生、もしくは意図しない動作（下書き保存ができないなど）が発生する。

PMによる調査の結果、原因はフロントエンドが送信するデータ構造と、バックエンドAPI (`/api/articles`) が期待するデータ構造の間に不一致があるためと特定された。

本作業の目的は、このAPI契約の不一致を解消し、新規記事投稿機能を正常に動作させることである。

## 3. 問題の詳細

- **フロントエンドの送信データ:**
  - `heroImage` (ヒーロー画像のURL)
  - `isPublished` (公開ステータス)
- **バックエンドの期待データ:**
  - `heroImageUrl` (ヒーロー画像のURL)
  - `isPublished` を受け取るロジックがなく、常に `true` で保存される。
  - `description` を期待しているが、フロントエンドから送信されていない（これはスキーマ上オプショナルなため、直接のエラー原因ではない）。

この不一致により、ヒーロー画像が保存されず、下書き機能も正しく動作しない。

## 4. 作業内容

バックエンドのAPI (`src/app/api/articles/route.ts`) を、フロントエンドの実装とデータベーススキーマに合わせて修正する。

- **修正対象ファイル:** `src/app/api/articles/route.ts`

### 修正手順

1.  APIが受け取るJSONオブジェクトのキーを、フロントエンドが送信するキーに合わせる。
    - `heroImageUrl` → `heroImage`
2.  フロントエンドから送信される `isPublished` の値を受け取り、`prisma.article.create` に正しく渡すようにする。
3.  フロントエンドから送信されていない `description` は、引き続きオプショナルとして扱う。

## 5. 具体的なコード変更

以下の通り、対象ファイルの内容を修正してください。

### 変更前のコード (`src/app/api/articles/route.ts`)

```typescript
// ...
    const { title, content, description, tags, heroImageUrl } = await request.json()

// ...

    // 記事作成
    const article = await prisma.article.create({
      data: {
        title: title.trim(),
        slug,
        content: content.trim(),
        description: description?.trim() || null,
        tags: Array.isArray(tags) ? tags : [],
        heroImageUrl: heroImageUrl?.trim() || null,
        pubDate: new Date(),
        authorId: user.id,
        isPublished: true,
      },
// ...
```

### 変更後のコード (`src/app/api/articles/route.ts`)

```typescript
// ...
    const { title, content, tags, heroImage, isPublished, description } = await request.json()

// ...

    // 記事作成
    const article = await prisma.article.create({
      data: {
        title: title.trim(),
        slug,
        content: content.trim(),
        description: description?.trim() || null,
        tags: Array.isArray(tags) ? tags : [],
        heroImageUrl: heroImage?.trim() || null,
        pubDate: new Date(),
        authorId: user.id,
        isPublished: isPublished ?? true,
      },
// ...
```

### 変更点の要約

- 分割代入で受け取るキーを `{ title, content, description, tags, heroImageUrl }` から `{ title, content, tags, heroImage, isPublished, description }` に変更。
- `prisma.article.create` に渡す `heroImageUrl` の値を、`heroImage` から取得するように変更。
- `prisma.article.create` に渡す `isPublished` の値を、ハードコードされた `true` から、リクエストボディの値 (`isPublished ?? true`) を使うように変更。（`?? true` は、`isPublished` が `undefined` や `null` の場合にデフォルトで公開にするためのフォールバック）

## 6. 検証方法

1.  ローカル環境でアプリケーションを起動する。
2.  `/articles/new` にアクセスする。
3.  詳細フォームに以下の内容を入力する。
    - **タイトル、内容:** 任意の文字列
    - **ヒーロー画像:** 何か画像をアップロードする
    - **タグ:** 任意のタグ（例: `test, fix`）
4.  「下書き保存」ボタンをクリックする。
5.  エラーが発生せず、「下書きとして保存しました！」というアラートが表示されることを確認する。
6.  データベースを直接確認し、該当記事の `isPublished` が `false` になっていること、`heroImageUrl` に画像のURLが保存されていることを確認する。
7.  再度 `/articles/new` から、今度は「すぐに公開する」にチェックを入れたまま「投稿する」ボタンをクリックする。
8.  エラーが発生せず、「記事を投稿しました！」というアラートが表示され、記事ページにリダイレクトされることを確認する。
9.  データベースで、該当記事の `isPublished` が `true` になっていることを確認する。

以上で作業は完了です。不明点があれば、PMまで確認してください。
