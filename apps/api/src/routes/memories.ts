import { queryAll } from "../lib/db";
import type { Env } from "../index";

export async function handleMemories(req: Request, env: Env) {
  try {
    const results = await queryAll(env, "SELECT * FROM memories;");
    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}