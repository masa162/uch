// @ts-nocheck
export const onRequest = async (ctx) => {
  const { request } = ctx
  const url = new URL(request.url)

  // Strip the prefix /api/auth/ and forward the rest
  const rest = url.pathname.replace(/^\/api\/auth\//, "")
  const upstream = `https://api.uchinokiroku.com/api/auth/${rest}${url.search}`

  // Clone request for upstream
  const headers = new Headers()
  const orig = request.headers
  const upstreamURL = new URL(upstream)
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
    // Only pass body for non-GET/HEAD
    body: ["GET", "HEAD"].includes(request.method)
      ? undefined
      : await request.arrayBuffer(),
    redirect: "manual",
  }

  const resp = await fetch(upstream, init)

  // Return upstream response as-is so Set-Cookie and redirect headers flow through
  return new Response(resp.body, {
    status: resp.status,
    headers: resp.headers,
  })
}
