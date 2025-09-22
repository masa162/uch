// NextAuth.jsは一時的に無効化（独自API認証を使用）
export const runtime = "edge";

// ダミーハンドラー
const handler = () => {
  return new Response("NextAuth.js is disabled", { status: 404 });
};

export { handler as GET, handler as POST };
