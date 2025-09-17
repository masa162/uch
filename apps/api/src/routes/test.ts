import type { Env } from "../index";

/**
 * GET /api/test - バックエンドのテスト用エンドポイント
 */
export async function test(req: Request, env: Env) {
  console.log('TEST ENDPOINT CALLED - this should appear in logs');
  
  try {
    // データベース接続をテスト
    const result = await env.DB.prepare('SELECT count(*) as count FROM media').first();
    console.log('Database test result:', result);
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: "バックエンドは正常に動作しています",
      timestamp: new Date().toISOString(),
      mediaCount: result?.count || 0
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    
  } catch (error: any) {
    console.error('Test endpoint error:', error);
    return new Response(JSON.stringify({ 
      error: "テストに失敗しました",
      details: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
