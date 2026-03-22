import { Worker } from 'bullmq'
import { connection } from './connection'
import { QUEUE_NAMES } from './queues'
import { scrapingWorker } from './scraping/orchestrator'
import { enrichmentWorker } from './scraping/enrichment'
import { rssIngestWorker } from './news/rss-ingest'
import { newsEnrichWorker } from './news/enrich'
import { reviewModerationWorker } from './moderation/review'

console.log('Starting FYI workers...')

// Meilisearch sync worker
const meiliSyncWorker = new Worker(
  QUEUE_NAMES.MEILI_SYNC,
  async (job) => {
    const { action, index, document } = job.data
    const { getMeiliClient } = await import('../lib/meilisearch')
    const client = getMeiliClient()
    const idx = client.index(index)

    switch (action) {
      case 'upsert':
        await idx.addDocuments([document])
        break
      case 'delete':
        await idx.deleteDocument(document.id)
        break
      case 'bulk-upsert':
        await idx.addDocuments(document)
        break
    }
  },
  { connection, concurrency: 5 }
)

// Moderation worker — real implementation in workers/moderation/review.ts
// reviewModerationWorker imported above handles MODERATION queue

// Notification worker — inserts notification records into Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://supabase-kong:8000'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const notificationsWorker = new Worker(
  QUEUE_NAMES.NOTIFICATIONS,
  async (job) => {
    const { userId, type, title, body, metadata } = job.data

    const response = await fetch(`${SUPABASE_URL}/rest/v1/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({
        user_id: userId,
        type,
        title,
        body: body || null,
        metadata: metadata || {},
        is_read: false,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Failed to create notification: ${response.status} ${text}`)
    }

    console.log(`[Notification] Created for user ${userId}: ${type} — ${title}`)
  },
  { connection, concurrency: 3 }
)

// Graceful shutdown
const workers = [
  meiliSyncWorker,
  reviewModerationWorker,
  notificationsWorker,
  scrapingWorker,
  enrichmentWorker,
  rssIngestWorker,
  newsEnrichWorker,
]

async function shutdown() {
  console.log('Shutting down workers...')
  await Promise.all(workers.map((w) => w.close()))
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

console.log(`Workers started: ${workers.map((w) => w.name).join(', ')}`)

// Schedule recurring jobs
async function setupSchedules() {
  const { Queue } = await import('bullmq')

  // News ingestion — every 30 minutes
  const newsQueue = new Queue(QUEUE_NAMES.NEWS_INGEST, { connection })
  await newsQueue.upsertJobScheduler('rss-ingest-schedule', {
    every: 30 * 60 * 1000, // 30 minutes
  }, {
    name: 'scheduled-rss-ingest',
    data: { mode: 'all' },
  })
  console.log('Scheduled: RSS ingest every 30 minutes')

  // Weekly full scrape — Sundays at 2 AM
  const scrapingQueue = new Queue(QUEUE_NAMES.SCRAPING, { connection })
  const cities = ['kingston', 'ottawa', 'montreal', 'toronto', 'vancouver']
  const categories = ['restaurant', 'bar', 'cafe', 'shopping', 'attraction', 'service']

  for (const cityId of cities) {
    for (const category of categories) {
      await scrapingQueue.upsertJobScheduler(`weekly-${cityId}-${category}`, {
        pattern: '0 2 * * 0', // Sundays at 2 AM
      }, {
        name: `weekly-scrape-${cityId}-${category}`,
        data: { cityId, category, mode: 'full' },
      })
    }
  }
  console.log(`Scheduled: Weekly scrape for ${cities.length} cities x ${categories.length} categories`)
}

setupSchedules().catch((err) => console.error('Failed to set up schedules:', err))
