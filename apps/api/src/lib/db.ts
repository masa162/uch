export async function queryAll(env: { DB: D1Database }, sql: string, params: unknown[] = []) {
  const res = await env.DB.prepare(sql).bind(...params).all();
  if (!res.success) throw new Error(res.error || "D1 query failed");
  return res.results;
}

export async function queryOne(env: { DB: D1Database }, sql: string, params: unknown[] = []) {
  const res = await env.DB.prepare(sql).bind(...params).first();
  
  if (!res) {
    return null;
  }
  
  // first()メソッドは直接オブジェクトを返すので、resをそのまま返す
  return res;
}

export async function execute(env: { DB: D1Database }, sql: string, params: unknown[] = []) {
  const res = await env.DB.prepare(sql).bind(...params).run();
  if (!res.success) throw new Error(res.error || "D1 execute failed");
  return res;
}