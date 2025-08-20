### 作業指示書: TSK-082 本番デプロイプロセスの修正

**担当:** Claude Code

**概要:**
本番環境へのデプロイが確実に反映されない問題を解決するため、Dockerイメージのタグ付けとデプロイ手順を、より堅牢なコミットSHAベースの方法に変更します。

---

#### **タスク1: `docker-compose.prod.yml` の修正**

**目的:**
`docker-compose` が環境変数を通じて動的にDockerイメージのタグを指定できるようにする。

**対象ファイル:**
`docker-compose.prod.yml`

**具体的な指示:**
`image` の指定を、環境変数 `DOCKER_IMAGE_TAG` を受け取れるように変更してください。環境変数が指定されていない場合は、フォールバックとして `latest` を使用するようにします。

**変更前:**
```yaml
version: '3.8'
services:
  uch:
    # buildコンテキストを削除し、GHCRのイメージを直接指定
    image: ghcr.io/masayuki-nakayama/uch:latest
    # ... (以下略)
```

**変更後:**
```yaml
version: '3.8'
services:
  uch:
    # buildコンテキストを削除し、GHCRのイメージを直接指定
    image: ghcr.io/masayuki-nakayama/uch:${DOCKER_IMAGE_TAG:-latest}
    # ... (以下略)
```

---

#### **タスク2: デプロイワークフロー (`deploy.yml`) の修正**

**目的:**
デプロイ時に、ビルドしたイメージのコミットSHAタグを明示的に使用して、VPS上でコンテナを起動するように変更する。

**対象ファイル:**
`.github/workflows/deploy.yml`

**具体的な指示:**
`Deploy to VPS` ステップの `script` 部分を、以下の内容に置き換えてください。

**変更点:**
- `docker-compose pull` を `docker pull` に変更し、コミットSHAタグで直接イメージをpullします。
- `DOCKER_IMAGE_TAG` 環境変数を設定します。
- `docker-compose up` コマンドは変更ありませんが、上記2点の変更により、新しいイメージで起動されるようになります。

**変更前:**
```yaml
          script: |
            export PROJECT_DIR="/home/nakayama/uch"
            cd $PROJECT_DIR
            echo ${{ secrets.CR_PAT }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin
            docker-compose pull
            docker-compose up -d --force-recreate
            docker image prune -f
```

**変更後:**
```yaml
          script: |
            export PROJECT_DIR="/home/nakayama/uch"
            export DOCKER_IMAGE_TAG=${{ github.sha }}
            cd $PROJECT_DIR
            echo ${{ secrets.CR_PAT }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin
            docker pull ghcr.io/${{ github.repository }}:${DOCKER_IMAGE_TAG}
            docker-compose up -d --force-recreate
            docker image prune -f
```
