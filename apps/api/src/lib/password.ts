import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export function validatePasswordStrength(password: string): { ok: boolean; message?: string } {
  if (!password || password.trim().length === 0) {
    return { ok: false, message: 'パスワードを入力してくださいね 😊' };
  }

  // 高齢者向け設計：1文字以上あればOK
  // 「11」「aa」「はなこ」「アムロ」など、覚えやすいものなら何でも可能
  return { ok: true };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}
