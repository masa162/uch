import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Cloudflare R2クライアントの設定
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.R2_BUCKET_NAME!

/**
 * ファイルをCloudflare R2にアップロード
 */
export async function uploadToR2(
  key: string,
  file: Buffer,
  contentType: string,
  metadata?: Record<string, string>
) {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
      Metadata: metadata,
    })

    const result = await r2Client.send(command)
    
    // 公開URLを返す
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`
    
    return {
      success: true,
      url: publicUrl,
      key,
      etag: result.ETag,
    }
  } catch (error) {
    console.error('R2 upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * ファイルの署名付きURLを取得（一時的なアクセス用）
 */
export async function getSignedUrlForFile(key: string, expiresIn: number = 3600) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn })
    return signedUrl
  } catch (error) {
    console.error('R2 signed URL error:', error)
    return null
  }
}

/**
 * ファイルをCloudflare R2から削除
 */
export async function deleteFromR2(key: string) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    await r2Client.send(command)
    return { success: true }
  } catch (error) {
    console.error('R2 delete error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * ファイルの公開URLを取得
 */
export function getPublicUrl(key: string): string {
  return `${process.env.R2_PUBLIC_URL}/${key}`
}

/**
 * ファイルキーを生成（重複を避けるため）
 */
export function generateFileKey(originalName: string, userId: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = originalName.split('.').pop()
  return `uploads/${userId}/${timestamp}-${randomString}.${extension}`
}
