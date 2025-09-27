import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export function validatePasswordStrength(password: string): { ok: boolean; message?: string } {
  if (!password || password.length < 8) {
    return { ok: false, message: 'パスワードは8文字以上でお願いします。' };
  }

  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return { ok: false, message: '英字と数字をどちらも含めてください。' };
  }

  return { ok: true };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}
