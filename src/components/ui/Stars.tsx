import React from 'react'

type StarsProps = {
  value?: number
  showNum?: boolean
  count?: number
}

/* Five-star rating with half-star support, plus optional numeric value and
   review count. Extracted from the locked prototype. */
export const Stars = ({ value = 0, showNum = true, count }: StarsProps) => {
  const full = Math.floor(value)
  const half = value - full >= 0.5
  return (
    <span className="meta" style={{ gap: 7 }}>
      <span className="stars" aria-label={`${value} stars`}>
        {[0, 1, 2, 3, 4].map((i) => {
          const on = i < full
          const isHalf = i === full && half
          return (
            <svg key={i} viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
              <defs>
                <linearGradient id={`kf-half-${i}`}>
                  <stop offset="50%" stopColor="var(--accent)" />
                  <stop offset="50%" stopColor="var(--line-strong)" />
                </linearGradient>
              </defs>
              <path
                d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 21.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"
                fill={on ? 'var(--accent)' : isHalf ? `url(#kf-half-${i})` : 'var(--line-strong)'}
              />
            </svg>
          )
        })}
      </span>
      {showNum ? <span className="rating-num">{value.toFixed(1)}</span> : null}
      {count != null ? <span className="rating-count">({count})</span> : null}
    </span>
  )
}
