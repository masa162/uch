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

    // 記事ID生成（YYMMDD-NN形式）
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const datePrefix = `${year}${month}${day}`;
    
    // 同日の記事数を確認
    const todayArticles = await queryAll(env, `
      SELECT COUNT(*) as count FROM memories 
      WHERE article_id LIKE ? OR (article_id IS NULL AND DATE(created_at) = DATE('now'))
    `, [`${datePrefix}%`]);
    
    const todayCount = (todayArticles[0]?.count || 0) + 1;
    const articleId = todayCount === 1 ? datePrefix : `${datePrefix}-${todayCount.toString().padStart(2, '0')}`;
    
    // 重複チェック
    let finalArticleId = articleId;
    let counter = 1;
    while (true) {
      const existing = await queryAll(env, `
        SELECT id FROM memories WHERE article_id = ?
      `, [finalArticleId]);
      
      if (existing.length === 0) {
        break;
      }
      
      counter++;
      finalArticleId = todayCount === 1 ? `${datePrefix}-${counter.toString().padStart(2, '0')}` : `${datePrefix}-${(todayCount + counter - 1).toString().padStart(2, '0')}`;
    }

    // 記事をデータベースに保存
    console.log('Creating article with data:', { title, content, userId: session.sub, articleId: finalArticleId });
    const result = await execute(env, `
      INSERT INTO memories (title, content, user_id, article_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `, [title, content, session.sub, finalArticleId]);
    console.log('Article creation result:', result);

    const dbArticleId = result.meta.last_row_id;

    // 作成時のデータから直接レスポンスを生成（DBから再取得をスキップ）
    const nowString = new Date().toISOString();
    const authorName = session.name || 'ユーザー';
    const formattedArticle = {
      id: dbArticleId.toString(),
      articleId: finalArticleId,
      title: title,
      slug: finalArticleId, // スラッグをarticle_idに変更
      description: description || (content ? content.substring(0, 150) + '...' : null),
      content: content || '',
      pubDate: nowString,
      heroImageUrl: null,
      tags: tags || [],
      isPublished: isPublished,
      createdAt: nowString,
      updatedAt: nowString,
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

    console.log('Getting article with ID:', articleSlug);
    
    // article_idで検索
    let articles = await queryAll(env, `
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
      WHERE m.article_id = ?
    `, [articleSlug]);
    
    // article_idで見つからない場合、数値IDで検索（後方互換性）
    if (!articles || articles.length === 0) {
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
    }
    
    // それでも見つからない場合、タイトルで検索（後方互換性）
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

    // フロントエンドが期待する形式に変換
    const formattedArticle = {
      id: article.id.toString(),
      articleId: article.article_id || article.id.toString(),
      title: article.title,
      slug: article.article_id || article.id.toString(), // article_idをスラッグとして使用
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

export async function updateArticle(req: Request, env: Env) {
  try {
    const session = await verifySession(req, env);
    if (!session) {
      return new Response(JSON.stringify({ error: "認証が必要です" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const idParam = decodeURIComponent(url.pathname.split('/').pop() || '');
    if (!idParam) {
      return new Response(JSON.stringify({ error: 'IDが必要です' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const body = await req.json().catch(() => ({} as any));
    const { title, description, content } = body as { title?: string; description?: string | null; content?: string };

    if (!title && !description && !content) {
      return new Response(JSON.stringify({ error: '更新項目がありません' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const fields: string[] = [];
    const params: any[] = [];

    if (typeof title === 'string') { fields.push('title = ?'); params.push(title); }
    if (typeof content === 'string') { fields.push('content = ?'); params.push(content); }
    // description はmemoriesテーブルに列が無いので、今は無視（将来の拡張に備えフロント互換は維持）

    if (fields.length === 0) {
      return new Response(JSON.stringify({ error: '更新可能な項目がありません' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // article_id で更新し、無ければ数値IDで更新
    let sql = `UPDATE memories SET ${fields.join(', ')}, updated_at = datetime('now') WHERE article_id = ?`;
    params.push(idParam);
    let res = await execute(env, sql, params);

    if ((res as any).meta?.changes === 0 && /^\d+$/.test(idParam)) {
      // 数値id fallback
      const params2 = [...params];
      params2[params2.length - 1] = parseInt(idParam, 10);
      sql = `UPDATE memories SET ${fields.join(', ')}, updated_at = datetime('now') WHERE id = ?`;
      res = await execute(env, sql, params2);
    }

    // 更新後のレコードを返す
    const getRes = await queryAll(env, `SELECT * FROM memories WHERE article_id = ? OR id = ? LIMIT 1`, [idParam, idParam]);
    const row: any = getRes[0];
    if (!row) {
      return new Response(JSON.stringify({ error: '記事が見つかりません' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({
      id: row.id.toString(),
      articleId: row.article_id || row.id.toString(),
      title: row.title,
      slug: row.article_id || row.id.toString(),
      description: row.content ? row.content.substring(0, 150) + '...' : null,
      content: row.content || '',
      pubDate: row.created_at,
      heroImageUrl: null,
      tags: [],
      isPublished: true,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      author: {
        name: session.name || 'ユーザー',
        email: session.email || null,
        displayName: session.name || 'ユーザー',
      },
    }), { headers: { 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error('記事更新エラー:', error);
    return new Response(JSON.stringify({
      error: '記事の更新に失敗しました',
      details: error.message || '不明なエラー',
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
