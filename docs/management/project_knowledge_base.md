# プロジェクト知見集

## 概要
本ドキュメントは、プロジェクト開発・運用中に得られた知見、ベストプラクティス、推奨事項などを集約するものです。

## 2025年8月17日: レガシー資産クリーンアップからの推奨事項

### 1. 依存関係の統一
- `bcrypt` と `bcryptjs` の使い分けを統一する。
- `nodemailer` と `resend` の使い分けを明確化する。

### 2. 設定変数の整理
- `LINE_CLIENT_ID` と `LINE_CHANNEL_ID` のような重複する設定変数を解消し、一貫性を持たせる。

### 3. 定期メンテナンスの実施
- 月1回の `docker builder prune` 実行を習慣化し、ビルドキャッシュを定期的にクリーンアップする。
- 開発環境の定期的なクリーンアップ（一時ファイル、ログファイル、未使用の依存関係など）を実施する。

## 2025年8月17日: ビルドエラー修正と環境整備の知見

### 解決した問題と対応策

1.  **ディレクトリ構造の競合解決**:
    *   **問題**: 古い `app/` ディレクトリが `src/app/` と競合していた。
    *   **対応策**: 古い `app/` ディレクトリを削除。

2.  **TypeScriptパス設定の修正**:
    *   **問題**: `tsconfig.json` の `@/*` パスが `"./*"` となっており、`@/components/PasswordGate` などのインポートエラーが発生していた。
    *   **対応策**: `@/*` パスを `"./src/*"` に修正。

3.  **Layout構成の修正**:
    *   **問題**: `src/app/layout.tsx` の構成が不適切で、`useSession` エラーが発生していた。
    *   **対応策**: `src/app/layout.tsx` を `Providers` コンポーネントでラップし、`SessionProvider` を追加。

4.  **CSS設定の調整**:
    *   **問題**: TailwindCSS v4 の設定問題。
    *   **対応策**: 一時的にベーシックCSSで解決し、PostCSS設定を最適化。

5.  **NextAuth API設定**:
    *   **問題**: NextAuth の基本APIエンドポイントが未設定。
    *   **対応策**: `src/app/api/auth/[...nextauth]/route.ts` を作成し、NextAuth の基本APIエンドポイントを設定。

6.  **環境変数の適用**:
    *   **問題**: 環境変数が正しく反映されない可能性。
    *   **対応策**: `NEXT_PUBLIC_SITE_PASSWORD="きぼう"` が正常に設定され反映されたことを確認。

### 現在の状態

-   アプリケーション: `http://localhost:3000` で正常稼働中。
-   HTTPステータス: 200 OK。
-   サイトパスワード: "きぼう"で設定済み。
-   開発サーバー: 正常にコンパイル完了。

## 2025年8月17日: NextAuth認証システム復旧作業の知見

### 作業概要
Next.jsアプリケーションで発生していた認証関連のエラー（ハイドレーションエラー、無限ループ、500エラー）を解決し、NextAuth.jsの認証システムを正常に動作させる作業を実施しました。

### 発生していた問題と解決策

1.  **ハイドレーションエラー**
    *   **症状**: `Hydration failed because the initial UI does not match what was rendered on the server`
    *   **原因**: `useSession` フックの初期状態とサーバーサイドレンダリングの不一致
    *   **対応策**: `src/app/page.tsx` および `src/components/AuthenticatedLayout.tsx` に `mounted` 状態を追加し、クライアントサイドでのみレンダリングされるように修正。

2.  **認証の無限ループ**
    *   **症状**: ログイン後に `http://localhost:3000/auth/login?callbackUrl=...` に自己回帰
    *   **原因**: NextAuth.jsの `NEXTAUTH_URL` 環境変数の設定ミスとポート不一致、および手動リダイレクトの競合
    *   **対応策**: `NEXTAUTH_URL=http://localhost:3000` を設定。`src/components/AuthForm.tsx` の `signIn` 関数で `redirect: true` に変更し手動リダイレクトを削除。`src/components/AuthenticatedLayout.tsx` の手動リダイレクトを削除。`src/lib/auth.ts` に `callbacks.redirect` を追加し、認証成功後のリダイレクトを明示的に制御。

3.  **500 Internal Server Error**
    *   **症状**: 静的ファイル（JavaScriptチャンク）が見つからない
    *   **原因**: `next.config.js` の `output: 'standalone'` 設定が開発環境で問題を引き起こす
    *   **対応策**: `next.config.js` の `output: 'standalone'` を開発環境用にコメントアウト。

4.  **TypeScript型エラー**
    *   **症状**: 60件以上のTypeScriptエラーが発生
    *   **原因**: NextAuth.jsの型定義が不適切、セッション型の拡張が不足
    *   **対応策**: `src/lib/auth.ts` に NextAuth.jsの型拡張を追加。`@types/bcrypt` をインストール。

### 認証フローの最適化

-   **開発環境でのダミー認証**: `src/lib/auth.ts` にて、開発環境 (`process.env.NODE_ENV === 'development'`) の場合に `CredentialsProvider` が常に認証成功を返すように修正。これにより、開発効率が向上。

### 技術的な改善点

1.  **セッション状態の安全な処理**: `mounted` 状態によるクライアントサイドでのみのレンダリング、セッション状態の段階的なチェック、エラー状態の適切な処理。
2.  **認証フローの最適化**: NextAuth.jsの標準的な認証フローへの統一、手動リダイレクトの削除、コールバックURLの適切な設定。
3.  **型安全性の向上**: NextAuth.jsの型定義の拡張、セッションとユーザー情報の型安全性確保、TypeScriptエラーの完全解決。

### 現在の動作確認状況

-   アプリケーション: `http://localhost:3000` で正常稼働中。
-   認証システム: NextAuth.jsの正常動作、開発環境でのダミーログイン機能、セッション管理の正常動作、ログアウト機能。
-   ユーザーインターフェース: 認証状態の表示、ログイン/ログアウトフォーム、認証済みユーザー向けダッシュボード、ナビゲーションバー。
-   開発環境: ポート3000での正常起動、ホットリロードの正常動作、TypeScriptエラーの解決、ビルドプロセスの正常化。