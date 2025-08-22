import 'dotenv/config'
import { PrismaClient } from '../../node_modules/@prisma/client/index.js'

console.log('=== AI執事テスト開始 ===')

const prisma = new PrismaClient()

async function testAIButler() {
  try {
    console.log('1. データベース接続テスト...')
    await prisma.$connect()
    console.log('✅ データベース接続成功')

    console.log('2. PENDING状態のメディアファイル検索...')
    const pendingFiles = await prisma.media.findMany({
      where: { status: 'PENDING' },
      take: 5
    })
    
    console.log(`✅ ${pendingFiles.length}件のPENDINGファイルが見つかりました`)
    
    if (pendingFiles.length > 0) {
      console.log('--- PENDINGファイル一覧 ---')
      pendingFiles.forEach((file, index) => {
        console.log(`${index + 1}. ${file.originalFilename} (${file.mimeType}) - ${file.storageKey}`)
      })
    }

    console.log('3. 環境変数確認...')
    console.log(`R2_ENDPOINT: ${process.env.R2_ENDPOINT ? '設定済み' : '未設定'}`)
    console.log(`R2_BUCKET_NAME: ${process.env.R2_BUCKET_NAME}`)
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message)
  } finally {
    await prisma.$disconnect()
    console.log('=== テスト完了 ===')
  }
}

testAIButler()