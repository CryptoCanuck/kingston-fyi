'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

import { Chip } from '@/components/ui'
import {
  EMPTY_FILTERS,
  activeFilterChips,
  activeFilterCount,
  parseFilters,
  serializeFilters,
  type FilterState,
} from '@/lib/directory/filters'

export interface ActiveChipsProps {
  catLabels: Record<string, string>
  hoodLabels: Record<string, string>
}

/**
 * Active-filter chips above the results (FR26). Each chip removes just its facet; a trailing
 * "Clear (n)" resets all (keeping the chosen sort). Reads/writes the same URL state as
 * DirFilters via the shared filters lib.
 */
export const ActiveChips = ({ catLabels, hoodLabels }: ActiveChipsProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const filters = parseFilters(Object.fromEntries(searchParams.entries()))
  const chips = activeFilterChips(filters, catLabels, hoodLabels)

  if (chips.length === 0) return null

  const go = (next: FilterState) => {
    const qs = serializeFilters(next)
    router.replace(qs ? `/directory?${qs}` : '/directory', { scroll: false })
  }

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
      {chips.map((c) => (
        <Chip key={c.key} active onRemove={() => go(c.next)} onClick={() => go(c.next)}>
          {c.label}
        </Chip>
      ))}
      {chips.length > 1 && (
        <button
          type="button"
          onClick={() => go({ ...EMPTY_FILTERS, sort: filters.sort })}
          style={{
            background: 'none',
            border: 0,
            cursor: 'pointer',
            color: 'var(--accent-strong)',
            fontWeight: 700,
            fontSize: 13.5,
          }}
        >
          Clear ({activeFilterCount(filters)})
        </button>
      )}
    </div>
  )
}
