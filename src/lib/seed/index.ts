import type { Payload } from 'payload'

import { seedKingston } from './seedKingston'
import { seedTaxonomies } from './seedTaxonomies'

/**
 * Idempotent launch seed: ensures the Kingston city and its shared taxonomies exist.
 * Runs on init; safe to call repeatedly and tolerant of an unmigrated schema.
 */
export const seed = async (payload: Payload): Promise<void> => {
  const cityId = await seedKingston(payload)
  if (cityId) {
    await seedTaxonomies(payload, cityId)
  }
}
