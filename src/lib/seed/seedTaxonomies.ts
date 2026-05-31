import type { Payload } from 'payload'

import { slugify } from '../../fields/slugField'

// Kingston launch taxonomy data (from the content model + design system).
const NEIGHBOURHOODS = [
  'Downtown',
  'Williamsville',
  'Portsmouth',
  'Sydenham',
  'Inner Harbour',
  'Kingscourt',
  'Reddendale',
  'Cataraqui',
]

const NEWS_CATEGORIES: { name: string; color: string }[] = [
  { name: 'Local', color: '#2f6d6a' },
  { name: 'Politics', color: '#7a4b8c' },
  { name: 'Business', color: '#2e5d8a' },
  { name: 'Sports', color: '#b1582b' },
  { name: 'Arts & Culture', color: '#a23a64' },
  { name: 'Opinion', color: '#6b6f3a' },
]

const EVENT_CATEGORIES = ['Music', 'Food', 'Family', 'Arts', 'Sports']

// Two-level business categories: parent → leaves.
const BUSINESS_CATEGORIES: Record<string, string[]> = {
  'Food & Drink': ['Restaurant', 'Cafe', 'Coffee Shop', 'Bar', 'Bakery'],
  Shopping: ['Bookstore', 'Grocery', 'Boutique'],
  Recreation: ['Gym', 'Park', 'Studio'],
  'Arts & Culture': ['Gallery', 'Theatre', 'Music Venue'],
  Services: ['Salon', 'Repair', 'Professional Services'],
}

type Collection =
  | 'neighbourhoods'
  | 'news-categories'
  | 'event-categories'
  | 'business-categories'

// Create a term only if one with the same slug doesn't already exist in this city.
const ensureTerm = async (
  payload: Payload,
  collection: Collection,
  cityId: string,
  data: Record<string, unknown>,
): Promise<string> => {
  const slug = slugify(String(data.name))
  const existing = await payload.find({
    collection,
    where: { and: [{ slug: { equals: slug } }, { city: { equals: cityId } }] },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (existing.docs[0]) return String(existing.docs[0].id)
  const created = await payload.create({
    collection,
    overrideAccess: true,
    data: { ...data, slug, city: cityId },
  } as Parameters<typeof payload.create>[0])
  return String(created.id)
}

/** Idempotently seed Kingston's shared taxonomies. Safe to re-run. */
export const seedTaxonomies = async (payload: Payload, cityId: string): Promise<void> => {
  try {
    for (const name of NEIGHBOURHOODS) {
      await ensureTerm(payload, 'neighbourhoods', cityId, { name })
    }
    for (const cat of NEWS_CATEGORIES) {
      await ensureTerm(payload, 'news-categories', cityId, { name: cat.name, color: cat.color })
    }
    for (const name of EVENT_CATEGORIES) {
      await ensureTerm(payload, 'event-categories', cityId, { name })
    }
    for (const [parentName, leaves] of Object.entries(BUSINESS_CATEGORIES)) {
      const parentId = await ensureTerm(payload, 'business-categories', cityId, { name: parentName })
      for (const leaf of leaves) {
        await ensureTerm(payload, 'business-categories', cityId, { name: leaf, parent: parentId })
      }
    }
    payload.logger.info('Seeded Kingston taxonomies')
  } catch {
    payload.logger.warn('seedTaxonomies skipped — taxonomy tables not ready yet')
  }
}
