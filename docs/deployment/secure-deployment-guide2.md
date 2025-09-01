# プレイブック: セキュア・デプロイメント手順

## 目的
機密情報（環境変数）を安全に管理し、本番環境へアプリケーションを正しくデプロイする。

## 前提条件
- VPSへのSSH接続情報が手元にあること。
- `.gitignore` で `.env*` ファイルが正しく除外設定されていること。

## 手順

### 1. 環境変数ファイルの準備
1.  ローカルPCで `.env.example` をコピーし、`.env.production` を作成する。
2.  `.env.production` 内の全ての値を**本番環境用**に設定する。
    - `NEXTAUTH_URL=https://uchinokiroku.com`
    - `DATABASE_URL=postgresql://...` (本番DBの情報)
3.  SCPやSFTPクライアントを使い、完成した `.env.production` をVPSのプロジェクトルート（`/root/uch` など）に安全にアップロードする。

### 2. アプリケーションのデプロイ
1.  ローカルPCで最新のソースコードを `git push` する。
2.  VPSにSSHでログインする。
3.  プロジェクトルートに移動し、`git pull` で最新のコードを取得する。
4.  以下のコマンドでDockerイメージをビルドし、コンテナを起動する。
    ```bash
    # イメージのビルド
    docker build -t ghcr.io/masa162/uch:latest .

    # 古いコンテナの停止と削除
    docker stop my-app-container || true
    docker rm my-app-container || true

    # 新しいコンテナの起動（--env-fileで本番設定を読み込む）
    docker run -d \
      --name my-app-container \
      --env-file .env.production \
      -p 3000:3000 \
      --restart unless-stopped \
      ghcr.io/masa162/uch:latest
    ```

### 3. 動作確認
1.  コンテナが正しく本番用の環境変数を読み込んでいるか確認する。
    ```bash
    docker exec my-app-container env | grep NEXTAUTH_URL
    ```
    - **期待される結果:** `NEXTAUTH_URL=https://uchinokiroku.com`
    - **NGな結果:** `NEXTAUTH_URL=http://localhost:3000`
2.  ブラウザで `https://uchinokiroku.com` にアクセスし、認証機能が正常に動作することを確認する。