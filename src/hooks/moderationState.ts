import type { CollectionBeforeChangeHook } from 'payload'

import type { ModerationStatus } from '../fields/statusField'

/**
 * Edit re-moderation scaffold (FR59): when already-published content is edited by a
 * non-staff user, transition it back to `pending` so the live version is unaffected
 * until a moderator re-approves. Staff edits keep their chosen status.
 *
 * Wire as a `beforeChange` hook on moderated content collections. The full owner-edit
 * snapshot/diff behaviour is completed in Epic 5 (Story 5.6); this is the primitive.
 */
export const reModerateOnEdit = (): CollectionBeforeChangeHook => {
  return ({ data, originalDoc, operation, req }) => {
    if (operation !== 'update' || !originalDoc) return data

    const isStaff = Boolean(req.user) // refined to role-based in Epic 5
    const wasPublic = (['approved', 'published'] as ModerationStatus[]).includes(
      originalDoc.status as ModerationStatus,
    )

    if (wasPublic && !isStaff) {
      return { ...data, status: 'pending' satisfies ModerationStatus }
    }
    return data
  }
}
