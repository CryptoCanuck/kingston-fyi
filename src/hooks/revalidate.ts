import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { type Pillar, entityTag, listTag, crossTag } from '../lib/cache'

// revalidateTag is a Next server API; guard so Payload CLI / job contexts don't crash.
// Next 16 signature: revalidateTag(tag, profile) — { expire: 0 } purges immediately.
const safeRevalidate = async (tags: string[]): Promise<void> => {
  try {
    const { revalidateTag } = await import('next/cache')
    for (const tag of tags) revalidateTag(tag, { expire: 0 })
  } catch {
    // Not in a Next request/render context (e.g. migration CLI) — nothing to revalidate.
  }
}

const cityIdOf = (doc: unknown): string | null => {
  const city = (doc as { city?: unknown })?.city
  if (city == null) return null
  return typeof city === 'object' ? String((city as { id: unknown }).id) : String(city)
}

const tagsFor = (doc: { id?: unknown; city?: unknown } | null | undefined, pillar: Pillar): string[] => {
  if (!doc?.id) return []
  const tags = [entityTag(String(doc.id)), crossTag(String(doc.id))]
  const cityId = cityIdOf(doc)
  if (cityId) tags.push(listTag(cityId, pillar))
  return tags
}

/**
 * afterChange / afterDelete revalidation for a pillar collection. Revalidates the
 * entity, its cross-link rails, and the city+pillar list (revalidation conventions).
 */
export const revalidateHooks = (pillar: Pillar) => ({
  afterChange: [
    (async ({ doc, previousDoc }) => {
      await safeRevalidate([...tagsFor(doc, pillar), ...tagsFor(previousDoc, pillar)])
      return doc
    }) as CollectionAfterChangeHook,
  ],
  afterDelete: [
    (async ({ doc }) => {
      await safeRevalidate(tagsFor(doc, pillar))
      return doc
    }) as CollectionAfterDeleteHook,
  ],
})
