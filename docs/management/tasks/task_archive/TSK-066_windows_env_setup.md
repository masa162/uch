# TSK-066: Windows開発環境のセットアップとDocker/ネットワーク設定の確認

## 📋 タスク概要

**目的**: Windows環境でのNext.js+Docker開発環境を適切にセットアップし、ローカル開発が円滑に行えるようにする

**優先度**: 最高  
**ステータス**: 進行中  
**担当者**: Claude Code  
**作成日**: 2025-08-19

---

## 🎯 成果物

1. Windows環境でのDocker動作確認
2. 適切なネットワーク設定とポート確認
3. 環境変数ファイルの調整
4. データベース接続の確認
5. Windows開発環境セットアップ手順書

---

## 📝 作業指示書

### 【前提確認】

現在の環境状況：
- OS: Windows 10/11 (MINGW64_NT-10.0-19045)
- プロジェクト: Next.js + PostgreSQL + Docker
- 現在のポート設定:
  - アプリケーション: 3000
  - PostgreSQL: 5433 (ホスト) → 5432 (コンテナ)

### 【手順1: Docker Desktop動作確認】

```bash
# Docker Desktop が起動していることを確認
docker --version
docker-compose --version

# 現在のコンテナ状況確認
docker ps -a
docker-compose ps
```

### 【手順2: 既存コンテナのクリーンアップ（必要に応じて）】

```bash
# 既存のコンテナを停止・削除
docker-compose down -v

# 不要なイメージやボリュームをクリーンアップ
docker system prune -a
docker volume prune
```

### 【手順3: 環境変数ファイルの調整】

#### `.env.local` の確認・修正:

```bash
# 現在の.env.localを確認
cat .env.local
```

**重要な設定項目**:
```env
# Database - ローカル開発用（ポート5433使用）
DATABASE_URL="postgresql://uch_user:uch_password@localhost:5433/uch_dev?schema=public"

# NextAuth - ローカル開発用
NEXTAUTH_URL=http://localhost:3000

# Authentication Skip - 開発中はtrueに設定
NEXT_PUBLIC_SKIP_AUTH=true

# Site Password
NEXT_PUBLIC_SITE_PASSWORD="きぼう"
```

### 【手順4: Docker Compose でのサービス起動】

```bash
# データベースのみ先に起動
docker-compose up -d db

# データベースの起動完了を確認
docker-compose logs db

# ヘルスチェック確認
docker-compose exec db pg_isready -U uch_user -d uch_dev
```

### 【手順5: Prismaマイグレーション実行】

```bash
# Prismaクライアント生成
npx prisma generate

# データベースマイグレーション実行
npx prisma migrate deploy

# データベース接続確認
npx prisma db pull
```

### 【手順6: 開発サーバーの起動確認】

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev
```

**アクセス確認**:
- アプリケーション: http://localhost:3000
- データベース: localhost:5433

### 【手順7: ポート競合の確認と対処】

もしポート3000が使用中の場合：

```bash
# ポート使用状況確認
netstat -ano | findstr :3000
netstat -ano | findstr :5433

# 他のポートでの起動
npm run dev -- -p 3001
```

その場合、`.env.local`も更新：
```env
NEXTAUTH_URL=http://localhost:3001
```

### 【手順8: Docker Composeでの完全起動】

開発サーバーが正常動作確認後：

```bash
# 開発サーバーを停止
# Ctrl+C

# Docker Composeで全サービス起動
docker-compose up -d

# ログ確認
docker-compose logs -f app
```

---

## 🔧 トラブルシューティング

### よくある問題と対処法

#### 1. Docker Desktopが起動しない
- Windows機能の「Hyper-V」と「Windows Subsystem for Linux」が有効になっているか確認
- BIOSでVirtualization Technologyが有効になっているか確認

#### 2. ポート競合エラー
```bash
# ポート5433が使用中の場合、docker-compose.ymlを編集
# ports: "5434:5432" に変更し、DATABASE_URLも更新
```

#### 3. Prismaマイグレーションエラー
```bash
# データベースリセット
npx prisma migrate reset

# 手動でデータベース削除・再作成
docker-compose exec db psql -U uch_user -c "DROP DATABASE IF EXISTS uch_dev;"
docker-compose exec db psql -U uch_user -c "CREATE DATABASE uch_dev;"
```

#### 4. Node.js/npm バージョン問題
```bash
# Node.js バージョン確認
node --version

# 推奨: Node.js 20.x
# nvmを使用してバージョン管理を推奨
```

---

## 📊 検証項目

### 動作確認チェックリスト

- [ ] Docker Desktop正常起動
- [ ] PostgreSQLコンテナ起動・接続確認
- [ ] Next.js開発サーバー起動
- [ ] http://localhost:3000 アクセス確認
- [ ] データベースマイグレーション成功
- [ ] 認証スキップでのアクセス確認
- [ ] 記事一覧表示確認
- [ ] 基本的なCRUD動作確認

---

## 📚 参考情報

### 関連ドキュメント
- `docs/仕様書/docker設定書.md` - Docker環境設定詳細
- `docs/仕様書/設計思想.md` - プロジェクト設計思想
- `docker-compose.yml` - Docker Compose設定
- `package.json` - Node.js依存関係

### 開発環境の理想状態
```
Windows Host
├── Docker Desktop (running)
├── Node.js 20.x
├── npm/yarn
└── Project Directory
    ├── PostgreSQL (Container: 5432 → Host: 5433)
    ├── Next.js Dev Server (Host: 3000)
    └── Environment Files (.env.local)
```

---

## 🎉 完了条件

1. Dockerコンテナが正常に起動する
2. ローカル環境でNext.jsアプリケーションにアクセスできる
3. データベース接続が正常に機能する
4. 基本的なCRUD操作が動作する
5. Windows環境固有の設定文書が作成される

---

**更新履歴**:
- 2025-08-19: 初版作成
- 2025-08-19: 詳細作業指示書に更新
