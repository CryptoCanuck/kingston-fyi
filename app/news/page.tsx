import Link from 'next/link'
import { Newspaper, ExternalLink } from 'lucide-react'
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
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--city-surface)]">
          <Newspaper className="h-5 w-5 text-[var(--city-primary)]" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{config.name} News</h1>
          <p className="text-gray-500">Latest local news and community updates</p>
        </div>
      </div>

      {/* Category Filters */}
      <div className="mt-6 flex flex-wrap gap-2">
        {NEWS_CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={cat.id === 'all' ? '/news' : `/news?category=${cat.id}`}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
              (category || 'all') === cat.id
                ? 'bg-[var(--city-primary)] text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      {/* Articles */}
      <div className="mt-8 space-y-4">
        {news.length === 0 ? (
          <div className="text-center py-16">
            <Newspaper className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-gray-500">No news articles found.</p>
          </div>
        ) : (
          news.map((article) => (
            <article key={article.id} className="card p-5">
              <div className="flex items-start gap-4">
                {article.thumbnail_url && (
                  <img
                    src={article.thumbnail_url}
                    alt=""
                    className="h-24 w-32 flex-shrink-0 rounded-xl object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-gray-900 leading-snug">
                    <a
                      href={article.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[var(--city-primary)] transition-colors"
                    >
                      {article.title}
                      <ExternalLink className="inline-block ml-1.5 h-3.5 w-3.5 text-gray-400" />
                    </a>
                  </h2>
                  {article.summary && (
                    <p className="mt-2 text-sm text-gray-500 leading-relaxed line-clamp-2">
                      {article.summary}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                    <span className="font-medium text-gray-500">{article.source_name}</span>
                    {article.published_at && (
                      <span>{new Date(article.published_at).toLocaleDateString()}</span>
                    )}
                    {article.categories.length > 0 && (
                      <div className="flex gap-1">
                        {article.categories.map((cat) => (
                          <span key={cat} className="badge bg-gray-100 text-gray-500">
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
      <div className="mt-10 flex justify-center gap-3">
        {page > 1 && (
          <Link
            href={`/news?page=${page - 1}${category ? `&category=${category}` : ''}`}
            className="btn btn-secondary"
          >
            Previous
          </Link>
        )}
        {news.length === pageSize && (
          <Link
            href={`/news?page=${page + 1}${category ? `&category=${category}` : ''}`}
            className="btn btn-secondary"
          >
            Next
          </Link>
        )}
      </div>
    </div>
  )
}
