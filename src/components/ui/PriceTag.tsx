import React from 'react'

type PriceTagProps = {
  value: React.ReactNode
}

/* Price indicator (e.g. "$$", "Free", "$15"). Uses the meta row styling. */
export const PriceTag = ({ value }: PriceTagProps) => {
  return (
    <span className="meta" style={{ fontWeight: 700, color: 'var(--ink-soft)', fontSize: 14 }}>
      {value}
    </span>
  )
}
