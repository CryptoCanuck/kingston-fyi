import type { Access, Where } from 'payload'

import type { User } from '../payload-types'
import { PUBLIC_STATUSES } from '../fields/statusField'
import { isAdminUser } from './isAdmin'

/**
 * Public moderation gate (NFR4): non-staff reads see only approved/published content.
 * Admins/operators bypass so they can manage drafts and the pending queue.
 *
 * Compose with cityScoped() at the collection level — both return Where constraints
 * which Payload ANDs together.
 */
export const published = (): Access => {
  return ({ req }) => {
    if (isAdminUser(req.user as User | null | undefined)) return true
    return { status: { in: PUBLIC_STATUSES } } satisfies Where
  }
}
