# タスク詳細: TSK-022

**ID**: `TSK-022`
**タイトル**: 記事発見APIの実装 (検索、タグ、アーカイブ)
**ステータス**: 未着手
**優先度**: 高

## 1. タスクの目的

記事の検索、タグ一覧取得、特定タグの記事取得、月別アーカイブ一覧取得、特定月記事取得、カテゴリ別記事取得のAPIを実装し、ユーザーが目的の記事を見つけやすくする機能を提供する。

## 2. 手順

以下のファイルを、`/Users/nakayamamasayuki/Documents/GitHub/uch/src/app/api/articles/` ディレクトリに新規作成し、それぞれ指定された内容をコピー＆ペーストしてください。

*注意: `src/app/api/articles/` およびそのサブディレクトリが存在しない場合は、作成してください。*

### 2.1. `src/app/api/articles/search/route.ts`

```typescript
import type { Session } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')

    if (!q || q.trim() === '') {
      return NextResponse.json({ articles: [] })
    }

    // タイトルと内容から検索
    const articles = await prisma.article.findMany({
      where: {
        OR: [
          {
            title: {
              contains: q,
              mode: 'insensitive'
            }
          },
          {
            content: {
              contains: q,
              mode: 'insensitive'
            }
          },
          {
            tags: {
              hasSome: [q]
            }
          }
        ]
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        tags: true,
        createdAt: true,
        author: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    })

    // 内容を要約（最初の100文字）
    const searchResults = articles.map(article => ({
      ...article,
      content: article.content.slice(0, 100) + (article.content.length > 100 ? '...' : '')
    }))

    return NextResponse.json({
      articles: searchResults,
      query: q,
      count: searchResults.length
    })

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
```

### 2.2. `src/app/api/articles/tags/route.ts`

```typescript
import type { Session } from 'next-auth'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as Session | null
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 過去に使用されたタグを取得（使用頻度順）
    const articles = await prisma.article.findMany({
      select: {
        tags: true,
      },
      where: {
        tags: {
          isEmpty: false
        }
      }
    })

    // タグの使用頻度をカウント
    const tagCount: { [key: string]: number } = {}
    articles.forEach(article => {
      article.tags.forEach(tag => {
        if (typeof tag === 'string') {
          tagCount[tag] = (tagCount[tag] || 0) + 1
        }
      })
    })

    // 頻度順にソートして上位20個を取得
    const sortedTags = Object.entries(tagCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([tag]) => tag)

    return NextResponse.json({
      tags: sortedTags,
      totalCount: Object.keys(tagCount).length
    })

  } catch (error) {
    console.error('Tags API error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
```

### 2.3. `src/app/api/articles/tag/[tag]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest, { params }: { params: { tag: string } }) {
  try {
    const { tag } = params

    if (!tag) {
      return NextResponse.json({ message: 'タグ名が必要です' }, { status: 400 })
    }

    // タグ名で記事を検索
    const articles = await prisma.article.findMany({
      where: {
        tags: {
          has: tag,
        },
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        pubDate: true,
        author: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        pubDate: 'desc',
      },
    })

    return NextResponse.json({
      tag,
      articles,
      count: articles.length,
    })
  } catch (error) {
    console.error('Tag API error:', error)
    return NextResponse.json({ message: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
```

### 2.4. `src/app/api/articles/archive/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // 月別アーカイブの集計
    const archives = await prisma.article.groupBy({
      by: ['pubDate'], // pubDateを基準にグループ化
      _count: {
        id: true,
      },
      orderBy: {
        pubDate: 'desc',
      },
    })

    // 年月ごとの集計に変換
    const monthlyArchives: { [key: string]: { year: number; month: number; count: number } } = {}

    archives.forEach(item => {
      const date = new Date(item.pubDate)
      const year = date.getFullYear()
      const month = date.getMonth() + 1 // 月は0から始まるため+1

      const key = `${year}-${String(month).padStart(2, '0')}`

      if (!monthlyArchives[key]) {
        monthlyArchives[key] = { year, month, count: 0 }
      }
      monthlyArchives[key].count += item._count.id
    })

    // 配列に変換してソート
    const sortedMonthlyArchives = Object.values(monthlyArchives).sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year
      return b.month - a.month
    })

    return NextResponse.json({ archives: sortedMonthlyArchives })
  } catch (error) {
    console.error('Monthly archive API error:', error)
    return NextResponse.json({ message: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
```

### 2.5. `src/app/api/articles/archive/[yearMonth]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest, { params }: { params: { yearMonth: string } }) {
  try {
    const { yearMonth } = params // 例: "202308"

    if (!/^\d{6}$/.test(yearMonth)) {
      return NextResponse.json({ message: '無効な年月フォーマットです' }, { status: 400 })
    }

    const year = parseInt(yearMonth.substring(0, 4))
    const month = parseInt(yearMonth.substring(4, 6))

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json({ message: '無効な年月です' }, { status: 400 })
    }

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0) // その月の最終日

    const articles = await prisma.article.findMany({
      where: {
        pubDate: {
          gte: startDate,
          lte: endDate,
        },
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        pubDate: true,
        author: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        pubDate: 'desc',
      },
    })

    return NextResponse.json({
      year,
      month,
      articles,
      count: articles.length,
    })
  } catch (error) {
    console.error('Archive API error:', error)
    return NextResponse.json({ message: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
```

### 2.6. `src/app/api/articles/category/[category]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest, { params }: { params: { category: string } }) {
  try {
    const { category } = params

    if (!category) {
      return NextResponse.json({ message: 'カテゴリ名が必要です' }, { status: 400 })
    }

    // カテゴリ名で記事を検索
    // Note: 旧プロジェクトではカテゴリとタグが統合されたため、このAPIはタグAPIとほぼ同じロジックになる
    // tagsフィールドにカテゴリ名が含まれる記事を検索
    const articles = await prisma.article.findMany({
      where: {
        tags: {
          has: category,
        },
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        pubDate: true,
        author: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        pubDate: 'desc',
      },
    })

    return NextResponse.json({
      category,
      articles,
      count: articles.length,
    })
  } catch (error) {
    console.error('Category API error:', error)
    return NextResponse.json({ message: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
```

## 3. 完了の定義

*   `src/app/api/articles/` ディレクトリ内に上記6つのファイルが作成されていること。

## 4. 検証方法

PMがファイル内容を読み取り、意図通りに作成されていることを確認する。
