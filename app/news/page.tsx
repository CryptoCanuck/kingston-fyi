import Link from 'next/link'
import { getCityFromHeaders, CITY_CONFIG } from '@/lib/city'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import type { NewsArticle } from '@/lib/types'

const NEWS_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'business', label: 'Business' },
  { id: 'politics', label: 'Politics' },
  { id: 'events', label: 'Events' },
  { id: 'development', label: 'Development' },
  { id: 'sports', label: 'Sports' },
  { id: 'community', label: 'Community' },
]

export async function generateMetadata(): Promise<Metadata> {
  const cityId = await getCityFromHeaders()
  const config = CITY_CONFIG[cityId]
  return {
    title: `Local News | ${config.name}.FYI`,
    description: `Latest local news and community updates from ${config.name}.`,
  }
}

interface Props {
  searchParams: Promise<{ category?: string; page?: string }>
}

export default async function NewsPage({ searchParams }: Props) {
  const { category, page: pageStr } = await searchParams
  const cityId = await getCityFromHeaders()
  const config = CITY_CONFIG[cityId]
  const supabase = await createServerSupabaseClient(cityId)
  const page = parseInt(pageStr || '1', 10)
  const pageSize = 20

  let query = supabase
    .from('news_articles')
    .select('*')
    .eq('city_id', cityId)
    .eq('is_duplicate', false)
    .order('published_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (category && category !== 'all') {
    query = query.contains('categories', [category])
  }

  const { data: articles } = await query
  const news = (articles ?? []) as NewsArticle[]

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900">{config.name} News</h1>
      <p className="mt-2 text-gray-600">Latest local news and community updates</p>

      {/* Category Filters */}
      <div className="mt-6 flex flex-wrap gap-2">
        {NEWS_CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={cat.id === 'all' ? '/news' : `/news?category=${cat.id}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              (category || 'all') === cat.id
                ? 'bg-city-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      {/* Articles */}
      <div className="mt-8 space-y-6">
        {news.length === 0 ? (
          <p className="text-gray-500">No news articles found.</p>
        ) : (
          news.map((article) => (
            <article
              key={article.id}
              className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start gap-4">
                {article.thumbnail_url && (
                  <img
                    src={article.thumbnail_url}
                    alt=""
                    className="h-20 w-28 flex-shrink-0 rounded-md object-cover"
                  />
                )}
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900">
                    <a
                      href={article.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-city-primary"
                    >
                      {article.title}
                    </a>
                  </h2>
                  {article.summary && (
                    <p className="mt-1 text-sm text-gray-600">{article.summary}</p>
                  )}
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                    <span>{article.source_name}</span>
                    {article.published_at && (
                      <span>
                        {new Date(article.published_at).toLocaleDateString()}
                      </span>
                    )}
                    {article.categories.length > 0 && (
                      <div className="flex gap-1">
                        {article.categories.map((cat) => (
                          <span
                            key={cat}
                            className="rounded bg-gray-100 px-2 py-0.5 text-xs"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="mt-8 flex justify-center gap-4">
        {page > 1 && (
          <Link
            href={`/news?page=${page - 1}${category ? `&category=${category}` : ''}`}
            className="rounded-md bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200"
          >
            Previous
          </Link>
        )}
        {news.length === pageSize && (
          <Link
            href={`/news?page=${page + 1}${category ? `&category=${category}` : ''}`}
            className="rounded-md bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200"
          >
            Next
          </Link>
        )}
      </div>
    </div>
  )
}
