#!/bin/bash
# 2025-09-01 緊急修正スクリプト
# うちのきろく認証問題修正

set -e

echo "=== うちのきろく緊急修正開始 ==="

# 1. 現在のコンテナ状態確認
echo "1. Docker コンテナ状態確認..."
docker ps
docker-compose -f docker-compose.prod.yml ps

# 2. データベース接続確認
echo "2. データベース接続確認..."
docker exec my-db-container psql -U uch_user -d uch_db -c "\dt"

# 3. displayNameカラム存在確認
echo "3. displayName カラム確認..."
docker exec my-db-container psql -U uch_user -d uch_db -c "\d users"

# 4. Prismaマイグレーション実行
echo "4. Prismaマイグレーション実行..."
docker exec my-app-container npx prisma migrate deploy

# 5. Prismaクライアント再生成
echo "5. Prismaクライアント再生成..."
docker exec my-app-container npx prisma generate

# 6. コンテナ再起動
echo "6. コンテナ再起動..."
docker-compose -f docker-compose.prod.yml restart app

# 7. ヘルスチェック
echo "7. ヘルスチェック..."
sleep 10
curl -f http://localhost:3000/api/health || echo "ヘルスチェック失敗"

# 8. AI Butler状態確認
echo "8. AI Butler確認..."
docker logs my-ai-butler-container --tail 20

echo "=== 修正完了 ==="