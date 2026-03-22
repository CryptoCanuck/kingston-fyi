import { Worker } from 'bullmq'
import { connection } from '../connection'
import { QUEUE_NAMES } from '../queues'
import { summarizeArticle, generateEmbedding } from '../../lib/ai'

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
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Supabase ${path}: ${response.status} ${text}`)
  }
  return response.json()
}

export interface NewsEnrichJobData {
  articleId: string
  title: string
  content: string
  cityId: string
}

export const newsEnrichWorker = new Worker(
  QUEUE_NAMES.NEWS_ENRICH,
  async (job) => {
    const { articleId, title, content, cityId } = job.data as NewsEnrichJobData

    const text = `${title}\n\n${content}`
    let summary = ''
    let categories: string[] = []
    let entities = {}

    // 1. AI summarization + entity extraction
    try {
      const result = await summarizeArticle(text)
      summary = result.summary
      categories = result.categories
      entities = result.entities
    } catch (err) {
      console.warn(`[NewsEnrich] AI summarization failed for ${articleId}:`, err)
      // Use first 200 chars as fallback summary
      summary = content.substring(0, 200) + (content.length > 200 ? '...' : '')
    }

    // 2. Generate embedding for dedup
    let embedding: number[] | null = null
    try {
      embedding = await generateEmbedding(text.substring(0, 2000))
    } catch (err) {
      console.warn(`[NewsEnrich] Embedding generation failed for ${articleId}:`, err)
    }

    // 3. Check for semantic duplicates (cosine similarity > 0.92)
    let isDuplicate = false
    let duplicateOf: string | null = null

    if (embedding) {
      try {
        // Use pgvector to find similar articles in the same city from the last 7 days
        const embeddingStr = `[${embedding.join(',')}]`
        const { data: similar } = await supabaseRequest(
          `/rpc/find_similar_articles`,
          {
            method: 'POST',
            body: JSON.stringify({
              query_embedding: embeddingStr,
              match_city_id: cityId,
              match_threshold: 0.92,
              match_count: 1,
              exclude_id: articleId,
            }),
          }
        ).catch(() => ({ data: [] }))

        if (similar && similar.length > 0) {
          isDuplicate = true
          duplicateOf = similar[0].id
        }
      } catch {
        // Similarity search not available yet — skip dedup
      }
    }

    // 4. Update article with enrichment data
    const updateData: Record<string, unknown> = {
      summary,
      categories,
      entities,
      is_duplicate: isDuplicate,
      duplicate_of: duplicateOf,
    }

    if (embedding) {
      updateData.embedding = `[${embedding.join(',')}]`
    }

    await supabaseRequest(`/news_articles?id=eq.${articleId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    })

    // 5. Sync to Meilisearch (if not duplicate)
    if (!isDuplicate) {
      const { getMeiliClient } = await import('../../lib/meilisearch')
      const client = getMeiliClient()
      await client.index('news').addDocuments([{
        id: articleId,
        city_id: cityId,
        title,
        summary,
        source_name: job.data.sourceName || '',
        categories,
        published_at: job.data.publishedAt || '',
      }])
    }

    return { articleId, isDuplicate, duplicateOf, categoriesFound: categories.length }
  },
  { connection, concurrency: 2 }
)
