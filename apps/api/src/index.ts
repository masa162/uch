import { handleHealth } from "./routes/health";
import { handleMemories } from "./routes/memories";
import { googleStart, handleGoogleAuthCallback } from "./routes/auth/google";
import { handleLineAuthStart, handleLineAuthCallback } from "./routes/auth/line";
import { migrate } from "./routes/migrate";
import { test } from "./routes/test";
import { readSessionCookie } from "./lib/session"; // Added import for debug endpoint
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
  LINE_CHANNEL_ID: string;
  LINE_CHANNEL_SECRET: string;
  LINE_REDIRECT_URI: string;
  // COOKIE_DOMAIN は本番だけ（ダッシュボード Vars/Secrets）
  COOKIE_DOMAIN?: string;
}

// 開発環境用のCORSヘッダーを追加する関数
function addCorsHeaders(response: Response): Response {
  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });

  newResponse.headers.set("Access-Control-Allow-Origin", "http://localhost:3001");
  newResponse.headers.set("Access-Control-Allow-Credentials", "true");

  return newResponse;
}

const routes: Record<string, (req: Request, env: Env) => Promise<Response> | Response> = {
  "GET /health": (_req, _env) => handleHealth(),
  "GET /api/test": (req, env) => test(req, env),
  "GET /api/debug-media": async (req, env) => {
    console.log('=== DEBUG MEDIA ENDPOINT CALLED ===');
    console.log('Request URL:', req.url);
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    console.log('Cookies:', req.headers.get('Cookie') || 'No cookies');

    const session = await readSessionCookie(req, env);
    console.log('Session check result:', session ? 'authenticated' : 'not authenticated');

    return new Response(JSON.stringify({
      message: "Debug endpoint reached!",
      timestamp: new Date().toISOString(),
      session: session ? { sub: session.sub, exp: session.exp } : null,
      headers: Object.fromEntries(req.headers.entries())
    }), {
      headers: { "Content-Type": "application/json" },
    });
  },
  "OPTIONS /api/dev-login": (req, env) => {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:3001",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400"
      }
    });
  },
  "POST /api/dev-login": async (req, env) => {
    // 開発環境でのみ使用するテストセッション作成
    const { createSessionCookie } = await import("./lib/session");

    const testUserId = "06CN9Z2T33E70TH22BSCQ3ZP"; // 既存のテストユーザーID
    console.log('🛠️ Dev login: Creating session for user:', testUserId);
    const testUser = {
      id: testUserId,
      name: "テストユーザー",
      email: "test@example.com"
    };
    const sessionToken = await createSessionCookie(testUser, env);
    console.log('🛠️ Dev login: Session token created:', sessionToken ? 'Success' : 'Failed');

    const response = new Response(JSON.stringify({
      success: true,
      message: "Development session created",
      userId: testUserId
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:3001",
        "Access-Control-Allow-Credentials": "true"
      },
    });

    response.headers.set("Set-Cookie", sessionToken);
    return response;
  },
  "POST /api/migrate": (req, env) => migrate(req, env),
  "GET /memories": (req, env) => handleMemories(req, env),
  "OPTIONS /api/articles": (req, env) => {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:3001",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Credentials": "true"
      }
    });
  },
  "GET /api/articles/search": (req, env) => handleMemories(req, env), // 検索用エイリアス（qパラメータ対応）
  "OPTIONS /api/search": (req, env) => {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:3001",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Credentials": "true"
      }
    });
  },
  "GET /api/search": async (req, env) => {
    const mod = await import("./routes/search");
    const response = await mod.handleUnifiedSearch(req, env);
    return addCorsHeaders(response);
  },
  "POST /api/articles": async (req, env) => {
    const mod = await import("./routes/articles");
    const response = await mod.createArticle(req, env);
    return addCorsHeaders(response);
  },
  "GET /api/articles/[id]": async (req, env) => {
    const mod = await import("./routes/articles");
    return mod.getArticle(req, env);
  },
  "PATCH /api/articles/[id]": async (req, env) => {
    const mod = await import("./routes/articles");
    return mod.updateArticle(req, env);
  },
  "DELETE /api/articles/[id]": async (req, env) => {
    const mod = await import("./routes/articles");
    return mod.deleteArticle(req, env);
  },
  "GET /api/tags": async (req, env) => {
    const mod = await import("./routes/articles");
    return mod.getTags(req, env);
  },
  "GET /api/articles": async (req, env) => {
    const url = new URL(req.url);
    const tagParam = url.searchParams.get('tag');

    if (tagParam) {
      // タグフィルタリング
      const mod = await import("./routes/articles");
      return mod.getArticlesByTag(req, env);
    } else {
      // 通常の記事一覧 (既存の検索機能を利用)
      const mod = await import("./routes/search");
      return mod.handleUnifiedSearch(req, env);
    }
  },
  "OPTIONS /api/media": (req, env) => {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:3001",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Credentials": "true"
      }
    });
  },
  "GET /api/media": async (req, env) => {
    const mod = await import("./routes/media");
    const response = await mod.getMedia(req, env);
    return addCorsHeaders(response);
  },
  "GET /api/media-debug": async (req, env) => {
    const mod = await import("./routes/media");
    const response = await mod.getMediaDebugInfo(req, env);
    return addCorsHeaders(response);
  },
  "GET /auth/google/start": (req, env) => googleStart(req, env),
  "GET /auth/google/callback": (req, env) => handleGoogleAuthCallback(req, env),
  "GET /auth/line/start": (req, env) => handleLineAuthStart(req, env),
  "GET /auth/line/callback": (req, env) => handleLineAuthCallback(req, env),
  "OPTIONS /auth/me": (req, env) => {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:3001",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Credentials": "true"
      }
    });
  },
  "GET /auth/me": async (req, env) => {
    const mod = await import("./routes/auth/me");
    const response = await mod.authMe(req, env);
    return addCorsHeaders(response);
  },
  // メディア関連のルート（重複削除済み）
  "POST /api/media/generate-upload-url": async (req, env) => {
    const mod = await import("./routes/media");
    return mod.generateUploadUrl(req, env);
  },
  "POST /api/media/upload-r2": async (req, env) => {
    const mod = await import("./routes/media");
    return mod.uploadToR2(req, env);
  },
  "POST /api/media/upload-direct": async (req, env) => {
    const mod = await import("./routes/media");
    return mod.uploadDirect(req, env);
  },
  "GET /api/media/[id]": async (req, env) => {
    const mod = await import("./routes/media");
    const url = new URL(req.url);
    const mediaId = url.pathname.split('/').pop();
    if (!mediaId) {
      return new Response(JSON.stringify({ error: "メディアIDが必要です" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    return mod.getMediaFile(req, env, mediaId);
  },
  "DELETE /api/media/[id]": async (req, env) => {
    const mod = await import("./routes/media");
    const url = new URL(req.url);
    const mediaId = url.pathname.split('/').pop();
    if (!mediaId) {
      return new Response(JSON.stringify({ error: "メディアIDが必要です" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    return mod.deleteMedia(req, env, mediaId);
  },
  "GET /api/media/[id]/image": async (req, env) => {
    const mod = await import("./routes/media");
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const mediaId = pathParts[pathParts.length - 2]; // /api/media/[id]/image
    console.log('Media file request:', { pathname: url.pathname, mediaId, pathParts });
    if (!mediaId) {
      return new Response(JSON.stringify({ error: "メディアIDが必要です" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    return mod.getMediaFile(req, env, mediaId);
  },
  // filename-path based fetch (e.g., /api/media/<userId>/<timestamp>_<name>)
  "GET /api/media/by-filename": async (req, env) => {
    const mod = await import("./routes/media");
    const url = new URL(req.url);
    const filenamePath = decodeURIComponent(url.pathname.replace(/^\/api\/media\//, ''));
    return mod.getMediaByFilename(req, env, filenamePath);
  },
  // Cloudflare Stream
  "POST /api/video/sign": async (req, env) => {
    const mod = await import("./routes/media");
    return mod.signVideoUpload(req, env);
  },
  "POST /api/media/register-video": async (req, env) => {
    const mod = await import("./routes/media");
    return mod.registerVideo(req, env);
  },
  "POST /auth/logout": (_req, env) => {
    // import の循環回避のため遅延 import
    return import("./routes/auth/logout").then(m => m.authLogout(_req, env));
  },
  "GET /api/profile": async (req, env) => {
    const mod = await import("./routes/profile");
    return mod.getProfile(req, env);
  },
  "PUT /api/profile": async (req, env) => {
    const mod = await import("./routes/profile");
    return mod.updateProfile(req, env);
  },
};

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
function keyOf(req: Request) {
  const url = new URL(req.url);
  const method = req.method.toUpperCase();
  // 正規化（末尾スラッシュを除去、ただしルートは除く）
  let pathname = url.pathname;
  if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.replace(/\/+$/, '');
  
  // 動的ルートの処理
  if (pathname.startsWith('/api/articles/') && pathname !== '/api/articles' && pathname !== '/api/articles/search') {
    return `${method} /api/articles/[id]`;
  }
  // まずは固定パスを優先マッチ
  if (pathname === '/api/video/sign') {
    return `${method} /api/video/sign`;
  }
  if (pathname === '/api/media/register-video') {
    return `${method} /api/media/register-video`;
  }
  if (pathname === '/api/media/generate-upload-url') {
    return `${method} /api/media/generate-upload-url`;
  }
  if (pathname === '/api/media/upload-r2') {
    return `${method} /api/media/upload-r2`;
  }
  if (pathname === '/api/media/upload-direct') {
    return `${method} /api/media/upload-direct`;
  }

  // /api/media/:id/image → GET /api/media/[id]/image
  if (pathname.match(/^\/api\/media\/[^/]+\/image$/)) {
    return `${method} /api/media/[id]/image`;
  }
  // Any other GET under /api/media/* is treated as filename-path based fetch
  // （/api/media/<userId>/<timestamp>_<name> 等）
  if (method === 'GET' && pathname.startsWith('/api/media/')) {
    const remainder = pathname.replace(/^\/api\/media\//, '');
    const decodedRemainder = safeDecodeURIComponent(remainder);
    const hasNestedPath = remainder.includes('/') || decodedRemainder.includes('/');

    if (hasNestedPath || !pathname.match(/^\/api\/media\/[^/]+(\/image)?$/)) {
      return `${method} /api/media/by-filename`;
    }
  }
  // /api/media/:id → GET /api/media/[id] or DELETE /api/media/[id]
  if (pathname.match(/^\/api\/media\/[^/]+$/)) {
    // Exclude reserved endpoints like generate-upload-url, upload-r2, upload-direct, register-video
    const seg = pathname.split('/').pop() || '';
    const reserved = new Set(['generate-upload-url','upload-r2','upload-direct','register-video','by-filename']);
    if (!reserved.has(seg) && (method === 'DELETE' || method === 'GET')) {
      return `${method} /api/media/[id]`;
    }
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
    'http://localhost:3001',
    'https://localhost:3000'
  ];
  
  if (origin && allowedOrigins.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // プリフライトリクエストの場合
    headers.set('Access-Control-Allow-Origin', 'https://uchinokiroku.com');
  }
  
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
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
    
    // デバッグ用：LINE認証コールバックの詳細確認
    if (url.pathname === "/__debug/line-callback") {
      try {
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');
        
        // 環境変数の確認
        const envCheck = {
          hasChannelId: !!env.LINE_CHANNEL_ID,
          hasChannelSecret: !!env.LINE_CHANNEL_SECRET,
          hasRedirectUri: !!env.LINE_REDIRECT_URI,
          channelIdLength: env.LINE_CHANNEL_ID?.length || 0,
          redirectUri: env.LINE_REDIRECT_URI
        };
        
        const response = new Response(JSON.stringify({
          code,
          state,
          envCheck,
          cookies: req.headers.get('Cookie') || 'No cookies'
        }), {
          headers: { "Content-Type": "application/json" }
        });
        return setCorsHeaders(response, origin);
      } catch (error) {
        const response = new Response(JSON.stringify({
          error: error.message,
          stack: error.stack
        }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
        return setCorsHeaders(response, origin);
      }
    }

    // デバッグ用：環境変数の確認
    if (url.pathname === "/__debug/env") {
      const response = new Response(JSON.stringify({
        GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID ? "設定済み" : "未設定",
        GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET ? "設定済み" : "未設定",
        GOOGLE_REDIRECT_URI: env.GOOGLE_REDIRECT_URI || "未設定",
        FRONTEND_URL: env.FRONTEND_URL || "未設定",
        STREAM_ACCOUNT_ID: (env as any).STREAM_ACCOUNT_ID || (env as any).STREAM_ACCOUNT ? "設定済み" : "未設定",
        STREAM_TOKEN: (env as any).STREAM_TOKEN ? "設定済み（Secret）" : "未設定",
        HAS_R2_BUCKET: !!(env as any).R2_BUCKET
      }), {
        headers: { "Content-Type": "application/json" }
      });
      return setCorsHeaders(response, origin);
    }

    const key = keyOf(req);
    const handler = routes[key];

    // デバッグ用: 実際に来たパスをログ
    console.log("[router]", key, "handler exists:", !!handler);

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
