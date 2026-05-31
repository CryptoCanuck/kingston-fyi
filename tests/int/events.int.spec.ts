import { describe, it, expect } from 'vitest'

import { Events } from '@/collections/Events'

type AnyField = {
  name?: string
  type?: string
  fields?: AnyField[]
  defaultValue?: unknown
  required?: boolean
  relationTo?: string
  hasMany?: boolean
}
const namedFields = (fields: AnyField[]): Record<string, AnyField> => {
  const out: Record<string, AnyField> = {}
  for (const f of fields) {
    if (f.name) out[f.name] = f
    if (Array.isArray(f.fields)) Object.assign(out, namedFields(f.fields))
  }
  return out
}

describe('Events collection (Story 3.1)', () => {
  const fields = namedFields(Events.fields as AnyField[])

  it('has the full event data model (FR13)', () => {
    expect(Events.slug).toBe('events')
    for (const name of [
      'title',
      'slug',
      'blurb',
      'startsAt',
      'endsAt',
      'displayDate',
      'displayTime',
      'category',
      'neighbourhood',
      'isFree',
      'priceText',
      'image',
      'venue',
      'locationName',
      'address',
      'location',
      'provenance',
      'status',
      'city',
    ]) {
      expect(fields[name], `missing field: ${name}`).toBeTruthy()
    }
  })

  it('requires a title and a machine start datetime', () => {
    expect(fields.title.required).toBe(true)
    expect(fields.startsAt.required).toBe(true)
  })

  it('never auto-publishes — defaults to draft (NFR4)', () => {
    expect(fields.status.defaultValue).toBe('draft')
  })

  it('links a nullable venue to a business (FR38)', () => {
    expect(fields.venue.type).toBe('relationship')
    expect(fields.venue.relationTo).toBe('businesses')
    expect(fields.venue.hasMany).toBe(false)
    expect(fields.venue.required).toBeFalsy()
  })

  it('carries its own geospatial point for the location fallback (FR62)', () => {
    expect(fields.location.type).toBe('point')
  })

  it('wires the cross-link invariant, geocode/re-moderate, and revalidation hooks', () => {
    expect(Events.hooks?.beforeValidate?.length).toBeGreaterThan(0)
    expect(Events.hooks?.beforeChange?.length).toBeGreaterThanOrEqual(2)
    expect(Events.hooks?.afterChange?.length).toBeGreaterThan(0)
    expect(Events.hooks?.afterDelete?.length).toBeGreaterThan(0)
  })
})
