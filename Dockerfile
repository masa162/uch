# ==============================================================================
# STAGE 1: ビルダーステージ (家の建築作業場)
# ==============================================================================
# "AS builder" で、このステージに "builder" という名前を付けています
FROM node:20-alpine AS builder

# パッケージマネージャとしてpnpmを指定 (npmやyarnの場合は適宜変更してください)
# RUN npm install -g pnpm

# アプリケーションの作業ディレクトリを設定
WORKDIR /app

# 依存関係の定義ファイルだけを先にコピー
COPY package.json package-lock.json ./
# COPY package.json pnpm-lock.yaml ./   # pnpmの場合
# COPY package.json yarn.lock ./          # yarnの場合

# 依存関係をインストール (開発用のものも含む)
# RUN pnpm install --frozen-lockfile
RUN npm ci
# npmの場合
# RUN yarn install --frozen-lockfile     # yarnの場合

# アプリの全ソースコードをコピー
COPY . .

# Prisma Clientを生成
RUN npx prisma generate

# Next.jsアプリケーションを本番用にビルド
# RUN pnpm build
RUN npm run build
# npmの場合
# RUN yarn build                         # yarnの場合


# ==============================================================================
# STAGE 2: 最終ステージ (完成品を置く本番の土地)
# ==============================================================================
FROM node:20-alpine

# アプリケーションの作業ディレクトリを設定
WORKDIR /app

# Next.jsの実行に必要な環境変数を設定
ENV NODE_ENV=production
ENV NEXTAUTH_URL=https://uchinokiroku.com

# ビルダーステージから、standaloneモードで出力された実行ファイル群をコピー
# --chown=nextjs:nodejs はセキュリティのための設定で、一般ユーザーで実行するようにします
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prismaスキーマとマイグレーションファイルをコピー（データベースマイグレーション用）
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# 一般ユーザー 'nextjs' を作成し、それに切り替え
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# /app ディレクトリ全体の所有権を強制的に nextjs ユーザーに変更
RUN chown -R nextjs:nodejs /app

USER nextjs

# 公開するポート番号を指定
EXPOSE 3000

# コンテナが起動したときに実行される最終コマンド
# standaloneモードで生成されたサーバーを起動します
CMD ["node", "server.js"]