import type { TaskConfig } from 'payload'

import { INGEST_DEFAULT_STATUS } from './draftDefaults'

/**
 * No-op task that proves the Jobs Queue runtime (AR20). It logs, asserts the
 * moderation-never-published invariant (NFR4) via INGEST_DEFAULT_STATUS, and returns
 * success. Registered in payload.config.ts and run by the cron Route Handler + autoRun.
 */
export const heartbeatTask: TaskConfig<{
  input: Record<string, never>
  output: { ranAt: string; ingestStatus: string }
}> = {
  slug: 'heartbeat',
  label: 'Heartbeat',
  // Schedule proves scheduled running is wired up; autoRun (config) executes the queue.
  schedule: [{ cron: '*/5 * * * *', queue: 'default' }],
  outputSchema: [
    { name: 'ranAt', type: 'text' },
    { name: 'ingestStatus', type: 'text' },
  ],
  handler: ({ req }) => {
    const ranAt = new Date().toISOString()
    // Demonstrates the invariant: ingest defaults are always non-public.
    req.payload.logger.info(
      `[jobs] heartbeat ok at ${ranAt} (ingest default status="${INGEST_DEFAULT_STATUS}")`,
    )
    return { output: { ranAt, ingestStatus: INGEST_DEFAULT_STATUS } }
  },
}
