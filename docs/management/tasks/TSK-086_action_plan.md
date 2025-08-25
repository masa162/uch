# TSK-086 実作業プロセス: ConoHa VPS復旧手順

## 緊急度: 高 🔴
OAuth認証が完全に機能せず、ユーザーがログインできない状態

## 前提条件
- SSH接続不可（全ポートで接続拒否）
- ConoHa VPSコンソールからの直接アクセスが必要
- WebサービスはNginx経由で稼働中

## 実作業手順

### Phase 1: ConoHa VPSコンソールアクセス
1. ConoHa VPSコンソールにログイン
2. 対象サーバー（uchinokiroku.com）を特定
3. コンソール経由でサーバーに直接ログイン

### Phase 2: 現状確認
```bash
# 現在のコンテナ状況確認
docker ps -a

# 現在の環境変数確認
cd /root/uch
cat .env.production

# ディスク使用量確認
df -h
docker system df
```

### Phase 3: 古いコンテナクリーンアップ
```bash
# 既存のコンテナを停止
cd /root/uch
docker-compose down

# 古いイメージ・コンテナを削除
docker system prune -af
docker volume prune -f

# ネットワークのクリーンアップ
docker network prune -f
```

### Phase 4: 最新コードの確認・デプロイ
```bash
# Gitの状態確認
git status
git log --oneline -5

# 最新コードをプル（必要に応じて）
git pull origin main

# 環境変数の確認
echo "NEXTAUTH_URL=$NEXTAUTH_URL"
echo "GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID"
```

### Phase 5: 新しいコンテナ起動
```bash
# Docker Composeで新規起動
docker-compose up -d

# コンテナの起動状況確認
docker-compose ps
docker-compose logs app

# アプリケーション内での環境変数確認
docker-compose exec app printenv | grep -E "(NEXTAUTH_URL|GOOGLE_CLIENT)"
```

### Phase 6: 動作確認
```bash
# 内部からのヘルスチェック
curl -I http://localhost:3000/api/health

# ログの確認
docker-compose logs app | tail -20
```

### Phase 7: SSH復旧（時間があれば）
```bash
# SSH設定確認
systemctl status ssh
netstat -tlnp | grep :22

# ファイアウォール確認
ufw status
iptables -L
```

## 確認ポイント
- [ ] 古いコンテナが完全に削除された
- [ ] 新しいコンテナで正しい環境変数が設定されている
- [ ] `NEXTAUTH_URL=https://uchinokiroku.com`が正しく設定
- [ ] OAuth認証が正常に動作する
- [ ] SSH接続が復旧する（オプション）

## 成功基準
✅ https://uchinokiroku.com/auth/signin でGoogle OAuth認証が正常に動作

## 失敗時の代替案
- VPSの再起動
- 完全なクリーンデプロイ
- GitHub Actionsからの強制再デプロイ

## 作業時間見積もり
- Phase 1-3: 10分
- Phase 4-6: 15分  
- Phase 7: 5分
- **合計: 約30分**

## 注意事項
- データベースのバックアップは不要（PostgreSQL分離済み）
- 作業中はサービス停止が発生
- SSH復旧は必須ではない（Webサービス優先）