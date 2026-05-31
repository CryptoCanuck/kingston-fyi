import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, Payload, PayloadRequest } from 'payload'

import { PUBLIC_STATUSES } from '../fields/statusField'
import { summarizeReviews } from '../lib/reviews'

const businessIdOf = (doc: unknown): string | null => {
  const value = (doc as { business?: unknown })?.business
  if (value == null) return null
  if (typeof value === 'object') return String((value as { id: unknown }).id)
  return String(value)
}

/**
 * Recompute a business's displayed rating + review count from its public reviews (FR61).
 *
 * Non-destructive: only writes when at least one public review exists. A business with no
 * Review records keeps whatever rating it already has (e.g. a Google-Places aggregate set
 * during seeding), so this never clobbers a sourced aggregate down to null.
 */
const recompute = async (
  payload: Payload,
  req: PayloadRequest,
  businessId: string | null,
): Promise<void> => {
  if (!businessId) return
  const { docs } = await payload.find({
    collection: 'reviews',
    where: {
      and: [{ business: { equals: businessId } }, { status: { in: PUBLIC_STATUSES } }],
    },
    limit: 0,
    pagination: false,
    depth: 0,
    overrideAccess: true,
    req,
  })
  const { average, count } = summarizeReviews(docs as { rating?: number | null }[])
  if (count === 0) return
  await payload.update({
    collection: 'businesses',
    id: businessId,
    data: { rating: average, reviewCount: count },
    overrideAccess: true,
    depth: 0,
    req,
  })
}

/**
 * Wire on the Reviews collection. After a review is created/updated/deleted, refresh the
 * parent business's denormalized rating + count (and the previous business too, if the
 * review was re-pointed) so cards and listings can read them cheaply and sort null-safely.
 */
export const recomputeBusinessRatingHooks = (): {
  afterChange: CollectionAfterChangeHook[]
  afterDelete: CollectionAfterDeleteHook[]
} => ({
  afterChange: [
    (async ({ doc, previousDoc, req }) => {
      const current = businessIdOf(doc)
      const previous = businessIdOf(previousDoc)
      await recompute(req.payload, req, current)
      if (previous && previous !== current) await recompute(req.payload, req, previous)
      return doc
    }) as CollectionAfterChangeHook,
  ],
  afterDelete: [
    (async ({ doc, req }) => {
      await recompute(req.payload, req, businessIdOf(doc))
      return doc
    }) as CollectionAfterDeleteHook,
  ],
})
