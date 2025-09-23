import { queryAll } from "../lib/db";
import type { Env } from "../index";

export type ContentType = 'all' | 'articles' | 'media' | 'images' | 'videos' | 'documents';
export type SortOption = 'relevance' | 'date' | 'size';

interface SearchFilters {
  contentType: ContentType;
  dateFrom?: string;
  dateTo?: string;
  tags: string[];
  sortBy: SortOption;
}

interface UnifiedSearchRequest {
  query: string;
  type?: ContentType;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  sortBy?: SortOption;
  page?: number;
  limit?: number;
}

interface BaseSearchResult {
  id: string;
  title: string;
  type: 'article' | 'image' | 'video' | 'document';
  url: string;
  thumbnailUrl?: string;
  createdAt: string;
  tags: string[];
  author: {
    name: string | null;
    displayName?: string | null;
    email?: string;
  };
  metadata?: Record<string, any>;
}

interface ArticleSearchResult extends BaseSearchResult {
  type: 'article';
  slug: string;
  description?: string | null;
  content: string;
  pubDate: string;
}

interface MediaSearchResult extends BaseSearchResult {
  type: 'image' | 'video' | 'document';
  fileName: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  duration?: number;
}

export type UnifiedSearchResult = ArticleSearchResult | MediaSearchResult;

interface SearchResponse {
  results: UnifiedSearchResult[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  availableTags: string[];
  filters: {
    contentTypes: { type: ContentType; count: number }[];
    dateRange: {
      earliest: string;
      latest: string;
    };
  };
}

export async function handleUnifiedSearch(req: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(req.url);
    const searchQuery = url.searchParams.get('q');

    if (!searchQuery || searchQuery.trim().length < 1) {
      return new Response(JSON.stringify({
        error: "検索クエリが必要です",
        message: "検索キーワードを入力してください"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Parse search parameters
    const contentType = (url.searchParams.get('type') as ContentType) || 'all';
    const dateFrom = url.searchParams.get('date_from');
    const dateTo = url.searchParams.get('date_to');
    const tagsParam = url.searchParams.get('tags');
    const tags = tagsParam ? tagsParam.split(',').map(t => t.trim()).filter(Boolean) : [];
    const sortBy = (url.searchParams.get('sort_by') as SortOption) || 'relevance';
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100);

    console.log('Unified search called:', {
      searchQuery,
      contentType,
      dateFrom,
      dateTo,
      tags,
      sortBy,
      page,
      limit
    });

    const offset = (page - 1) * limit;
    let results: UnifiedSearchResult[] = [];
    let totalCount = 0;

    // Search articles
    if (contentType === 'all' || contentType === 'articles') {
      const articleResults = await searchArticles(env, searchQuery, {
        dateFrom,
        dateTo,
        tags,
        sortBy,
        limit: contentType === 'articles' ? limit : Math.ceil(limit / 2),
        offset: contentType === 'articles' ? offset : 0
      });
      results.push(...articleResults);
    }

    // Search media
    if (contentType === 'all' || ['media', 'images', 'videos', 'documents'].includes(contentType)) {
      const mediaResults = await searchMedia(env, searchQuery, {
        contentType,
        dateFrom,
        dateTo,
        tags,
        sortBy,
        limit: contentType === 'all' ? Math.floor(limit / 2) : limit,
        offset: contentType === 'all' ? 0 : offset
      });
      results.push(...mediaResults);
    }

    // Sort results by relevance or date
    if (sortBy === 'date') {
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'size' && results.some(r => r.type !== 'article')) {
      results.sort((a, b) => {
        const aSize = a.type === 'article' ? 0 : (a as MediaSearchResult).fileSize || 0;
        const bSize = b.type === 'article' ? 0 : (b as MediaSearchResult).fileSize || 0;
        return bSize - aSize;
      });
    }

    // Apply pagination if searching all content types
    if (contentType === 'all') {
      totalCount = results.length;
      results = results.slice(offset, offset + limit);
    } else {
      totalCount = results.length;
    }

    // Get available tags
    const availableTags = await getAvailableTags(env, searchQuery);

    // Get content type counts
    const contentTypeCounts = await getContentTypeCounts(env, searchQuery);

    // Get date range
    const dateRange = await getDateRange(env);

    const response: SearchResponse = {
      results,
      total: totalCount,
      page,
      limit,
      hasMore: (page * limit) < totalCount,
      availableTags,
      filters: {
        contentTypes: contentTypeCounts,
        dateRange
      }
    };

    return new Response(JSON.stringify(response), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error('Unified search error:', error);
    return new Response(JSON.stringify({
      error: "検索に失敗しました",
      message: error.message,
      details: error.stack
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

async function searchArticles(
  env: Env,
  searchQuery: string,
  options: {
    dateFrom?: string;
    dateTo?: string;
    tags?: string[];
    sortBy?: SortOption;
    limit?: number;
    offset?: number;
  } = {}
): Promise<ArticleSearchResult[]> {
  const { dateFrom, dateTo, tags, sortBy, limit = 10, offset = 0 } = options;

  let sql = `
    SELECT
      m.*,
      u.name as user_name,
      u.email as user_email,
      (SELECT GROUP_CONCAT(t.name) FROM tags t JOIN memory_tags mt ON t.id = mt.tag_id WHERE mt.memory_id = m.id) as tags_concat
    FROM memories m
    LEFT JOIN users u ON m.user_id = u.id
    WHERE (LOWER(m.title) LIKE ? OR LOWER(m.content) LIKE ?)
  `;

  const params: any[] = [
    `%${searchQuery.toLowerCase()}%`,
    `%${searchQuery.toLowerCase()}%`
  ];

  // Add date filters
  if (dateFrom) {
    sql += ` AND DATE(m.created_at) >= ?`;
    params.push(dateFrom);
  }
  if (dateTo) {
    sql += ` AND DATE(m.created_at) <= ?`;
    params.push(dateTo);
  }

  // Add tag filters
  if (tags && tags.length > 0) {
    const tagPlaceholders = tags.map(() => '?').join(',');
    sql += ` AND m.id IN (
      SELECT DISTINCT mt.memory_id
      FROM memory_tags mt
      JOIN tags t ON mt.tag_id = t.id
      WHERE t.name IN (${tagPlaceholders})
    )`;
    params.push(...tags);
  }

  // Add ordering
  if (sortBy === 'date') {
    sql += ` ORDER BY m.created_at DESC`;
  } else {
    // Relevance-based ordering (title matches first, then content matches)
    sql += ` ORDER BY
      CASE
        WHEN LOWER(m.title) LIKE ? THEN 1
        ELSE 2
      END,
      m.created_at DESC`;
    params.push(`%${searchQuery.toLowerCase()}%`);
  }

  sql += ` LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  console.log('Article search SQL:', sql);
  console.log('Article search params:', params);

  const results = await queryAll(env, sql, params);

  return results.map((article: any): ArticleSearchResult => {
    const tags = article.tags_concat ? article.tags_concat.split(',') : [];

    return {
      id: article.id.toString(),
      title: article.title,
      type: 'article',
      slug: article.article_id || article.id.toString(),
      description: article.content ? article.content.substring(0, 150) + '...' : null,
      content: article.content || '',
      pubDate: article.created_at,
      url: `/articles/${article.article_id || article.id}`,
      createdAt: article.created_at,
      tags,
      author: {
        name: article.user_name || 'システム',
        displayName: article.user_name || 'システム',
        email: article.user_email || null
      }
    };
  });
}

async function searchMedia(
  env: Env,
  searchQuery: string,
  options: {
    contentType?: ContentType;
    dateFrom?: string;
    dateTo?: string;
    tags?: string[];
    sortBy?: SortOption;
    limit?: number;
    offset?: number;
  } = {}
): Promise<MediaSearchResult[]> {
  const { contentType, dateFrom, dateTo, tags, sortBy, limit = 10, offset = 0 } = options;

  let sql = `
    SELECT
      m.*,
      u.name as user_name,
      u.email as user_email
    FROM media m
    LEFT JOIN users u ON m.user_id = u.id
    WHERE (LOWER(m.original_filename) LIKE ? OR LOWER(m.description) LIKE ?)
  `;

  const params: any[] = [
    `%${searchQuery.toLowerCase()}%`,
    `%${searchQuery.toLowerCase()}%`
  ];

  // Add content type filters
  if (contentType && contentType !== 'all' && contentType !== 'media') {
    if (contentType === 'images') {
      sql += ` AND m.mime_type LIKE 'image/%'`;
    } else if (contentType === 'videos') {
      sql += ` AND m.mime_type LIKE 'video/%'`;
    } else if (contentType === 'documents') {
      sql += ` AND m.mime_type NOT LIKE 'image/%' AND m.mime_type NOT LIKE 'video/%'`;
    }
  }

  // Add date filters
  if (dateFrom) {
    sql += ` AND DATE(m.created_at) >= ?`;
    params.push(dateFrom);
  }
  if (dateTo) {
    sql += ` AND DATE(m.created_at) <= ?`;
    params.push(dateTo);
  }

  // Add ordering
  if (sortBy === 'date') {
    sql += ` ORDER BY m.created_at DESC`;
  } else if (sortBy === 'size') {
    sql += ` ORDER BY m.file_size DESC`;
  } else {
    // Relevance-based ordering
    sql += ` ORDER BY
      CASE
        WHEN LOWER(m.original_filename) LIKE ? THEN 1
        ELSE 2
      END,
      m.created_at DESC`;
    params.push(`%${searchQuery.toLowerCase()}%`);
  }

  sql += ` LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  console.log('Media search SQL:', sql);
  console.log('Media search params:', params);

  const results = await queryAll(env, sql, params);

  return results.map((media: any): MediaSearchResult => {
    const isImage = media.mime_type?.startsWith('image/');
    const isVideo = media.mime_type?.startsWith('video/');

    return {
      id: media.id.toString(),
      title: media.original_filename || 'Untitled',
      type: isImage ? 'image' : isVideo ? 'video' : 'document',
      fileName: media.original_filename || '',
      fileSize: media.file_size || 0,
      mimeType: media.mime_type || '',
      width: media.width,
      height: media.height,
      duration: media.duration,
      url: `/api/media/${media.id}`,
      thumbnailUrl: isImage ? `/api/media/${media.id}` : undefined,
      createdAt: media.created_at,
      tags: [], // Media tags implementation would go here
      author: {
        name: media.user_name || 'システム',
        displayName: media.user_name || 'システム',
        email: media.user_email || null
      },
      metadata: {
        description: media.description,
        fileSize: media.file_size,
        mimeType: media.mime_type
      }
    };
  });
}

async function getAvailableTags(env: Env, searchQuery: string): Promise<string[]> {
  try {
    const sql = `
      SELECT DISTINCT t.name
      FROM tags t
      JOIN memory_tags mt ON t.id = mt.tag_id
      JOIN memories m ON mt.memory_id = m.id
      WHERE (LOWER(m.title) LIKE ? OR LOWER(m.content) LIKE ?)
      ORDER BY t.name
      LIMIT 20
    `;

    const results = await queryAll(env, sql, [
      `%${searchQuery.toLowerCase()}%`,
      `%${searchQuery.toLowerCase()}%`
    ]);

    return results.map((row: any) => row.name);
  } catch (error) {
    console.error('Error getting available tags:', error);
    return [];
  }
}

async function getContentTypeCounts(env: Env, searchQuery: string): Promise<{ type: ContentType; count: number }[]> {
  try {
    // Count articles
    const articleCount = await queryAll(env, `
      SELECT COUNT(*) as count
      FROM memories m
      WHERE (LOWER(m.title) LIKE ? OR LOWER(m.content) LIKE ?)
    `, [`%${searchQuery.toLowerCase()}%`, `%${searchQuery.toLowerCase()}%`]);

    // Count media
    const mediaCount = await queryAll(env, `
      SELECT COUNT(*) as count
      FROM media m
      WHERE (LOWER(m.original_filename) LIKE ? OR LOWER(m.description) LIKE ?)
    `, [`%${searchQuery.toLowerCase()}%`, `%${searchQuery.toLowerCase()}%`]);

    // Count images
    const imageCount = await queryAll(env, `
      SELECT COUNT(*) as count
      FROM media m
      WHERE (LOWER(m.original_filename) LIKE ? OR LOWER(m.description) LIKE ?)
      AND m.mime_type LIKE 'image/%'
    `, [`%${searchQuery.toLowerCase()}%`, `%${searchQuery.toLowerCase()}%`]);

    // Count videos
    const videoCount = await queryAll(env, `
      SELECT COUNT(*) as count
      FROM media m
      WHERE (LOWER(m.original_filename) LIKE ? OR LOWER(m.description) LIKE ?)
      AND m.mime_type LIKE 'video/%'
    `, [`%${searchQuery.toLowerCase()}%`, `%${searchQuery.toLowerCase()}%`]);

    return [
      { type: 'all', count: (articleCount[0]?.count || 0) + (mediaCount[0]?.count || 0) },
      { type: 'articles', count: articleCount[0]?.count || 0 },
      { type: 'media', count: mediaCount[0]?.count || 0 },
      { type: 'images', count: imageCount[0]?.count || 0 },
      { type: 'videos', count: videoCount[0]?.count || 0 }
    ];
  } catch (error) {
    console.error('Error getting content type counts:', error);
    return [
      { type: 'all', count: 0 },
      { type: 'articles', count: 0 },
      { type: 'media', count: 0 },
      { type: 'images', count: 0 },
      { type: 'videos', count: 0 }
    ];
  }
}

async function getDateRange(env: Env): Promise<{ earliest: string; latest: string }> {
  try {
    // Get date range from both memories and media
    const memoryDates = await queryAll(env, `
      SELECT
        MIN(created_at) as earliest,
        MAX(created_at) as latest
      FROM memories
    `);

    const mediaDates = await queryAll(env, `
      SELECT
        MIN(created_at) as earliest,
        MAX(created_at) as latest
      FROM media
    `);

    const memoryEarliest = memoryDates[0]?.earliest;
    const memoryLatest = memoryDates[0]?.latest;
    const mediaEarliest = mediaDates[0]?.earliest;
    const mediaLatest = mediaDates[0]?.latest;

    const earliest = [memoryEarliest, mediaEarliest]
      .filter(Boolean)
      .sort()[0] || '';

    const latest = [memoryLatest, mediaLatest]
      .filter(Boolean)
      .sort()
      .reverse()[0] || '';

    return { earliest, latest };
  } catch (error) {
    console.error('Error getting date range:', error);
    return { earliest: '', latest: '' };
  }
}