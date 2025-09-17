// Base64URLエンコード/デコード関数（標準Web APIを使用）

/**
 * OAuth認証で使用する共通ユーティリティ
 * やさしい文言と"あいことば"哲学に基づく実装
 */

// ランダムな文字列を生成（state/nonce用）
export function generateRandomString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomArray = new Uint8Array(length);
  crypto.getRandomValues(randomArray);
  
  for (let i = 0; i < length; i++) {
    result += chars[randomArray[i] % chars.length];
  }
  
  return result;
}

// Base64URLエンコード（UTF-8対応）
export function base64UrlEncode(input: string): string {
  // UTF-8エンコードしてからBase64エンコード
  const utf8Bytes = new TextEncoder().encode(input);
  const base64 = btoa(String.fromCharCode(...utf8Bytes));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Base64URLデコード（UTF-8対応）
export function base64UrlDecode(input: string): string {
  // パディングを追加
  const padded = input + '='.repeat((4 - input.length % 4) % 4);
  // URL-safe文字を標準Base64文字に変換
  const standard = padded.replace(/-/g, '+').replace(/_/g, '/');
  const binaryString = atob(standard);
  // UTF-8デコード
  const utf8Bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    utf8Bytes[i] = binaryString.charCodeAt(i);
  }
  return new TextDecoder().decode(utf8Bytes);
}

// JWTペイロードの型定義
export interface JWTPayload {
  sub: string; // ユーザーID
  provider: string; // 'google' or 'line'
  provider_user_id: string;
  email?: string;
  name?: string;
  picture_url?: string;
  iat: number; // 発行時刻
  exp: number; // 有効期限
}

// JWT署名（HMAC-SHA256）
export async function signJWT(payload: JWTPayload, secret: string): Promise<string> {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signatureInput));
  const encodedSignature = base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
  
  return `${signatureInput}.${encodedSignature}`;
}

// JWT検証（HMAC-SHA256）
export async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    console.log("JWT verification started:", {
      tokenLength: token.length,
      hasSecret: !!secret,
      secretLength: secret.length
    });
    
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log("JWT verification failed: Invalid token format");
      return null;
    }
    
    const [header, payload, signature] = parts;
    const signatureInput = `${header}.${payload}`;
    
    console.log("JWT parts:", {
      headerLength: header.length,
      payloadLength: payload.length,
      signatureLength: signature.length
    });
    
    // 署名の検証
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    
    const expectedSignature = base64UrlDecode(signature);
    const expectedSignatureBytes = new Uint8Array(
      Array.from(expectedSignature).map(char => char.charCodeAt(0))
    );
    
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      expectedSignatureBytes,
      new TextEncoder().encode(signatureInput)
    );
    
    if (!isValid) {
      return null;
    }
    
    // ペイロードの解析
    const decodedPayload = JSON.parse(base64UrlDecode(payload));
    
    // 有効期限のチェック
    if (decodedPayload.exp < Date.now() / 1000) {
      return null;
    }
    
    return decodedPayload;
  } catch (error) {
    console.error('JWT検証エラー:', error);
    return null;
  }
}

// OAuth stateパラメータを生成
export function generateOAuthState(): string {
  const timestamp = Date.now().toString();
  const random = generateRandomString(16);
  const state = `${timestamp}_${random}`;
  return base64UrlEncode(state);
}

// OAuth stateパラメータを検証
export function validateOAuthState(state: string, maxAge: number = 600000): boolean { // デフォルト10分
  try {
    const decodedState = base64UrlDecode(state);
    const [timestampStr] = decodedState.split('_');
    const timestamp = parseInt(timestampStr, 10);
    
    if (isNaN(timestamp)) {
      return false;
    }
    
    const age = Date.now() - timestamp;
    return age <= maxAge && age >= 0;
  } catch (error) {
    console.error('State検証エラー:', error);
    return false;
  }
}

// エラーメッセージの生成（やさしい文言）
export function createFriendlyErrorMessage(error: string, context: string): string {
  const messages: Record<string, string> = {
    'invalid_request': 'リクエストに問題があります。もう一度お試しください。',
    'unauthorized_client': '認証に失敗しました。アプリケーションの設定を確認してください。',
    'access_denied': '認証がキャンセルされました。',
    'unsupported_response_type': '認証方式に問題があります。',
    'invalid_scope': 'アクセス権限に問題があります。',
    'server_error': 'サーバーで問題が発生しました。しばらく時間をおいてからお試しください。',
    'temporarily_unavailable': 'サービスが一時的に利用できません。しばらく時間をおいてからお試しください。'
  };
  
  return messages[error] || `${context}で問題が発生しました。もう一度お試しください。`;
}

// リダイレクトURLの生成
export function buildRedirectUrl(baseUrl: string, path: string, params: Record<string, string> = {}): string {
  const url = new URL(path, baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return url.toString();
}
