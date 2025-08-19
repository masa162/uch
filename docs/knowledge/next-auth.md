# 認証関連 (NextAuth) 知見集

## 2025年8月19日: 本番環境OAuth認証エラー調査指示書作成 (TSK-068) からの知見

### 本番環境OAuth設定の分析結果

#### 現在の設定状況
- **認証プロバイダー**: 本番環境でGoogle/LINEのOAuthプロバイダーが有効
- **開発環境**: 認証スキップ機能が正常に動作し、ダミーユーザーでの開発が可能
- **環境変数**: `.env.local`にテンプレート値が設定されているが、本番環境の実際の値は別途設定が必要

#### 想定される問題領域
1. **環境変数の設定不備**: 本番環境で`NEXTAUTH_URL`、OAuth Client ID/Secretが正しく設定されていない可能性
2. **コールバックURL不一致**: OAuthプロバイダー側で`https://uchinokiroku.com/api/auth/callback/[provider]`が正しく登録されていない可能性
3. **HTTPS/SSL証明書問題**: 本番ドメインのSSL設定に問題がある可能性

#### 調査指示書の作成方針
設計思想の「きぼう」（フレンドリー、あたたかさ、ゆるさ、親近感）に基づき、技術的な調査手順を段階的で分かりやすく整理。エラー解決後も「おかえりなさい 🏠」の温かい体験を提供できるよう配慮した調査指示書を作成した。

#### 実際のエラー分析結果（2025年8月19日追記）
- **エラー**: `OAuthSignin` エラーが `/api/auth/error` で発生
- **Google OAuth URL分析**: 認証開始は正常（Client ID: `928722754697-albetj2ltu754a5eou52mrailmcsi0p8.apps.googleusercontent.com`）
- **問題箇所特定**: Google Cloud ConsoleのリダイレクトURI設定またはコールバック処理時の環境変数不足が原因
- **修正方針**: Google Cloud Console設定確認 → 本番環境変数確認 → 段階的修正の具体的指示書を作成

## 2025年8月18日: 記事編集機能の動作確認と改善 (TSK-051) からの知見

### 開発環境認証スキップのAPIへの適用
- **問題:** 開発環境で認証スキップが有効な場合でも、記事の更新（PUT）や削除（DELETE）API操作が認証エラー（401 Unauthorized）となっていた。
- **原因:** 記事詳細API (`src/app/api/articles/[slug]/route.ts`) のPUT/DELETEメソッドにおいて、開発環境での認証スキップロジックが適用されていなかったため。
- **解決策:** `src/app/api/articles/[slug]/route.ts` のPUT/DELETEメソッドにも、POSTメソッドと同様に開発環境での認証スキップロジック（ダミーユーザーの適用）を追加した。これにより、開発環境での記事の更新・削除操作が認証なしで可能になった。

## 2025年8月18日: プロフィール表示機能の確認と実装 (TSK-050) からの知見

### 1. 概要
プロフィール機能の実装において、API、UI、ナビゲーションを統合的に実装した。

### 2. 主要な実装内容
- **プロフィールAPI:** `/api/profile` にGET/PUTエンドポイントを実装。`next-auth` の `getServerSession` を利用して認証ユーザーを特定。
- **プロフィールページ:** `useAuth` フックからユーザー情報を取得し、インライン編集機能を実装。
- **ナビゲーション統合:** `Sidebar` と `MobileMenu` に `useAuth` フックから取得したユーザー情報と `signOut` 関数を統合し、ドロップダウンメニューなどを実装。

## 2025年8月18日: 記事一覧表示の失敗原因調査と修正 (TSK-049) からの知見

### 認証コンテキストのローディング問題
- **問題:** `AuthContext` が無限ローディング状態になり、`articles` ページが記事の取得を開始できない。特に `NEXT_PUBLIC_SKIP_AUTH=true` が設定されている開発環境で顕著だった。
- **原因:** `AuthContext.tsx` 内の `loading` フラグが、`NEXT_PUBLIC_SKIP_AUTH=true` の場合に `false` に解決されず、常に `true` のままになっていたため。
- **解決策:**
    1.  `src/contexts/AuthContext.tsx` を修正し、`NEXT_PUBLIC_SKIP_AUTH` 環境変数が `true` の場合に `loading` フラグが確実に `false` になるようにロジックを改善した。
    2.  `src/app/articles/page.tsx` の `useEffect` フック内で、`useAuth()` から取得した `authLoading` フラグが `false` になった後にのみ記事のフェッチを開始するように修正した。
- **教訓:**
    - 認証コンテキストのようなグローバルな状態管理を行うコンポーネントでは、ローディング状態のハンドリングが非常に重要である。特に、開発環境でのスキップ設定などが本番環境の挙動に影響を与えないよう、環境変数の参照と状態遷移のロジックを堅牢に設計する必要がある。

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

3.  **TypeScript型エラー**
    *   **症状**: 60件以上のTypeScriptエラーが発生
    *   **原因**: NextAuth.jsの型定義が不適切、セッション型の拡張が不足
    *   **対応策**: `src/lib/auth.ts` に NextAuth.jsの型定義の拡張を追加。`@types/bcrypt` をインストール。

### 認証フローの最適化

-   **開発環境でのダミー認証**: `src/lib/auth.ts` にて、開発環境 (`process.env.NODE_ENV === 'development'`) の場合に `CredentialsProvider` が常に認証成功を返すように修正。これにより、開発効率が向上。

## 2025年8月18日: 記事CRUD機能実装 (TSK-040) からの知見

### 認証コンテキストの不統一
- **問題:** ページやコンポーネントによって、NextAuth由来の `useSession` と、カスタムコンテキストの `useAuth` が混在していた。これにより、開発環境の認証スキップが一部で機能せず、「ログインが必要です」エラーが発生した。
- **解決策:** プロジェクト内の認証状態の取得を、すべてカスタムの `useAuth()` フックに統一した。
- **教訓:** 認証のような横断的な関心事は、プロジェクト全体で単一の信頼できる情報源（Single Source of Truth）から取得するべきである。複数の認証管理方法の混在は、混乱とバグの温床となる。

