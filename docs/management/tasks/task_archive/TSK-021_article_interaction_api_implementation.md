# タスク詳細: TSK-021

**ID**: `TSK-021`
**タイトル**: 記事インタラクションAPIの実装 (コメント、いいね)
**ステータス**: 未着手
**優先度**: 高

## 1. タスクの目的

記事へのコメント投稿・取得、いいねの登録・削除のAPIを実装し、ユーザー間のインタラクション機能を提供する。

## 2. 手順

以下のファイルを、`/Users/nakayamamasayuki/Documents/GitHub/uch/src/app/api/articles/[slug]/` ディレクトリに新規作成し、それぞれ指定された内容をコピー＆ペーストしてください。

*注意: `src/app/api/articles/[slug]/` およびそのサブディレクトリが存在しない場合は、作成してください。*

### 2.1. `src/app/api/articles/[slug]/comments/route.ts`

```typescript
import type { Session } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// コメント投稿API
export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'ログインが必要です' },
        { status: 401 }
      )
    }

    const { slug } = params
    const { content } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json(
        { message: 'コメント内容は必須です' },
        { status: 400 }
      )
    }

    const article = await prisma.article.findUnique({
      where: { slug }
    })

    if (!article) {
      return NextResponse.json(
        { message: '記事が見つかりません' },
        { status: 404 }
      )
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        articleId: article.id,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        }
      }
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Comment creation error:', error)
    return NextResponse.json(
      { message: 'コメントの投稿に失敗しました' },
      { status: 500 }
    )
  }
}

// コメント取得API
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    const skip = (page - 1) * limit

    const article = await prisma.article.findUnique({
      where: { slug }
    })

    if (!article) {
      return NextResponse.json(
        { message: '記事が見つかりません' },
        { status: 404 }
      )
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { articleId: article.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        },
        skip,
        take: limit,
      }),
      prisma.comment.count({ where: { articleId: article.id } })
    ])

    return NextResponse.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Comments fetch error:', error)
    return NextResponse.json(
      { message: 'コメントの取得に失敗しました' },
      { status: 500 }
    )
  }
}
```

### 2.2. `src/app/api/articles/[slug]/like/route.ts`

```typescript
import type { Session } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// いいね！API
export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'ログインが必要です' },
        { status: 401 }
      )
    }

    const { slug } = params

    const article = await prisma.article.findUnique({
      where: { slug }
    })

    if (!article) {
      return NextResponse.json(
        { message: '記事が見つかりません' },
        { status: 404 }
      )
    }

    // 既にいいねしているか確認
    const existingLike = await prisma.like.findUnique({
      where: {
        articleId_userId: {
          articleId: article.id,
          userId: session.user.id,
        }
      }
    })

    if (existingLike) {
      return NextResponse.json(
        { message: '既にいいねしています' },
        { status: 409 } // Conflict
      )
    }

    const like = await prisma.like.create({
      data: {
        articleId: article.id,
        userId: session.user.id,
      }
    })

    return NextResponse.json(like, { status: 201 })
  } catch (error) {
    console.error('Like creation error:', error)
    return NextResponse.json(
      { message: 'いいね！の登録に失敗しました' },
      { status: 500 }
    )
  }
}

// いいね！削除API
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

    const article = await prisma.article.findUnique({
      where: { slug }
    })

    if (!article) {
      return NextResponse.json(
        { message: '記事が見つかりません' },
        { status: 404 }
      )
    }

    // いいねしているか確認
    const existingLike = await prisma.like.findUnique({
      where: {
        articleId_userId: {
          articleId: article.id,
          userId: session.user.id,
        }
      }
    })

    if (!existingLike) {
      return NextResponse.json(
        { message: 'いいねしていません' },
        { status: 404 }
      )
    }

    await prisma.like.delete({
      where: {
        articleId_userId: {
          articleId: article.id,
          userId: session.user.id,
        }
      }
    })

    return NextResponse.json(
      { message: 'いいね！を削除しました' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Like deletion error:', error)
    return NextResponse.json(
      { message: 'いいね！の削除に失敗しました' },
      { status: 500 }
    )
  }
}
```

## 3. 完了の定義

*   `src/app/api/articles/[slug]/comments/route.ts` が上記内容で作成されていること。
*   `src/app/api/articles/[slug]/like/route.ts` が上記内容で作成されていること。

## 4. 検証方法

PMがファイル内容を読み取り、意図通りに作成されていることを確認する。
