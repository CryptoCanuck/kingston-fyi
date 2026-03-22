import { Queue } from 'bullmq'

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
}

// Lazy-initialized queues for use in Next.js API routes
let _meiliSync: Queue | null = null
let _moderation: Queue | null = null
let _notifications: Queue | null = null

function getMeiliSyncQueue(): Queue {
  if (!_meiliSync) _meiliSync = new Queue('meili-sync', { connection })
  return _meiliSync
}

function getModerationQueue(): Queue {
  if (!_moderation) _moderation = new Queue('moderation', { connection })
  return _moderation
}

function getNotificationsQueue(): Queue {
  if (!_notifications) _notifications = new Queue('notifications', { connection })
  return _notifications
}

export async function enqueueMeiliSync(
  action: 'upsert' | 'delete' | 'bulk-upsert',
  index: string,
  document: unknown
) {
  await getMeiliSyncQueue().add('sync', { action, index, document })
}

export async function enqueueModeration(
  type: 'review',
  entityId: string,
  content: string
) {
  await getModerationQueue().add('moderate', { type, entityId, content })
}

export async function enqueueNotification(
  userId: string,
  type: string,
  title: string,
  body?: string,
  metadata?: Record<string, unknown>
) {
  await getNotificationsQueue().add('notify', { userId, type, title, body, metadata })
}
