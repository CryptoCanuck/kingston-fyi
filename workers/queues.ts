import { Queue } from 'bullmq'
import { connection } from './connection'

export const QUEUE_NAMES = {
  SCRAPING: 'scraping',
  ENRICHMENT: 'enrichment',
  NEWS_INGEST: 'news-ingest',
  NEWS_ENRICH: 'news-enrich',
  MODERATION: 'moderation',
  MEILI_SYNC: 'meili-sync',
  NOTIFICATIONS: 'notifications',
} as const

export const scrapingQueue = new Queue(QUEUE_NAMES.SCRAPING, { connection })
export const enrichmentQueue = new Queue(QUEUE_NAMES.ENRICHMENT, { connection })
export const newsIngestQueue = new Queue(QUEUE_NAMES.NEWS_INGEST, { connection })
export const newsEnrichQueue = new Queue(QUEUE_NAMES.NEWS_ENRICH, { connection })
export const moderationQueue = new Queue(QUEUE_NAMES.MODERATION, { connection })
export const meiliSyncQueue = new Queue(QUEUE_NAMES.MEILI_SYNC, { connection })
export const notificationsQueue = new Queue(QUEUE_NAMES.NOTIFICATIONS, { connection })
