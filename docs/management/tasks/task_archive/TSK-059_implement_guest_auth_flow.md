# タスク詳細: TSK-059

**ID**: `TSK-059`
**タイトル**: 【Backend】ゲスト認証フローの実装
**ステータス**: 未着手
**優先度**: 最高
**担当者**: Claude Code
**関連タスク**: TSK-058

## 1. タスクの目的

`TSK-058`で導入した`GUEST`ロールを利用し、NextAuthの認証フローに「ゲストとしてログインする」ためのロジックを実装する。これにより、システムはゲストセッションを正式に発行できるようになる。

## 2. 背景

データベースに役割の概念は導入されたが、アプリケーションの認証システム(NextAuth)はまだゲストの存在を認識しない。フロントエンドから「ゲストとしてログインしたい」というリクエストを受け取り、適切なセッションを発行するためのバックエンド処理が必要となる。

## 3. 具体的な作業内容

### 3.1. `lib/auth.ts` の編集

`authOptions`オブジェクトに、ゲスト認証を処理するための設定を追加する。

1.  **ゲスト用`CredentialsProvider`の追加**: 既存の`providers`配列に、ゲスト専用の認証情報プロバイダーを追加する。このプロバイダーは、特定のユーザー名（例: `'guest'`) が渡された場合に、データベースから`GUEST`ロールを持つユーザーを検索して返すように設定する。

    ```typescript
    // lib/auth.ts の providers 配列内
    CredentialsProvider({
      id: 'guest',
      name: 'Guest',
      credentials: {},
      async authorize(credentials) {
        const guestUser = await prisma.user.findFirst({
          where: { role: 'GUEST' },
        });
        if (guestUser) {
          return guestUser;
        }
        // ゲストユーザーが見つからない場合はnullを返すか、ここで作成する
        // 今回は事前にDBに作成されていることを前提とする
        return null;
      },
    }),
    ```

2.  **セッションへの`role`情報の追加**: `callbacks`オブジェクトの`jwt`と`session`コールバックを修正し、トークンとセッションオブジェクトに`role`の情報が含まれるようにする。

    ```typescript
    // lib/auth.ts の callbacks オブジェクト内
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role; // roleを追加
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as Role; // roleを追加
      }
      return session;
    },
    ```

### 3.2. `next-auth.d.ts` の型定義拡張

セッションの型定義に`role`を追加するため、型定義ファイル（例: `src/types/next-auth.d.ts`）を修正または作成する。

```typescript
import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';
import { Role } from '@prisma/client'; // TSK-058で作成したenumをインポート

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username: string | null;
      role: Role; // roleプロパティを追加
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role: Role;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    role: Role;
  }
}
```

## 4. 完了の定義

*   `lib/auth.ts` がゲスト認証プロバイダーと`role`を含むコールバックで更新されていること。
*   `next-auth`の型定義が拡張され、`session.user.role`に型安全にアクセスできること。
*   フロントエンドから`signIn('guest')`を呼び出すと、`GUEST`ロールを持つユーザーセッションが正常に確立されること。

## 5. 検証方法

PMがコードレビューを行い、変更が意図通りであることを確認する。また、開発ツールを用いて、ログイン後のセッションオブジェクトに`role: 'GUEST'`が含まれていることを確認する。
