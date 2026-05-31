import Link from 'next/link'
import React from 'react'

import { Icon } from '@/components/ui'
import type { MonthGrid } from '@/lib/events/calendar'

export interface EventsCalendarProps {
  grid: MonthGrid
  prevHref: string
  nextHref: string
  /** Build the drill-in href for a given "YYYY-MM-DD". */
  dayHref: (dateKey: string) => string
  /** Currently selected "YYYY-MM-DD", if any. */
  selectedDay?: string | null
}

/**
 * Month-grid calendar (FR54). Server-rendered and link-driven: month nav and day drill-in are
 * real links (accessible, no client JS), event chips link straight to the detail page. On
 * ≤560px the cell event lists collapse to a count dot (handled in CSS) while the day stays a
 * tappable drill-in link.
 */
export const EventsCalendar = ({ grid, prevHref, nextHref, dayHref, selectedDay }: EventsCalendarProps) => (
  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid var(--line)',
      }}
    >
      <h2 style={{ fontSize: 22 }}>{grid.label}</h2>
      <div style={{ display: 'flex', gap: 6 }}>
        <Link className="btn btn-ghost btn-sm" href={prevHref} aria-label="Previous month" scroll={false}>
          <Icon name="chevL" size={16} />
        </Link>
        <Link className="btn btn-ghost btn-sm" href={nextHref} aria-label="Next month" scroll={false}>
          <Icon name="chevR" size={16} />
        </Link>
      </div>
    </div>

    <div className="kf-cal-grid" role="grid" aria-label={grid.label}>
      {grid.weekdays.map((d) => (
        <div key={d} className="kf-cal-dow" role="columnheader">
          {d}
        </div>
      ))}
      {grid.weeks.flat().map((cell, i) => {
        if (cell.day === null || !cell.dateKey) {
          return <div key={`pad-${i}`} className="kf-calcell kf-calcell-empty" aria-hidden="true" />
        }
        const isSelected = selectedDay === cell.dateKey
        const count = cell.events.length
        return (
          <div
            key={cell.dateKey}
            className={'kf-calcell' + (isSelected ? ' is-selected' : '')}
            role="gridcell"
          >
            <Link
              href={dayHref(cell.dateKey)}
              className="kf-cal-daynum"
              aria-label={`${grid.label.split(' ')[0]} ${cell.day}${count ? `, ${count} event${count === 1 ? '' : 's'}` : ', no events'}`}
              data-has-events={count > 0 ? 'true' : undefined}
              scroll={false}
            >
              {cell.day}
            </Link>

            <div className="kf-cal-events">
              {cell.events.slice(0, 3).map((e) => (
                <Link key={e.id} href={`/events/${e.slug ?? e.id}`} className="kf-cal-chip">
                  {e.title}
                </Link>
              ))}
              {count > 3 && <span className="faint kf-cal-more">+{count - 3} more</span>}
            </div>

            {count > 0 && (
              <Link href={dayHref(cell.dateKey)} className="kf-cal-dot" aria-hidden="true" scroll={false}>
                <span>{count}</span>
              </Link>
            )}
          </div>
        )
      })}
    </div>
  </div>
)
