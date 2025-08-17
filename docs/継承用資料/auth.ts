import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import LineProvider from 'next-auth/providers/line'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

/* eslint-disable @typescript-eslint/no-explicit-any */
interface AuthConfig {
  adapter: any
  debug: boolean
  providers: any[]
  session: { strategy: 'jwt' | 'database' }
  pages: { signIn: string; error: string }
  callbacks: any
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export const authOptions: AuthConfig = {
  adapter: PrismaAdapter(prisma),
  debug: process.env.NODE_ENV === 'development',
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
    }),
    LineProvider({
      clientId: process.env.LINE_CHANNEL_ID || '',
      clientSecret: process.env.LINE_CHANNEL_SECRET || '',
      authorization: {
        params: {
          scope: "profile openid email"
        }
      },
      // Next.js 15 + NextAuth.js v4互換性設定
      checks: ["pkce", "state"],
      client: {
        id_token_signed_response_alg: "HS256"
      },
      // P008対策: LINEプロバイダー安定化設定
      wellKnown: undefined,
      issuer: "https://access.line.me",
      token: "https://api.line.me/oauth2/v2.1/token",
      userinfo: "https://api.line.me/v2/profile"
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email
          },
          include: {
            accounts: {
              where: {
                provider: 'credentials'
              }
            }
          }
        })

        if (!user || !user.accounts.length) {
          return null
        }

        // access_tokenに保存されたハッシュ化パスワードと比較
        const account = user.accounts[0]
        const isValidPassword = await bcrypt.compare(
          credentials.password,
          account.access_token || ''
        )

        if (!isValidPassword) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  /* eslint-disable @typescript-eslint/no-explicit-any */
  callbacks: {
    async jwt({ token, user, account, profile }: any) {
      if (user) {
        token.id = user.id
      }
      if (account && profile) {
        if (account.provider === 'line') {
          console.log('LINE Profile:', profile)
          token.lineUserId = profile.sub
        }
      }
      return token
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        (session.user as { id?: string }).id = token.id as string
      }
      return session
    },
    async signIn({ user, account, profile }: any) {
      if (account?.provider === 'line') {
        console.log('LINE SignIn - User:', user)
        console.log('LINE SignIn - Account:', account)
        console.log('LINE SignIn - Profile:', profile)
        
        // LINE特有の検証
        if (!profile?.sub) {
          console.error('LINE Profile missing sub (user ID)')
          return false
        }
      }
      return true
    }
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */
}