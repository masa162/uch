import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import type { Session } from 'next-auth'

// Cloudinary設定
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'ログインが必要です' },
        { status: 401 }
      )
    }

    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ message: 'ファイルがありません' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Cloudinaryにアップロード
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'uchinokiroku_uploads' }, // Cloudinaryのフォルダ
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error)
            return reject(error)
          }
          resolve(result)
        }
      ).end(buffer)
    })

    // @ts-ignore
    return NextResponse.json({ url: result.secure_url }, { status: 201 })

  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { message: 'ファイルのアップロードに失敗しました' },
      { status: 500 }
    )
  }
}