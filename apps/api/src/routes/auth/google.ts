import { createFriendlyErrorMessage } from '../../lib/oauth';
import { createSessionCookie } from '../../lib/session';
import { upsertUser, createOAuthUserData } from '../../lib/users';
import type { Env } from '../../index';

/**
 * Google OAuth認証ルート
 * /auth/google/start - Google認可画面へのリダイレクト
 * /auth/google/callback - Googleからのコールバック処理
 */

// Google OAuth認可URL
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

// Google Token取得URL
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

// Google UserInfo取得URL
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

// 乱数とbase64url（既存に utils があればそれを使ってOK）
function randomString(len = 24) {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  const b64 = btoa(String.fromCharCode(...arr));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

export async function googleStart(req: Request, env: Env) {
  try {
    // デバッグ用：環境変数の確認
    console.log("Google OAuth Debug:", {
      hasClientId: !!env.GOOGLE_CLIENT_ID,
      hasRedirectUri: !!env.GOOGLE_REDIRECT_URI,
      clientIdLength: env.GOOGLE_CLIENT_ID?.length || 0,
      redirectUri: env.GOOGLE_REDIRECT_URI
    });

    // 環境変数の確認
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_REDIRECT_URI) {
      return new Response(JSON.stringify({
        error: "設定エラー",
        message: "Google OAuthの設定が完了していません。",
        debug: {
          hasClientId: !!env.GOOGLE_CLIENT_ID,
          hasRedirectUri: !!env.GOOGLE_REDIRECT_URI
        }
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 1) state / nonce 生成
    const state = randomString(24);
    const nonce = randomString(24);

    // 2) 認可URLを組み立て
    const url = new URL(AUTH_URL);
    url.searchParams.set("client_id", env.GOOGLE_CLIENT_ID);
    url.searchParams.set("redirect_uri", env.GOOGLE_REDIRECT_URI);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("state", state);
    url.searchParams.set("nonce", nonce);
    url.searchParams.set("prompt", "consent");

    // デバッグ用：実際のURLをログ出力
    console.log("Google OAuth URL:", url.toString());
    console.log("Client ID:", env.GOOGLE_CLIENT_ID);
    console.log("Redirect URI:", env.GOOGLE_REDIRECT_URI);

    // 3) state を短寿命Cookieに保存（CSRF対策）
    const parts = [
      `uk_oauth_state=${state}`,
      "Max-Age=300",         // 5分
      "Path=/",
      "HttpOnly",
      "SameSite=None"
    ];
    if (!new URL(req.url).hostname.includes("localhost")) {
      parts.push("Secure"); // 本番/httpsのみ
      // ドメイン設定は削除（デフォルトのドメインを使用）
    }
    const cookie = parts.join("; ");

    console.log("Cookie being set:", cookie);
    console.log("COOKIE_DOMAIN:", env.COOKIE_DOMAIN);

    // 4) 302でGoogle 認可画面へ
    return new Response(null, {
      status: 302,
      headers: {
        Location: url.toString(),
        "Set-Cookie": cookie
      }
    });

  } catch (error) {
    console.error("Google OAuth Start Error:", error);
    return new Response(JSON.stringify({
      error: "内部エラー",
      message: "認証の開始でエラーが発生しました。",
      debug: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

/**
 * Google認証コールバック
 * GET /auth/google/callback
 */
export async function handleGoogleAuthCallback(req: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(req.url);
    
    console.log("Google OAuth Callback Debug:", {
      url: req.url,
      hasCode: !!url.searchParams.get('code'),
      hasState: !!url.searchParams.get('state'),
      hasError: !!url.searchParams.get('error')
    });

    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    // エラーチェック
    if (error) {
      const friendlyMessage = createFriendlyErrorMessage(error, 'Google認証');
      return new Response(JSON.stringify({
        error: '認証エラー',
        message: friendlyMessage
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 必須パラメータの確認
    if (!code || !state) {
      return new Response(JSON.stringify({
        error: 'パラメータエラー',
        message: '認証に必要な情報が不足しています。'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // stateの検証（Cookieから取得したstateと比較）
    const cookies = req.headers.get('Cookie') || '';
    const cookieMatch = cookies.match(/uk_oauth_state=([^;]+)/);
    const cookieState = cookieMatch ? cookieMatch[1] : null;
    
    console.log("State validation debug:", {
      cookies: cookies,
      cookieMatch: cookieMatch,
      cookieState: cookieState,
      receivedState: state,
      statesMatch: cookieState === state,
      allHeaders: Object.fromEntries(req.headers.entries())
    });
    
    // State検証を有効化
    if (!cookieState || cookieState !== state) {
      console.log("State validation failed:", {
        cookieState: cookieState,
        receivedState: state,
        cookies: cookies
      });
      return new Response(JSON.stringify({
        error: 'セキュリティエラー',
        message: '認証リクエストが無効です。もう一度お試しください。'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 環境変数の確認
    console.log("Google OAuth Callback Env Debug:", {
      hasClientId: !!env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!env.GOOGLE_CLIENT_SECRET,
      hasRedirectUri: !!env.GOOGLE_REDIRECT_URI,
      hasDB: !!env.DB,
      clientIdLength: env.GOOGLE_CLIENT_ID?.length || 0,
      redirectUri: env.GOOGLE_REDIRECT_URI
    });

    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_REDIRECT_URI) {
      return new Response(JSON.stringify({
        error: '設定エラー',
        message: 'Google OAuthの設定が完了していません。',
        debug: {
          hasClientId: !!env.GOOGLE_CLIENT_ID,
          hasClientSecret: !!env.GOOGLE_CLIENT_SECRET,
          hasRedirectUri: !!env.GOOGLE_REDIRECT_URI
        }
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // アクセストークンの取得
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: env.GOOGLE_REDIRECT_URI
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Google token取得エラー:', errorData);
      return new Response(JSON.stringify({
        error: '認証エラー',
        message: 'Google認証で問題が発生しました。もう一度お試しください。'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const tokenData = await tokenResponse.json() as {
      access_token: string;
      token_type: string;
      expires_in: number;
    };
    const accessToken = tokenData.access_token;

    // ユーザー情報の取得
    const userResponse = await fetch(GOOGLE_USERINFO_URL, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!userResponse.ok) {
      console.error('Google userinfo取得エラー:', userResponse.status);
      return new Response(JSON.stringify({
        error: '認証エラー',
        message: 'ユーザー情報の取得に失敗しました。もう一度お試しください。'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userData = await userResponse.json() as {
      id: string;
      email: string;
      name: string;
      picture: string;
    };

    // ユーザー情報をupsert
    console.log("Creating OAuth user data:", {
      provider: 'google',
      providerUserId: userData.id,
      email: userData.email,
      name: userData.name
    });

    const oauthUserData = createOAuthUserData('google', userData.id, {
      email: userData.email,
      name: userData.name,
      picture: userData.picture
    });

    console.log("OAuth user data created:", oauthUserData);

    const user = await upsertUser(env.DB, oauthUserData);
    console.log("User upserted successfully:", { id: user.id, name: user.name, email: user.email });

    // セッションクッキーを作成（新しいAPI）
    console.log("Creating session cookie...");
    const cookie = await createSessionCookie(
      { id: user.id, name: user.name, email: user.email },
      env
    );
    console.log("Session cookie created successfully");

    // フロントエンドにリダイレクト
    const frontendUrl = env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}?auth=success`;

    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl,
        'Set-Cookie': cookie,
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('Google認証コールバックエラー:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return new Response(JSON.stringify({
      error: '認証エラー',
      message: '認証処理で問題が発生しました。もう一度お試しください。',
      debug: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
