import { Worker, Queue } from 'bullmq'
import Parser from 'rss-parser'
import { connection } from '../connection'
import { QUEUE_NAMES } from '../queues'

const parser = new Parser()
const newsEnrichQueue = new Queue(QUEUE_NAMES.NEWS_ENRICH, { connection })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://supabase-kong:8000'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

async function supabaseRequest(path: string, options: RequestInit = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: 'return=representation',
      ...options.headers,
    },
  })
  if (!response.ok && response.status !== 409) {
    const text = await response.text()
    throw new Error(`Supabase ${path}: ${response.status} ${text}`)
  }
  return response.json()
}

export const rssIngestWorker = new Worker(
  QUEUE_NAMES.NEWS_INGEST,
  async (job) => {
    const { mode } = job.data as { mode: 'all' | 'single'; sourceId?: string }

    // Fetch active RSS sources
    let sourcesQuery = '/news_sources?type=eq.rss&is_active=eq.true'
    if (mode === 'single' && job.data.sourceId) {
      sourcesQuery += `&id=eq.${job.data.sourceId}`
    }

    const sources = await supabaseRequest(sourcesQuery)
    let totalInserted = 0
    let totalSkipped = 0
    let totalErrors = 0

    for (const source of sources) {
      try {
        const feed = await parser.parseURL(source.url)
        let inserted = 0
        let skipped = 0

        for (const item of feed.items || []) {
          if (!item.link || !item.title) continue

          try {
            // Insert article (UNIQUE on source_url will prevent duplicates)
            const result = await supabaseRequest('/news_articles', {
              method: 'POST',
              headers: { Prefer: 'return=representation,resolution=ignore-duplicates' },
              body: JSON.stringify({
                city_id: source.city_id,
                source_id: source.id,
                title: item.title,
                content: item.contentSnippet || item.content || '',
                source_url: item.link,
                source_name: source.name,
                published_at: item.isoDate || item.pubDate || null,
                thumbnail_url: item.enclosure?.url || null,
              }),
            })

            if (result && result.length > 0) {
              inserted++
              // Enqueue AI enrichment
              await newsEnrichQueue.add('enrich', {
                articleId: result[0].id,
                title: item.title,
                content: item.contentSnippet || item.content || '',
                cityId: source.city_id,
              })
            } else {
              skipped++
            }
          } catch {
            skipped++
          }
        }

        // Update last_fetched_at
        await supabaseRequest(`/news_sources?id=eq.${source.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            last_fetched_at: new Date().toISOString(),
            error_count: 0,
            last_error: null,
          }),
        })

        totalInserted += inserted
        totalSkipped += skipped
        console.log(`[RSS] ${source.name}: ${inserted} new, ${skipped} skipped`)
      } catch (err) {
        totalErrors++
        console.error(`[RSS] Error fetching ${source.name}:`, err)

        // Record error on source
        await supabaseRequest(`/news_sources?id=eq.${source.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            error_count: source.error_count + 1,
            last_error: err instanceof Error ? err.message : String(err),
          }),
        }).catch(() => {})
      }
    }

    return { inserted: totalInserted, skipped: totalSkipped, errors: totalErrors }
  },
  { connection, concurrency: 1 }
)
