# GitHub Actions + VPS デプロイメント仕様書

## 1. 概要
本仕様書は、GitHub ActionsとConoHa VPSを使用したCI/CDパイプラインの構成と運用における重要な知見をまとめたものです。TSK-085での問題解決を通じて得られた教訓と対策を記録しています。

## 2. インフラ構成

### 2.1 基本情報
- **VPS**: ConoHa VPS
- **IP**: 160.251.136.92
- **ドメイン**: uchinokiroku.com
- **SSH接続**: root@160.251.136.92 (key: `/docs/関連資料/conohaVPS/key-2025-08-03-13-24.pem`)

### 2.2 Docker環境
- **Docker**: 28.3.3
- **Docker Compose**: v2.39.1
- **コマンド形式**: `docker compose` (スペース区切り)

## 3. デプロイメントフロー

### 3.1 GitHub Actions ワークフロー
**ファイル**: `.github/workflows/deploy.yml`

**重要ポイント**:
1. **イメージタグ**: `${{ github.sha }}`を使用してコミット固有のタグを生成
2. **レジストリ**: GitHub Container Registry (GHCR)
3. **VPS操作**: SSH経由でdocker-compose.prod.ymlを動的更新

### 3.2 本番環境ファイル構成
**VPS上のプロジェクトディレクトリ**: `/home/nakayama/uch`

必須ファイル:
- `docker-compose.prod.yml` (本番用設定)
- `.env.production` (環境変数)
- `uploads/` (永続化ディレクトリ)

## 4. トラブルシューティング実例

### 4.1 発生した問題（2025年8月20日）
**症状**: GitHub Actionsは成功するが、サイトの更新が反映されない

**根本原因**:
1. VPS上に`docker-compose.prod.yml`が存在しなかった
2. 古い`docker-compose.yml`が使用され続けていた
3. GitHubリポジトリとVPS上のファイル構成に乖離があった

### 4.2 診断手順
```bash
# 1. VPSへのSSH接続確認
ssh -i /path/to/key root@160.251.136.92

# 2. 稼働中コンテナの確認
docker ps -a

# 3. 使用中のComposeファイル特定
ls -la *.yml
cat docker-compose.yml

# 4. ネットワーク・ポート確認
ss -tlnp | grep :3000
ss -tlnp | grep :5432

# 5. アプリケーション健康状態確認
curl -s http://localhost:3000/api/health

# 6. コンテナログ確認
docker logs uch_app --tail 20
```

### 4.3 解決手順
1. **環境のバックアップと初期化**
   ```bash
   cd /home/nakayama
   mv uch uch_backup
   git clone https://github.com/masa162/uch.git
   ```

2. **設定ファイルの復元**
   ```bash
   cp uch_backup/.env.production uch/
   cp -r uch_backup/uploads uch/
   ```

3. **最新イメージでの再デプロイ**
   ```bash
   cd uch
   COMMIT_SHA=$(git rev-parse HEAD)
   sed -i "s|ghcr.io/masa162/uch:latest|ghcr.io/masa162/uch:${COMMIT_SHA}|" docker-compose.prod.yml
   docker compose -f docker-compose.prod.yml up -d
   ```

## 5. セキュリティ設定

### 5.1 ポートバインディング（重要）
**セキュア設定**:
```yaml
ports:
  - "127.0.0.1:3000:3000"  # アプリケーション
  - "127.0.0.1:5432:5432"  # データベース
```

**理由**: 外部から直接アクセスを防ぎ、Nginxリバースプロキシ経由のみ許可

### 5.2 Nginx設定
**ファイル**: `/etc/nginx/sites-available/uchinokiroku.com`
```nginx
location / {
    proxy_pass http://localhost:3000;
    # 各種プロキシヘッダー設定
}
```

## 6. 運用上の注意事項

### 6.1 デプロイ時の確認項目
- [ ] GitHub Actionsワークフローが成功している
- [ ] VPS上で最新コミットSHAのイメージが使用されている
- [ ] アプリケーション健康状態が"healthy"
- [ ] 外部からHTTPSアクセスできる

### 6.2 定期メンテナンス
```bash
# 不要なDockerイメージの削除
docker image prune -f

# ディスク使用量確認
df -h

# コンテナ状態確認
docker ps
docker compose -f docker-compose.prod.yml logs --tail 50
```

## 7. 緊急時対応

### 7.1 サービス停止時の復旧手順
1. **コンテナ状態確認**
   ```bash
   docker ps -a
   docker compose -f docker-compose.prod.yml ps
   ```

2. **ログ確認**
   ```bash
   docker logs uch_app --tail 50
   docker logs uch_db --tail 50
   ```

3. **サービス再起動**
   ```bash
   docker compose -f docker-compose.prod.yml restart
   ```

4. **完全リビルド（最終手段）**
   ```bash
   docker compose -f docker-compose.prod.yml down
   docker compose -f docker-compose.prod.yml up -d --force-recreate
   ```

### 7.2 データベース関連トラブル
**症状**: アプリが503エラー、ヘルスチェック失敗

**対処**:
```bash
# DB接続確認
docker exec uch_db pg_isready -U uch_user -d uch_prod

# DB手動接続テスト
docker exec -it uch_db psql -U uch_user -d uch_prod -c "SELECT 1;"
```

## 8. ファイル構成管理

### 8.1 重要なファイルの同期
**問題**: GitHubリポジトリとVPS上のファイルが乖離する

**対策**:
- デプロイ前に`git pull`を必ず実行
- 重要な設定ファイルはバージョン管理対象にする
- 環境固有ファイル（`.env.production`）は手動管理

### 8.2 推奨バックアップ手順
```bash
# 設定ファイルのバックアップ
cp .env.production .env.production.backup.$(date +%Y%m%d)

# データベースダンプ
docker exec uch_db pg_dump -U uch_user uch_prod > backup_$(date +%Y%m%d).sql
```

## 9. 今後の改善予定

### 9.1 短期的改善
- [ ] データベースの外部サービス化（RDS等）
- [ ] アップロードファイルのS3移行
- [ ] モニタリングツール導入

### 9.2 長期的改善
- [ ] Kubernetesへの移行検討
- [ ] Multi-AZ構成
- [ ] CDN導入

## 10. 参考情報

### 10.1 関連ドキュメント
- [TSK-085作業指示書](../management/tasks/TSK-085_vps_prod_env_optimization.md)
- [ConoHa VPSメモ](../関連資料/conohaVPS/conohavps_memo.md)

### 10.2 有用なコマンド集
```bash
# コンテナリソース使用量確認
docker stats

# ネットワーク確認
docker network ls
docker network inspect uch_default

# システムリソース確認
free -h
df -h
uptime
```

---
**更新履歴**
- 2025-08-20: 初版作成（TSK-085問題解決に基づく）
- 
---
**作成者**: Claude Code
**最終更新**: 2025-08-20