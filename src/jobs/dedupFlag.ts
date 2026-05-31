import type { Payload, TaskConfig } from 'payload'

import { DEFAULT_CITY_SLUG } from '../lib/city'
import { type DedupCandidate, detectDuplicates } from '../lib/places/dedup'

export interface DedupFlagResult {
  scanned: number
  flagged: number
}

const toLocation = (value: unknown): [number, number] | null =>
  Array.isArray(value) && value.length === 2 ? [Number(value[0]), Number(value[1])] : null

/**
 * Flag likely-duplicate seeded listings for operator review (FR58). Uses the name+proximity
 * heuristic in lib/places/dedup; the operator merge action (which preserves cross-links)
 * lands in Epic 5. lib/inference can refine borderline pairs once an endpoint is configured —
 * the heuristic is the always-on baseline so dedup works without it.
 */
export const runDedupFlag = async (payload: Payload): Promise<DedupFlagResult> => {
  const { docs: cities } = await payload.find({
    collection: 'cities',
    where: { slug: { equals: DEFAULT_CITY_SLUG } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const city = cities[0]
  if (!city) return { scanned: 0, flagged: 0 }

  const { docs } = await payload.find({
    collection: 'businesses',
    where: { city: { equals: city.id } },
    limit: 0,
    pagination: false,
    depth: 0,
    overrideAccess: true,
    sort: 'createdAt', // oldest first → earlier listing is kept, later ones flagged
  })

  const candidates: DedupCandidate[] = docs.map((d) => ({
    id: String(d.id),
    name: String((d as { name?: string }).name ?? ''),
    location: toLocation((d as { location?: unknown }).location),
  }))

  const flags = detectDuplicates(candidates)
  for (const flag of flags) {
    await payload.update({
      collection: 'businesses',
      id: flag.duplicateId,
      data: {
        directoryFlags: { flaggedDuplicate: true, duplicateCandidate: flag.ofId },
      } as never,
      depth: 0,
      overrideAccess: true,
      context: { skipReModeration: true },
    })
  }

  payload.logger.info(`[dedup-flag] scanned=${candidates.length} flagged=${flags.length}`)
  return { scanned: candidates.length, flagged: flags.length }
}

export const dedupFlagTask: TaskConfig<{
  input: Record<string, never>
  output: DedupFlagResult
}> = {
  slug: 'dedup-flag',
  label: 'Flag duplicate directory listings',
  outputSchema: [
    { name: 'scanned', type: 'number' },
    { name: 'flagged', type: 'number' },
  ],
  handler: async ({ req }) => {
    const output = await runDedupFlag(req.payload)
    return { output }
  },
}
