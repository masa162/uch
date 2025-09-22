// D1Database type is available globally in Cloudflare Workers
import type { SessionData } from './session';
import { ulid } from './id';

/**
 * ユーザー管理ライブラリ
 * D1データベースでのユーザー情報の管理
 * やさしい文言と"あいことば"哲学に基づく実装
 */

export interface User {
  id: string; // ULID/UUID文字列
  provider: string;
  provider_user_id: string;
  email?: string;
  name?: string;
  picture_url?: string;
  created_at: string;
  updated_at: string;
}

export interface OAuthUserData {
  provider: string;
  provider_user_id: string;
  email?: string;
  name?: string;
  picture_url?: string;
}

/**
 * ユーザーをupsert（存在しない場合は作成、存在する場合は更新）
 */
export async function upsertUser(
  db: D1Database,
  userData: OAuthUserData
): Promise<User> {
  try {
    // まず既存ユーザーを検索
    const existingUser = await db
      .prepare(`
        SELECT * FROM users 
        WHERE provider = ? AND provider_user_id = ?
      `)
      .bind(userData.provider, userData.provider_user_id)
      .first<User>();

    if (existingUser) {
      // 既存ユーザーを更新
      const updatedUser = await db
        .prepare(`
          UPDATE users 
          SET email = ?, name = ?, picture_url = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
          WHERE provider = ? AND provider_user_id = ?
          RETURNING *
        `)
        .bind(
          userData.email || existingUser.email,
          userData.name || existingUser.name,
          userData.picture_url || existingUser.picture_url,
          userData.provider,
          userData.provider_user_id
        )
        .first<User>();

      if (!updatedUser) {
        throw new Error('ユーザー更新に失敗しました');
      }

      return updatedUser;
    } else {
      // 新規ユーザーを作成（ULIDを生成）
      const id = ulid();
      const newUser = await db
        .prepare(`
          INSERT INTO users (id, provider, provider_user_id, email, name, picture_url)
          VALUES (?, ?, ?, ?, ?, ?)
          RETURNING *
        `)
        .bind(
          id,
          userData.provider,
          userData.provider_user_id,
          userData.email || null,
          userData.name || null,
          userData.picture_url || null
        )
        .first<User>();

      if (!newUser) {
        throw new Error('ユーザー作成に失敗しました');
      }

      return newUser;
    }
  } catch (error) {
    console.error('ユーザーupsertエラー:', error);
    throw new Error('ユーザー情報の保存に失敗しました');
  }
}

/**
 * プロバイダーベースのupsert（新しいAPI）
 */
export async function upsertUserByProvider(
  env: { DB: D1Database },
  provider: "google"|"line",
  providerUserId: string,
  profile: { name?: string; email?: string; picture?: string }
) {
  const existing = await env.DB.prepare(
    "SELECT * FROM users WHERE provider=? AND provider_user_id=? LIMIT 1;"
  ).bind(provider, providerUserId).first<any>();

  if (existing) {
    await env.DB.prepare(
      "UPDATE users SET name=?, email=?, picture_url=?, updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?;"
    ).bind(profile.name, profile.email, profile.picture, existing.id).run();
    return existing;
  } else {
    const id = ulid(); // ← 新規はULID
    await env.DB.prepare(
      "INSERT INTO users(id, provider, provider_user_id, name, email, picture_url) VALUES(?, ?, ?, ?, ?, ?);"
    ).bind(id, provider, providerUserId, profile.name, profile.email, profile.picture).run();
    return { id, provider, provider_user_id: providerUserId, ...profile };
  }
}

/**
 * IDでユーザーを取得
 */
export async function getUserById(
  db: D1Database,
  userId: string
): Promise<User | null> {
  try {
    const user = await db
      .prepare('SELECT * FROM users WHERE id = ?')
      .bind(userId)
      .first<User>();

    return user || null;
  } catch (error) {
    console.error('ユーザー取得エラー:', error);
    throw new Error('ユーザー情報の取得に失敗しました');
  }
}

/**
 * プロバイダーとプロバイダーユーザーIDでユーザーを取得
 */
export async function getUserByProvider(
  db: D1Database,
  provider: string,
  providerUserId: string
): Promise<User | null> {
  try {
    const user = await db
      .prepare('SELECT * FROM users WHERE provider = ? AND provider_user_id = ?')
      .bind(provider, providerUserId)
      .first<User>();

    return user || null;
  } catch (error) {
    console.error('ユーザー取得エラー:', error);
    throw new Error('ユーザー情報の取得に失敗しました');
  }
}

/**
 * ユーザーをSessionDataに変換
 */
export function userToSessionData(user: User): SessionData {
  return {
    userId: user.id, // 文字列ID
    provider: user.provider,
    providerUserId: user.provider_user_id,
    email: user.email || undefined,
    name: user.name || undefined,
    pictureUrl: user.picture_url || undefined
  };
}

/**
 * OAuthプロバイダーから取得したデータをOAuthUserDataに変換
 */
export function createOAuthUserData(
  provider: string,
  providerUserId: string,
  profile: {
    email?: string;
    name?: string;
    picture?: string;
  }
): OAuthUserData {
  return {
    provider,
    provider_user_id: providerUserId,
    email: profile.email,
    name: profile.name,
    picture_url: profile.picture
  };
}

/**
 * ユーザー統計情報を取得
 */
export async function getUserStats(db: D1Database): Promise<{
  totalUsers: number;
  googleUsers: number;
  lineUsers: number;
}> {
  try {
    const [totalResult, googleResult, lineResult] = await Promise.all([
      db.prepare('SELECT COUNT(*) as count FROM users').first<{ count: number }>(),
      db.prepare('SELECT COUNT(*) as count FROM users WHERE provider = "google"').first<{ count: number }>(),
      db.prepare('SELECT COUNT(*) as count FROM users WHERE provider = "line"').first<{ count: number }>()
    ]);

    return {
      totalUsers: totalResult?.count || 0,
      googleUsers: googleResult?.count || 0,
      lineUsers: lineResult?.count || 0
    };
  } catch (error) {
    console.error('ユーザー統計取得エラー:', error);
    throw new Error('ユーザー統計情報の取得に失敗しました');
  }
}

/**
 * ユーザー一覧を取得（管理者用）
 */
export async function getUsers(
  db: D1Database,
  limit: number = 50,
  offset: number = 0
): Promise<User[]> {
  try {
    const users = await db
      .prepare('SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?')
      .bind(limit, offset)
      .all<User>();

    return users.results || [];
  } catch (error) {
    console.error('ユーザー一覧取得エラー:', error);
    throw new Error('ユーザー一覧の取得に失敗しました');
  }
}

/**
 * やさしいエラーメッセージを生成
 */
export function createFriendlyUserErrorMessage(error: string): string {
  const messages: Record<string, string> = {
    'user_not_found': 'ユーザーが見つかりませんでした。',
    'user_creation_failed': 'アカウントの作成に失敗しました。もう一度お試しください。',
    'user_update_failed': 'プロフィールの更新に失敗しました。もう一度お試しください。',
    'database_error': 'データベースで問題が発生しました。しばらく時間をおいてからお試しください。',
    'duplicate_user': '既に登録されているアカウントです。',
    'invalid_user_data': 'ユーザー情報に問題があります。'
  };

  return messages[error] || 'ユーザー情報の処理で問題が発生しました。もう一度お試しください。';
}
