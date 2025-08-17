# タスク詳細: TSK-020

**ID**: `TSK-020`
**タイトル**: 記事投稿・管理APIの実装 (CRUD)
**ステータス**: 未着手
**優先度**: 高

## 1. タスクの目的

記事の作成、一覧取得、詳細取得、更新、削除のAPIを実装し、記事コンテンツの管理機能を提供する。

## 2. 手順

以下のファイルを、`/Users/nakayamamasayuki/Documents/GitHub/uch/src/app/api/articles/` ディレクトリに新規作成し、それぞれ指定された内容をコピー＆ペーストしてください。

*注意: `src/app/api/articles/` およびそのサブディレクトリが存在しない場合は、作成してください。*

### 2.1. `src/app/api/articles/route.ts`

```typescript
import type { Session } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 記事投稿API
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'ログインが必要です' },
        { status: 401 }
      )
    }

    const { title, content, description, tags, heroImageUrl } = await request.json()

    // バリデーション
    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { message: 'タイトルと本文は必須です' },
        { status: 400 }
      )
    }

    // ユーザー取得
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    // スラッグ生成（日付ベース、分かりやすい形式）
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '') // YYYYMMDD
    
    // その日の記事数を取得して連番を決定
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
    
    const todayArticlesCount = await prisma.article.count({
      where: {
        createdAt: {
          gte: todayStart,
          lt: todayEnd
        }
      }
    })
    
    const sequenceNumber = String(todayArticlesCount + 1).padStart(3, '0')
    const baseSlug = `${dateStr}${sequenceNumber}`
    
    // 重複チェック
    let slug = baseSlug
    let counter = 1
    while (await prisma.article.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // 記事作成
    const article = await prisma.article.create({
      data: {
        title: title.trim(),
        slug,
        content: content.trim(),
        description: description?.trim() || null,
        tags: Array.isArray(tags) ? tags : [],
        heroImageUrl: heroImageUrl?.trim() || null,
        pubDate: new Date(),
        authorId: user.id,
        isPublished: true,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    return NextResponse.json(article, { status: 201 })
  } catch (error) {
    console.error('Article creation error:', error)
    return NextResponse.json(
      { message: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

// 記事一覧取得API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const tag = searchParams.get('tag')
    
    const skip = (page - 1) * limit

    const where = {
      isPublished: true,
      ...(tag && { tags: { has: tag } })
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          _count: {
            select: {
              comments: true,
              likes: true,
            }
          }
        },
        orderBy: {
          pubDate: 'desc'
        },
        skip,
        take: limit,
      }),
      prisma.article.count({ where })
    ])

    return NextResponse.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Articles fetch error:', error)
    return NextResponse.json(
      { message: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
```

### 2.2. `src/app/api/articles/[slug]/route.ts`

```typescript
import type { Session } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 記事詳細取得API
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params

    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          }
        }
      }
    })

    if (!article) {
      return NextResponse.json(
        { message: '記事が見つかりません' },
        { status: 404 }
      )
    }

    return NextResponse.json(article)
  } catch (error) {
    console.error('Article detail fetch error:', error)
    return NextResponse.json(
      { message: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

// 記事更新API
export async function PUT(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'ログインが必要です' },
        { status: 401 }
      )
    }

    const { slug } = params
    const { title, content, description, tags, heroImageUrl, isPublished } = await request.json()

    // 記事の存在確認と所有者チェック
    const existingArticle = await prisma.article.findUnique({
      where: { slug }
    })

    if (!existingArticle) {
      return NextResponse.json(
        { message: '記事が見つかりません' },
        { status: 404 }
      )
    }

    if (existingArticle.authorId !== session.user.id) {
      return NextResponse.json(
        { message: '権限がありません' },
        { status: 403 }
      )
    }

    // バリデーション
    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { message: 'タイトルと本文は必須です' },
        { status: 400 }
      )
    }

    const updatedArticle = await prisma.article.update({
      where: { slug },
      data: {
        title: title.trim(),
        content: content.trim(),
        description: description?.trim() || null,
        tags: Array.isArray(tags) ? tags : [],
        heroImageUrl: heroImageUrl?.trim() || null,
        isPublished: typeof isPublished === 'boolean' ? isPublished : existingArticle.isPublished,
        updatedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    return NextResponse.json(updatedArticle)
  } catch (error) {
    console.error('Article update error:', error)
    return NextResponse.json(
      { message: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

// 記事削除API
export async function DELETE(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'ログインが必要です' },
        { status: 401 }
      )
    }

    const { slug } = params

    // 記事の存在確認と所有者チェック
    const existingArticle = await prisma.article.findUnique({
      where: { slug }
    })

    if (!existingArticle) {
      return NextResponse.json(
        { message: '記事が見つかりません' },
        { status: 404 }
      )
    }

    if (existingArticle.authorId !== session.user.id) {
      return NextResponse.json(
        { message: '権限がありません' },
        { status: 403 }
      )
    }

    await prisma.article.delete({
      where: { slug }
    })

    return NextResponse.json(
      { message: '記事を削除しました' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Article deletion error:', error)
    return NextResponse.json(
      { message: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
```

### 2.3. `src/app/api/articles/simple/route.ts`

```typescript
import type { Session } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * 簡易POST機能 API
 * 最小限の入力で記事投稿を可能にする
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'ログインが必要です' },
        { status: 401 }
      )
    }

    const { content } = await request.json()

    // バリデーション
    if (!content?.trim()) {
      return NextResponse.json(
        { message: '内容を入力してください' },
        { status: 400 }
      )
    }

    if (content.trim().length > 1000) {
      return NextResponse.json(
        { message: '内容は1000文字以内で入力してください' },
        { status: 400 }
      )
    }

    // ユーザー取得
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    // タイトル自動生成
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const autoTitle = `${year}年${month}月${day}日の記録`

    // 説明文自動生成（本文の先頭100文字）
    const autoDescription = content.trim().length > 100 
      ? content.trim().substring(0, 97) + '...'
      : content.trim()

    // スラッグ生成（既存システムと同じロジック）
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '') // YYYYMMDD
    
    // その日の記事数を取得して連番を決定
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
    
    const todayArticlesCount = await prisma.article.count({
      where: {
        createdAt: {
          gte: todayStart,
          lt: todayEnd
        }
      }
    })
    
    const sequenceNumber = String(todayArticlesCount + 1).padStart(3, '0')
    const baseSlug = `${dateStr}${sequenceNumber}`
    
    // 重複チェック
    let slug = baseSlug
    let counter = 1
    while (await prisma.article.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // 記事作成（簡易POST仕様）
    const article = await prisma.article.create({
      data: {
        title: autoTitle,
        slug,
        content: content.trim(),
        description: autoDescription,
        tags: [], // 簡易POSTではタグなし
        heroImageUrl: null, // 簡易POSTでは画像なし
        pubDate: new Date(),
        authorId: user.id,
        isPublished: true,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    return NextResponse.json({
      id: article.id,
      title: article.title,
      slug: article.slug,
      content: article.content,
      description: article.description,
      createdAt: article.createdAt,
      message: '投稿が完了しました！'
    }, { status: 201 })

  } catch (error) {
    console.error('Simple post creation error:', error)
    return NextResponse.json(
      { message: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
```

### 2.4. `src/app/api/articles/draft/route.ts`

```typescript
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
```

## 3. 完了の定義

*   `src/app/api/articles/` ディレクトリ内に上記4つのファイルが作成されていること。

## 4. 検証方法

PMがファイル内容を読み取り、意図通りに作成されていることを確認する。
