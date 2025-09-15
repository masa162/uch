export async function queryAll(env: { DB: D1Database }, sql: string, params: unknown[] = []) {
  const res = await env.DB.prepare(sql).bind(...params).all();
  if (!res.success) throw new Error(res.error || "D1 query failed");
  return res.results;
}