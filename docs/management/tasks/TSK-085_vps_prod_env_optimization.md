# TSK-085: VPS本番環境のDocker設定見直しと最適化

## 1. タスクIDとタイトル
- **タスクID**: TSK-085
- **タイトル**: VPS本番環境のDocker設定見直しと最適化（イメージタグ、DB公開、Composeファイル）

## 2. 目的
VPS上の本番環境におけるDockerコンテナの運用を、よりセキュアで再現性の高い状態に改善します。具体的には、Dockerイメージのタグ付けの適正化、データベースの外部公開停止、および本番環境に最適化されたDocker Compose設定の適用を目指します。

## 3. 現状分析の要約
現在のVPS環境では以下の問題が確認されています。
- Dockerイメージが `:latest` タグで運用されており、デプロイの再現性が低い。
- PostgreSQLコンテナのポート (`5432`) が外部に公開されており、セキュリティリスクが高い。
- 開発用の `docker-compose.yml` が本番環境で流用されている可能性があり、本番運用に不適切な設定が含まれている。

## 4. 具体的な作業内容

### 4.1. `docker-compose.prod.yml` の作成/更新

以下の内容で `/Users/nakayamamasayuki/Documents/GitHub/uch/docker-compose.prod.yml` ファイルを作成または更新してください。

```yaml
services:
  # Next.js Application
  app:
    image: ghcr.io/masa162/uch:<COMMIT_SHA> # ここをデプロイするコミットSHAタグに置き換えてください
    container_name: uch_app
    restart: always
    environment:
      - NODE_ENV=production
      # 本番環境に必要な環境変数をここに記述してください。
      # 例: DATABASE_URL=postgresql://user:password@your_db_host:5432/your_db_name
      # 例: NEXTAUTH_SECRET=your_nextauth_secret_from_env
      # 例: NEXTAUTH_URL=https://yourdomain.com
      # .env.production ファイルの内容をここに移行するか、デプロイ時に環境変数として渡すことを検討してください。
    ports:
      - "127.0.0.1:3000:3000" # Nginxからのみアクセス可能にするため、ローカルホストにバインド
    volumes:
      - ./uploads:/app/uploads # 必要に応じて永続化ボリュームを設定

networks:
  default:
    driver: bridge
```

**注意点:**
- `<COMMIT_SHA>` の部分は、実際にデプロイするGitのコミットハッシュに置き換えてください。
- `environment` セクションには、本番環境で必要なすべての環境変数（例: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` など）を正確に記述してください。これらの値は、`.env.production` ファイルから移行するか、デプロイプロセスで安全に注入されるように設定してください。

### 4.2. デプロイフローの変更に関する指示

上記の `docker-compose.prod.yml` の変更に伴い、デプロイフロー（特にGitHub Actionsの `.github/workflows/deploy.yml`）の修正が必須となります。

**GitHub Actions (`.github/workflows/deploy.yml`) で行うべき主な変更点:**
1.  Dockerイメージをビルドする際に、GitのコミットSHAをタグとして付与するように変更してください。
2.  ビルドしたイメージをGitHub Container Registry (GHCR) にプッシュしてください。
3.  VPSにSSH接続し、新しいコミットSHAタグのイメージをプルし、`docker-compose -f docker-compose.prod.yml up -d` コマンドでコンテナを再作成するように変更してください。

## 5. 確認事項
- `docker-compose.prod.yml` が正しく配置され、本番環境に最適化された内容になっているか。
- `app` サービスが `127.0.0.1:3000` でリッスンしており、外部から直接アクセスできないことを確認する。
- Nginxのリバースプロキシ設定が `127.0.0.1:3000` に向いていることを確認する。
- デプロイフローがコミットSHAタグを使用し、再現性のあるデプロイが可能になっているか。
- 本番環境でアプリケーションが正常に動作することを確認する。

## 6. 特記事項
- データベースは本番環境では独立したサービスとして運用することを推奨します。今回の変更では `docker-compose.prod.yml` からDBサービスを削除しましたが、実際のDB接続先は `DATABASE_URL` 環境変数で適切に設定してください。
- `uploads` ボリュームの永続化については、将来的にS3などのオブジェクトストレージサービスの利用を検討してください。
