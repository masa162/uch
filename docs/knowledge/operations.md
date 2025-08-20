# 運用ナレッジベース

本ドキュメントは「うちのきろく」アプリケーションの運用における実践的なナレッジ、トラブルシューティング、ベストプラクティスをまとめています。

## 🎯 目的

- 運用中に発生した問題と解決策の蓄積
- 繰り返し作業の効率化
- ナレッジの属人化防止
- 新規メンバーのオンボーディング支援

---

## 🔧 日常運用

### よく使うコマンド集

#### システム状況確認
```bash
# 一括状況確認（推奨）
./scripts/dashboard.sh

# コンテナ状況
docker ps
docker compose -f docker-compose.prod.yml ps

# システムリソース
htop
df -h
free -h

# ネットワーク状況
ss -tlnp | grep -E ':80|:443|:3000|:5432'
```

#### ログ確認
```bash
# アプリケーションログ
docker logs uch_app --tail 100 -f

# データベースログ
docker logs uch_db --tail 50

# システムログ
journalctl -u docker --tail 50
tail -f /var/log/uch/*.log
```

#### 緊急時操作
```bash
# サービス再起動
docker compose -f docker-compose.prod.yml restart

# 完全再起動（設定変更後）
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d

# ヘルスチェック
curl http://localhost:3000/api/health
```

### 日次チェックリスト

- [ ] ダッシュボードで全体状況確認
- [ ] エラーログの有無確認
- [ ] ディスク使用量確認（85%以下）
- [ ] バックアップ成功確認
- [ ] SSL証明書有効期限確認

---

## 🚨 トラブルシューティング

### よくある問題と解決策

#### 1. アプリケーションが応答しない

**症状:**
- HTTP 503エラー
- ヘルスチェック失敗
- タイムアウトエラー

**確認手順:**
```bash
# 1. コンテナ状況確認
docker ps -a

# 2. アプリケーションログ確認
docker logs uch_app --tail 50

# 3. プロセス確認
docker exec uch_app ps aux
```

**解決策:**
```bash
# 軽微な場合: 再起動
docker compose -f docker-compose.prod.yml restart app

# 重度の場合: 完全再起動
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

#### 2. データベース接続エラー

**症状:**
- "database connection failed"
- Prismaエラー
- アプリケーション起動失敗

**確認手順:**
```bash
# 1. DB コンテナ状況確認
docker inspect uch_db | grep -E "Status|Health"

# 2. 手動接続テスト
docker exec -it uch_db psql -U uch_user -d uch_prod -c "SELECT 1;"

# 3. ネットワーク確認
docker network ls
docker inspect uch_default
```

**解決策:**
```bash
# DB コンテナ再起動
docker compose -f docker-compose.prod.yml restart db

# 接続設定確認
grep DATABASE_URL docker-compose.prod.yml
```

#### 3. ディスク容量不足

**症状:**
- デプロイ失敗
- "No space left on device"
- コンテナ起動失敗

**確認手順:**
```bash
# ディスク使用量確認
df -h
du -sh /var/lib/docker/

# 不要ファイル特定
docker system df
docker images --filter "dangling=true"
```

**解決策:**
```bash
# Docker クリーンアップ（推奨）
docker system prune -f
docker image prune -f

# より aggressive な削除
docker system prune -a -f

# ログローテーション
sudo logrotate -f /etc/logrotate.d/uch
```

#### 4. メモリ不足

**症状:**
- OOMエラー
- アプリケーション異常終了
- システム応答遅延

**確認手順:**
```bash
# メモリ使用量確認
free -h
docker stats

# OOM 履歴確認
dmesg | grep -i "killed process"
journalctl -k | grep -i "memory"
```

**解決策:**
```bash
# 一時的対処
sync && echo 3 > /proc/sys/vm/drop_caches

# コンテナリソース制限調整（docker-compose.prod.yml）
# memory: "512M" -> "1G"
```

#### 5. SSL証明書期限切れ

**症状:**
- HTTPS接続エラー
- ブラウザセキュリティ警告

**確認手順:**
```bash
# 証明書有効期限確認
openssl x509 -in /etc/letsencrypt/live/uchinokiroku.com/cert.pem -text -noout | grep "Not After"

# certbot 状況確認
sudo certbot certificates
```

**解決策:**
```bash
# 手動更新
sudo certbot renew --nginx

# 強制更新
sudo certbot renew --force-renewal --nginx

# Nginx 再起動
sudo systemctl reload nginx
```

---

## 🔄 デプロイ関連

### 正常デプロイの流れ

1. **GitHub Actions 実行確認**
   - Actions タブでワークフロー成功を確認
   - 各フェーズの実行時間をチェック

2. **VPS での確認**
   ```bash
   # 新しいイメージタグ確認
   docker images | grep uch
   
   # コンテナ更新確認  
   docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"
   ```

3. **動作確認**
   ```bash
   # ヘルスチェック
   curl http://localhost:3000/api/health
   
   # 主要ページ確認
   curl -I https://uchinokiroku.com/
   curl -I https://uchinokiroku.com/essays
   ```

### デプロイ失敗時の対処

#### GitHub Actions失敗

**確認ポイント:**
- テスト失敗: ローカルで同様のテスト実行
- ビルド失敗: 依存関係の問題
- デプロイ失敗: VPS の接続性・権限問題

**解決策:**
```bash
# ローカルで問題再現
npm test
npm run build

# VPS 接続確認
ssh -i key.pem root@160.251.136.92 "echo 'Connection OK'"
```

#### 自動ロールバック発生

**確認手順:**
```bash
# バックアップディレクトリ確認
ls -la /home/nakayama/uch/backups/

# 前回の設定と比較
diff /home/nakayama/uch/backups/[最新]/docker-compose.prod.yml ./docker-compose.prod.yml
```

**手動修正:**
```bash
# 安全なバージョンに手動切り戻し
SAFE_COMMIT="7b65444313be29ecead7a65b8f5373a2ee91eec1"
sed -i "s|ghcr.io/masa162/uch:[^[:space:]]*|ghcr.io/masa162/uch:${SAFE_COMMIT}|g" docker-compose.prod.yml
docker compose -f docker-compose.prod.yml up -d
```

---

## 📊 パフォーマンス最適化

### 監視すべき指標

#### システム指標
- **CPU使用率**: 80%以下を維持
- **メモリ使用率**: 85%以下を維持
- **ディスク使用率**: 80%以下を維持
- **ロードアベレージ**: CPUコア数以下

#### アプリケーション指標
- **レスポンス時間**: 2秒以下
- **エラー率**: 1%以下
- **データベース接続数**: 80%以下
- **アクティブセッション数**

### 最適化テクニック

#### Dockerイメージ最適化
```dockerfile
# マルチステージビルドでサイズ削減
FROM node:18-alpine as builder
# ... build stages

FROM node:18-alpine as runner
COPY --from=builder /app/.next ./.next
```

#### データベース最適化
```sql
-- 定期的なVACUUM実行
VACUUM ANALYZE;

-- インデックス確認
SELECT schemaname, tablename, indexname, tablespace, indexdef 
FROM pg_indexes 
WHERE tablename = 'Article';
```

#### キャッシュ戦略
```yaml
# nginx.conf でのキャッシュ設定
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## 🛡️ セキュリティベストプラクティス

### 日常的なセキュリティ確認

```bash
# fail2ban 状況確認
sudo fail2ban-client status
sudo fail2ban-client status sshd

# UFW ファイアウォール確認
sudo ufw status verbose

# 不審なプロセス確認
ps aux | grep -v -E "^\s*(root|nakayama|www-data)"

# ログイン履歴確認
last | head -10
```

### セキュリティインシデント対応

#### 1. 不審なアクセスを検知

**確認手順:**
```bash
# アクセスログ確認
sudo tail -100 /var/log/nginx/access.log

# fail2ban ログ確認
sudo journalctl -u fail2ban --tail 50

# 現在の接続確認
ss -tuln
```

**対処法:**
```bash
# 特定IPの遮断
sudo ufw deny from [suspicious-ip]

# fail2ban の手動バン
sudo fail2ban-client set sshd banip [suspicious-ip]
```

#### 2. システム侵害の疑い

**緊急対応:**
```bash
# ネットワーク切断
sudo ufw --force enable
sudo ufw default deny incoming
sudo ufw default deny outgoing

# プロセス確認
sudo netstat -tulpn
sudo ps aux --forest
```

---

## 📝 運用改善のフィードバック

### 問題報告テンプレート

```markdown
## 発生日時
YYYY-MM-DD HH:MM:SS

## 問題の概要
[簡潔な問題の説明]

## 影響範囲
- [ ] ユーザーアクセスに影響
- [ ] 管理機能に影響  
- [ ] データに影響
- [ ] その他: [詳細]

## エラー内容
[エラーメッセージ・ログ]

## 対処内容
1. [実施した対処]
2. [結果]

## 根本原因
[判明した場合]

## 再発防止策
[提案があれば]
```

### 改善提案の記録

**定期レビュー項目:**
- [ ] 頻繁に発生する問題の自動化
- [ ] 監視項目の追加・調整
- [ ] アラート閾値の見直し
- [ ] バックアップ戦略の改善
- [ ] ドキュメントの更新

---

## 🔗 関連リソース

### 重要なリンク
- **監視ダッシュボード**: `./scripts/dashboard.sh`
- **バックアップ管理**: `./scripts/backup.sh`
- **ヘルスチェック**: `./monitoring/health-check.sh`

### 外部ドキュメント
- [Docker公式ドキュメント](https://docs.docker.com/)
- [PostgreSQL管理ガイド](https://www.postgresql.org/docs/current/admin.html)
- [Nginx設定リファレンス](https://nginx.org/en/docs/)

### 緊急時連絡先
- **VPSプロバイダー**: ConoHa サポート
- **開発チーム**: [内部連絡先]
- **外部サポート**: [契約先情報]

---

## 📋 チェックリスト

### 月次メンテナンス
- [ ] システムアップデート確認
- [ ] SSL証明書更新確認
- [ ] ログファイル整理
- [ ] バックアップ整合性確認
- [ ] セキュリティ監査実行
- [ ] パフォーマンス指標レビュー

### 四半期メンテナンス
- [ ] 災害復旧テスト実施
- [ ] セキュリティ設定見直し
- [ ] 監視アラート調整
- [ ] ドキュメント更新
- [ ] 外部依存関係更新検討

---

## 更新履歴

- **2025-08-20**: 初版作成（CI/CD改善プロジェクトに伴う）

---

*このドキュメントは運用経験に基づいて継続的に更新されます。新しい知見や解決策は積極的に追加してください。*