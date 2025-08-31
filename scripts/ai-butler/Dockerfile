# AI執事サービス用 Dockerfile
FROM node:20-alpine

# ffmpegをインストール（動画処理用）
RUN apk add --no-cache ffmpeg

# 作業ディレクトリ設定
WORKDIR /app

# package.jsonをコピーして依存関係をインストール
COPY package*.json ./
RUN npm ci --omit=dev

# アプリケーションファイルをコピー
COPY . .

# 一時ディレクトリ作成
RUN mkdir -p temp

# ユーザー作成（セキュリティのため）
RUN addgroup -g 1001 -S aibutler && \
    adduser -S aibutler -u 1001

# 所有権変更
RUN chown -R aibutler:aibutler /app
USER aibutler

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "console.log('AI Butler is running')" || exit 1

# サービス開始
CMD ["node", "index.js"]