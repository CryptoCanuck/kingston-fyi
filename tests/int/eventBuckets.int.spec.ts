import { describe, it, expect } from 'vitest'

import { eventBucket, bucketsForPreset } from '@/lib/events/buckets'

// Anchor "now" to a known Kingston instant: Thursday 2026-06-11, ~noon EDT (16:00Z).
const NOW = new Date('2026-06-11T16:00:00.000Z')
// Kingston-local times so bucketing is unambiguous regardless of the test runner's timezone.
const at = (iso: string) => new Date(iso)

describe('eventBucket (FR14/FR15) — anchored Thu 2026-06-11', () => {
  it('buckets today, the coming weekend, next week, this month, and later', () => {
    expect(eventBucket(at('2026-06-11T23:00:00.000Z'), NOW)).toBe('today') // Thu evening
    expect(eventBucket(at('2026-06-13T18:00:00.000Z'), NOW)).toBe('weekend') // Sat
    expect(eventBucket(at('2026-06-14T18:00:00.000Z'), NOW)).toBe('weekend') // Sun
    expect(eventBucket(at('2026-06-16T18:00:00.000Z'), NOW)).toBe('nextweek') // Tue (+5d)
    expect(eventBucket(at('2026-06-28T18:00:00.000Z'), NOW)).toBe('month') // ~17d out
    expect(eventBucket(at('2026-08-01T18:00:00.000Z'), NOW)).toBe('later') // >31d
  })

  it('flags past events so the list can drop them', () => {
    expect(eventBucket(at('2026-06-09T18:00:00.000Z'), NOW)).toBe('past')
  })

  it('treats Friday as belonging to the coming weekend window', () => {
    const friday = new Date('2026-06-12T16:00:00.000Z')
    expect(eventBucket(at('2026-06-13T18:00:00.000Z'), friday)).toBe('weekend') // Sat (+1)
  })
})

describe('bucketsForPreset', () => {
  it('maps date presets to admitted buckets', () => {
    expect(bucketsForPreset('today')).toEqual(['today'])
    expect(bucketsForPreset('weekend')).toEqual(['today', 'weekend'])
    expect(bucketsForPreset('week')).toEqual(['today', 'weekend', 'nextweek'])
    expect(bucketsForPreset('any')).toContain('later')
  })
})
