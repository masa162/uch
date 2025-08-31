import 'dotenv/config'
import { PrismaClient } from '../node_modules/@prisma/client/index.js'

const prisma = new PrismaClient()

/**
 * 古いMediaFileテーブルから新しいMediaテーブルへのマイグレーションスクリプト
 */

async function migrateMediaFiles() {
  console.log('📦 メディアファイル移行を開始します...')
  
  try {
    // 1. 移行対象の古いファイルを取得
    const oldMediaFiles = await prisma.mediaFile.findMany({
      include: {
        user: true
      }
    })
    
    if (oldMediaFiles.length === 0) {
      console.log('ℹ️ 移行するファイルがありません')
      return
    }
    
    console.log(`📋 ${oldMediaFiles.length}件のファイルを移行します`)
    
    let migratedCount = 0
    let skippedCount = 0
    let errorCount = 0
    
    // 2. 各ファイルを新しいMediaテーブルに移行
    for (const oldFile of oldMediaFiles) {
      try {
        // 既に移行済みかチェック
        const existingMedia = await prisma.media.findFirst({
          where: {
            originalFilename: oldFile.originalName,
            uploaderId: oldFile.userId,
            storageKey: oldFile.r2Key
          }
        })
        
        if (existingMedia) {
          console.log(`⏭️  既に移行済み: ${oldFile.originalName}`)
          skippedCount++
          continue
        }
        
        // 新しいMediaレコードを作成
        const newMedia = await prisma.media.create({
          data: {
            uploaderId: oldFile.userId,
            originalFilename: oldFile.originalName,
            storageKey: oldFile.r2Key,
            mimeType: oldFile.fileType,
            fileSize: oldFile.fileSize,
            status: 'PENDING', // AI執事による再処理を促すため
            createdAt: oldFile.createdAt,
            updatedAt: oldFile.updatedAt,
          }
        })
        
        console.log(`✅ 移行完了: ${oldFile.originalName} -> ${newMedia.id}`)
        migratedCount++
        
        // 移行完了後、古いレコードにメタデータを追加（削除は手動で行う）
        await prisma.mediaFile.update({
          where: { id: oldFile.id },
          data: {
            metadata: {
              migratedToMediaId: newMedia.id,
              migratedAt: new Date().toISOString()
            }
          }
        })
        
      } catch (error) {
        console.error(`❌ 移行エラー: ${oldFile.originalName}`, error.message)
        errorCount++
      }
    }
    
    // 3. 結果レポート
    console.log('\n📊 移行結果:')
    console.log(`✅ 移行完了: ${migratedCount}件`)
    console.log(`⏭️  スキップ: ${skippedCount}件`)
    console.log(`❌ エラー: ${errorCount}件`)
    console.log(`📋 総対象: ${oldMediaFiles.length}件`)
    
    if (migratedCount > 0) {
      console.log('\n🤖 次のステップ:')
      console.log('1. AI執事を起動してファイルを最適化処理してください')
      console.log('2. 処理完了後、古いMediaFileテーブルのデータを削除できます')
      console.log('3. 削除前にバックアップを取ることをお勧めします')
    }
    
  } catch (error) {
    console.error('💥 移行処理中にエラーが発生しました:', error)
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * 移行の進捗状況を確認
 */
async function checkMigrationProgress() {
  console.log('📊 移行進捗状況を確認します...')
  
  try {
    const [oldCount, newCount, pendingCount, optimizedCount] = await Promise.all([
      prisma.mediaFile.count(),
      prisma.media.count(),
      prisma.media.count({ where: { status: 'PENDING' } }),
      prisma.media.count({ where: { status: 'OPTIMIZED' } })
    ])
    
    console.log('\n📈 現在の状況:')
    console.log(`📁 旧MediaFileテーブル: ${oldCount}件`)
    console.log(`🆕 新Mediaテーブル: ${newCount}件`)
    console.log(`⏳ 処理待ち: ${pendingCount}件`)
    console.log(`✨ 最適化済み: ${optimizedCount}件`)
    
    // 移行済みファイルの確認
    const migratedOldFiles = await prisma.mediaFile.count({
      where: {
        metadata: {
          path: ['migratedToMediaId'],
          not: null
        }
      }
    })
    
    console.log(`🔄 移行済み（旧テーブル）: ${migratedOldFiles}件`)
    
  } catch (error) {
    console.error('💥 進捗確認中にエラーが発生しました:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// スクリプト実行
const command = process.argv[2]

switch (command) {
  case 'migrate':
    migrateMediaFiles()
    break
  case 'status':
    checkMigrationProgress()
    break
  default:
    console.log('📋 使用方法:')
    console.log('  node scripts/migrate-media-files.js migrate  - マイグレーション実行')
    console.log('  node scripts/migrate-media-files.js status   - 進捗状況確認')
    break
}