import type { Payload } from 'payload'

import { DEFAULT_CITY_SLUG } from '../city'

/**
 * Idempotently ensure the launch city (Kingston) exists. Runs on init so a fresh DB is
 * immediately usable for hostname→city resolution. Safe to call repeatedly.
 */
export const seedKingston = async (payload: Payload): Promise<void> => {
  try {
    const existing = await payload.find({
      collection: 'cities',
      where: { slug: { equals: DEFAULT_CITY_SLUG } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (existing.docs.length > 0) return

    await payload.create({
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
  } catch {
    // Table may not exist yet (e.g. during migrate:create before migrations run).
    // Seeding will succeed on the next init once the schema is applied.
    payload.logger.warn('seedKingston skipped — cities table not ready yet')
  }
}
