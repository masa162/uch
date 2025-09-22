import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 認証が不要なパス
const publicPaths = ['/landing', '/api', '/_next', '/images', '/favicon.ico', '/site.webmanifest']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 認証が不要なパスはそのまま通す
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // セッションCookieをチェック
  const sessionCookie = request.cookies.get('uk_session')
  
  // セッションがない場合はランディングページにリダイレクト
  if (!sessionCookie) {
    const landingUrl = new URL('/landing', request.url)
    return NextResponse.redirect(landingUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * 以下を除くすべてのパスにマッチ:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}