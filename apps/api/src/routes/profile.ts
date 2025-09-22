import { queryOne, execute } from "../lib/db";
import { verifySession } from "../lib/session";
import type { Env } from "../index";

/**
 * プロフィール取得
 */
export async function getProfile(req: Request, env: Env): Promise<Response> {
  try {
    const session = await verifySession(req, env);
    if (!session) {
      return new Response(JSON.stringify({ 
        error: '認証が必要です', 
        message: 'ログインしてから再度お試しください。' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // ユーザー情報を取得
    const user = await queryOne(env, `
      SELECT id, provider, email, name, picture_url, created_at, updated_at 
      FROM users WHERE id = ?
    `, [session.sub]);

    if (!user) {
      return new Response(JSON.stringify({ 
        error: 'ユーザーが見つかりません',
        message: 'プロフィール情報が見つかりませんでした。'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      id: user.id,
      provider: user.provider,
      email: user.email,
      name: user.name,
      pictureUrl: user.picture_url,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error('プロフィール取得エラー:', error);
    return new Response(JSON.stringify({
      error: 'プロフィールの取得に失敗しました',
      details: error.message || '不明なエラー'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * プロフィール更新
 */
export async function updateProfile(req: Request, env: Env): Promise<Response> {
  try {
    const session = await verifySession(req, env);
    if (!session) {
      return new Response(JSON.stringify({ 
        error: '認証が必要です', 
        message: 'ログインしてから再度お試しください。' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return new Response(JSON.stringify({ 
        error: '入力エラー', 
        message: '名前は必須です。' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (name.length > 100) {
      return new Response(JSON.stringify({ 
        error: '入力エラー', 
        message: '名前は100文字以内で入力してください。' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // ユーザー名を更新
    console.log('Updating profile for user:', session.sub, 'with name:', name);
    const result = await execute(env, `
      UPDATE users 
      SET name = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
      WHERE id = ?
    `, [name.trim(), session.sub]);

    console.log('Profile update result:', result);

    if (!result.success) {
      throw new Error('プロフィールの更新に失敗しました');
    }

    // 更新されたユーザー情報を取得
    const updatedUser = await queryOne(env, `
      SELECT id, provider, email, name, picture_url, created_at, updated_at 
      FROM users WHERE id = ?
    `, [session.sub]);

    if (!updatedUser) {
      throw new Error('更新後のユーザー情報の取得に失敗しました');
    }

    return new Response(JSON.stringify({
      id: updatedUser.id,
      provider: updatedUser.provider,
      email: updatedUser.email,
      name: updatedUser.name,
      pictureUrl: updatedUser.picture_url,
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error('プロフィール更新エラー:', error);
    return new Response(JSON.stringify({
      error: 'プロフィールの更新に失敗しました',
      details: error.message || '不明なエラー'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
