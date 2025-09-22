import { readSessionCookie } from "../../lib/session";
import type { Env } from "../../index";

/**
 * GET /auth/me - 現在のユーザー情報を取得
 * セッション検証して最小限のユーザー情報を返却（未ログインは 401）
 */
export async function authMe(req: Request, env: Env) {
  console.log("AuthMe Debug:", {
    cookies: req.headers.get('Cookie') || 'No cookies',
    hasSessionSecret: !!env.SESSION_SECRET,
    hasCookieDomain: !!env.COOKIE_DOMAIN
  });
  
  const session = await readSessionCookie(req, env);
  
  console.log("Session validation result:", {
    hasSession: !!session,
    sessionData: session
  });
  
  if (!session) {
    console.log("Session validation failed - returning 401");
    return new Response(JSON.stringify({ 
      ok: false, 
      message: "ログインが必要です。" 
    }), {
      status: 401, 
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    });
  }
  
  // 必要最小限だけ返す
  return new Response(JSON.stringify({ 
    ok: true, 
    user: { 
      id: session.sub, 
      name: session.name, 
      email: session.email 
    }
  }), {
    headers: { 
      "Content-Type": "application/json", 
      "Cache-Control": "no-store" 
    }
  });
}
