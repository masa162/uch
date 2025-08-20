### 作業指示書: TSK-084 デプロイプロセスの最終FIX

**担当:** Claude Code

**優先度: 最高**

**概要:**
デプロイが反映されない問題の根本原因である「VPS上の設定ファイルが最新でない」という問題を解決するため、デプロイワークフローに `git pull` を追加し、常に最新の状態でデプロイが実行されるようにします。

---

#### **タスク: デプロイワークフロー (`deploy.yml`) の最終修正**

**目的:**
デプロイ実行前に、VPS上のプロジェクトリポジトリをGitHubの最新の状態に同期させる。

**対象ファイル:**
`.github/workflows/deploy.yml`

**具体的な指示:**
`Deploy to VPS` ステップの `script` 部分の、`cd $PROJECT_DIR` の直後に `git pull origin main` を追加してください。

**変更前(イメージ):**
```yaml
          script: |
            export PROJECT_DIR="/home/nakayama/uch"
            export DOCKER_IMAGE_TAG=${{ github.sha }}
            cd $PROJECT_DIR
            # ここに git pull がない
            echo ${{ secrets.CR_PAT }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin
            docker pull ghcr.io/${{ github.repository }}:${DOCKER_IMAGE_TAG}
            docker-compose -f docker-compose.prod.yml up -d --force-recreate
            docker image prune -f
```

**変更後:**
```yaml
          script: |
            export PROJECT_DIR="/home/nakayama/uch"
            export DOCKER_IMAGE_TAG=${{ github.sha }}
            cd $PROJECT_DIR
            git pull origin main
            echo ${{ secrets.CR_PAT }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin
            docker pull ghcr.io/${{ github.repository }}:${DOCKER_IMAGE_TAG}
            docker-compose -f docker-compose.prod.yml up -d --force-recreate
            docker image prune -f
```
