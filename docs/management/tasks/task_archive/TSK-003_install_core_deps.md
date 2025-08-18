# タスク詳細: TSK-003

**ID**: `TSK-003`
**タイトル**: コアライブラリの導入
**ステータス**: 未着手
**優先度**: 高

## 1. タスクの目的

旧プロジェクトで利用されていたライブラリ群を新プロジェクトに導入し、認証、UI、データ検証などの基本機能を実装するための土台を整える。

## 2. 手順

以下のコマンドを、プロジェクトのルートディレクトリで実行してください。

**本番環境用ライブラリ:**
```bash
npm install @next-auth/prisma-adapter next-auth zod bcrypt resend react-hook-form @hookform/resolvers date-fns lucide-react shadcn-ui class-variance-authority clsx
```

**開発環境用ライブラリ:**
```bash
npm install -D tailwindcss postcss autoprefixer
```

*注意: `shadcn-ui`の導入には、追加で`npx shadcn-ui@latest init`の実行が必要になる場合があります。一旦上記コマンドを実行し、エラーが出るようであればPMに報告してください。*

## 3. 完了の定義

*   `package.json` に上記のライブラリが追加されていること。
*   `package-lock.json` が更新されていること。

## 4. 検証方法

PMが `package.json` の内容を読み取り、ライブラリが追加されていることを確認する。
