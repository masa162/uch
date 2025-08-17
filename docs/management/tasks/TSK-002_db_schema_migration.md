# タスク詳細: TSK-002

**ID**: `TSK-002`
**タイトル**: データベース設計の移行
**ステータス**: 未着手
**優先度**: 高

## 1. タスクの目的

旧プロジェクトで定義されていた完成度の高いデータベーススキーマを新プロジェクトに適用し、アプリケーションのデータ基盤を確立する。

## 2. 手順

以下の内容で、`/Users/nakayamamasayuki/Documents/GitHub/uch/prisma/schema.prisma` ファイルを**完全に上書き**してください。

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?
  emailVerified DateTime?
  image         String?
  username      String?   @unique
  createdAt     DateTime  @default(now())
  accounts      Account[]
  articles      Article[]
  comments      Comment[]
  likes         Like[]
  sessions      Session[]

  @@map("users")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

model Article {
  id           String    @id @default(cuid())
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  title        String
  slug         String    @unique
  description  String?
  content      String    @db.Text
  pubDate      DateTime
  authorId     String
  heroImageUrl String?
  tags         String[]
  isPublished  Boolean   @default(true)
  author       User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments     Comment[]
  likes        Like[]

  @@map("articles")
}

model Comment {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  content   String
  articleId String
  userId    String
  article   Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("comments")
}

model Like {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  articleId String
  userId    String
  article   Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([articleId, userId])
  @@map("likes")
}
```

## 3. 完了の定義

*   `prisma/schema.prisma` が上記内容で更新されていること。

## 4. 検証方法

PMがファイル内容を読み取り、意図通りに更新されていることを確認する。
