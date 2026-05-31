'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import React, { useState } from 'react'

import { Check, FilterGroup, Icon, Radio, Switch } from '@/components/ui'
import {
  EMPTY_FILTERS,
  PRICE_OPTIONS,
  RATING_OPTIONS,
  activeFilterCount,
  parseFilters,
  serializeFilters,
  type CategoryTreeBranch,
  type FilterState,
} from '@/lib/directory/filters'

export interface DirFiltersProps {
  tree: CategoryTreeBranch[]
  neighbourhoods: { slug: string; name: string }[]
}

/**
 * Directory filter panel (FR21/FR26) — visible by default on desktop. All state lives in the
 * URL: each control navigates with router.replace so the RSC list re-renders from the new
 * params (shareable, back-button-friendly). Open-Now toggle, hierarchical category checkboxes,
 * neighbourhood select, minimum-rating radios, and price chips.
 */
export const DirFilters = ({ tree, neighbourhoods }: DirFiltersProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const filters = parseFilters(Object.fromEntries(searchParams.entries()))
  const [openCats, setOpenCats] = useState<string[]>(() => tree.map((t) => t.parent.slug))

  const apply = (next: FilterState) => {
    const qs = serializeFilters(next)
    router.replace(qs ? `/directory?${qs}` : '/directory', { scroll: false })
  }
  const patch = (partial: Partial<FilterState>) => apply({ ...filters, ...partial, page: 1 })

  const toggleInArray = (list: string[], value: string): string[] =>
    list.includes(value) ? list.filter((x) => x !== value) : [...list, value]

  const count = activeFilterCount(filters)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="filter" size={17} /> Filters
        </h2>
        {count > 0 && (
          <button
            type="button"
            onClick={() => apply({ ...EMPTY_FILTERS, sort: filters.sort })}
            style={{
              background: 'none',
              border: 0,
              cursor: 'pointer',
              color: 'var(--accent-strong)',
              fontWeight: 700,
              fontSize: 13.5,
            }}
          >
            Clear ({count})
          </button>
        )}
      </div>

      <div
        style={{
          padding: '12px 14px',
          background: 'var(--limestone)',
          borderRadius: 'var(--r-sm)',
          border: '1px solid var(--line)',
        }}
      >
        <Switch
          checked={filters.openNow}
          onChange={(v) => patch({ openNow: v })}
          label={<span style={{ fontWeight: 700 }}>Open Now</span>}
        />
      </div>

      <FilterGroup label="Category">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {tree.map((branch) => {
            const isOpen = openCats.includes(branch.parent.slug)
            return (
              <div key={branch.parent.slug}>
                <button
                  type="button"
                  onClick={() =>
                    setOpenCats((o) =>
                      o.includes(branch.parent.slug)
                        ? o.filter((x) => x !== branch.parent.slug)
                        : [...o, branch.parent.slug],
                    )
                  }
                  aria-expanded={isOpen}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    background: 'none',
                    border: 0,
                    padding: '9px 0',
                    cursor: 'pointer',
                    color: 'var(--ink)',
                    fontWeight: 700,
                    fontSize: 14.5,
                  }}
                >
                  {branch.parent.name}
                  <Icon
                    name="chevD"
                    size={15}
                    style={{ transform: isOpen ? 'none' : 'rotate(-90deg)', transition: 'transform .15s' }}
                  />
                </button>
                {isOpen && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingLeft: 4, paddingBottom: 6 }}>
                    {branch.children.map((c) => (
                      <Check
                        key={c.slug}
                        label={c.name}
                        checked={filters.cats.includes(c.slug)}
                        onChange={() => patch({ cats: toggleInArray(filters.cats, c.slug) })}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </FilterGroup>

      <FilterGroup label="Neighbourhood">
        <select
          className="select"
          value={filters.hood ?? ''}
          onChange={(e) => patch({ hood: e.target.value || null })}
        >
          <option value="">All neighbourhoods</option>
          {neighbourhoods.map((h) => (
            <option key={h.slug} value={h.slug}>
              {h.name}
            </option>
          ))}
        </select>
      </FilterGroup>

      <FilterGroup label="Minimum rating">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {RATING_OPTIONS.map((r) => (
            <Radio
              key={r.value}
              name="minRating"
              value={String(r.value)}
              label={r.label}
              checked={filters.minRating === r.value}
              onChange={() => patch({ minRating: r.value })}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Price">
        <div style={{ display: 'flex', gap: 8 }}>
          {PRICE_OPTIONS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => patch({ prices: toggleInArray(filters.prices, p) })}
              className={'chip' + (filters.prices.includes(p) ? ' is-active' : '')}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              {p}
            </button>
          ))}
        </div>
      </FilterGroup>
    </div>
  )
}
