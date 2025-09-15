#!/usr/bin/env node

/**
 * OAuth認証APIの動作確認スクリプト
 * やさしい文言と"あいことば"哲学に基づくテスト
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:8787';

async function testEndpoint(endpoint, description) {
  console.log(`\n🧪 ${description}`);
  console.log(`   GET ${BASE_URL}${endpoint}`);
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    const status = response.status;
    const headers = Object.fromEntries(response.headers.entries());
    
    console.log(`   Status: ${status}`);
    
    if (response.headers.get('content-type')?.includes('application/json')) {
      const data = await response.json();
      console.log(`   Response:`, JSON.stringify(data, null, 2));
    } else if (response.headers.get('location')) {
      console.log(`   Redirect to: ${response.headers.get('location')}`);
    } else {
      const text = await response.text();
      console.log(`   Response: ${text}`);
    }
    
    if (response.headers.get('set-cookie')) {
      console.log(`   Cookies: ${response.headers.get('set-cookie')}`);
    }
    
    return { success: status < 400, status, headers };
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🌟 OAuth認証API 動作確認テスト');
  console.log('=====================================');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('やさしい文言と"あいことば"哲学に基づくテストです');
  
  const tests = [
    {
      endpoint: '/health',
      description: 'ヘルスチェック（基本動作確認）'
    },
    {
      endpoint: '/memories',
      description: 'メモリー一覧取得（既存API確認）'
    },
    {
      endpoint: '/auth/google/start',
      description: 'Google認証開始（リダイレクト確認）'
    },
    {
      endpoint: '/auth/line/start',
      description: 'LINE認証開始（リダイレクト確認）'
    },
    {
      endpoint: '/nonexistent',
      description: '存在しないエンドポイント（404確認）'
    }
  ];
  
  const results = [];
  
  for (const test of tests) {
    const result = await testEndpoint(test.endpoint, test.description);
    results.push({ ...test, result });
    
    // リクエスト間隔を空ける
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // 結果サマリー
  console.log('\n📊 テスト結果サマリー');
  console.log('====================');
  
  const successCount = results.filter(r => r.result.success).length;
  const totalCount = results.length;
  
  console.log(`成功: ${successCount}/${totalCount}`);
  
  results.forEach(test => {
    const icon = test.result.success ? '✅' : '❌';
    console.log(`${icon} ${test.description}`);
    if (!test.result.success && test.result.error) {
      console.log(`   エラー: ${test.result.error}`);
    }
  });
  
  if (successCount === totalCount) {
    console.log('\n🎉 すべてのテストが成功しました！');
    console.log('OAuth認証APIは正常に動作しています。');
  } else {
    console.log('\n⚠️  一部のテストが失敗しました。');
    console.log('環境変数の設定やOAuthアプリケーションの設定を確認してください。');
  }
  
  console.log('\n📚 次のステップ:');
  console.log('1. OAuthアプリケーション（Google/LINE）の設定');
  console.log('2. 環境変数の設定（wrangler.tomlまたはSecrets）');
  console.log('3. ブラウザでの実際の認証フローテスト');
  console.log('\n詳細は OAUTH_SETUP.md を参照してください。');
}

// スクリプト実行
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testEndpoint, runTests };
