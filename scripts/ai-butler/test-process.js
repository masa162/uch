import 'dotenv/config'
import { PrismaClient } from '../../node_modules/@prisma/client/index.js'
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import sharp from 'sharp'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('=== AI執事 画像処理テスト開始 ===')

const prisma = new PrismaClient()
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
})

const tempDir = path.join(__dirname, 'temp')

async function testImageProcessing() {
  try {
    // 一時ディレクトリ作成
    await fs.mkdir(tempDir, { recursive: true })
    console.log('✅ 一時ディレクトリ作成完了')

    // PENDING状態のファイルを1件取得
    const pendingFile = await prisma.media.findFirst({
      where: { status: 'PENDING' }
    })

    if (!pendingFile) {
      console.log('❌ 処理対象のファイルがありません')
      return
    }

    console.log(`📁 処理対象: ${pendingFile.originalFilename}`)
    console.log(`🔑 ストレージキー: ${pendingFile.storageKey}`)

    // ステータスを処理中に更新
    await prisma.media.update({
      where: { id: pendingFile.id },
      data: { status: 'PROCESSING' }
    })
    console.log('📝 ステータスをPROCESSINGに更新')

    // R2からファイルをダウンロード
    console.log('⬇️ R2からファイルをダウンロード中...')
    const downloadCommand = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: pendingFile.storageKey,
    })

    const response = await r2Client.send(downloadCommand)
    const chunks = []
    
    for await (const chunk of response.Body) {
      chunks.push(chunk)
    }
    
    const buffer = Buffer.concat(chunks)
    const tempFilePath = path.join(tempDir, `temp_${Date.now()}_${pendingFile.originalFilename}`)
    await fs.writeFile(tempFilePath, buffer)
    
    console.log(`✅ ダウンロード完了: ${buffer.length} bytes`)

    // 画像最適化処理
    console.log('🎨 画像最適化処理開始...')
    const image = sharp(tempFilePath)
    const metadata = await image.metadata()
    console.log(`📊 原画像情報: ${metadata.width}x${metadata.height}, ${metadata.format}`)

    // 3つの品質で最適化
    const variants = [
      { quality: 'high', width: 1920, height: 1080, webpQuality: 85 },
      { quality: 'medium', width: 1280, height: 720, webpQuality: 70 },
      { quality: 'thumbnail', width: 400, height: 300, webpQuality: 60 },
    ]

    for (const variant of variants) {
      console.log(`🔧 ${variant.quality}品質を生成中...`)
      
      const optimizedBuffer = await image
        .resize(variant.width, variant.height, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .webp({ quality: variant.webpQuality })
        .toBuffer()

      const optimizedKey = `optimized/${pendingFile.id}_${variant.quality}.webp`
      
      // R2にアップロード
      const uploadCommand = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: optimizedKey,
        Body: optimizedBuffer,
        ContentType: 'image/webp',
      })

      await r2Client.send(uploadCommand)
      console.log(`✅ ${variant.quality}品質をR2にアップロード: ${optimizedBuffer.length} bytes`)

      // DB記録
      await prisma.mediaOptimized.create({
        data: {
          mediaId: pendingFile.id,
          storageKey: optimizedKey,
          mimeType: 'image/webp',
          quality: variant.quality,
          width: Math.min(variant.width, metadata.width || variant.width),
          height: Math.min(variant.height, metadata.height || variant.height),
          fileSize: optimizedBuffer.length,
        }
      })
      console.log(`📝 ${variant.quality}品質のメタデータをDB記録`)
    }

    // ステータスを完了に更新
    await prisma.media.update({
      where: { id: pendingFile.id },
      data: { status: 'OPTIMIZED' }
    })
    console.log('📝 ステータスをOPTIMIZEDに更新')

    // 一時ファイルを削除
    await fs.unlink(tempFilePath)
    console.log('🗑️ 一時ファイル削除完了')

    console.log('🎉 画像処理が正常に完了しました！')

  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message)
    console.error(error.stack)
  } finally {
    await prisma.$disconnect()
    console.log('=== テスト完了 ===')
  }
}

testImageProcessing()