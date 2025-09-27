import { createSessionCookie } from '../../lib/session';
import {
  createEmailUser,
  getUserByEmail,
  getUserById,
  setUserPassword,
  touchUserLastLogin,
  User,
} from '../../lib/users';
import { hashPassword, validatePasswordStrength, verifyPassword } from '../../lib/password';
import {
  createPasswordResetToken,
  findActiveResetToken,
  markResetTokenUsed,
  purgeExpiredResetTokens,
} from '../../lib/passwordReset';
import { buildPasswordResetEmail, sendEmail } from '../../lib/email';
import type { Env } from '../../index';

interface JsonResponseOptions {
  status?: number;
  headers?: Record<string, string>;
}

function jsonResponse(body: unknown, options: JsonResponseOptions = {}) {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  return new Response(JSON.stringify(body), {
    status: options.status ?? 200,
    headers,
  });
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function handleEmailSignup(req: Request, env: Env) {
  try {
    const payload = await req.json() as { email?: string; password?: string; name?: string };
    const email = payload.email ? normalizeEmail(payload.email) : '';
    const password = payload.password?.trim() ?? '';
    const name = payload.name?.trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ ok: false, message: 'メールアドレスの形式をご確認ください。' }, { status: 400 });
    }

    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.ok) {
      return jsonResponse({ ok: false, message: passwordCheck.message }, { status: 400 });
    }

    const existingUser = await getUserByEmail(env.DB, email);

    if (existingUser && existingUser.password_hash) {
      return jsonResponse({ ok: false, message: 'このメールアドレスはすでに登録されています。' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    let user: User;

    if (existingUser) {
      await setUserPassword(env.DB, existingUser.id, passwordHash, email);
      user = (await getUserById(env.DB, existingUser.id))!;
    } else {
      user = await createEmailUser(env.DB, { email, passwordHash, name });
    }

    const cookie = await createSessionCookie(
      { id: user.id, name: user.name || undefined, email: user.email || email },
      env,
    );

    await touchUserLastLogin(env.DB, user.id);

    return jsonResponse(
      { ok: true, message: 'メールアドレスでの登録が完了しました。ようこそ 💝' },
      {
        status: 201,
        headers: {
          'Set-Cookie': cookie,
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch (error) {
    console.error('メールサインアップエラー:', error);
    return jsonResponse({ ok: false, message: '登録に失敗しました。お手数ですが時間をおいて再度お試しください。' }, { status: 500 });
  }
}

export async function handleEmailLogin(req: Request, env: Env) {
  try {
    const payload = await req.json() as { email?: string; password?: string };
    const email = payload.email ? normalizeEmail(payload.email) : '';
    const password = payload.password?.trim() ?? '';

    if (!email || !password) {
      return jsonResponse({ ok: false, message: 'メールアドレスとパスワードを入力してください。' }, { status: 400 });
    }

    const user = await getUserByEmail(env.DB, email);

    if (!user || !user.password_hash || user.email_login_enabled !== 1) {
      return jsonResponse({ ok: false, message: 'メールアドレスまたはパスワードが違うようです。' }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password_hash);

    if (!valid) {
      return jsonResponse({ ok: false, message: 'メールアドレスまたはパスワードが違うようです。' }, { status: 401 });
    }

    const cookie = await createSessionCookie(
      { id: user.id, name: user.name || undefined, email: user.email || email },
      env,
    );

    await touchUserLastLogin(env.DB, user.id);

    return jsonResponse(
      { ok: true, message: 'ようこそ。おかえりなさい 🏠' },
      {
        status: 200,
        headers: {
          'Set-Cookie': cookie,
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch (error) {
    console.error('メールログインエラー:', error);
    return jsonResponse({ ok: false, message: 'ログインに失敗しました。時間をおいて再度お試しください。' }, { status: 500 });
  }
}

export async function handleEmailResetRequest(req: Request, env: Env) {
  try {
    const payload = await req.json() as { email?: string };
    const email = payload.email ? normalizeEmail(payload.email) : '';

    if (!email) {
      return jsonResponse({ ok: false, message: 'メールアドレスを入力してください。' }, { status: 400 });
    }

    const user = await getUserByEmail(env.DB, email);

    if (!user || !user.email_login_enabled || !user.password_hash) {
      // 安全のため成功レスポンスのみ返す
      return jsonResponse({ ok: true, message: 'リセット手順をお送りしました。メールをご確認くださいね。' });
    }

    const { token, expiresAt } = await createPasswordResetToken(env.DB, user.id);
    const emailContent = buildPasswordResetEmail(env, { to: email, token, expiresAt });

    await sendEmail(env, {
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    return jsonResponse({ ok: true, message: 'リセット手順をお送りしました。メールをご確認くださいね。' });
  } catch (error) {
    console.error('パスワードリセットリクエストエラー:', error);
    return jsonResponse({ ok: false, message: '手続きに失敗しました。時間をおいて再度お試しください。' }, { status: 500 });
  }
}

export async function handleEmailResetConfirm(req: Request, env: Env) {
  try {
    const payload = await req.json() as { token?: string; password?: string };
    const token = payload.token?.trim() ?? '';
    const password = payload.password?.trim() ?? '';

    if (!token || !password) {
      return jsonResponse({ ok: false, message: 'トークンと新しいパスワードを入力してください。' }, { status: 400 });
    }

    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.ok) {
      return jsonResponse({ ok: false, message: passwordCheck.message }, { status: 400 });
    }

    const tokenRecord = await findActiveResetToken(env.DB, token);

    if (!tokenRecord) {
      return jsonResponse({ ok: false, message: 'リセットの有効期限が切れているようです。もう一度お手続きください。' }, { status: 400 });
    }

    const user = await getUserById(env.DB, tokenRecord.user_id);

    if (!user) {
      await markResetTokenUsed(env.DB, token);
      return jsonResponse({ ok: false, message: '対象のユーザーが見つかりませんでした。' }, { status: 404 });
    }

    const hash = await hashPassword(password);
    await setUserPassword(env.DB, user.id, hash, user.email || undefined);
    await markResetTokenUsed(env.DB, token);
    await purgeExpiredResetTokens(env.DB);

    const cookie = await createSessionCookie(
      { id: user.id, name: user.name || undefined, email: user.email || undefined },
      env,
    );

    await touchUserLastLogin(env.DB, user.id);

    return jsonResponse(
      { ok: true, message: 'あたらしいパスワードを設定しました。' },
      {
        headers: {
          'Set-Cookie': cookie,
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch (error) {
    console.error('パスワードリセット確定エラー:', error);
    return jsonResponse({ ok: false, message: '手続きに失敗しました。時間をおいて再度お試しください。' }, { status: 500 });
  }
}
