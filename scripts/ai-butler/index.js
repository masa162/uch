import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import sharp from 'sharp'
import ffmpeg from 'fluent-ffmpeg'
import cron from 'node-cron'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import AITaggingService from './services/AITaggingService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 設定
const config = {
  batchSize: parseInt(process.env.BATCH_SIZE) || 10,
  processingInterval: process.env.PROCESSING_INTERVAL_MINUTES || 5,
  logLevel: process.env.LOG_LEVEL || 'info',
  tempDir: path.join(__dirname, 'temp'),
  image: {
    qualityHigh: parseInt(process.env.IMAGE_QUALITY_HIGH) || 85,
    qualityMedium: parseInt(process.env.IMAGE_QUALITY_MEDIUM) || 70,
    qualityThumbnail: parseInt(process.env.IMAGE_QUALITY_THUMBNAIL) || 60,
    maxWidth: parseInt(process.env.MAX_IMAGE_WIDTH) || 1920,
    maxHeight: parseInt(process.env.MAX_IMAGE_HEIGHT) || 1080,
  },
  video: {
    qualityHigh: parseInt(process.env.VIDEO_QUALITY_HIGH) || 720,
    qualityMedium: parseInt(process.env.VIDEO_QUALITY_MEDIUM) || 480,
    bitrateHigh: parseInt(process.env.VIDEO_BITRATE_HIGH) || 2000,
    bitrateMedium: parseInt(process.env.VIDEO_BITRATE_MEDIUM) || 1000,
  }
}

// Prisma・R2クライアント初期化
const prisma = new PrismaClient()
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
})

// ログ機能
class Logger {
  static log(level, message, data = null) {
    const timestamp = new Date().toISOString()
    const logData = data ? ` | ${JSON.stringify(data)}` : ''
    const output = `[${timestamp}] [${level.toUpperCase()}] ${message}${logData}`
    console.log(output)
    console.error(output) // stderrにも出力
  }

  static info(message, data) { this.log('info', message, data) }
  static warn(message, data) { this.log('warn', message, data) }
  static error(message, data) { this.log('error', message, data) }
  static debug(message, data) { 
    if (config.logLevel === 'debug') this.log('debug', message, data) 
  }
}

// AI執事メインクラス
class AIButler {
  constructor() {
    this.isProcessing = false
    this.aiTaggingService = new AITaggingService()
  }

  async init() {
    try {
      // 一時ディレクトリ作成
      await fs.mkdir(config.tempDir, { recursive: true })
      Logger.info('AI執事が初期化されました', { tempDir: config.tempDir })
      
      // Prisma接続確認
      await prisma.$connect()
      Logger.info('データベース接続が確立されました')
      
    } catch (error) {
      Logger.error('AI執事の初期化に失敗しました', { error: error.message })
      throw error
    }
  }

  async processMediaFiles() {
    if (this.isProcessing) {
      Logger.warn('既に処理中のため、スキップします')
      return
    }

    this.isProcessing = true
    Logger.info('メディアファイル処理を開始します')

    try {
      // 未処理ファイルを取得
      const pendingFiles = await this.getPendingFiles()
      
      if (pendingFiles.length === 0) {
        Logger.info('処理待ちのファイルはありません')
        return
      }

      Logger.info(`${pendingFiles.length}件のファイルを処理します`)

      // 各ファイルを処理
      for (const mediaFile of pendingFiles) {
        try {
          await this.processMediaFile(mediaFile)
        } catch (error) {
          Logger.error(`ファイル処理に失敗しました`, { 
            fileId: mediaFile.id, 
            filename: mediaFile.originalFilename,
            error: error.message 
          })
          
          // エラー状態に更新
          await this.updateMediaStatus(mediaFile.id, 'ERROR', error.message)
        }
      }

    } catch (error) {
      Logger.error('メディア処理中にエラーが発生しました', { error: error.message })
    } finally {
      this.isProcessing = false
      Logger.info('メディアファイル処理が完了しました')
    }
  }

  async getPendingFiles() {
    return await prisma.media.findMany({
      where: { status: 'PENDING' },
      take: config.batchSize,
      orderBy: { createdAt: 'asc' }
    })
  }

  async processMediaFile(mediaFile) {
    Logger.info(`ファイル処理を開始: ${mediaFile.originalFilename}`, { 
      id: mediaFile.id, 
      storageKey: mediaFile.storageKey 
    })

    // ステータスを処理中に更新
    await this.updateMediaStatus(mediaFile.id, 'PROCESSING')

    // ファイルをダウンロード
    const tempFilePath = await this.downloadFromR2(mediaFile.storageKey, mediaFile.originalFilename)
    
    try {
      // ファイルタイプに応じて処理分岐
      if (mediaFile.mimeType.startsWith('image/')) {
        await this.processImageFile(mediaFile, tempFilePath)
      } else if (mediaFile.mimeType.startsWith('video/')) {
        await this.processVideoFile(mediaFile, tempFilePath)
      } else {
        throw new Error(`サポートされていないファイル形式: ${mediaFile.mimeType}`)
      }

      // 処理完了状態に更新
      await this.updateMediaStatus(mediaFile.id, 'OPTIMIZED')
      Logger.info(`ファイル処理が完了しました: ${mediaFile.originalFilename}`)

    } finally {
      // 一時ファイルを削除
      await this.cleanupTempFile(tempFilePath)
    }
  }

  async downloadFromR2(storageKey, originalFilename) {
    const tempFilePath = path.join(config.tempDir, `temp_${Date.now()}_${originalFilename}`)
    
    try {
      const command = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: storageKey,
      })

      const response = await r2Client.send(command)
      const chunks = []
      
      for await (const chunk of response.Body) {
        chunks.push(chunk)
      }
      
      const buffer = Buffer.concat(chunks)
      await fs.writeFile(tempFilePath, buffer)
      
      Logger.debug(`ファイルをダウンロードしました`, { storageKey, tempFilePath })
      return tempFilePath

    } catch (error) {
      Logger.error('R2からのダウンロードに失敗しました', { storageKey, error: error.message })
      throw error
    }
  }

  async processImageFile(mediaFile, tempFilePath) {
    Logger.info(`画像処理を開始: ${mediaFile.originalFilename}`)

    const image = sharp(tempFilePath)
    const metadata = await image.metadata()

    // 複数品質の画像を生成
    const variants = [
      { quality: 'high', width: config.image.maxWidth, height: config.image.maxHeight, jpegQuality: config.image.qualityHigh },
      { quality: 'medium', width: 1280, height: 720, jpegQuality: config.image.qualityMedium },
      { quality: 'thumbnail', width: 400, height: 300, jpegQuality: config.image.qualityThumbnail },
    ]

    for (const variant of variants) {
      const optimizedBuffer = await image
        .resize(variant.width, variant.height, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .webp({ quality: variant.jpegQuality })
        .toBuffer()

      const optimizedKey = `optimized/${mediaFile.id}_${variant.quality}.webp`
      
      // R2にアップロード
      await this.uploadToR2(optimizedKey, optimizedBuffer, 'image/webp')

      // DB記録
      await this.saveOptimizedFile(mediaFile.id, optimizedKey, 'image/webp', variant.quality, {
        width: Math.min(variant.width, metadata.width || variant.width),
        height: Math.min(variant.height, metadata.height || variant.height),
        fileSize: optimizedBuffer.length
      })
    }
    
    // 画像の場合はAIタグ付けを実行
    if (mediaFile.mimeType.startsWith('image/')) {
      await this.processAITagging(mediaFile, tempFilePath)
    }
  }

  async processVideoFile(mediaFile, tempFilePath) {
    Logger.info(`動画処理を開始: ${mediaFile.originalFilename}`)

    // 動画最適化は今回は簡単な実装とし、後で詳細化
    const outputPath = path.join(config.tempDir, `optimized_${Date.now()}.mp4`)

    return new Promise((resolve, reject) => {
      ffmpeg(tempFilePath)
        .outputOptions([
          '-c:v libx264',
          `-b:v ${config.video.bitrateMedium}k`,
          '-c:a aac',
          '-preset fast'
        ])
        .output(outputPath)
        .on('end', async () => {
          try {
            const buffer = await fs.readFile(outputPath)
            const optimizedKey = `optimized/${mediaFile.id}_medium.mp4`
            
            await this.uploadToR2(optimizedKey, buffer, 'video/mp4')
            await this.saveOptimizedFile(mediaFile.id, optimizedKey, 'video/mp4', 'medium', {
              fileSize: buffer.length
            })
            
            await fs.unlink(outputPath).catch(() => {})
            resolve()
          } catch (error) {
            reject(error)
          }
        })
        .on('error', reject)
        .run()
    })
  }

  async uploadToR2(key, buffer, mimeType) {
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })

    await r2Client.send(command)
    Logger.debug(`R2にアップロードしました`, { key, size: buffer.length })
  }

  async saveOptimizedFile(mediaId, storageKey, mimeType, quality, metadata) {
    await prisma.mediaOptimized.create({
      data: {
        mediaId,
        storageKey,
        mimeType,
        quality,
        width: metadata.width || null,
        height: metadata.height || null,
        fileSize: metadata.fileSize || null,
      }
    })
  }

  async updateMediaStatus(mediaId, status, errorMessage = null) {
    await prisma.media.update({
      where: { id: mediaId },
      data: { 
        status,
        updatedAt: new Date(),
        ...(errorMessage && { metadata: { error: errorMessage } })
      }
    })
  }

  async processAITagging(mediaFile, imagePath) {
    if (!this.aiTaggingService.isEnabled()) {
      Logger.debug('AIタグ付けが無効になっています')
      return
    }

    try {
      Logger.info(`AIタグ付けを開始: ${mediaFile.originalFilename}`)
      
      const tags = await this.aiTaggingService.analyzeImage(imagePath)
      
      if (tags.length > 0) {
        await this.saveTags(mediaFile.id, tags)
        Logger.info(`${tags.length}個のタグを保存しました: ${mediaFile.originalFilename}`)
      } else {
        Logger.info(`タグが検出されませんでした: ${mediaFile.originalFilename}`)
      }
      
    } catch (error) {
      Logger.error('AIタグ付けエラー', { 
        filename: mediaFile.originalFilename, 
        error: error.message 
      })
    }
  }

  async saveTags(mediaId, tags) {
    const tagData = tags.map(tag => ({
      mediaId,
      tag: tag.tag,
      confidence: tag.confidence,
      source: 'AI'
    }))

    try {
      // 既存のAIタグを削除（重複を避けるため）
      await prisma.mediaTag.deleteMany({
        where: {
          mediaId,
          source: 'AI'
        }
      })

      // 新しいタグを一括作成
      await prisma.mediaTag.createMany({
        data: tagData,
        skipDuplicates: true
      })

      Logger.debug(`${tagData.length}個のタグをDBに保存しました`, { mediaId })
      
    } catch (error) {
      Logger.error('タグ保存エラー', { mediaId, error: error.message })
      throw error
    }
  }

  async cleanupTempFile(filePath) {
    try {
      await fs.unlink(filePath)
      Logger.debug(`一時ファイルを削除しました`, { filePath })
    } catch (error) {
      Logger.warn('一時ファイルの削除に失敗しました', { filePath, error: error.message })
    }
  }

  async shutdown() {
    Logger.info('AI執事をシャットダウンしています...')
    await prisma.$disconnect()
    Logger.info('AI執事がシャットダウンされました')
  }
}

// メイン実行
async function main() {
  const butler = new AIButler()
  
  try {
    await butler.init()
    
    // 即座に1回実行
    await butler.processMediaFiles()
    
    // cron設定（5分間隔）
    cron.schedule(`*/${config.processingInterval} * * * *`, async () => {
      Logger.info('定期実行を開始します')
      await butler.processMediaFiles()
    })
    
    Logger.info(`AI執事が開始されました（${config.processingInterval}分間隔で実行）`)
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      Logger.info('シャットダウン信号を受信しました')
      await butler.shutdown()
      process.exit(0)
    })
    
  } catch (error) {
    Logger.error('AI執事の起動に失敗しました', { error: error.message })
    process.exit(1)
  }
}

// スクリプトが直接実行された場合のみmainを実行
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { AIButler }