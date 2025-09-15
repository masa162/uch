import { queryAll } from "../lib/db";
import type { Env } from "../index";

export async function handleMemories(req: Request, env: Env) {
  try {
    // フロントエンドが期待する形式に合わせてデータを整形
    const results = await queryAll(env, "SELECT * FROM memories;");
    
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
        name: 'システム',
        email: null,
        displayName: 'システム'
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