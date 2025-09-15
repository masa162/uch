import { readSessionCookie } from "../../lib/session";
import type { Env } from "../../index";

/**
 * GET /auth/me - 現在のユーザー情報を取得
 * セッション検証して最小限のユーザー情報を返却（未ログインは 401）
 */
export async function authMe(req: Request, env: Env) {
  const session = await readSessionCookie(req, env);
  
  if (!session) {
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
