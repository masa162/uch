import { queryAll, execute } from "../lib/db";
import { readSessionCookie } from "../lib/session";
import type { Env } from "../index";

// デバッグ用: 認証なしでメディア総数を取得
export async function getMediaDebugInfo(req: Request, env: Env) {
  try {
    console.log('=== DEBUG: getMediaDebugInfo called ===');

    // 総数を取得
    const totalCount = await queryAll(env, `
      SELECT COUNT(*) as count FROM media
    `, []);

    // 最新20件のサンプルを取得
    const sampleMedia = await queryAll(env, `
      SELECT
        id,
        original_filename,
        mime_type,
        file_size,
        created_at
      FROM media
      ORDER BY created_at DESC
      LIMIT 20
    `, []);

    const debugInfo = {
      totalMediaCount: totalCount[0]?.count || 0,
      sampleMediaCount: sampleMedia.length,
      sampleMedia: sampleMedia.map(m => ({
        id: m.id,
        filename: m.original_filename,
        created_at: m.created_at
      }))
    };

    console.log('DEBUG: Media debug info:', debugInfo);

    return new Response(JSON.stringify(debugInfo), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
    });

  } catch (error: any) {
    console.error('DEBUG: Error in getMediaDebugInfo:', error);
    return new Response(JSON.stringify({
      error: "Debug info取得に失敗しました",
      details: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// メディア一覧取得
export async function getMedia(req: Request, env: Env) {
  try {
    console.log('=== getMedia API called ===');
    console.log('Request URL:', req.url);
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    console.log('Cookies:', req.headers.get('Cookie') || 'No cookies');
    
    // セッション確認
    const session = await readSessionCookie(req, env);
    console.log('getMedia session check result:', session ? 'authenticated' : 'not authenticated');
    if (session) {
      console.log('Session details:', { sub: session.sub, exp: session.exp });
    }
    
    if (!session) {
      console.log('getMedia: No valid session found');
      return new Response(JSON.stringify({ error: "認証が必要です" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const limit = parseInt(url.searchParams.get('limit') || '24');

    // フィルター条件を取得
    const mimeTypeFilter = url.searchParams.get('mimeType');
    const searchKeyword = url.searchParams.get('search');
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');

    // 動的SQLクエリとパラメータを構築
    let whereConditions = ['user_id = ?'];
    let queryParams: any[] = [session.sub];

    // MIMEタイプフィルター
    if (mimeTypeFilter) {
      whereConditions.push('mime_type LIKE ?');
      queryParams.push(`${mimeTypeFilter}%`);
    }

    // キーワード検索（ファイル名）
    if (searchKeyword) {
      whereConditions.push('original_filename LIKE ?');
      queryParams.push(`%${searchKeyword}%`);
    }

    // 日付範囲フィルター
    if (dateFrom) {
      whereConditions.push('created_at >= ?');
      queryParams.push(dateFrom);
    }
    if (dateTo) {
      whereConditions.push('created_at <= ?');
      queryParams.push(dateTo + ' 23:59:59'); // 日付の終わりまで含める
    }

    // LIMIT とOFFSETを追加
    queryParams.push(limit, offset);

    const whereClause = whereConditions.join(' AND ');

    // メディア一覧を取得
    console.log('getMedia: Querying media for user_id:', session.sub, 'with filters:', {
      offset, limit, mimeTypeFilter, searchKeyword, dateFrom, dateTo
    });

    const media = await queryAll(env, `
      SELECT
        id,
        filename,
        original_filename,
        mime_type,
        file_size,
        file_url,
        thumbnail_url,
        width,
        height,
        duration,
        created_at
      FROM media
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, queryParams);

    console.log('getMedia: Found', media.length, 'media items');
    console.log('getMedia: Media items:', media);

    return new Response(JSON.stringify(media), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error('メディア取得エラー:', error);
    return new Response(JSON.stringify({ 
      error: "メディアの取得に失敗しました" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// アップロード用URL生成（Cloudflare R2用）
export async function generateUploadUrl(req: Request, env: Env) {
  try {
    // セッション確認
    const session = await readSessionCookie(req, env);
    if (!session) {
      return new Response(JSON.stringify({ error: "認証が必要です" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { filename, mimeType, fileSize } = body;

    if (!filename || !mimeType) {
      return new Response(JSON.stringify({ 
        error: "ファイル名とMIMEタイプは必須です" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // R2 用のオブジェクトキーを生成（ユーザーID/タイムスタンプ_元ファイル名）
    const timestamp = Date.now();
    const uniqueFilename = `${session.sub}/${timestamp}_${filename}`;

    // まずは Workers 経由アップロードエンドポイントを返す（署名URL直PUTは後続）
    const uploadUrl = `https://api.uchinokiroku.com/api/media/upload-r2`;
    
    return new Response(JSON.stringify({
      uploadUrl,
      filename: uniqueFilename,
      fields: {
        userId: session.sub,
        originalFilename: filename,
        mimeType,
        fileSize,
        key: uniqueFilename
      }
    }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error('アップロードURL生成エラー:', error);
    return new Response(JSON.stringify({ 
      error: "アップロードURLの生成に失敗しました" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// 直接アップロード処理
export async function uploadDirect(req: Request, env: Env) {
  try {
    console.log('uploadDirect called');
    
    // セッション確認
    const session = await readSessionCookie(req, env);
    console.log('Session check result:', session ? 'authenticated' : 'not authenticated');
    
    if (!session) {
      return new Response(JSON.stringify({ error: "認証が必要です" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const originalFilename = formData.get('originalFilename') as string;

    console.log('File info:', {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      originalFilename
    });

    if (!file) {
      return new Response(JSON.stringify({ 
        error: "ファイルが選択されていません" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ファイル情報を取得
    const fileSize = file.size;
    const mimeType = file.type;
    const timestamp = Date.now();
    const filename = `${session.sub}/${timestamp}_${originalFilename || file.name}`;

    // ファイルサイズチェック
    console.log('File size check:', fileSize);
    
    if (fileSize > 1 * 1024 * 1024) { // 1MB制限（Cloudflare Workersの制限を考慮）
      return new Response(JSON.stringify({ 
        error: "ファイルサイズが大きすぎます（1MB以下にしてください）" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    // ファイルの内容をBase64エンコードして保存
    console.log('Converting file to Base64...');
    let base64Content: string = '';
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // 大きなファイルの場合はチャンクに分けて処理
      const chunkSize = 8192; // 8KB chunks
      
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, i + chunkSize);
        base64Content += btoa(String.fromCharCode(...chunk));
      }
      
      console.log('File converted to Base64, length:', base64Content.length);
    } catch (error) {
      console.error('Base64 encoding error:', error);
      return new Response(JSON.stringify({ 
        error: "ファイルのエンコードに失敗しました" 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    const fileUrl = `https://api.uchinokiroku.com/api/media/${filename}`;

    // 画像の場合はサムネイルURLも生成
    let thumbnailUrl = null;
    let width = null;
    let height = null;
    let duration = null;

    if (mimeType.startsWith('image/')) {
      thumbnailUrl = fileUrl; // 簡易実装では同じURLを使用
      // 実際の実装では、画像のサイズを取得してサムネイルを生成
    } else if (mimeType.startsWith('video/')) {
      // 動画の場合はサムネイル生成が必要
      // 実際の実装では、動画のフレームを抽出してサムネイルを生成
    }

    // データベースに保存
    console.log('Saving to database...');
    const result = await execute(env, `
      INSERT INTO media (
        user_id, filename, original_filename, mime_type, file_size, 
        file_url, thumbnail_url, width, height, duration, file_content,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `, [
      session.sub, filename, originalFilename || file.name, mimeType, fileSize,
      fileUrl, thumbnailUrl, width, height, duration, base64Content
    ]);

    console.log('Database save result:', result);
    const mediaId = result.meta.last_row_id;

    return new Response(JSON.stringify({
      id: mediaId,
      filename,
      originalFilename: originalFilename || file.name,
      mimeType,
      fileSize,
      fileUrl,
      thumbnailUrl,
      width,
      height,
      duration,
      createdAt: new Date().toISOString()
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error('アップロードエラー:', error);
    console.error('Error stack:', error.stack);
    return new Response(JSON.stringify({ 
      error: "アップロードに失敗しました",
      details: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// メディアファイル取得
export async function getMediaFile(req: Request, env: Env, mediaId: string) {
  try {
    console.log('getMediaFile called with mediaId:', mediaId);
    
    // セッション確認
    const session = await readSessionCookie(req, env);
    console.log('Session check result:', session ? 'authenticated' : 'not authenticated');
    
    if (!session) {
      return new Response(JSON.stringify({ error: "認証が必要です" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // メディア情報を取得
    console.log('Querying media with id:', mediaId, 'user_id:', session.sub);
    const media = await queryAll(env, `
      SELECT file_content, mime_type, original_filename, filename
      FROM media 
      WHERE id = ? AND user_id = ?
    `, [mediaId, session.sub]);
    
    console.log('Media query result:', media);

    if (media.length === 0) {
      return new Response(JSON.stringify({ 
        error: "メディアが見つかりません" 
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const mediaItem = media[0];
    // 動画の場合はinline、それ以外はattachment
    const disposition = mediaItem.mime_type.startsWith('video/') ? 'inline' : 'attachment';
    const dispositionHeader = `${disposition}; filename*=UTF-8''${encodeURIComponent(mediaItem.original_filename || 'download')}`;

    if (!mediaItem.file_content) {
      // R2 に保存されている場合は R2 から読み出して返す
      if ((env as any).R2_BUCKET && mediaItem.filename) {
        const obj = await (env as any).R2_BUCKET.get(mediaItem.filename);
        if (obj && obj.body) {
          return new Response(obj.body as ReadableStream, {
            headers: {
              "Content-Type": mediaItem.mime_type || obj.httpMetadata?.contentType || "application/octet-stream",
              "Cache-Control": "public, max-age=3600",
              "Content-Disposition": dispositionHeader,
            },
          });
        }
      }
      // ファイル内容がない場合はプレースホルダー画像を返す
      const placeholderSvg = `
        <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="200" fill="#f0f0f0"/>
          <text x="150" y="100" text-anchor="middle" font-family="Arial" font-size="14" fill="#666">
            ${mediaItem.original_filename}
          </text>
          <text x="150" y="120" text-anchor="middle" font-family="Arial" font-size="12" fill="#999">
            ${mediaItem.mime_type}
          </text>
        </svg>
      `;

      return new Response(placeholderSvg, {
        headers: { 
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=3600"
        },
      });
    }
    
    // Base64コンテンツをデコードして返す
    console.log('Returning file content for:', mediaItem.original_filename);
    const fileBuffer = Buffer.from(mediaItem.file_content, 'base64');
    
    return new Response(fileBuffer, {
      headers: { 
        "Content-Type": mediaItem.mime_type,
        "Cache-Control": "public, max-age=3600",
        "Content-Disposition": dispositionHeader,
      },
    });

  } catch (error: any) {
    console.error('メディアファイル取得エラー:', error);
    return new Response(JSON.stringify({ 
      error: "メディアファイルの取得に失敗しました" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// ファイル名パスでの取得（後方互換: /api/media/:userId/:filename）
export async function getMediaByFilename(req: Request, env: Env, filenamePath: string) {
  try {
    // 認証
    const session = await readSessionCookie(req, env);
    if (!session) {
      return new Response(JSON.stringify({ error: "認証が必要です" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // filename は DB 上は userId/xxxxx_original の形で保存している
    const filename = decodeURIComponent(filenamePath);
    const rows = await queryAll(env, `
      SELECT file_content, mime_type, original_filename
      FROM media
      WHERE filename = ? AND user_id = ?
      LIMIT 1
    `, [filename, session.sub]);

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: "メディアが見つかりません" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const item = rows[0];
    // 動画の場合はinline、それ以外はattachment
    const disposition = item.mime_type.startsWith('video/') ? 'inline' : 'attachment';
    const dispositionHeader = `${disposition}; filename*=UTF-8''${encodeURIComponent(item.original_filename || 'download')}`;

    if (!item.file_content) {
      // R2 に保存されている場合は R2 から読み出して返す
      if ((env as any).R2_BUCKET && filename) {
        const obj = await (env as any).R2_BUCKET.get(filename);
        if (obj && obj.body) {
          return new Response(obj.body as ReadableStream, {
            headers: {
              "Content-Type": item.mime_type || obj.httpMetadata?.contentType || "application/octet-stream",
              "Cache-Control": "public, max-age=3600",
              "Content-Disposition": dispositionHeader,
            },
          });
        }
      }
      // R2にもない場合
      return new Response(JSON.stringify({ error: "ファイル内容がありません" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const fileBuffer = Buffer.from(item.file_content, 'base64');
    return new Response(fileBuffer, {
      headers: {
        "Content-Type": item.mime_type,
        "Cache-Control": "public, max-age=3600",
        "Content-Disposition": dispositionHeader,
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: "メディアファイルの取得に失敗しました", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// メディア削除
export async function deleteMedia(req: Request, env: Env, mediaId: string) {
  try {
    // セッション確認
    const session = await readSessionCookie(req, env);
    if (!session) {
      return new Response(JSON.stringify({ error: "認証が必要です" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // メディアが存在し、ユーザーが所有しているか確認
    const media = await queryAll(env, `
      SELECT id FROM media WHERE id = ? AND user_id = ?
    `, [mediaId, session.sub]);

    if (media.length === 0) {
      return new Response(JSON.stringify({ 
        error: "メディアが見つからないか、削除権限がありません" 
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // メディアを削除
    await execute(env, `
      DELETE FROM media WHERE id = ? AND user_id = ?
    `, [mediaId, session.sub]);

    return new Response(JSON.stringify({ 
      message: "メディアが削除されました" 
    }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error('メディア削除エラー:', error);
    return new Response(JSON.stringify({ 
      error: "メディアの削除に失敗しました" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// R2 に直接保存するアップロード（multipart/form-data）
export async function uploadToR2(req: Request, env: Env) {
  try {
    const session = await readSessionCookie(req, env);
    if (!session) {
      return new Response(JSON.stringify({ error: "認証が必要です" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!(env as any).R2_BUCKET) {
      return new Response(JSON.stringify({ error: "R2 が設定されていません" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const form = await req.formData();
    const file = form.get('file') as File | null;
    const providedKey = (form.get('key') as string) || '';
    const originalFilename = (form.get('originalFilename') as string) || file?.name || 'upload.bin';

    if (!file) {
      return new Response(JSON.stringify({ error: "ファイルがありません" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // キーを確定
    const key = providedKey || `${session.sub}/${Date.now()}_${originalFilename}`;

    // R2 に保存（ストリーミング）
    await (env as any).R2_BUCKET.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type || 'application/octet-stream',
        contentDisposition: `inline; filename="${encodeURIComponent(originalFilename)}"`
      }
    } as any);

    // DB 登録（file_content なし）
    const fileUrl = `/api/media/${encodeURIComponent(key)}`; // by-filename 経由でも可
    const result = await execute(env, `
      INSERT INTO media (
        user_id, filename, original_filename, mime_type, file_size,
        file_url, thumbnail_url, width, height, duration, file_content,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `, [
      session.sub, key, originalFilename, file.type || 'application/octet-stream', file.size,
      fileUrl, null, null, null, null, null
    ]);

    const mediaId = result.meta.last_row_id;
    return new Response(JSON.stringify({ id: mediaId, key, originalFilename }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: "R2 アップロードに失敗しました", details: String(error?.message || error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Cloudflare Stream 直アップロードURLの発行
export async function signVideoUpload(req: Request, env: Env) {
  try {
    const session = await readSessionCookie(req, env);
    if (!session) {
      return new Response(JSON.stringify({ error: "認証が必要です" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

    const accountId = (env as any).STREAM_ACCOUNT_ID || (env as any).STREAM_ACCOUNT || '';
    const token = (env as any).STREAM_TOKEN || '';
    if (!accountId || !token) {
      return new Response(JSON.stringify({ error: "Stream の環境変数が未設定です" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    const apiUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/direct_upload`;
    const maxDuration = parseInt((env as any).STREAM_MAX_DURATION_SECONDS || "900", 10); // 15分デフォルト
    const allowedOrigins: string[] = [];
    if ((env as any).FRONTEND_URL) {
      try {
        const u = new URL((env as any).FRONTEND_URL);
        // Stream の allowedOrigins はプロトコルなしのドメイン/ホストのみ
        allowedOrigins.push(u.host);
      } catch {}
    }
    // ローカル開発時の直アクセス許可（任意）
    allowedOrigins.push('localhost:3000');
    const body: Record<string, any> = { 
      creator: session.sub,
      maxDurationSeconds: maxDuration,
    };
    if (allowedOrigins.length > 0) body.allowedOrigins = allowedOrigins;
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const json = await res.json<any>();
    if (!res.ok || !json?.result?.uploadURL) {
      return new Response(JSON.stringify({ error: "Stream サインに失敗しました", details: json }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ uploadURL: json.result.uploadURL, uid: json.result.uid }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: "Stream API エラー", details: String(e?.message || e) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

// アップロード完了後に動画のメタデータをDB登録
export async function registerVideo(req: Request, env: Env) {
  try {
    const session = await readSessionCookie(req, env);
    if (!session) {
      return new Response(JSON.stringify({ error: "認証が必要です" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }
    const { uid, originalFilename, fileSize, mimeType } = await req.json();
    if (!uid) {
      return new Response(JSON.stringify({ error: "uid が必要です" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    const hls = `https://videodelivery.net/${uid}/manifest/video.m3u8`;
    const thumb = `https://videodelivery.net/${uid}/thumbnails/thumbnail.jpg?time=1s`;

    const result = await execute(env, `
      INSERT INTO media (
        user_id, filename, original_filename, mime_type, file_size,
        file_url, thumbnail_url, width, height, duration, file_content,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `, [
      session.sub, uid, originalFilename || uid, mimeType || 'video/mp4', fileSize || 0,
      hls, thumb, null, null, null, null
    ]);
    const mediaId = result.meta.last_row_id;
    return new Response(JSON.stringify({ id: mediaId, uid }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: "動画登録に失敗しました", details: String(e?.message || e) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
