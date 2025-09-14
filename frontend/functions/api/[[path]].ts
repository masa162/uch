// @ts-nocheck
// Generic proxy for all /api/* requests to the upstream API server.
// This avoids browser CORS by serving via the same origin (Cloudflare Pages).

export const onRequest = async (ctx) => {
  const { request } = ctx
  const url = new URL(request.url)

  // Remove leading /api/ and forward rest of the path
  const rest = url.pathname.replace(/^\/api\//, "")
  const upstreamBase = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uchinokiroku.com').replace(/\/$/, '')
  const upstream = `${upstreamBase}/api/${rest}${url.search}`

  const headers = new Headers()
  const orig = request.headers
  const upstreamURL = new URL(upstream)
  // Preserve essential headers and forward cookies explicitly
  const cookie = orig.get('cookie')
  if (cookie) headers.set('cookie', cookie)
  const contentType = orig.get('content-type')
  if (contentType) headers.set('content-type', contentType)
  const accept = orig.get('accept')
  if (accept) headers.set('accept', accept)
  const ua = orig.get('user-agent')
  if (ua) headers.set('user-agent', ua)
  headers.set('host', upstreamURL.host)
  headers.set('origin', `${upstreamURL.protocol}//${upstreamURL.host}`)
  headers.set('referer', `${upstreamURL.protocol}//${upstreamURL.host}/`)
  const init = {
    method: request.method,
    headers,
    body: ["GET", "HEAD"].includes(request.method)
      ? undefined
      : await request.arrayBuffer(),
    redirect: "manual",
  }

  const resp = await fetch(upstream, init)
  return new Response(resp.body, {
    status: resp.status,
    headers: resp.headers,
  })
}
