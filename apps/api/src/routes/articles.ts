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

    // スラッグ生成（タイトルから + 重複チェック）
    let baseSlug = title
      .toLowerCase()
      .replace(/[^\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAFa-z0-9\s-]/g, '') // 日本語文字も許可
      .replace(/\s+/g, '-')
      .trim();
    
    // 重複チェック
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await queryAll(env, `
        SELECT id FROM memories WHERE LOWER(REPLACE(REPLACE(title, ' ', '-'), '[^a-z0-9-]', '')) = ?
      `, [slug]);
      
      if (existing.length === 0) {
        break;
      }
      
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // 記事をデータベースに保存
    console.log('Creating article with data:', { title, content, userId: session.sub });
    const result = await execute(env, `
      INSERT INTO memories (title, content, user_id, created_at, updated_at)
      VALUES (?, ?, ?, datetime('now'), datetime('now'))
    `, [title, content, session.sub]);
    console.log('Article creation result:', result);

    const articleId = result.meta.last_row_id;

    // 作成時のデータから直接レスポンスを生成（DBから再取得をスキップ）
    const now = new Date().toISOString();
    const authorName = session.name || 'ユーザー';
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
        name: authorName,
        email: session.email,
        displayName: authorName
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
    let articleSlug = pathParts[pathParts.length - 1];

    // URLデコード
    try {
      articleSlug = decodeURIComponent(articleSlug);
    } catch (e) {
      console.log('URL decode failed, using original slug:', articleSlug);
    }

    if (!articleSlug) {
      return new Response(JSON.stringify({ 
        error: "記事スラッグが必要です" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log('Getting article with slug:', articleSlug);
    
    // まずIDで検索（数値の場合）
    let articles = [];
    if (/^\d+$/.test(articleSlug)) {
      articles = await queryAll(env, `
        SELECT m.*, 
               CASE 
                 WHEN m.user_id = 'システム' OR m.user_id IS NULL THEN 'システム'
                 ELSE COALESCE(u.name, 'システム')
               END as user_name,
               CASE 
                 WHEN m.user_id = 'システム' OR m.user_id IS NULL THEN NULL
                 ELSE u.email
               END as user_email
        FROM memories m
        LEFT JOIN users u ON m.user_id = u.id AND m.user_id != 'システム'
        WHERE m.id = ?
      `, [articleSlug]);
    }
    
    // IDで見つからない場合、タイトルで直接検索
    if (!articles || articles.length === 0) {
      articles = await queryAll(env, `
        SELECT m.*, 
               CASE 
                 WHEN m.user_id = 'システム' OR m.user_id IS NULL THEN 'システム'
                 ELSE COALESCE(u.name, 'システム')
               END as user_name,
               CASE 
                 WHEN m.user_id = 'システム' OR m.user_id IS NULL THEN NULL
                 ELSE u.email
               END as user_email
        FROM memories m
        LEFT JOIN users u ON m.user_id = u.id AND m.user_id != 'システム'
        WHERE m.title = ?
      `, [articleSlug]);
    }
    
    // それでも見つからない場合、部分一致で検索
    if (!articles || articles.length === 0) {
      articles = await queryAll(env, `
        SELECT m.*, 
               CASE 
                 WHEN m.user_id = 'システム' OR m.user_id IS NULL THEN 'システム'
                 ELSE COALESCE(u.name, 'システム')
               END as user_name,
               CASE 
                 WHEN m.user_id = 'システム' OR m.user_id IS NULL THEN NULL
                 ELSE u.email
               END as user_email
        FROM memories m
        LEFT JOIN users u ON m.user_id = u.id AND m.user_id != 'システム'
        WHERE m.title LIKE ?
      `, [`%${articleSlug}%`]);
    }
    
    if (!articles || articles.length === 0) {
      return new Response(JSON.stringify({ 
        error: "記事が見つかりません" 
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const article = articles[0];
    console.log('Article found:', article);

    // スラッグ生成
    const slug = article.title
      .toLowerCase()
      .replace(/[^\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAFa-z0-9\s-]/g, '') // 日本語文字も許可
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
        name: article.user_name || 'システム',
        email: article.user_email || null,
        displayName: article.user_name || 'システム'
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
