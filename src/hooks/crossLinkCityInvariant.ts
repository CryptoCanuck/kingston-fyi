import type { CollectionBeforeValidateHook } from 'payload'
import { APIError } from 'payload'

type LinkSpec = {
  /** The relationship field name on this collection. */
  field: string
  /** Target collection slug (omit for polymorphic relationships — read from the value). */
  relationTo?: string
}

type Ref = { id: string; collection: string }

const toId = (value: unknown): string | null => {
  if (value == null) return null
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (typeof value === 'object' && 'id' in (value as Record<string, unknown>)) {
    return String((value as { id: unknown }).id)
  }
  return null
}

// Normalize a relationship field value into a flat list of {id, collection} refs.
const collectRefs = (value: unknown, relationTo?: string): Ref[] => {
  if (value == null) return []
  const items = Array.isArray(value) ? value : [value]
  const refs: Ref[] = []
  for (const item of items) {
    // Polymorphic shape: { relationTo, value }
    if (item && typeof item === 'object' && 'relationTo' in item && 'value' in item) {
      const poly = item as { relationTo: string; value: unknown }
      const id = toId(poly.value)
      if (id) refs.push({ id, collection: poly.relationTo })
      continue
    }
    const id = toId(item)
    if (id && relationTo) refs.push({ id, collection: relationTo })
  }
  return refs
}

/**
 * Cross-link city invariant (FR55, NFR7): every relationship endpoint must share the
 * document's city. A link whose target lives in another city is rejected. Wire this as
 * a `beforeValidate` collection hook, passing the cross-link relationship fields.
 *
 * Enforcement is skipped only when a side has no resolvable city (e.g. a non-scoped
 * target), never silently across cities.
 */
export const crossLinkCityInvariant = (links: LinkSpec[]): CollectionBeforeValidateHook => {
  return async ({ data, originalDoc, req }) => {
    if (!data) return data

    const selfCity = toId(data.city) ?? toId(originalDoc?.city)
    if (!selfCity) return data // city not yet known on this doc; nothing to compare

    for (const { field, relationTo } of links) {
      const refs = collectRefs(data[field], relationTo)
      for (const ref of refs) {
        let related: { city?: unknown } | null = null
        try {
          related = (await req.payload.findByID({
            collection: ref.collection as never,
            id: ref.id,
            depth: 0,
            overrideAccess: true,
            req,
          })) as { city?: unknown }
        } catch {
          continue // target missing/unreadable — referential integrity handled elsewhere
        }
        const targetCity = toId(related?.city)
        if (targetCity && targetCity !== selfCity) {
          throw new APIError(
            `Cross-city link rejected: "${field}" → ${ref.collection}/${ref.id} belongs to a different city.`,
            400,
          )
        }
      }
    }

    return data
  }
}
