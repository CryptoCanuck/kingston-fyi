'use client'

import { useRouter } from 'next/navigation'
import React from 'react'

import { SearchBar } from '@/components/ui'

type HeaderSearchProps = {
  compact?: boolean
  /* visually-hidden accessible label for the search region */
  label?: string
}

/* Persistent site search. Cross-pillar result wiring is deferred (Epic 6) — for now this
   navigates to /search?q=… so it never dead-ends or throws. */
export const HeaderSearch = ({ compact, label = 'Site search' }: HeaderSearchProps) => {
  const router = useRouter()
  const onSubmit = (q: string) => {
    const query = q.trim()
    if (!query) return
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }
  return (
    <div role="search" aria-label={label} style={{ flex: 1, minWidth: 0 }}>
      <SearchBar compact={compact} onSubmit={onSubmit} />
    </div>
  )
}
