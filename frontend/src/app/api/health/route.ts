export const runtime = 'edge'; // ← Cloudflare向けにEdge実行

export async function GET() {
  return new Response(
    JSON.stringify({ ok: true, now: new Date().toISOString() }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}