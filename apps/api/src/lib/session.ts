import { signJWT, verifyJWT, type JWTPayload } from './oauth';

/**
 * セッション管理ライブラリ
 * HttpOnlyクッキーを使用したセッション管理
 * やさしい文言と"あいことば"哲学に基づく実装
 */

export interface SessionData {
  userId: string; // 文字列ID（ULID/UUID）
  provider: string;
  providerUserId: string;
  email?: string;
  name?: string;
  pictureUrl?: string;
}

// セッションクッキー名
const SESSION_COOKIE_NAME = 'uk_session';

// セッション有効期限（7日間）
const SESSION_EXPIRY_SECONDS = 7 * 24 * 60 * 60;

/**
 * セッションクッキーを作成（レガシーAPI）
 */
export async function createSessionCookieLegacy(
  sessionData: SessionData,
  secret: string,
  domain?: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: JWTPayload = {
    sub: sessionData.userId, // 文字列ID
    provider: sessionData.provider,
    provider_user_id: sessionData.providerUserId,
    email: sessionData.email,
    name: sessionData.name,
    picture_url: sessionData.pictureUrl,
    iat: now,
    exp: now + SESSION_EXPIRY_SECONDS
  };

  const token = await signJWT(payload, secret);
  
  // クッキーオプション
  let cookieOptions = [
    `${SESSION_COOKIE_NAME}=${token}`,
    'HttpOnly', // XSS攻撃を防ぐ
    'Secure', // HTTPSでのみ送信
    'SameSite=Lax', // CSRF攻撃を防ぐ
    `Path=/`, // サイト全体で有効
    `Max-Age=${SESSION_EXPIRY_SECONDS}` // 有効期限
  ];

  // ドメインが指定されている場合
  if (domain) {
    cookieOptions.push(`Domain=${domain}`);
  }

  return cookieOptions.join('; ');
}

/**
 * セッションクッキーを削除
 */
export function createLogoutCookie(domain?: string): string {
  const cookieOptions = [
    `${SESSION_COOKIE_NAME}=`,
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    'Path=/',
    'Max-Age=0' // 即座に削除
  ];

  if (domain) {
    cookieOptions.push(`Domain=${domain}`);
  }

  return cookieOptions.join('; ');
}

/**
 * リクエストからセッション情報を取得
 */
export async function getSessionFromRequest(
  request: Request,
  secret: string
): Promise<SessionData | null> {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) {
    return null;
  }

  const cookies = parseCookies(cookieHeader);
  const sessionToken = cookies[SESSION_COOKIE_NAME];
  
  if (!sessionToken) {
    return null;
  }

  const payload = await verifyJWT(sessionToken, secret);
  if (!payload) {
    return null;
  }

  return {
    userId: payload.sub, // 文字列ID
    provider: payload.provider,
    providerUserId: payload.provider_user_id,
    email: payload.email,
    name: payload.name,
    pictureUrl: payload.picture_url
  };
}

/**
 * セッション情報をレスポンスヘッダーに追加
 */
export async function addSessionToResponse(
  response: Response,
  sessionData: SessionData,
  secret: string,
  domain?: string
): Promise<Response> {
  const cookie = await createSessionCookieLegacy(sessionData, secret, domain);
  
  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  });
  
  newResponse.headers.set('Set-Cookie', cookie);
  
  return newResponse;
}

/**
 * セッション削除をレスポンスヘッダーに追加
 */
export function addLogoutToResponse(
  response: Response,
  domain?: string
): Response {
  const cookie = createLogoutCookie(domain);
  
  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  });
  
  newResponse.headers.set('Set-Cookie', cookie);
  
  return newResponse;
}

/**
 * 認証が必要なレスポンスを返す
 */
export function createAuthRequiredResponse(redirectUrl?: string): Response {
  if (redirectUrl) {
    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl,
        'Content-Type': 'application/json'
      }
    });
  }

  return new Response(JSON.stringify({
    error: '認証が必要です',
    message: 'ログインしてから再度お試しください。'
  }), {
    status: 401,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

/**
 * セッション検証ミドルウェア
 */
export function createSessionMiddleware(secret: string, domain?: string) {
  return async (request: Request, env: any, ctx: ExecutionContext) => {
    const session = await getSessionFromRequest(request, secret);
    
    if (!session) {
      return createAuthRequiredResponse();
    }

    // セッション情報をリクエストに追加（必要に応じて）
    (request as any).session = session;
    
    return null; // 次のハンドラーに処理を委譲
  };
}

/**
 * クッキー文字列をパース
 */
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  
  cookieHeader.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });
  
  return cookies;
}

/**
 * セッションクッキーを読み取り（新しいAPI）
 */
export async function readSessionCookie(
  request: Request,
  env: { SESSION_SECRET: string; COOKIE_DOMAIN?: string }
): Promise<{ sub: string; name?: string; email?: string } | null> {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) {
    console.log("No cookie header found");
    return null;
  }

  console.log("Cookie header:", cookieHeader);
  
  const m = cookieHeader.match(/uk_session=([^;]+)/);
  if (!m) {
    console.log("No uk_session cookie found");
    return null;
  }
  
  console.log("Found uk_session cookie:", m[1].substring(0, 50) + "...");
  
  const payload = await verifyJWT(m[1], env.SESSION_SECRET);
  if (!payload) {
    console.log("JWT verification failed");
    return null;
  }

  console.log("JWT verification successful:", {
    sub: payload.sub,
    name: payload.name,
    email: payload.email
  });

  return {
    sub: payload.sub,
    name: payload.name,
    email: payload.email
  };
}

/**
 * セッションクッキーを作成（新しいAPI）
 */
export async function createSessionCookie(
  user: { id: string; name?: string; email?: string },
  env: { SESSION_SECRET: string; COOKIE_DOMAIN?: string; SESSION_MAX_AGE_SEC?: string }
): Promise<string> {
  const maxAge = parseInt(env.SESSION_MAX_AGE_SEC || "2592000", 10);
  const sessionData: SessionData = {
    userId: user.id,
    provider: '', // この関数では使用しない
    providerUserId: '', // この関数では使用しない
    email: user.email,
    name: user.name
  };

  const now = Math.floor(Date.now() / 1000);
  const payload: JWTPayload = {
    sub: user.id,
    provider: '',
    provider_user_id: '',
    email: user.email,
    name: user.name,
    picture_url: undefined,
    iat: now,
    exp: now + maxAge
  };

  const token = await signJWT(payload, env.SESSION_SECRET);
  
  const parts = [
    `uk_session=${token}`,
    `Max-Age=${maxAge}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
  ];
  
  // 本番のみ Cookie Domain を付与
  if (env.COOKIE_DOMAIN) {
    parts.push(`Domain=${env.COOKIE_DOMAIN}`);
  }
  
  return parts.join("; ");
}

/**
 * セッション検証（記事作成用）
 */
export async function verifySession(
  request: Request,
  env: { SESSION_SECRET: string; COOKIE_DOMAIN?: string }
): Promise<{ sub: string; name?: string; email?: string } | null> {
  return await readSessionCookie(request, env);
}

/**
 * やさしいエラーメッセージを生成
 */
export function createFriendlySessionErrorMessage(error: string): string {
  const messages: Record<string, string> = {
    'invalid_session': 'セッションが無効です。再度ログインしてください。',
    'expired_session': 'セッションの有効期限が切れています。再度ログインしてください。',
    'missing_session': 'ログインが必要です。',
    'session_error': 'セッションで問題が発生しました。再度ログインしてください。'
  };

  return messages[error] || 'セッションで問題が発生しました。再度ログインしてください。';
}
