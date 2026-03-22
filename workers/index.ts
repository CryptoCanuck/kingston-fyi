import { Worker } from 'bullmq'
import { connection } from './connection'
import { QUEUE_NAMES } from './queues'
import { scrapingWorker } from './scraping/orchestrator'
import { enrichmentWorker } from './scraping/enrichment'
import { rssIngestWorker } from './news/rss-ingest'
import { newsEnrichWorker } from './news/enrich'

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

// Moderation worker (placeholder — full implementation in Phase 6)
const moderationWorker = new Worker(
  QUEUE_NAMES.MODERATION,
  async (job) => {
    console.log(`Moderation job ${job.id}: ${job.data.type}`)
    // Will be implemented in Phase 6
  },
  { connection, concurrency: 2 }
)

// Notification worker (placeholder — full implementation in Phase 5)
const notificationsWorker = new Worker(
  QUEUE_NAMES.NOTIFICATIONS,
  async (job) => {
    console.log(`Notification job ${job.id}: ${job.data.type}`)
    // Will be implemented in Phase 5
  },
  { connection, concurrency: 3 }
)

// Graceful shutdown
const workers = [
  meiliSyncWorker,
  moderationWorker,
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
