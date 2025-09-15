import { queryAll } from "../lib/db";
import type { Env } from "../index";

export async function handleMemories(req: Request, env: Env) {
  try {
    const url = new URL(req.url);
    const searchQuery = url.searchParams.get('q');
    
    console.log('handleMemories called with searchQuery:', searchQuery);
    
    // まずシンプルなクエリでテスト
    let sql = `SELECT * FROM memories ORDER BY created_at DESC`;
    let params: any[] = [];
    
    if (searchQuery) {
      sql = `SELECT * FROM memories WHERE LOWER(title) LIKE ? OR LOWER(content) LIKE ? ORDER BY created_at DESC`;
      params = [`%${searchQuery.toLowerCase()}%`, `%${searchQuery.toLowerCase()}%`];
    }
    
    console.log('Executing SQL:', sql, 'with params:', params);
    
    // フロントエンドが期待する形式に合わせてデータを整形
    const results = await queryAll(env, sql, params);
    console.log('Query results:', results.length, 'records');
    
    // フロントエンドが期待するArticle形式に変換
    const articles = results.map((memory: any) => {
      console.log('Processing memory:', memory.id, memory.title, memory.user_id);
      return {
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
          name: memory.user_id === 'システム' || !memory.user_id ? 'システム' : 'ユーザー',
          email: null,
          displayName: memory.user_id === 'システム' || !memory.user_id ? 'システム' : 'ユーザー'
        }
      };
    });
    
    console.log('Formatted articles:', articles.length);
    
    return new Response(JSON.stringify(articles), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error('handleMemories error:', e);
    console.error('Error stack:', e.stack);
    return new Response(JSON.stringify({ 
      error: '記事の取得に失敗しました',
      details: e.message,
      stack: e.stack
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}