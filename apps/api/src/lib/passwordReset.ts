function randomToken(bytes = 32): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  const base64 = btoa(String.fromCharCode(...arr));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export async function createPasswordResetToken(db: D1Database, userId: string, ttlMinutes = 60) {
  const token = randomToken(32);
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();

  await db
    .prepare(`
      INSERT INTO password_reset_tokens (token, user_id, expires_at)
      VALUES (?, ?, ?)
    `)
    .bind(token, userId, expiresAt)
    .run();

  return { token, expiresAt };
}

export async function findActiveResetToken(db: D1Database, token: string) {
  return db
    .prepare(`
      SELECT * FROM password_reset_tokens
      WHERE token = ?
        AND used_at IS NULL
        AND expires_at > strftime('%Y-%m-%dT%H:%M:%fZ','now')
      LIMIT 1
    `)
    .bind(token)
    .first<{ token: string; user_id: string; expires_at: string; used_at?: string | null }>();
}

export async function markResetTokenUsed(db: D1Database, token: string) {
  await db
    .prepare(`
      UPDATE password_reset_tokens
      SET used_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
      WHERE token = ?
    `)
    .bind(token)
    .run();
}

export async function purgeExpiredResetTokens(db: D1Database) {
  await db
    .prepare(`
      DELETE FROM password_reset_tokens
      WHERE expires_at <= strftime('%Y-%m-%dT%H:%M:%fZ','now')
         OR used_at IS NOT NULL AND used_at <= strftime('%Y-%m-%dT%H:%M:%fZ','now', '-7 days')
    `)
    .run();
}
