import React from 'react'

import { Icon } from '@/components/ui'
import { torontoNowParts, type OpeningInterval, type Weekday } from '@/lib/openNow'

// Monday-first display order (the prototype's weekly list runs Mon→Sun).
const DISPLAY_ORDER: { key: Weekday; label: string }[] = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
]

/** "13:30" → "1:30 PM"; "11:00" → "11 AM". Returns the raw value if unparseable. */
const formatTime = (value: string): string => {
  const m = value.trim().match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return value
  const h = Number(m[1])
  const min = Number(m[2])
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return min === 0 ? `${h12} ${period}` : `${h12}:${m[2]} ${period}`
}

/**
 * Structured weekly hours card (FR27) with today highlighted in Kingston time. Days with no
 * interval read "Closed"; multiple intervals on a day join with a comma. Renders gracefully
 * (returns null) when a listing has no hours at all.
 */
export const BusinessHours = ({
  hours,
  now = new Date(),
}: {
  hours: OpeningInterval[] | null | undefined
  now?: Date
}) => {
  if (!hours || hours.length === 0) return null
  const today = torontoNowParts(now).weekday

  const byDay = (day: Weekday): string => {
    const intervals = hours.filter((h) => h.day === day)
    if (intervals.length === 0) return 'Closed'
    return intervals.map((i) => `${formatTime(i.opens)} – ${formatTime(i.closes)}`).join(', ')
  }

  return (
    <div className="card" style={{ padding: '18px 20px' }}>
      <h3 style={{ fontSize: 16, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="clock" size={16} /> Hours
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {DISPLAY_ORDER.map(({ key, label }, i) => {
          const isToday = key === today
          return (
            <div
              key={key}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '7px 0',
                fontSize: 14.5,
                borderTop: i ? '1px solid var(--line)' : 'none',
                fontWeight: isToday ? 700 : 500,
                color: isToday ? 'var(--ink)' : 'var(--ink-soft)',
              }}
            >
              <span>
                {label}
                {isToday ? ' (Today)' : ''}
              </span>
              <span>{byDay(key)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
