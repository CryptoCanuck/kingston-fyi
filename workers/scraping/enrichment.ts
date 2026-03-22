import { Worker, Queue } from 'bullmq'
import { connection } from '../connection'
import { QUEUE_NAMES } from '../queues'
import { enrichListing, generateEmbedding } from '../../lib/ai'
import type { ExtractJobData } from './orchestrator'

const meiliSyncQueue = new Queue(QUEUE_NAMES.MEILI_SYNC, { connection })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://supabase-kong:8000'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

async function supabaseRequest(path: string, options: RequestInit = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: options.method === 'POST' ? 'return=representation,resolution=merge-duplicates' : 'return=representation',
      ...options.headers,
    },
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Supabase ${path}: ${response.status} ${text}`)
  }
  return response.json()
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80)
}

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = []
  for (let i = 0; i <= b.length; i++) matrix[i] = [i]
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  return matrix[b.length][a.length]
}

/** Enrichment worker: AI-enrich scraped data, dedupe, upsert to DB + Meilisearch */
export const enrichmentWorker = new Worker(
  QUEUE_NAMES.ENRICHMENT,
  async (job) => {
    const { cityId, category, businesses } = job.data as ExtractJobData

    let inserted = 0
    let updated = 0
    let duplicates = 0
    let errors = 0

    for (const biz of businesses) {
      try {
        // 1. Check for duplicate by google_place_id
        if (biz.google_place_id) {
          const existing = await supabaseRequest(
            `/places?google_place_id=eq.${encodeURIComponent(biz.google_place_id)}&limit=1`
          )
          if (existing.length > 0) {
            duplicates++
            continue
          }
        }

        // 2. Check for duplicate by fuzzy name match within city
        const slug = generateSlug(biz.name)
        const existing = await supabaseRequest(
          `/places?city_id=eq.${cityId}&slug=eq.${encodeURIComponent(slug)}&limit=1`
        )
        if (existing.length > 0) {
          // Fuzzy check on name
          if (levenshtein(existing[0].name.toLowerCase(), biz.name.toLowerCase()) < 3) {
            duplicates++
            continue
          }
        }

        // 3. AI enrichment
        let aiDescription = biz.description || ''
        let normalizedCategory = category

        try {
          const enrichment = await enrichListing({
            name: biz.name,
            category: biz.category || category,
            address: biz.address,
            existingDescription: biz.description,
          })
          aiDescription = enrichment.description || aiDescription
          normalizedCategory = enrichment.normalizedCategory || category
        } catch (aiErr) {
          console.warn(`AI enrichment failed for ${biz.name}:`, aiErr)
          // Continue with raw data
        }

        // 4. Upsert to database
        const placeData = {
          city_id: cityId,
          category_id: normalizedCategory,
          slug: slug + (biz.google_place_id ? '' : `-${Date.now().toString(36)}`),
          name: biz.name,
          description: aiDescription,
          street_address: biz.address,
          phone: biz.phone,
          website: biz.website,
          rating: biz.rating || 0,
          review_count: biz.review_count || 0,
          google_place_id: biz.google_place_id,
          hours: biz.hours ? JSON.stringify(biz.hours) : null,
          source_metadata: JSON.stringify({
            scraped_at: new Date().toISOString(),
            source: 'google_maps',
            raw_category: biz.category,
          }),
          ai_enrichment: JSON.stringify({
            enriched_at: new Date().toISOString(),
            description_generated: aiDescription !== biz.description,
            category_normalized: normalizedCategory !== category,
          }),
          is_active: true,
          claim_status: 'unclaimed',
        }

        const result = await supabaseRequest('/places', {
          method: 'POST',
          body: JSON.stringify(placeData),
        })

        if (result && result.length > 0) {
          inserted++

          // 5. Sync to Meilisearch
          await meiliSyncQueue.add('sync', {
            action: 'upsert',
            index: 'places',
            document: {
              id: result[0].id,
              city_id: cityId,
              category_id: normalizedCategory,
              slug: result[0].slug,
              name: biz.name,
              description: aiDescription,
              street_address: biz.address,
              phone: biz.phone,
              website: biz.website,
              rating: biz.rating || 0,
              review_count: biz.review_count || 0,
              is_featured: false,
              is_active: true,
            },
          })
        }
      } catch (err) {
        errors++
        console.error(`Error processing ${biz.name}:`, err)
      }
    }

    console.log(
      `[Enrichment] ${cityId}/${category}: ${inserted} inserted, ${updated} updated, ${duplicates} duplicates, ${errors} errors`
    )

    return { inserted, updated, duplicates, errors }
  },
  { connection, concurrency: 1 }
)
