import type { Field } from 'payload'

/**
 * Where a field's current value came from (AR18 / FR56). Seeding pipelines and the
 * Story 5.5 refresh enforcement read this to decide what they may overwrite:
 * - `seeded`        — generic cold-start seed data.
 * - `google-places` — Google-attributed Place fields; refresh-required, never frozen as ours.
 * - `owner-edited`  — claimed-and-edited by the business owner; OWNED, never re-seeded over.
 * - `operator`      — manually set/curated by Kingston.FYI staff; authoritative.
 */
export type ProvenanceSource = 'seeded' | 'google-places' | 'owner-edited' | 'operator'

export const PROVENANCE_SOURCES: ProvenanceSource[] = [
  'seeded',
  'google-places',
  'owner-edited',
  'operator',
]

/** Sources whose values an automated re-seed/refresh must NEVER clobber (Story 5.5). */
export const OWNER_OWNED_SOURCES: ProvenanceSource[] = ['owner-edited', 'operator']

export type ProvenanceFieldOptions = {
  /** Default record-level source for newly created docs. Defaults to `seeded`. */
  defaultSource?: ProvenanceSource
  /** Override the group field name. Defaults to `provenance`. */
  name?: string
}

/**
 * Provenance / lockedFields scaffold (AR18, FR56). Injects a reusable `provenance` group
 * so any collection can track where its data came from and which fields the owner now owns:
 *
 *   provenance.source          — record-level origin (one of PROVENANCE_SOURCES)
 *   provenance.lockedFields    — field paths the owner owns; re-seeding must skip these
 *   provenance.refreshRequired — true for ToS-bound sources (Google Places) re-fetched on cadence
 *   provenance.lastRefreshedAt — when the source data was last refreshed
 *
 * This is the DATA scaffold only; the enforcement hook that consults lockedFields lands in
 * Story 5.5. Reusable across collections via a single factory call.
 */
export const provenanceField = (options: ProvenanceFieldOptions = {}): Field => {
  const { defaultSource = 'seeded', name = 'provenance' } = options
  return {
    name,
    type: 'group',
    admin: {
      position: 'sidebar',
      description: 'Data provenance (FR56). Controls what re-seeding may overwrite.',
    },
    fields: [
      {
        name: 'source',
        type: 'select',
        required: true,
        defaultValue: defaultSource,
        index: true,
        options: [
          { label: 'Seeded', value: 'seeded' },
          { label: 'Google Places', value: 'google-places' },
          { label: 'Owner edited', value: 'owner-edited' },
          { label: 'Operator', value: 'operator' },
        ],
        admin: { description: 'Origin of this record’s data.' },
      },
      {
        name: 'lockedFields',
        type: 'text',
        hasMany: true,
        defaultValue: [],
        admin: {
          description: 'Field paths owned by the owner. Re-seeding never overwrites these.',
        },
      },
      {
        name: 'refreshRequired',
        type: 'checkbox',
        defaultValue: false,
        admin: {
          description: 'True for ToS-bound sources (e.g. Google Places) re-fetched on cadence.',
        },
      },
      {
        name: 'lastRefreshedAt',
        type: 'date',
        admin: { description: 'When source data was last refreshed.' },
      },
    ],
  }
}
