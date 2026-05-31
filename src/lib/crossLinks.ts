import type { CollectionSlug, Payload, RelationshipField } from 'payload'

/**
 * Typed cross-link relationship (FR37). A forward link from one pillar entity to
 * another (e.g. Article → relatedBusinesses). Reverse links are NEVER stored — they are
 * derived by query (see getReverseLinks) to prevent integrity drift (FR55).
 */
export const crossLinkField = (opts: {
  name: string
  relationTo: CollectionSlug | CollectionSlug[]
  hasMany?: boolean
  label?: string
  description?: string
}): RelationshipField =>
  ({
    name: opts.name,
    type: 'relationship',
    relationTo: opts.relationTo,
    hasMany: opts.hasMany ?? true,
    label: opts.label,
    admin: {
      description:
        opts.description ?? 'Typed cross-link. Reverse links are derived, never stored.',
    },
  }) as RelationshipField

/**
 * Derive reverse cross-links: find documents in `fromCollection` whose `viaField`
 * relationship points at `targetId`, scoped to the same city. Computed on read; nothing
 * is persisted, so links can never drift out of sync (FR55).
 */
export const getReverseLinks = async <T = unknown>(args: {
  payload: Payload
  fromCollection: CollectionSlug
  viaField: string
  targetId: string
  cityId?: string
  limit?: number
  depth?: number
}): Promise<T[]> => {
  const { payload, fromCollection, viaField, targetId, cityId, limit = 50, depth = 0 } = args
  const where: Record<string, unknown> = { [viaField]: { equals: targetId } }
  const finalWhere = cityId
    ? { and: [where, { city: { equals: cityId } }] }
    : where
  const { docs } = await payload.find({
    collection: fromCollection,
    where: finalWhere as never,
    limit,
    depth,
    overrideAccess: false,
  })
  return docs as T[]
}
