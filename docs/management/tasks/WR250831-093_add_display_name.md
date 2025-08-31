# 作業指示書: displayNameの実装と保守性向上

- **関連タスク:** TSK-093, TSK-094
- **担当者:** Claude Code
- **期日:** N/A

## 1. 目的

ユーザーがサービス内で使用する「表示名」を自由に設定できるようにし、かつ将来の混乱を防ぐためコードとドキュメントの保守性を向上させる。

## 2. 作業手順

### ステップ1: データベーススキーマの変更

**状況:** ✅ 完了

`prisma/schema.prisma` ファイルの `User` モデルに `displayName` カラムが追加されました。

### ステップ2: データベースのマイグレーション

**状況:** ✅ 完了

マイグレーションが実行され、データベースに `displayName` カラムが追加されました。

---

### ステップ3: 保守性向上対応 (TSK-094)

`prisma/schema.prisma` にコメントを追記し、各カラムの役割を明確にします。

**対象ファイル:** `prisma/schema.prisma`

**変更後のコード:**
```prisma
model User {
  id            String    @id @default(cuid())

  // @deprecated: アプリケーションロジックでは使用しない。認証プロバイダーからの生データ。
  // 代わりに displayName を使用してください。
  name          String?

  // [表示名] アプリケーション内で使用する唯一の表示名。
  displayName   String?

  email         String?   @unique
  emailVerified DateTime?
  // ... (以下略)
}
```

### ステップ4: 新規登録時の初期値設定 (TSK-093)

新規ユーザーが作成される際に、認証プロバイダーの `name` を `displayName` の初期値として設定します。これにより、ユーザーは初回から表示名を持ち、後から編集できます。

**対象ファイル:** `src/lib/auth.ts`

**変更点:** `PrismaAdapter` に `createUser` イベントを追加します。

```typescript
// src/lib/auth.ts の上部に追加
import { PrismaClient } from "@prisma/client";
import { AdapterUser } from "next-auth/adapters";

// authOptions の adapter を修正
export const authOptions: NextAuthOptions = {
  adapter: {
    ...PrismaAdapter(prisma as PrismaClient),
    createUser: (data: Omit<AdapterUser, "id">) => {
      return prisma.user.create({
        data: {
          ...data,
          displayName: data.name, // name を displayName の初期値として設定
        },
      });
    },
  },
  // ... (providers, callbacks など)
};
```

*注意: `PrismaAdapter(prisma)` を `...PrismaAdapter(prisma as PrismaClient)` のようにスプレッド構文に展開し、`createUser`メソッドで上書きします。既存の`adapter:`の行を上記のように書き換えてください。また、`PrismaClient`と`AdapterUser`のimportが必要になる場合があります。*

### ステップ5: プロフィール編集機能の改修 (TSK-093)

以前の改修で非表示にしたプロフィール編集ページを、`displayName` を編集できるように修正します。

**対象ファイル:** `src/app/profile/page.tsx`

**改修方針:**
1.  API (`/api/profile`) が `displayName` を更新できるように修正します。
2.  フロントエンドのフォームが、`name` の代わりに `displayName` を送信するように修正します。
3.  フォームのラベルを「名前」から「表示名」に変更し、ユーザーに分かりやすくします。

*具体的なコードは、既存の `page.tsx` の実装を基に `displayName` を扱うように変更してください。*

### ステップ6: 表示ロジックの全面的な切り替え (TSK-093)

記事ページやコメント欄など、ユーザー名が表示されるすべての箇所で、`displayName` を優先的に表示するように変更します。

**対象ファイル例:** `src/app/articles/[slug]/page.tsx`

**変更方針:**
`author.name` や `user.name` を参照している箇所を、以下のように変更します。

`{article.author.displayName || article.author.name || '匿名'}`

`displayName` があればそれを表示し、なければ従来の `name` を、それもなければ「匿名」を表示する、というフォールバック処理を入れます。

---
*まずはステップ3, 4の実施をお願いします。完了後、ご報告ください。*
