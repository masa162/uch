# タスク詳細: TSK-007

**ID**: `TSK-007`
**タイトル**: Userモデルへのpasswordフィールド追加
**ステータス**: 未着手
**優先度**: 高

## 1. タスクの目的

メールアドレス/パスワード認証機能を実装する準備として、`User`モデルにパスワードハッシュを保存するためのフィールドを追加する。これはタスク`TSK-005`の前提条件となる。

## 2. 手順

`/Users/nakayamamasayuki/Documents/GitHub/uch/prisma/schema.prisma` ファイルを開き、`User`モデルの中に以下の1行を追記してください。

**追記箇所:** `User`モデルの`image`フィールドの下あたりが分かりやすいでしょう。

```prisma
  password      String?
```

**修正後の`User`モデル (参考):**
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?
  emailVerified DateTime?
  image         String?
  password      String?   // ← この行を追記
  username      String?   @unique
  createdAt     DateTime  @default(now())
  accounts      Account[]
  articles      Article[]
  comments      Comment[]
  likes         Like[]
  sessions      Session[]

  @@map("users")
}
```

## 3. 完了の定義

*   `prisma/schema.prisma` の `User`モデルに`password`フィールドが追加されていること。

## 4. 検証方法

PMが`prisma/schema.prisma`の内容を読み取り、フィールドが追加されていることを確認する。

---
