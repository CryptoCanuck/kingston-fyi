import type { Payload, TaskConfig } from 'payload'

import { STALE_AFTER_DAYS } from '../lib/places/staleness'

export interface CheckStalenessResult {
  flagged: number
}

/**
 * Flag seeded listings whose Google-Places source data has aged past the threshold as
 * `stale-unverified` (FR58). Already-stale and permanently-closed listings are skipped.
 * Uses skipReModeration so flipping the lifecycle never re-opens moderation.
 */
export const runCheckStaleness = async (
  payload: Payload,
  now: Date = new Date(),
  days: number = STALE_AFTER_DAYS,
): Promise<CheckStalenessResult> => {
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString()

  const { docs } = await payload.find({
    collection: 'businesses',
    where: {
      and: [
        { 'provenance.source': { equals: 'google-places' } },
        { 'provenance.lastRefreshedAt': { less_than: cutoff } },
        { lifecycleStatus: { not_in: ['stale-unverified', 'permanently-closed'] } },
      ],
    },
    limit: 0,
    pagination: false,
    depth: 0,
    overrideAccess: true,
  })

  let flagged = 0
  for (const doc of docs) {
    await payload.update({
      collection: 'businesses',
      id: doc.id,
      data: { lifecycleStatus: 'stale-unverified' } as never,
      depth: 0,
      overrideAccess: true,
      context: { skipReModeration: true },
    })
    flagged += 1
  }

  payload.logger.info(`[check-staleness] flagged=${flagged} (cutoff ${cutoff})`)
  return { flagged }
}

export const checkStalenessTask: TaskConfig<{
  input: Record<string, never>
  output: CheckStalenessResult
}> = {
  slug: 'check-staleness',
  label: 'Flag stale directory listings',
  outputSchema: [{ name: 'flagged', type: 'number' }],
  handler: async ({ req }) => {
    const output = await runCheckStaleness(req.payload)
    return { output }
  },
}
