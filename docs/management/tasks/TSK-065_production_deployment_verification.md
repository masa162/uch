# TSK-065: 本番環境へのデプロイと表示・動作確認

## 📋 タスク概要

**目的**: Windows環境でのローカル開発完了を受けて、本番環境VPS（160.251.136.92）へのデプロイを実行し、アプリケーションの正常動作を確認する

**優先度**: 高  
**ステータス**: 進行中  
**担当者**: Claude Code  
**作成日**: 2025-08-19

---

## 🎯 成果物

1. 本番環境VPSでのアプリケーション正常稼働
2. 全機能の動作確認完了
3. パフォーマンステスト結果
4. 本番環境運用ドキュメント更新

---

## 📝 作業指示書

### 【前提確認】

現在の本番環境：
- VPS IP: 160.251.136.92
- ドメイン: https://uchinokiroku.com
- Docker構成: Next.js + PostgreSQL
- 既存環境状況: 要確認

### 【手順1: 本番環境VPS状態確認】

```bash
# VPS接続確認
ssh root@160.251.136.92

# Docker状態確認
docker ps -a
docker-compose ps

# ディスク使用量確認
df -h

# メモリ使用量確認
free -h
```

### 【手順2: ローカルでのビルドテスト】

```bash
# プロダクションビルドテスト
npm run build

# Dockerイメージビルドテスト
docker-compose -f docker-compose.yml build

# 環境変数確認
cat .env.production
```

### 【手順3: 本番環境へのコード同期】

```bash
# Gitステータス確認
git status
git log --oneline -5

# 本番環境での最新コード取得
ssh root@160.251.136.92 "cd /root/uch && git pull origin main"

# 環境変数ファイルの確認
ssh root@160.251.136.92 "cd /root/uch && cat .env.production"
```

### 【手順4: 本番環境デプロイ実行】

```bash
# 既存サービス停止
ssh root@160.251.136.92 "cd /root/uch && docker-compose down"

# イメージビルドとサービス起動
ssh root@160.251.136.92 "cd /root/uch && docker-compose up --build -d"

# ログ確認
ssh root@160.251.136.92 "cd /root/uch && docker-compose logs -f app"
```

### 【手順5: アプリケーション動作確認】

```bash
# ヘルスチェック
curl -I https://uchinokiroku.com
curl -I http://160.251.136.92:3000

# コンテナ状態確認
ssh root@160.251.136.92 "cd /root/uch && docker-compose ps"

# サービス起動確認
ssh root@160.251.136.92 "cd /root/uch && docker-compose logs --tail=50 app"
```

### 【手順6: 機能テストと検証】

#### ブラウザテスト項目:
1. **基本アクセス**: https://uchinokiroku.com にアクセス
2. **認証テスト**: 
   - サイトパスワード「きぼう」での認証
   - ゲストログイン機能
3. **記事表示**: 記事一覧、記事詳細の表示確認
4. **CRUD機能**: 記事作成、編集、削除の動作確認
5. **レスポンシブ**: モバイル、デスクトップでの表示確認

#### パフォーマンステスト:
```bash
# レスポンス時間測定
curl -w "%{time_total}" -o /dev/null -s https://uchinokiroku.com

# 複数リクエストテスト
for i in {1..5}; do
  echo "Request $i:"
  curl -w "Time: %{time_total}s, Status: %{http_code}\n" -o /dev/null -s https://uchinokiroku.com
done
```

---

## 🔧 トラブルシューティング

### よくある問題と対処法

#### 1. コンテナ起動失敗
```bash
# 詳細ログ確認
docker-compose logs app
docker-compose logs db

# コンテナ再起動
docker-compose restart app
```

#### 2. データベース接続エラー
```bash
# DB接続確認
docker-compose exec db pg_isready -U uch_user -d uch_dev

# マイグレーション再実行
docker-compose exec app npx prisma migrate deploy
```

#### 3. Nginx/リバースプロキシ問題
```bash
# Nginx状態確認
systemctl status nginx

# 設定ファイル確認
nginx -t

# ログ確認
tail -f /var/log/nginx/error.log
```

#### 4. SSL証明書問題
```bash
# 証明書状態確認
certbot certificates

# 証明書更新
certbot renew --dry-run
```

---

## 📊 検証項目

### 動作確認チェックリスト

- [ ] VPS正常稼働
- [ ] Docker Compose正常起動
- [ ] https://uchinokiroku.com アクセス可能
- [ ] サイトパスワード認証動作
- [ ] ゲストログイン動作
- [ ] 記事一覧表示
- [ ] 記事詳細表示
- [ ] 記事作成機能
- [ ] 記事編集機能
- [ ] 記事削除機能
- [ ] コメント機能
- [ ] いいね機能
- [ ] 検索機能
- [ ] タグ機能
- [ ] レスポンシブデザイン
- [ ] パフォーマンス確認

---

## 📚 参考情報

### 関連ドキュメント
- `TSK-043_vps_initial_deployment.md` - VPS初回デプロイ履歴
- `TSK-044_vps_firewall_configuration.md` - ファイアウォール設定
- `TSK-045_production_oauth_configuration.md` - OAuth設定
- `docs/仕様書/docker設定書.md` - Docker環境設定

### 本番環境構成
```
VPS (160.251.136.92)
├── Nginx (Reverse Proxy + SSL)
├── Docker Compose
│   ├── Next.js App (Port 3000)
│   └── PostgreSQL (Port 5432)
└── Domain: https://uchinokiroku.com
```

---

## 🎉 完了条件

1. 本番環境でアプリケーションが正常稼働する
2. 全ての主要機能が動作確認済み
3. パフォーマンスが許容範囲内
4. SSL証明書が有効
5. 監視とログが正常に動作
6. 緊急時の対応手順が確立済み

---

**更新履歴**:
- 2025-08-19: 初版作成