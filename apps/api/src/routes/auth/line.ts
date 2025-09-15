import { generateOAuthState, validateOAuthState, createFriendlyErrorMessage, buildRedirectUrl } from '../../lib/oauth';
import { createSessionCookie } from '../../lib/session';
import { upsertUser, createOAuthUserData } from '../../lib/users';
import type { Env } from '../../index';

/**
 * LINE OAuth認証ルート
 * /auth/line/start - LINE認可画面へのリダイレクト
 * /auth/line/callback - LINEからのコールバック処理
 */

// LINE OAuth認可URL
const LINE_AUTH_URL = 'https://access.line.me/oauth2/v2.1/authorize';

// LINE Token取得URL
const LINE_TOKEN_URL = 'https://api.line.me/oauth2/v2.1/token';

// LINE Profile取得URL
const LINE_PROFILE_URL = 'https://api.line.me/v2/profile';

/**
 * LINE認証開始
 * GET /auth/line/start
 */
export async function handleLineAuthStart(req: Request, env: Env): Promise<Response> {
  try {
    // 環境変数の確認
    if (!env.LINE_CLIENT_ID || !env.LINE_REDIRECT_URI) {
      return new Response(JSON.stringify({
        error: '設定エラー',
        message: 'LINE OAuthの設定が完了していません。'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // stateパラメータを生成
    const state = generateOAuthState();

    // LINE認可URLを構築
    const authUrl = buildRedirectUrl(LINE_AUTH_URL, '', {
      response_type: 'code',
      client_id: env.LINE_CLIENT_ID,
      redirect_uri: env.LINE_REDIRECT_URI,
      state: state,
      scope: 'profile openid email',
      nonce: generateOAuthState() // LINEではnonceも使用
    });

    // リダイレクト
    return new Response(null, {
      status: 302,
      headers: {
        'Location': authUrl,
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('LINE認証開始エラー:', error);
    return new Response(JSON.stringify({
      error: '認証エラー',
      message: 'LINE認証の開始に失敗しました。もう一度お試しください。'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * LINE認証コールバック
 * GET /auth/line/callback
 */
export async function handleLineAuthCallback(req: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    // エラーチェック
    if (error) {
      const friendlyMessage = createFriendlyErrorMessage(error, 'LINE認証');
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

    // stateの検証
    if (!validateOAuthState(state)) {
      return new Response(JSON.stringify({
        error: 'セキュリティエラー',
        message: '認証リクエストが無効です。もう一度お試しください。'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 環境変数の確認
    if (!env.LINE_CLIENT_ID || !env.LINE_CLIENT_SECRET || !env.LINE_REDIRECT_URI) {
      return new Response(JSON.stringify({
        error: '設定エラー',
        message: 'LINE OAuthの設定が完了していません。'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // アクセストークンの取得
    const tokenResponse = await fetch(LINE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: env.LINE_REDIRECT_URI,
        client_id: env.LINE_CLIENT_ID,
        client_secret: env.LINE_CLIENT_SECRET
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('LINE token取得エラー:', errorData);
      return new Response(JSON.stringify({
        error: '認証エラー',
        message: 'LINE認証で問題が発生しました。もう一度お試しください。'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // プロフィール情報の取得
    const profileResponse = await fetch(LINE_PROFILE_URL, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!profileResponse.ok) {
      console.error('LINE profile取得エラー:', profileResponse.status);
      return new Response(JSON.stringify({
        error: '認証エラー',
        message: 'プロフィール情報の取得に失敗しました。もう一度お試しください。'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const profileData = await profileResponse.json();

    // LINEではID Tokenも取得できる場合があるので、email情報を取得
    let email = undefined;
    if (tokenData.id_token) {
      try {
        // ID Tokenからemailを取得（簡易的な実装）
        const idTokenParts = tokenData.id_token.split('.');
        if (idTokenParts.length === 3) {
          const payload = JSON.parse(atob(idTokenParts[1]));
          email = payload.email;
        }
      } catch (error) {
        console.warn('ID Token解析エラー:', error);
      }
    }

    // ユーザー情報をupsert
    const oauthUserData = createOAuthUserData('line', profileData.userId, {
      email: email,
      name: profileData.displayName,
      picture: profileData.pictureUrl
    });

    const user = await upsertUser(env.DB, oauthUserData);

    // セッションクッキーを作成（新しいAPI）
    const cookie = await createSessionCookie(
      { id: user.id, name: user.name, email: user.email },
      env
    );

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
    console.error('LINE認証コールバックエラー:', error);
    return new Response(JSON.stringify({
      error: '認証エラー',
      message: '認証処理で問題が発生しました。もう一度お試しください。'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
