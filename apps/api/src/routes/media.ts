import { queryAll, execute } from "../lib/db";
import { readSessionCookie } from "../lib/session";
import type { Env } from "../index";

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

    // メディア一覧を取得
    console.log('getMedia: Querying media for user_id:', session.sub, 'offset:', offset, 'limit:', limit);
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
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [session.sub, limit, offset]);

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

    // ファイル名をユニークにする
    const timestamp = Date.now();
    const uniqueFilename = `${session.sub}/${timestamp}_${filename}`;

    // Cloudflare R2の署名付きURLを生成
    // 注意: 実際の実装では、Cloudflare R2のAPIを使用する必要があります
    // ここでは簡易的な実装として、直接アップロード用のURLを返します
    const uploadUrl = `https://api.uchinokiroku.com/api/media/upload-direct`;
    
    return new Response(JSON.stringify({
      uploadUrl,
      filename: uniqueFilename,
      fields: {
        userId: session.sub,
        originalFilename: filename,
        mimeType,
        fileSize
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
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // 大きなファイルの場合はチャンクに分けて処理
      let base64Content = '';
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
      SELECT file_content, mime_type, original_filename
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
    
    if (!mediaItem.file_content) {
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
        "Cache-Control": "public, max-age=3600"
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
