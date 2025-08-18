#!/bin/sh
set -e

# Prismaのデータベース同期を実行
echo "Syncing database schema..."
npx prisma db push --skip-generate || echo "Database sync failed or already synced"

# Next.jsサーバーを起動
echo "Starting Next.js server..."
exec node server.js
