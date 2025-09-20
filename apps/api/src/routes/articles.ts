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
    const { title, content, description, tags, isPublished = true, mediaIds = [] } = body;

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

    // メディアとの関連付けを保存
    if (mediaIds && mediaIds.length > 0) {
      for (const mediaId of mediaIds) {
        try {
          // メディアが存在し、ユーザーが所有しているか確認
          const mediaCheck = await queryAll(env, `
            SELECT id FROM media WHERE id = ? AND user_id = ?
          `, [mediaId, session.sub]);
          
          if (mediaCheck.length > 0) {
            await execute(env, `
              INSERT INTO memory_media (memory_id, media_id) VALUES (?, ?)
            `, [dbArticleId, mediaId]);
          }
        } catch (error) {
          console.error('メディア関連付けエラー:', error);
        }
      }
    }

    // タグの処理
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        try {
          // タグが存在するか確認
          let existingTag = await queryAll(env, `SELECT id FROM tags WHERE name = ?`, [tagName]);
          let tagId;
          
          if (existingTag.length > 0) {
            tagId = existingTag[0].id;
          } else {
            // 新しいタグを作成
            const tagResult = await execute(env, `INSERT INTO tags (name) VALUES (?)`, [tagName]);
            tagId = tagResult.meta.last_row_id;
          }
          
          // 記事とタグの関連付け
          await execute(env, `
            INSERT INTO memory_tags (memory_id, tag_id) VALUES (?, ?)
          `, [dbArticleId, tagId]);
        } catch (error) {
          console.error('タグ処理エラー:', error);
        }
      }
    }

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
    
    // 記事とタグを同時に取得するクエリ
    const query = `
      SELECT 
        m.*, 
        u.name as user_name,
        u.email as user_email,
        (SELECT GROUP_CONCAT(t.name) FROM tags t JOIN memory_tags mt ON t.id = mt.tag_id WHERE mt.memory_id = m.id) as tags_concat
      FROM memories m
      LEFT JOIN users u ON m.user_id = u.id
      WHERE m.article_id = ? OR m.id = ? OR m.title = ?
    `;
    
    const articles = await queryAll(env, query, [articleSlug, /^\d+$/.test(articleSlug) ? articleSlug : -1, articleSlug]);
    
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

    // タグを配列に変換
    const tags = article.tags_concat ? article.tags_concat.split(',') : [];

    // 関連するメディアを取得
    const mediaQuery = `
      SELECT m.* FROM media m
      JOIN memory_media mm ON m.id = mm.media_id
      WHERE mm.memory_id = ?
      ORDER BY m.created_at ASC
    `;
    const relatedMedia = await queryAll(env, mediaQuery, [article.id]);

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
      tags: tags, // 取得したタグを設定
      isPublished: true,
      createdAt: article.created_at,
      updatedAt: article.updated_at,
      media: relatedMedia || [], // 関連メディアを追加
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
    const { title, description, content, mediaIds = [], tags = [] } = body as { title?: string; description?: string | null; content?: string; mediaIds?: number[]; tags?: string[] };

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

    // メディア関連付けを更新
    if (mediaIds !== undefined) {
      // 既存の関連付けを削除
      await execute(env, `DELETE FROM memory_media WHERE memory_id = ?`, [row.id]);
      
      // 新しい関連付けを追加
      if (mediaIds.length > 0) {
        for (const mediaId of mediaIds) {
          try {
            // メディアが存在し、ユーザーが所有しているか確認
            const mediaCheck = await queryAll(env, `
              SELECT id FROM media WHERE id = ? AND user_id = ?
            `, [mediaId, session.sub]);
            
            if (mediaCheck.length > 0) {
              await execute(env, `
                INSERT INTO memory_media (memory_id, media_id) VALUES (?, ?)
              `, [row.id, mediaId]);
            }
          } catch (error) {
            console.error('メディア関連付けエラー:', error);
          }
        }
      }
    }

    // タグの処理
    if (tags !== undefined) {
      // 既存のタグ関連付けを削除
      await execute(env, `DELETE FROM memory_tags WHERE memory_id = ?`, [row.id]);
      
      // 新しいタグ関連付けを追加
      if (tags.length > 0) {
        for (const tagName of tags) {
          try {
            // タグが存在するか確認
            let existingTag = await queryAll(env, `SELECT id FROM tags WHERE name = ?`, [tagName]);
            let tagId;
            
            if (existingTag.length > 0) {
              tagId = existingTag[0].id;
            } else {
              // 新しいタグを作成
              const tagResult = await execute(env, `INSERT INTO tags (name) VALUES (?)`, [tagName]);
              tagId = tagResult.meta.last_row_id;
            }
            
            // 記事とタグの関連付け
            await execute(env, `
              INSERT INTO memory_tags (memory_id, tag_id) VALUES (?, ?)
            `, [row.id, tagId]);
          } catch (error) {
            console.error('タグ処理エラー:', error);
          }
        }
      }
    }

    // 関連するメディアを取得
    const mediaQuery = `
      SELECT m.* FROM media m
      JOIN memory_media mm ON m.id = mm.media_id
      WHERE mm.memory_id = ?
      ORDER BY m.created_at ASC
    `;
    const relatedMedia = await queryAll(env, mediaQuery, [row.id]);

    // 関連するタグを取得
    const tagsQuery = `
      SELECT t.name FROM tags t
      JOIN memory_tags mt ON t.id = mt.tag_id
      WHERE mt.memory_id = ?
      ORDER BY t.name ASC
    `;
    const relatedTags = await queryAll(env, tagsQuery, [row.id]);
    const tagNames = relatedTags.map((tag: any) => tag.name);

    return new Response(JSON.stringify({
      id: row.id.toString(),
      articleId: row.article_id || row.id.toString(),
      title: row.title,
      slug: row.article_id || row.id.toString(),
      description: row.content ? row.content.substring(0, 150) + '...' : null,
      content: row.content || '',
      pubDate: row.created_at,
      heroImageUrl: null,
      tags: tagNames,
      isPublished: true,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      media: relatedMedia || [], // 関連メディアを追加
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

export async function deleteArticle(req: Request, env: Env) {
  try {
    const session = await verifySession(req, env);
    if (!session) {
      return new Response(JSON.stringify({ error: "認証が必要です" }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const url = new URL(req.url);
    const idParam = decodeURIComponent(url.pathname.split('/').pop() || '');
    if (!idParam) {
      return new Response(JSON.stringify({ error: 'IDが必要です' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // article_id で削除し、無ければ数値IDで削除
    let res = await execute(env, `DELETE FROM memories WHERE article_id = ?`, [idParam]);
    if ((res as any).meta?.changes === 0 && /^\d+$/.test(idParam)) {
      res = await execute(env, `DELETE FROM memories WHERE id = ?`, [parseInt(idParam, 10)]);
    }

    return new Response(null, { status: 204 });
  } catch (error: any) {
    console.error('記事削除エラー:', error);
    return new Response(JSON.stringify({ error: '記事の削除に失敗しました', details: error.message || '不明なエラー' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function getTags(req: Request, env: Env) {
  try {
    const query = `
      SELECT
        t.id,
        t.name,
        COUNT(mt.memory_id) as count
      FROM tags t
      LEFT JOIN memory_tags mt ON t.id = mt.tag_id
      GROUP BY t.id, t.name
      ORDER BY count DESC, t.name ASC
      LIMIT 20
    `;
    const tags = await queryAll(env, query);
    return new Response(JSON.stringify(tags), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error('タグ一覧取得エラー:', error);
    return new Response(JSON.stringify({ 
      error: "タグ一覧の取得に失敗しました",
      details: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
