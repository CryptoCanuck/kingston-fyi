'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

import { SORT_KEYS, SORT_LABELS } from '@/lib/directory/sort'
import { parseFilters, serializeFilters } from '@/lib/directory/filters'

/** Directory sort control (FR23). Writes ?sort to the URL; the RSC list re-sorts. */
export const SortSelect = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const filters = parseFilters(Object.fromEntries(searchParams.entries()))

  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span className="faint" style={{ fontSize: 13.5, fontWeight: 600 }}>
        Sort
      </span>
      <select
        className="select"
        style={{ width: 'auto', paddingRight: 32, fontSize: 14.5 }}
        value={filters.sort}
        onChange={(e) => {
          const qs = serializeFilters({ ...filters, sort: e.target.value as never, page: 1 })
          router.replace(qs ? `/directory?${qs}` : '/directory', { scroll: false })
        }}
      >
        {SORT_KEYS.map((k) => (
          <option key={k} value={k}>
            {SORT_LABELS[k]}
          </option>
        ))}
      </select>
    </label>
  )
}
