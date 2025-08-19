#!/bin/sh

echo "Syncing database schema..."
npx prisma db push --skip-generate || echo "Database sync failed or already synced"

echo "Starting Next.js server..."
exec node server.js