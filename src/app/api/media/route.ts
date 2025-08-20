import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import type { Session } from 'next-auth'
import { Role } from '@prisma/client'
import { prisma } from '@/lib/prisma'

// メディアファイルの情報を保存
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'ログインが必要です' },
        { status: 401 }
      )
    }

    // ゲストユーザーの書き込み権限チェック
    if (session.user.role === Role.GUEST) {
      return NextResponse.json(
        { message: '権限がありません' },
        { status: 403 }
      )
    }

    const { fileName, originalName, fileType, fileSize, publicUrl, r2Key, metadata } = await request.json()

    if (!fileName || !originalName || !fileType || !fileSize || !publicUrl || !r2Key) {
      return NextResponse.json(
        { message: '必要な情報が不足しています' },
        { status: 400 }
      )
    }

    // メディアファイルの情報をデータベースに保存
    const mediaFile = await prisma.mediaFile.create({
      data: {
        fileName,
        originalName,
        fileType,
        fileSize,
        publicUrl,
        r2Key,
        userId: session.user.id,
        metadata: metadata || {},
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    return NextResponse.json({ mediaFile }, { status: 201 })

  } catch (error) {
    console.error('Media file save error:', error)
    return NextResponse.json(
      { message: 'メディアファイルの保存に失敗しました' },
      { status: 500 }
    )
  }
}

// メディアファイルの一覧を取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const userId = searchParams.get('userId')
    const fileType = searchParams.get('fileType')
    
    const skip = (page - 1) * limit

    const where = {
      ...(userId && { userId }),
      ...(fileType && { fileType: { startsWith: fileType } })
    }

    const [mediaFiles, total] = await Promise.all([
      prisma.mediaFile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
      }),
      prisma.mediaFile.count({ where })
    ])

    return NextResponse.json({
      mediaFiles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Media files fetch error:', error)
    return NextResponse.json(
      { message: 'メディアファイルの取得に失敗しました' },
      { status: 500 }
    )
  }
}
