### 作業指示書: TSK-083 本番デプロイプロセスの恒久対策

**担当:** Claude Code

**優先度: 最高**

**概要:**
本番環境へのデプロイが反映されない根本原因が、デプロイ時に意図せず開発用の `docker-compose.yml` が使用されていたことだと判明しました。
この問題を恒久的に解決するため、デプロイワークフローを修正し、必ず本番用の `docker-compose.prod.yml` が使用されるようにします。

---

#### **タスク: デプロイワークフロー (`deploy.yml`) の修正**

**目的:**
VPS上で `docker-compose` コマンドを実行する際に、本番用の設定ファイル (`docker-compose.prod.yml`) を明示的に指定する。

**対象ファイル:**
`.github/workflows/deploy.yml`

**具体的な指示:**
`Deploy to VPS` ステップの `script` 部分にある `docker-compose up` コマンドに、`-f docker-compose.prod.yml` オプションを追加してください。

**変更前 (抜粋):**
```yaml
            docker-compose up -d --force-recreate
```

**変更後 (抜粋):**
```yaml
            docker-compose -f docker-compose.prod.yml up -d --force-recreate
```
