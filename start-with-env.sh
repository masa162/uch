#!/bin/sh
set -e

# Prismaのマイグレーションを実行
echo "Running database migrations..."
npx prisma migrate deploy

# Next.jsサーバーを起動
echo "Starting Next.js server..."
exec node server.js
