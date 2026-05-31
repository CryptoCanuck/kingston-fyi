import type { ModerationStatus } from '../fields/statusField'

/**
 * Moderation invariant for all jobs/pipelines (NFR4 / FR12): automated ingestion NEVER
 * auto-publishes. Any job that writes content must derive its create payload through this
 * helper, which forces the moderation status to a non-public state.
 *
 * - LLM-summarized news, seeded directory listings, aggregated feeds → `draft`.
 * - Records that should land directly in the moderation queue → pass `'pending'`.
 *
 * Passing `'approved'` or `'published'` is a type error: jobs cannot opt into public.
 */
export type IngestStatus = Extract<ModerationStatus, 'draft' | 'pending'>

/** The status an ingest pipeline lands new records on. Never public. */
export const INGEST_DEFAULT_STATUS: IngestStatus = 'draft'

/**
 * Merge a job's record data with the enforced non-public moderation status. The status
 * is applied LAST so a pipeline cannot accidentally (or deliberately) set `published`.
 */
export const ingestDraftDefaults = <T extends Record<string, unknown>>(
  data: T,
  status: IngestStatus = INGEST_DEFAULT_STATUS,
): T & { status: IngestStatus } => ({
  ...data,
  status,
})
