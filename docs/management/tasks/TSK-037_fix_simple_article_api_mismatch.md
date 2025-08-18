# 作業指示書: TSK-037

**件名:** 簡易投稿APIの仕様不整合に起因するエラーの修正

## 1. タスク概要

- **タスクID:** TSK-037
- **担当者:** Claude Code
- **期日:** 可及的速やかに
- **関連チケット:** TSK-036 (本件とは別の、詳細フォームに関する問題)

## 2. 背景・目的

現在、新規記事投稿ページの「簡易投稿」フォームを使用すると、`500 Internal Server Error` が発生し、投稿が失敗する。

PMによる調査の結果、原因はフロントエンドとバックエンドAPI (`/api/articles/simple`) の間で、処理の仕様が完全に矛盾しているためと特定された。

本作業の目的は、この仕様の矛盾を解消し、簡易投稿機能を正常に動作させることである。

## 3. 問題の詳細

- **フロントエンドの送信データ:**
  - ユーザーが入力した `{ title, content }` を送信する。
- **バックエンドの処理ロジック:**
  - `{ content }` しか受け取らない。
  - `title` はリクエストに含まれていないことを前提に、日付から自動生成しようとする。

この矛盾が、APIサーバー内部で予期せぬエラーを引き起こしている。

## 4. 作業内容

バックエンドのAPI (`src/app/api/articles/simple/route.ts`) の仕様を、現在のフロントエンドの実装に合わせて修正する。

- **修正対象ファイル:** `src/app/api/articles/simple/route.ts`

### 修正手順

1.  APIがリクエストボディから `title` と `content` の両方を受け取るように修正する。
2.  受け取った `title` に対するバリデーション（空でないことのチェック）を追加する。
3.  不要になった「タイトル自動生成」のロジックを完全に削除する。
4.  `prisma.article.create` を呼び出す際に、自動生成したタイトルではなく、リクエストから受け取った `title` を使用するように変更する。

## 5. 具体的なコード変更

以下の通り、対象ファイルの内容を修正してください。

### 変更前のコード (`src/app/api/articles/simple/route.ts`)

```typescript
// ...
    const { content } = await request.json()

    // バリデーション
    if (!content?.trim()) {
      return NextResponse.json(
        { message: '内容を入力してください' },
        { status: 400 }
      )
    }
// ... (中略) ...
    // タイトル自動生成
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const autoTitle = `${year}年${month}月${day}日の記録`

    // 説明文自動生成（本文の先頭100文字）
    const autoDescription = content.trim().length > 100 
      ? content.trim().substring(0, 97) + '...'
      : content.trim()
// ... (中略) ...
    // 記事作成（簡易POST仕様）
    const article = await prisma.article.create({
      data: {
        title: autoTitle,
        slug,
        content: content.trim(),
        description: autoDescription,
// ...
```

### 変更後のコード (`src/app/api/articles/simple/route.ts`)

```typescript
// ...
    const { title, content } = await request.json()

    // バリデーション
    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { message: 'タイトルと内容を入力してください' },
        { status: 400 }
      )
    }

    if (content.trim().length > 1000) {
      return NextResponse.json(
        { message: '内容は1000文字以内で入力してください' },
        { status: 400 }
      )
    }
// ... (中略) ...
    // ユーザー取得 (この部分は変更なし)
// ...

    // ★★★ タイトル自動生成のロジックをここから削除 ★★★

    // 説明文自動生成（本文の先頭100文字）
    const autoDescription = content.trim().length > 100 
      ? content.trim().substring(0, 97) + '...'
      : content.trim()

    // ★★★ スラッグ生成のロジックは変更なし ★★★
// ... (中略) ...
    // 記事作成（簡易POST仕様）
    const article = await prisma.article.create({
      data: {
        title: title.trim(), // 受け取った title を使用
        slug,
        content: content.trim(),
        description: autoDescription,
// ...
```

### 変更点の要約

- `request.json()` で `title` も受け取るように変更。
- `title` の空チェックバリデーションを追加。
- `タイトル自動生成` のコードブロックを削除。
- `prisma.article.create` で `title: autoTitle` だった部分を `title: title.trim()` に変更。

## 6. 検証方法

1.  ローカル環境でアプリケーションを起動する。
2.  `/articles/new` にアクセスする。
3.  「簡易投稿」フォームに以下の内容を入力する。
    - **タイトル:** `簡易投稿テスト`
    - **内容:** `これは簡易投稿のテストです。`
4.  「今すぐ投稿」ボタンをクリックする。
5.  エラーが発生せず、「投稿しました！」というアラートが表示され、記事ページにリダイレクトされることを確認する。
6.  データベースを直接確認し、該当記事の `title` が `簡易投稿テスト` になっていることを確認する。

以上で作業は完了です。不明点があれば、PMまで確認してください。
