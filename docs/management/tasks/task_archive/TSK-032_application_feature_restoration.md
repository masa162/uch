# タスク詳細: TSK-032

**ID**: `TSK-032`
**タイトル**: アプリケーション機能の復旧とビルドエラーの根本原因解決
**ステータス**: 未着手
**優先度**: 高
**担当者**: Gemini CLI PM / Claude Code

## 1. タスクの目的

Dockerビルド過程で一時的に無効化されたアプリケーション機能を復旧し、ビルドエラーの根本原因を特定・解決する。

## 2. 背景

デプロイは成功したが、ビルドエラーを回避するために多くのファイルが簡略化・無効化された。これにより、アプリケーションのコア機能が失われている可能性がある。

## 3. 具体的な作業内容

*   **3.2.1. `src/app/layout.tsx` および `src/app/globals.css` の復旧**:
    *   正しい内容をリポジトリから取得し、VPS上のファイルに反映する。
    *   Google Fontsのタイムアウト問題が再発しないか確認する。
*   **3.2.2. `tsconfig.json` のパスエイリアス修正の確認と適用**:
    *   Claude Codeが試みたパスエイリアスの修正が正しく適用されているか確認し、必要であれば手動で修正する。
*   **3.2.3. `cloudinary` 機能の復旧**:
    *   `cloudinary` パッケージが `package.json` にない原因を特定し、必要であればインストールする。
    *   `src/app/api/upload/route.ts` を復旧する。
*   **3.2.4. Tailwind CSS / PostCSS 設定の復旧**:
    *   `postcss.config.js` および `tailwind.config.ts` を復旧し、Tailwind CSSが正しく機能するようにする。
*   **3.2.5. NextAuthセッション型、Prismaスキーマ、Nodemailer、Zod/React Hook Form、Providersコンポーネント、bcrypt の問題の根本解決と機能復旧**:
    *   各問題の具体的なエラーメッセージを再確認し、コードを本来の状態に戻しながら、一つずつ根本原因を解決していく。
    *   特に、`session.user.id` と `session.user.email` の使い分け、Prismaスキーマの `email` フィールドの `unique` 制約、NodemailerのAPI呼び出し、ZodスキーマとReact Hook Formの型整合性、`next-themes` のインポート、`bcrypt` の型エラーなどを詳細に調査し、修正する。
*   **3.2.6. アプリケーションの動作確認**:
    *   各機能が復旧するたびに、アプリケーションがVPS上で正しく動作するかを確認する。

## 4. 完了の定義

*   全ての無効化された機能が復旧し、アプリケーションが本来の機能を果たせるようになる。
*   `docker-compose build` がエラーなく成功する。
*   アプリケーションがVPS上で正常に起動し、外部からアクセス可能になる。
