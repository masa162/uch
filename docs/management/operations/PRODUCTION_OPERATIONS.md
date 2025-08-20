# 本番運用ガイド - うちのきろく

## 1. 概要

このドキュメントは「うちのきろく」アプリケーションの本番環境における長期安定運用のためのガイドです。

## 2. アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions CI/CD                     │
├─────────────────────────────────────────────────────────────┤
│ 1. Test → 2. Build → 3. Deploy → 4. Verify → 5. Notify    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                        VPS Server                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │    Nginx    │  │    App      │  │  Database   │        │
│  │   (Proxy)   │  │ (Next.js)   │  │ (PostgreSQL)│        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│              Monitoring & Backup Services                   │
└─────────────────────────────────────────────────────────────┘
```

## 3. デプロイメントフロー

### 3.1 改善されたCI/CDパイプライン

**主な改善点：**
- テストの自動実行
- エラーハンドリングの強化
- 自動ロールバック機能
- デプロイ後のヘルスチェック
- 通知機能

**デプロイ手順：**
1. **Test Phase**: 自動テスト実行とビルド確認
2. **Build Phase**: Dockerイメージのビルドとプッシュ
3. **Deploy Phase**: VPSでのデプロイとヘルスチェック
4. **Verify Phase**: アプリケーションエンドポイントの確認
5. **Notify Phase**: 成功/失敗の通知

### 3.2 自動ロールバック

デプロイが失敗した場合：
```bash
# 自動的に前のバージョンに復元
cp $BACKUP_DIR/docker-compose.prod.yml ./
docker compose -f docker-compose.prod.yml up -d --force-recreate
```

## 4. モニタリング

### 4.1 ヘルスチェック監視

**監視項目：**
- Dockerコンテナの健康状態
- アプリケーションエンドポイント（/api/health）
- システムリソース（CPU、メモリ、ディスク）
- エラーログの監視

**実行間隔：**
- 自動ヘルスチェック: 5分間隔
- システムリソース監視: 10分間隔
- ログ監視: リアルタイム

### 4.2 自動復旧機能

**復旧シナリオ：**
1. コンテナ異常 → 自動再起動
2. アプリケーション異常 → サービス再起動
3. メモリ不足 → 自動クリーンアップ
4. ディスク容量不足 → 古いログ・イメージの削除

### 4.3 アラート通知

**通知レベル：**
- **INFO**: バックアップ完了、復旧成功
- **WARNING**: リソース使用率高、軽微なエラー
- **CRITICAL**: サービス停止、データベース接続失敗

## 5. バックアップ戦略

### 5.1 自動バックアップ

**バックアップ対象：**
- データベース（PostgreSQL dump）
- アプリケーションファイル（uploads/）
- 設定ファイル（docker-compose, .env）
- システム設定

**スケジュール：**
```bash
# 日次バックアップ - 毎日 2:00 AM
0 2 * * * /home/nakayama/uch/scripts/backup.sh

# 週次システムクリーンアップ - 日曜日 3:00 AM  
0 3 * * 0 docker system prune -f
```

### 5.2 バックアップ保持ポリシー

- **日次バックアップ**: 7日間保持
- **週次バックアップ**: 4週間保持  
- **月次バックアップ**: 12ヶ月保持

## 6. セキュリティ

### 6.1 ネットワークセキュリティ

**ポート制限：**
```yaml
# アプリケーション - ローカルホストのみ
ports:
  - "127.0.0.1:3000:3000"

# データベース - ローカルホストのみ  
ports:
  - "127.0.0.1:5432:5432"
```

**UFW Firewall設定：**
```bash
# 外部からのアクセス制限
ufw default deny incoming
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
```

### 6.2 侵入検知

**fail2ban設定：**
- SSH攻撃の検知と遮断
- Nginx攻撃の検知と遮断
- 自動IP遮断機能

## 7. トラブルシューティング

### 7.1 一般的な問題と解決方法

| 問題 | 症状 | 解決方法 |
|------|------|----------|
| アプリケーション応答なし | HTTP 503エラー | `docker compose restart` |
| データベース接続失敗 | ヘルスチェック失敗 | DB コンテナ再起動 |
| ディスク容量不足 | デプロイ失敗 | `docker system prune -f` |
| メモリ不足 | OOM エラー | コンテナリソース制限調整 |

### 7.2 緊急時復旧手順

**サービス完全停止時：**
```bash
# 1. 現在の状況確認
docker ps -a
systemctl status docker

# 2. サービス再起動
cd /home/nakayama/uch
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d

# 3. ヘルスチェック確認
curl http://localhost:3000/api/health

# 4. 必要に応じてバックアップから復旧
./scripts/restore-from-backup.sh YYYY-MM-DD_HH-MM-SS
```

## 8. パフォーマンス監視

### 8.1 監視メトリクス

**アプリケーション：**
- レスポンス時間
- エラー率
- アクティブ接続数

**システム：**
- CPU使用率
- メモリ使用率
- ディスクI/O
- ネットワークトラフィック

### 8.2 パフォーマンス改善

**推奨設定：**
```yaml
# リソース制限
deploy:
  resources:
    limits:
      memory: 1G      # アプリケーション
      memory: 512M    # データベース
    reservations:
      memory: 512M    # アプリケーション
      memory: 256M    # データベース
```

## 9. 定期メンテナンス

### 9.1 月次メンテナンス

**第1日曜日 (毎月):**
```bash
# システムアップデート確認
apt update && apt list --upgradable

# SSL証明書更新確認  
certbot renew --dry-run

# バックアップ整合性確認
./scripts/backup.sh --verify-only

# セキュリティ監査
fail2ban-client status
ufw status verbose
```

### 9.2 四半期メンテナンス

**セキュリティ更新:**
- 依存関係の脆弱性チェック
- Dockerイメージの更新
- OS セキュリティパッチ適用

## 10. 運用コマンド集

### 10.1 日常運用

```bash
# システム状況確認
./scripts/dashboard.sh

# 手動バックアップ実行  
./scripts/backup.sh

# ヘルスチェック実行
./monitoring/health-check.sh

# ログ確認
docker logs uch_app --tail 100
docker logs uch_db --tail 100
```

### 10.2 デプロイ関連

```bash
# 手動デプロイ（緊急時）
git pull origin main
COMMIT_SHA=$(git rev-parse HEAD)
sed -i "s|ghcr.io/masa162/uch:[^[:space:]]*|ghcr.io/masa162/uch:${COMMIT_SHA}|g" docker-compose.prod.yml
docker compose -f docker-compose.prod.yml up -d

# 前バージョンへのロールバック
./scripts/rollback.sh
```

### 10.3 監視・調査

```bash
# リソース使用状況
docker stats
htop
df -h

# ネットワーク状況
ss -tlnp | grep -E ':80|:443|:3000|:5432'
netstat -i

# セキュリティ状況  
fail2ban-client status sshd
ufw status numbered
```

## 11. アップグレード戦略

### 11.1 Node.js/Next.js アップグレード

**手順：**
1. 開発環境でアップグレード
2. テスト実行
3. ステージング環境でテスト
4. 本番デプロイ

### 11.2 データベースアップグレード

**PostgreSQL アップグレード：**
1. 完全バックアップ作成
2. メンテナンスモード有効化
3. データベースアップグレード実行
4. データ整合性確認

## 12. 災害復旧計画

### 12.1 データ復旧

**RTO (Recovery Time Objective)**: 4時間以内
**RPO (Recovery Point Objective)**: 24時間以内

**復旧手順：**
1. 最新バックアップの確認
2. 新しいVPSインスタンスの作成
3. システム設定の復元
4. データベース復元
5. アプリケーション復元
6. DNS設定変更

### 12.2 バックアップからの完全復旧

```bash
# 1. システム初期化
cd /home/nakayama
git clone https://github.com/masa162/uch.git

# 2. バックアップから復元
cd uch
./scripts/restore-from-backup.sh [BACKUP_DATE]

# 3. サービス起動
docker compose -f docker-compose.prod.yml up -d

# 4. 動作確認
./monitoring/health-check.sh
```

## 13. 連絡先とエスカレーション

**緊急時連絡先：**
- 開発者: [連絡先情報]
- VPSプロバイダー: ConoHa サポート
- ドメインプロバイダー: [プロバイダー情報]

**エスカレーションフロー：**
1. 自動復旧試行 (5分以内)
2. アラート通知送信
3. 手動調査・対応開始 (15分以内)
4. 必要に応じて外部サポート連絡

---

## 更新履歴

- **2025-08-20**: 初版作成
- 定期的なレビューと更新を推奨

## 関連ドキュメント

- [GitHub VPS関連仕様書](../仕様書/github_vps関連仕様書.md)
- [API仕様書](../api/API_SPECIFICATION.md)
- [セキュリティガイドライン](../security/SECURITY.md)