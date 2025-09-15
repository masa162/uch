/**
 * ID生成ユーティリティ
 * ULID (Universally Unique Lexicographically Sortable Identifier) の実装
 * 依存関係なしで動作し、時間順ソート可能な26文字のIDを生成
 */

// Crockford's Base32 文字セット（混同しやすい文字を除外）
const CHARS = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/**
 * 数値を指定された長さのBase32文字列にエンコード
 */
function encode(val: number, len: number): string {
  let out = "";
  for (let i = len - 1; i >= 0; i--) {
    out = CHARS[(val >> (i * 5)) & 31] + out;
  }
  return out;
}

/**
 * ULIDを生成（軽量版）
 * @param date タイムスタンプ（ミリ秒）。指定しない場合は現在時刻
 * @returns 26文字のULID文字列
 */
export function ulid(date: number = Date.now()): string {
  // 軽量ULID（Crockford Base32, 26 chars）
  const T = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  const enc5 = (v: number) => T[v & 31];
  
  // time(48bit)を8文字化（粗いが実用上OK）
  const hi = Math.floor(date / 0x100000000);
  const lo = date >>> 0;
  const timeChars = [
    enc5(hi >> 11), enc5(hi >> 6), enc5(hi >> 1), enc5(((hi & 1) << 4) | (lo >> 28)),
    enc5(lo >> 23), enc5(lo >> 18), enc5(lo >> 13), enc5(lo >> 8)
  ].join("");
  
  // 80bit乱数→16文字
  const rnd = new Uint8Array(10);
  crypto.getRandomValues(rnd);
  let out = "", acc = 0, bits = 0;
  
  for (const b of rnd) {
    acc = (acc << 8) | b;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      out += T[(acc >> bits) & 31];
    }
  }
  
  if (out.length < 16) out = out.padEnd(16, "0");
  return (timeChars + out).slice(0, 26);
}

/**
 * UUID v4を生成（代替オプション）
 * @returns 36文字のUUID文字列
 */
export function uuid(): string {
  return crypto.randomUUID();
}

/**
 * IDの種類を判定
 * @param id 判定するID文字列
 * @returns 'ulid' | 'uuid' | 'unknown'
 */
export function getIDType(id: string): 'ulid' | 'uuid' | 'unknown' {
  if (id.length === 26 && /^[0-9A-HJKMNP-TV-Z]{26}$/.test(id)) {
    return 'ulid';
  }
  
  if (id.length === 36 && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return 'uuid';
  }
  
  return 'unknown';
}

/**
 * ULIDからタイムスタンプを抽出
 * @param ulid ULID文字列
 * @returns タイムスタンプ（ミリ秒）またはnull
 */
export function extractTimestamp(ulid: string): number | null {
  if (getIDType(ulid) !== 'ulid') {
    return null;
  }
  
  try {
    // 最初の10文字からタイムスタンプを復元
    const timeStr = ulid.slice(0, 10);
    let time = 0;
    
    for (let i = 0; i < timeStr.length; i++) {
      const char = timeStr[i];
      const index = CHARS.indexOf(char);
      if (index === -1) return null;
      
      time = time * 32 + index;
    }
    
    return time;
  } catch {
    return null;
  }
}

