import { describe, it, expect } from 'vitest'

import { buildMonthGrid, parseMonthParam, shiftMonth, monthParam } from '@/lib/events/calendar'

describe('buildMonthGrid (FR54)', () => {
  const events = [
    { id: 'a', title: 'A', startsAt: '2026-06-13T18:00:00.000Z' }, // Sat Jun 13
    { id: 'b', title: 'B', startsAt: '2026-06-13T23:00:00.000Z' }, // also Jun 13
    { id: 'c', title: 'C', startsAt: '2026-07-01T18:00:00.000Z' }, // out of month
  ]

  it('lays out June 2026 with leading padding and places events by date', () => {
    const grid = buildMonthGrid(2026, 6, events)
    expect(grid.label).toBe('June 2026')
    expect(grid.weeks.length).toBeGreaterThanOrEqual(5)
    // June 1 2026 is a Monday → one leading (Sunday) padding cell.
    expect(grid.weeks[0][0].day).toBeNull()
    expect(grid.weeks[0][1].day).toBe(1)
    // Both June-13 events land in the Jun 13 cell; the July event is excluded.
    const allCells = grid.weeks.flat()
    const jun13 = allCells.find((c) => c.day === 13)
    expect(jun13?.events.map((e) => e.id)).toEqual(['a', 'b'])
    expect(grid.eventCount).toBe(2)
    expect(allCells.filter((c) => c.day !== null)).toHaveLength(30)
  })
})

describe('month param helpers', () => {
  it('parses and shifts months, rolling the year', () => {
    expect(parseMonthParam('2026-06')).toEqual({ year: 2026, month: 6 })
    expect(parseMonthParam('garbage', new Date('2026-06-11T16:00:00.000Z'))).toEqual({ year: 2026, month: 6 })
    expect(shiftMonth(2026, 12, 1)).toEqual({ year: 2027, month: 1 })
    expect(shiftMonth(2026, 1, -1)).toEqual({ year: 2025, month: 12 })
    expect(monthParam(2026, 6)).toBe('2026-06')
  })
})
