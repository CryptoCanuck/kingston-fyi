'use client'

import React, { useState } from 'react'

import { Chip, Check, Radio, SearchBar, Switch, type Suggestion } from '@/components/ui'

const SUGGESTIONS: Suggestion[] = [
  { label: 'City Council approves waterfront plan', kind: 'News', icon: 'pin' },
  { label: 'Limestone City Blues Festival', kind: 'Event', icon: 'calendar' },
  { label: 'Pan Chancho Bakery', kind: 'Business', icon: 'globe' },
  { label: 'Kingston Penitentiary tours', kind: 'Event', icon: 'ticket' },
]

/* Client island bundling every stateful atom for the sandbox. */
export const InteractiveDemos = () => {
  const [openNow, setOpenNow] = useState(true)
  const [cats, setCats] = useState<Record<string, boolean>>({ food: true, retail: false })
  const [rating, setRating] = useState('any')
  const [chipActive, setChipActive] = useState(true)
  const [query, setQuery] = useState('')

  const toggleCat = (key: string) => setCats((c) => ({ ...c, [key]: !c[key] }))

  return (
    <div className="cb" style={{ ['--cbg' as string]: '18px' }}>
      <div style={{ maxWidth: 460 }}>
        <SearchBar value={query} onChange={setQuery} suggestions={SUGGESTIONS} />
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <Chip active={chipActive} onClick={() => setChipActive((v) => !v)}>
          Open now
        </Chip>
        <Chip
          active={chipActive}
          onClick={() => setChipActive((v) => !v)}
          onRemove={() => setChipActive(false)}
        >
          Downtown
        </Chip>
        <Chip>Inactive</Chip>
      </div>

      <Switch checked={openNow} onChange={setOpenNow} label="Open now" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        <Check checked={!!cats.food} onChange={() => toggleCat('food')} label="Food & Drink" />
        <Check checked={!!cats.retail} onChange={() => toggleCat('retail')} label="Retail" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {['any', '4.0', '4.5', '4.8'].map((r) => (
          <Radio
            key={r}
            name="min-rating"
            value={r}
            checked={rating === r}
            onChange={setRating}
            label={r === 'any' ? 'Any rating' : `${r}+`}
          />
        ))}
      </div>
    </div>
  )
}
