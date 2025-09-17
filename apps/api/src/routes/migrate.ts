import type { Env } from "../index";

/**
 * POST /api/migrate - マイグレーションを手動実行
 */
export async function migrate(req: Request, env: Env) {
  try {
    console.log('Running manual migration...');
    
    // 007_add_file_content_to_media.sql を実行
    await env.DB.exec(`
      -- mediaテーブルにfile_contentカラムを追加
      ALTER TABLE media ADD COLUMN file_content TEXT;
      
      -- インデックスの作成
      CREATE INDEX IF NOT EXISTS idx_media_file_content ON media(file_content);
    `);
    
    console.log('Migration completed successfully');
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: "マイグレーションが正常に実行されました" 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    
  } catch (error: any) {
    console.error('Migration error:', error);
    return new Response(JSON.stringify({ 
      error: "マイグレーションの実行に失敗しました",
      details: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
