# TSK-068: 本番環境でのLINE/Googleログインエラーの調査と修正

## 問題の概要
本番環境 (https://uchinokiroku.com/) にて、LINEおよびGoogleアカウントでのログインがエラーとなる。

## 再現手順
1.  本番環境 (https://uchinokiroku.com/) のログインページ (`/auth/signin`) にアクセスする。
2.  「LINEでログイン」または「Googleでログイン」ボタンをクリックする。
3.  認証プロバイダーのページにリダイレクトされた後、エラーが発生し、ログインが完了しない。

## 考えられる原因
*   OAuth設定の不備: 環境変数 (`NEXTAUTH_URL`, `LINE_CLIENT_ID`, `LINE_CLIENT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` など) の設定ミス、または本番環境でのOAuthプロバイダー側の設定（リダイレクトURIなど）の不備。
*   NextAuth.jsの設定問題: `src/lib/auth.ts` または `next.config.js` 内のNextAuth.js関連設定が本番環境と合致していない。
*   ネットワーク/ファイアウォールの問題: 認証プロバイダーからのコールバックがサーバーに到達できない。
*   データベースの問題: ユーザー情報の保存に失敗している。

## 調査計画
1.  本番環境のブラウザのデベロッパーツールを開き、ネットワークタブでOAuth認証フロー中のリクエストとレスポンスを確認する。特に、認証プロバイダーからのコールバックURLと、その後のサーバー側の挙動に注目する。
2.  サーバー側のログを確認し、認証関連のエラーメッセージや警告がないか確認する。
3.  本番環境の環境変数 (`.env.production` またはデプロイ環境の設定) を確認し、OAuth関連のキーやシークレットが正しく設定されているか検証する。
4.  LINE DevelopersコンソールおよびGoogle Cloud Consoleで、本番環境のURLがリダイレクトURIとして正しく登録されているか確認する。
5.  `src/lib/auth.ts` のNextAuth.js設定を確認し、プロバイダーの設定が正しいか検証する。
