import { queryAll } from "../lib/db";
import type { Env } from "../index";

export async function handleMemories(req: Request, env: Env) {
  try {
    const url = new URL(req.url);
    const searchQuery = url.searchParams.get('q');
    
    let sql = `
      SELECT m.*, u.name as user_name, u.email as user_email
      FROM memories m
      LEFT JOIN users u ON m.user_id = u.id
    `;
    let params: any[] = [];
    
    if (searchQuery) {
      sql += ` WHERE LOWER(m.title) LIKE ? OR LOWER(m.content) LIKE ?`;
      params = [`%${searchQuery.toLowerCase()}%`, `%${searchQuery.toLowerCase()}%`];
    }
    
    sql += ` ORDER BY m.created_at DESC`;
    
    // フロントエンドが期待する形式に合わせてデータを整形
    const results = await queryAll(env, sql, params);
    
    // フロントエンドが期待するArticle形式に変換
    const articles = results.map((memory: any) => ({
      id: memory.id.toString(),
      title: memory.title,
      slug: memory.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description: memory.content ? memory.content.substring(0, 150) + '...' : null,
      content: memory.content || '',
      pubDate: memory.created_at,
      heroImageUrl: null,
      tags: [],
      isPublished: true,
      createdAt: memory.created_at,
      updatedAt: memory.updated_at,
      author: {
        name: memory.user_name || 'システム',
        email: memory.user_email || null,
        displayName: memory.user_name || 'システム'
      }
    }));
    
    return new Response(JSON.stringify(articles), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}