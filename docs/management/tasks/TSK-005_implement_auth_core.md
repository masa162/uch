# タスク詳細: TSK-005

**ID**: `TSK-005`
**タイトル**: 認証機能の中核を実装
**ステータス**: 未着手
**優先度**: 高

## 1. タスクの目的

旧プロジェクトで実装されていた、Google/LINE/Emailの3種類の認証方式を新プロジェクトに移植する。これはアプリケーションの根幹をなす機能である。

## 2. 手順

1. `/Users/nakayamamasayuki/Documents/GitHub/uch/src/` ディレクトリ配下に `lib` という名前のディレクトリを新規作成してください。

2. 作成した `lib` ディレクトリの中に、`auth.ts` という名前でファイルを新規作成し、以下の内容をコピー＆ペーストしてください。

```typescript
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions, User, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import LineProvider from "next-auth/providers/line";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    LineProvider({
      clientId: process.env.LINE_CLIENT_ID || "",
      clientSecret: process.env.LINE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "email", type: "email", placeholder: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          return null;
        }

        // パスワードの検証（bcryptを使用）
        // 注意: 実際のUserモデルにはpasswordフィールドが必要です。TSK-002のスキーマには含まれていません。
        // このタスクを実装する前に、Userモデルにpasswordフィールドを追加する新しいタスクが必要になります。
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password // 仮。Userモデルにpasswordフィールドを追加する必要がある
        );

        if (!isPasswordValid) {
          return null;
        }

        return user;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
};

export const getAuthSession = () => getServerSession(authOptions);
```

## 3. 完了の定義

*   `/Users/nakayamamasayuki/Documents/GitHub/uch/src/lib/auth.ts` が上記内容で作成されていること。

## 4. 検証方法

PMがファイルの内容を読み取り、意図通りに作成されていることを確認する。
