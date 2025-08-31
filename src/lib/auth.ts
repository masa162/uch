import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions, User, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import LineProvider from "next-auth/providers/line";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { Role, PrismaClient } from '@prisma/client';
import { AdapterUser } from "next-auth/adapters";


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
  debug: process.env.NODE_ENV === 'development' || process.env.NEXTAUTH_DEBUG === 'true',
  providers: [
    // Google OAuth (開発・本番共通)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    ...(process.env.NODE_ENV === 'development'
      ? [
          // 開発環境では追加のCredentialsProviderも提供
          CredentialsProvider({
            name: "Development Credentials",
            credentials: {
              email: { label: "email", type: "email", placeholder: "dev@example.com" },
              password: { label: "Password", type: "password", placeholder: "password" },
            },
            async authorize(credentials, req) {
              // 開発環境では常に認証成功とみなす
              return { id: "dev-user-id", name: "Dev User", email: credentials?.email || "dev@example.com", username: undefined, role: 'USER' as Role } as User;
            },
          }),
          CredentialsProvider({
            id: 'guest',
            name: 'Guest',
            credentials: {},
            async authorize(credentials) {
              // ゲストユーザーを検索または作成
              let guestUser = await prisma.user.findFirst({
                where: { role: 'GUEST' },
              });
              
              if (!guestUser) {
                // ゲストユーザーが存在しない場合は作成
                guestUser = await prisma.user.create({
                  data: {
                    name: 'ゲストユーザー',
                    username: 'guest',
                    role: 'GUEST',
                  },
                });
              }
              
              return {
                id: guestUser.id,
                name: guestUser.name,
                email: guestUser.email,
                username: guestUser.username || undefined,
                role: guestUser.role,
              };
            },
          }),
        ]
      : [
          // 本番環境ではLINEログインも追加
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

              return { 
                ...user, 
                username: user.username || undefined,
                role: user.role 
              };
            },
          }),
          CredentialsProvider({
            id: 'guest',
            name: 'Guest',
            credentials: {},
            async authorize(credentials) {
              let guestUser = await prisma.user.findFirst({
                where: { role: 'GUEST' },
              });
              
              if (!guestUser) {
                guestUser = await prisma.user.create({
                  data: {
                    name: 'ゲストユーザー',
                    username: 'guest',
                    role: 'GUEST',
                  },
                });
              }
              
              return {
                id: guestUser.id,
                name: guestUser.name,
                email: guestUser.email,
                username: guestUser.username || undefined,
                role: guestUser.role,
              };
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
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log('NextAuth redirect callback:', { url, baseUrl });
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
    async signIn({ user, account, profile, email, credentials }) {
      console.log('NextAuth signIn callback:', { 
        provider: account?.provider, 
        hasProfile: !!profile, 
        hasEmail: !!profile?.email 
      });
      
      // 認証プロセスの検証
      if (account?.provider === 'google') {
        // Google OAuth認証の検証
        if (!profile?.email) {
          console.error('Google OAuth: No email in profile');
          return false;
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};

export const getAuthSession = () => getServerSession(authOptions);