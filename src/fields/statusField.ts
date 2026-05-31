import type { Field } from 'payload'

export type ModerationStatus = 'draft' | 'pending' | 'approved' | 'published'

export const MODERATION_STATUSES: ModerationStatus[] = ['draft', 'pending', 'approved', 'published']

// Statuses considered publicly visible (NFR4 / Story 1.5 AC).
export const PUBLIC_STATUSES: ModerationStatus[] = ['approved', 'published']

/**
 * Moderation status field (NFR4). Lifecycle: draft → pending → approved → published.
 * Content NEVER auto-publishes: new/ingested records default to `draft`. Public reads
 * are gated by the `published()` access helper.
 */
export const statusField = (defaultValue: ModerationStatus = 'draft'): Field => ({
  name: 'status',
  type: 'select',
  required: true,
  defaultValue,
  index: true,
  options: [
    { label: 'Draft', value: 'draft' },
    { label: 'Pending review', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Published', value: 'published' },
  ],
  admin: {
    position: 'sidebar',
    description: 'Moderation state. Public pages show approved/published only.',
  },
})
