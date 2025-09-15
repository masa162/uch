import { queryOne, queryAll, execute } from "../lib/db";
import { verifySession } from "../lib/session";
import type { Env } from "../index";

export async function createArticle(req: Request, env: Env) {
  try {
    // セッション確認
    const session = await verifySession(req, env);
    if (!session) {
      return new Response(JSON.stringify({ error: "認証が必要です" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { title, content, description, tags, isPublished = true } = body;

    if (!title || !content) {
      return new Response(JSON.stringify({ 
        error: "タイトルと内容は必須です" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // スラッグ生成（タイトルから）
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();

    // 記事をデータベースに保存
    console.log('Creating article with data:', { title, content });
    const result = await execute(env, `
      INSERT INTO memories (title, content, created_at, updated_at)
      VALUES (?, ?, datetime('now'), datetime('now'))
    `, [title, content]);
    console.log('Article creation result:', result);

    const articleId = result.meta.last_row_id;

    // 作成時のデータから直接レスポンスを生成（DBから再取得をスキップ）
    const now = new Date().toISOString();
    const formattedArticle = {
      id: articleId.toString(),
      title: title,
      slug: slug,
      description: description || (content ? content.substring(0, 150) + '...' : null),
      content: content || '',
      pubDate: now,
      heroImageUrl: null,
      tags: tags || [],
      isPublished: isPublished,
      createdAt: now,
      updatedAt: now,
      author: {
        name: session.name || 'ユーザー',
        email: session.email,
        displayName: session.name || 'ユーザー'
      }
    };

    return new Response(JSON.stringify(formattedArticle), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error('記事作成エラー:', error);
    return new Response(JSON.stringify({ 
      error: "記事の作成に失敗しました",
      details: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function getArticle(req: Request, env: Env) {
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const articleId = pathParts[pathParts.length - 1];

    if (!articleId) {
      return new Response(JSON.stringify({ 
        error: "記事IDが必要です" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const article = await queryOne(env, `
      SELECT * FROM memories WHERE id = ?
    `, [articleId]);

    if (!article) {
      return new Response(JSON.stringify({ 
        error: "記事が見つかりません" 
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // スラッグ生成
    const slug = article.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();

    // フロントエンドが期待する形式に変換
    const formattedArticle = {
      id: article.id.toString(),
      title: article.title,
      slug: slug,
      description: article.content ? article.content.substring(0, 150) + '...' : null,
      content: article.content || '',
      pubDate: article.created_at,
      heroImageUrl: null,
      tags: [],
      isPublished: true,
      createdAt: article.created_at,
      updatedAt: article.updated_at,
      author: {
        name: 'システム',
        email: null,
        displayName: 'システム'
      }
    };

    return new Response(JSON.stringify(formattedArticle), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error('記事取得エラー:', error);
    return new Response(JSON.stringify({ 
      error: "記事の取得に失敗しました",
      details: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
