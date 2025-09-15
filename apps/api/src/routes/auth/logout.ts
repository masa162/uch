import type { Env } from "../../index";

/**
 * POST /auth/logout - セッションクッキーを破棄
 * セッションクッキー破棄（Max-Age=0）を返す
 */
export function authLogout(_req: Request, env: Env) {
  const parts = [
    "uk_session=",
    "Max-Age=0",
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
  ];
  
  // 本番のみ Cookie Domain を付与
  if (env.COOKIE_DOMAIN) {
    parts.push(`Domain=${env.COOKIE_DOMAIN}`);
  }
  
  return new Response(null, { 
    status: 204, 
    headers: { 
      "Set-Cookie": parts.join("; ") 
    }
  });
}
