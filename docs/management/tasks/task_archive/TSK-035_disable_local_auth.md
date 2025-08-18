# TSK-035: ローカル環境での認証完全除外

## 概要
本タスクは、ローカル開発環境において、あいことば認証、Google認証、LINE認証、メール認証を完全にバイパスし、開発者が認証なしでアプリケーションの主要機能にアクセスできるようにすることを目的とします。ログイン画面自体を表示させないようにします。

## 目的
- ローカル開発環境での認証フローの完全なスキップ
- 開発効率の向上
- 過去の認証問題の根本的な解決

## 具体的な変更点

### 1. `src/app/page.tsx` の修正
- `hasPassword` ステートの初期値を、開発環境 (`process.env.NODE_ENV === 'development'`) の場合は `true` に設定します。
- `if (!hasPassword)` の条件を、開発環境以外でのみ適用するように変更します。
- `if (!session)` の条件を、開発環境以外でのみ適用するように変更します。これにより、開発環境ではログイン画面が表示されず、常に認証済みとして扱われます。

### 2. `src/lib/auth.ts` の修正
- `authOptions.providers` を、開発環境 (`process.env.NODE_ENV === 'development'`) の場合は、常に認証成功するダミーのCredentialsProviderのみにします。これにより、Google、LINE、既存のCredentialsProviderは開発環境では無効になります。
- `authOptions.pages.signIn` を、開発環境 (`process.env.NODE_ENV === 'development'`) の場合は削除します。

## 実施手順
1.  `src/app/page.tsx` を修正する。
2.  `src/lib/auth.ts` を修正する。
3.  Next.jsアプリケーションを再起動し、動作を確認する。

## 完了基準
- ローカル開発環境でアプリケーションにアクセスした際、あいことば認証画面やログイン画面が表示されず、直接アプリケーションの主要機能にアクセスできること。
- Google、LINE、メール認証のいずれも要求されないこと。
