import Link from 'next/link'
import clsx from 'clsx'

export interface ArticleCardData {
  id: string
  slug: string
  title: string
  description?: string | null
  content?: string | null
  pubDate?: string | null
  createdAt?: string | null
  heroImageUrl?: string | null
  tags?: string[]
  author?: {
    name?: string | null
    displayName?: string | null
    email?: string | null
  }
}

interface ArticleCardProps {
  article: ArticleCardData
  className?: string
}

const formatDate = (value?: string | null) => {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const buildSnippet = (description?: string | null, content?: string | null) => {
  if (description) {
    return description
  }

  if (!content) {
    return ''
  }

  const text = content.replace(/\s+/g, ' ').trim()
  return text.length > 160 ? `${text.slice(0, 157)}...` : text
}

export default function ArticleCard({ article, className }: ArticleCardProps) {
  const { slug, title } = article
  const href = slug ? `/articles/${encodeURIComponent(slug)}` : '#'
  const snippet = buildSnippet(article.description, article.content)
  const dateLabel = formatDate(article.pubDate || article.createdAt)
  const tags = Array.isArray(article.tags) ? article.tags : []

  return (
    <Link
      href={href}
      className={clsx(
        'block bg-base-100 shadow hover:shadow-lg transition-shadow rounded-lg p-6',
        { 'pointer-events-none opacity-60': href === '#' },
        className
      )}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold line-clamp-2">
            {title || '無題の記事'}
          </h3>
          {snippet && (
            <p className="text-base-content/70 text-sm line-clamp-3">
              {snippet}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-base-content/60">
          <div>
            <p>{article.author?.displayName || article.author?.name || 'システム'}</p>
            {dateLabel && <p>{dateLabel}</p>}
          </div>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 6).map((tag, index) => (
              <span key={`${article.id}-tag-${index}`} className="badge badge-outline badge-sm">
                {tag}
              </span>
            ))}
            {tags.length > 6 && (
              <span className="text-xs text-base-content/50">
                +{tags.length - 6}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
