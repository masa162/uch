import type { Session } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

// 下書きデータの型定義
interface DraftData {
  title: string
  content: string
  description: string
  tags: string[]
  heroImageUrl: string | null
}

// LocalStorageキー
const DRAFT_STORAGE_KEY = 'article_draft'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'ログインが必要です' },
        { status: 401 }
      )
    }

    const draftData: DraftData = await req.json()

    // 基本的なバリデーション
    if (!draftData.title?.trim() && !draftData.content?.trim()) {
      return NextResponse.json(
        { message: 'タイトルまたは本文が必要です' },
        { status: 400 }
      )
    }

    // 下書きデータを加工
    const draft = {
      ...draftData,
      title: draftData.title?.trim() || '',
      content: draftData.content?.trim() || '',
      description: draftData.description?.trim() || '',
      tags: Array.isArray(draftData.tags) ? draftData.tags : [],
      heroImageUrl: draftData.heroImageUrl?.trim() || null,
      savedAt: new Date().toISOString(),
      userId: session.user.email // emailをIDとして使用
    }

    // レスポンス（実際のDB保存は今回は省略し、クライアントサイド保存を指示）
    return NextResponse.json({
      success: true,
      message: '下書きを保存しました',
      draft,
      storageKey: DRAFT_STORAGE_KEY
    })

  } catch (error) {
    console.error('下書き保存エラー:', error)
    return NextResponse.json(
      { message: '下書きの保存に失敗しました' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as Session | null
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'ログインが必要です' },
        { status: 401 }
      )
    }

    // 下書き取得の指示を返す（実際の取得はクライアントサイド）
    return NextResponse.json({
      success: true,
      storageKey: DRAFT_STORAGE_KEY,
      message: 'LocalStorageから下書きを取得してください'
    })

  } catch (error) {
    console.error('下書き取得エラー:', error)
    return NextResponse.json(
      { message: '下書きの取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions) as Session | null
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'ログインが必要です' },
        { status: 401 }
      )
    }

    // 下書き削除の指示を返す
    return NextResponse.json({
      success: true,
      storageKey: DRAFT_STORAGE_KEY,
      message: '下書きを削除しました'
    })

  } catch (error) {
    console.error('下書き削除エラー:', error)
    return NextResponse.json(
      { message: '下書きの削除に失敗しました' },
      { status: 500 }
    )
  }
}