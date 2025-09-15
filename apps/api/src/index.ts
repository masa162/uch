import { handleHealth } from "./routes/health";
import { handleMemories } from "./routes/memories";
import { googleStart, handleGoogleAuthCallback } from "./routes/auth/google";
import { handleLineAuthStart, handleLineAuthCallback } from "./routes/auth/line";
import type { Env } from "./index"; // 既にあるならそのままでOK

export interface Env {
  DB: D1Database;
  FRONTEND_URL: string;
  JWT_SECRET: string;
  SESSION_SECRET: string;
  SESSION_MAX_AGE_SEC: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REDIRECT_URI: string;
  LINE_CLIENT_ID: string;
  LINE_CLIENT_SECRET: string;
  LINE_REDIRECT_URI: string;
  // COOKIE_DOMAIN は本番だけ（ダッシュボード Vars/Secrets）
  COOKIE_DOMAIN?: string;
}

const routes: Record<string, (req: Request, env: Env) => Promise<Response> | Response> = {
  "GET /health": (_req, _env) => handleHealth(),
  "GET /memories": (req, env) => handleMemories(req, env),
  "GET /api/articles": (req, env) => handleMemories(req, env), // エイリアス
  "POST /api/articles": async (req, env) => {
    const mod = await import("./routes/articles");
    return mod.createArticle(req, env);
  },
  "GET /api/articles/[id]": async (req, env) => {
    const mod = await import("./routes/articles");
    return mod.getArticle(req, env);
  },
  "GET /auth/google/start": (req, env) => googleStart(req, env),
  "GET /auth/google/callback": (req, env) => handleGoogleAuthCallback(req, env),
  "GET /auth/line/start": (req, env) => handleLineAuthStart(req, env),
  "GET /auth/line/callback": (req, env) => handleLineAuthCallback(req, env),
  "GET /auth/me": async (req, env) => {
    const mod = await import("./routes/auth/me");
    return mod.authMe(req, env);
  },
  "POST /auth/logout": (_req, env) => {
    // import の循環回避のため遅延 import
    return import("./routes/auth/logout").then(m => m.authLogout(_req, env));
  },
};

function keyOf(req: Request) {
  const url = new URL(req.url);
  const method = req.method.toUpperCase();
  const pathname = url.pathname;
  
  // 動的ルートの処理
  if (pathname.startsWith('/api/articles/') && pathname !== '/api/articles') {
    return `${method} /api/articles/[id]`;
  }
  
  return `${method} ${pathname}`;
}

// CORS設定
function setCorsHeaders(response: Response, origin?: string): Response {
  const headers = new Headers(response.headers);
  
  // 許可するオリジン
  const allowedOrigins = [
    'https://uchinokiroku.com',
    'http://localhost:3000',
    'https://localhost:3000'
  ];
  
  if (origin && allowedOrigins.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // プリフライトリクエストの場合
    headers.set('Access-Control-Allow-Origin', 'https://uchinokiroku.com');
  }
  
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  headers.set('Access-Control-Allow-Credentials', 'true');
  headers.set('Access-Control-Max-Age', '86400');
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

export default {
  async fetch(req: Request, env: Env) {
    const url = new URL(req.url);
    const origin = req.headers.get('Origin');
    
    // OPTIONS プリフライトリクエストの処理
    if (req.method === 'OPTIONS') {
      return setCorsHeaders(new Response(null, { status: 200 }), origin);
    }
    
    // デバッグ用：ルート一覧を確認（最優先でチェック）
    if (url.pathname === "/__debug/routes") {
      const response = new Response(JSON.stringify({ 
        routes: Object.keys(routes),
        total: Object.keys(routes).length
      }), {
        headers: { "Content-Type": "application/json" }
      });
      return setCorsHeaders(response, origin);
    }

    // デバッグ用：環境変数の確認
    if (url.pathname === "/__debug/env") {
      const response = new Response(JSON.stringify({
        GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID ? "設定済み" : "未設定",
        GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET ? "設定済み" : "未設定",
        GOOGLE_REDIRECT_URI: env.GOOGLE_REDIRECT_URI || "未設定",
        FRONTEND_URL: env.FRONTEND_URL || "未設定"
      }), {
        headers: { "Content-Type": "application/json" }
      });
      return setCorsHeaders(response, origin);
    }

    const key = keyOf(req);
    const handler = routes[key];

    // デバッグ用: 実際に来たパスをログ
    console.log("[router]", key);

    if (handler) {
      const response = await handler(req, env);
      return setCorsHeaders(response, origin);
    }

    // ルート（/）だけは案内を返しておくと便利
    if (new URL(req.url).pathname === "/") {
      return setCorsHeaders(new Response(null, { status: 302, headers: { Location: "/health" } }), origin);
    }

    // 404（利用可能なエンドポイント一覧つき）
    const response = new Response(
      JSON.stringify({
        error: "Not Found",
        message: "お探しのページが見つかりませんでした。",
        available_endpoints: Object.keys(routes),
      }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
    return setCorsHeaders(response, origin);
  },
};