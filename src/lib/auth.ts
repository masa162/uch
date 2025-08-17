import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions, User, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import LineProvider from "next-auth/providers/line";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcrypt";

// NextAuth.jsの型を拡張
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      username?: string;
    };
  }
  interface User {
    id: string;
    username?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username?: string;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    ...(process.env.NODE_ENV === 'development'
      ? [
          // 開発環境ではダミーのCredentialsProviderのみ
          CredentialsProvider({
            name: "Development Credentials",
            credentials: {
              email: { label: "email", type: "email", placeholder: "dev@example.com" },
              password: { label: "Password", type: "password", placeholder: "password" },
            },
            async authorize(credentials, req) {
              // 開発環境では常に認証成功とみなす
              return { id: "dev-user-id", name: "Dev User", email: credentials?.email || "dev@example.com", username: undefined } as User;
            },
          }),
        ]
      : [
          // 本番環境用のプロバイダー
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

              const user = await prisma.user.findFirst({
                where: {
                  email: credentials.email,
                },
              });

              if (!user) {
                return null;
              }

              if (!user.password) {
                  return null; // パスワードが設定されていない場合は認証失敗
                }
                const isPasswordValid = await bcrypt.compare(
                  credentials.password,
                  user.password
                );

              if (!isPasswordValid) {
                return null;
              }

              return { ...user, username: user.username || undefined };
            },
          }),
        ]),
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
    async redirect({ url, baseUrl }) {
      // 認証成功後のリダイレクト処理
      if (url.startsWith('/')) {
        // 相対パスの場合は、baseUrlと結合
        return `${baseUrl}${url}`;
      } else if (new URL(url).origin === baseUrl) {
        // 同じオリジンの場合は、そのまま使用
        return url;
      }
      // 外部URLの場合は、baseUrlにリダイレクト
      return baseUrl;
    },
  },
  pages: process.env.NODE_ENV === 'development' ? {} : {
    signIn: "/auth/login",
  },
};

export const getAuthSession = () => getServerSession(authOptions);