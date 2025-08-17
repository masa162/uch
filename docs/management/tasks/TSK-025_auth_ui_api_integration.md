# タスク詳細: TSK-025

**ID**: `TSK-025`
**タイトル**: 認証UIとAPIの連携
**ステータス**: 未着手
**優先度**: 高

## 1. タスクの目的

`AuthForm`や`PasswordGate`などのUIコンポーネントを、実装した認証関連APIと連携させ、ユーザーが実際にログイン・登録・パスワード認証を行えるようにする。

## 2. 手順

以下のUIコンポーネントを修正し、対応するAPIエンドポイントと連携させてください。

### 2.1. `src/components/AuthForm.tsx` の修正

*   **目的**: ユーザー登録 (`/api/auth/register`) とパスワードリセット (`/api/auth/forgot-password`) のAPIを呼び出すロジックを追加する。
*   **修正箇所**: `AuthForm.tsx` 内の `onSubmit` 関数と、新規登録/パスワードリセットボタンのクリックハンドラ。

### 2.2. `src/components/PasswordGate.tsx` の修正

*   **目的**: サイトパスワード認証API (`/api/check-password`) を呼び出すロジックを追加する。
*   **修正箇所**: `PasswordGate.tsx` 内の `handleSubmit` 関数。

## 3. 完了の定義

*   `AuthForm.tsx` がユーザー登録とパスワードリセットAPIと連携していること。
*   `PasswordGate.tsx` がサイトパスワード認証APIと連携していること。

## 4. 検証方法

PMがコードを読み取り、API連携ロジックが意図通りに実装されていることを確認する。
