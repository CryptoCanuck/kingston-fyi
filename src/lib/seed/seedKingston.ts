import type { Payload } from 'payload'

import { DEFAULT_CITY_SLUG } from '../city'

/**
 * Idempotently ensure the launch city (Kingston) exists. Runs on init so a fresh DB is
 * immediately usable for hostname→city resolution. Returns the city id, or null if the
 * schema isn't ready yet (e.g. during migrate:create before migrations run).
 */
export const seedKingston = async (payload: Payload): Promise<string | null> => {
  try {
    const existing = await payload.find({
      collection: 'cities',
      where: { slug: { equals: DEFAULT_CITY_SLUG } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (existing.docs[0]) return String(existing.docs[0].id)

    const created = await payload.create({
      collection: 'cities',
      overrideAccess: true,
      data: {
        name: 'Kingston',
        slug: DEFAULT_CITY_SLUG,
        timezone: 'America/Toronto',
        hostnames: [
          { hostname: 'kingston.fyi' },
          { hostname: 'www.kingston.fyi' },
          { hostname: 'localhost' },
        ],
      },
    })
    payload.logger.info('Seeded launch city: Kingston')
    return String(created.id)
  } catch {
    payload.logger.warn('seedKingston skipped — cities table not ready yet')
    return null
  }
}
