import Link from 'next/link'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import { getActiveCity } from '@/lib/city'
import { PUBLIC_STATUSES } from '@/fields/statusField'
import { BusinessCard, type BusinessCardItem } from '@/components/directory/BusinessCard'
import { DirFilters } from '@/components/directory/DirFilters'
import { SortSelect } from '@/components/directory/SortSelect'
import { Icon } from '@/components/ui'
import {
  buildCategoryTree,
  matchesBusiness,
  parseFilters,
  serializeFilters,
  type DirectoryBusiness,
  type RawSearchParams,
} from '@/lib/directory/filters'
import { sortBusinesses } from '@/lib/directory/sort'

export const metadata: Metadata = {
  title: 'Business Directory',
  description: 'Browse, filter and map every local business in Kingston, Ontario.',
}

const PAGE_SIZE = 24

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}) {
  const params = await searchParams
  const filters = parseFilters(params)

  const payload = await getPayload({ config: await config })
  const city = await getActiveCity()
  if (!city) {
    return (
      <div className="kf-route kf-wrap" style={{ padding: '60px 28px' }}>
        <h1>Business Directory</h1>
        <p className="meta">No active city is configured yet.</p>
      </div>
    )
  }
  const cityId = city.id

  const [businessesRes, categoriesRes, neighbourhoodsRes] = await Promise.all([
    payload.find({
      collection: 'businesses',
      where: { and: [{ city: { equals: cityId } }, { status: { in: PUBLIC_STATUSES } }] },
      depth: 1,
      limit: 1000,
      pagination: false,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'business-categories',
      where: { city: { equals: cityId } },
      depth: 0,
      limit: 1000,
      pagination: false,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'neighbourhoods',
      where: { city: { equals: cityId } },
      depth: 0,
      limit: 1000,
      pagination: false,
      overrideAccess: true,
    }),
  ])

  const all = businessesRes.docs as unknown as (DirectoryBusiness & BusinessCardItem)[]
  const tree = buildCategoryTree(
    categoriesRes.docs as { id: string; slug?: string | null; name?: string | null; parent?: unknown }[],
  )
  const neighbourhoods = (neighbourhoodsRes.docs as { slug?: string | null; name?: string | null }[])
    .map((n) => ({ slug: n.slug ?? '', name: n.name ?? '' }))
    .filter((n) => n.slug)

  const now = new Date()
  const filtered = all.filter((b) => matchesBusiness(b, filters, now))
  const sorted = sortBusinesses(filtered, filters.sort)
  const total = sorted.length
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const page = Math.min(filters.page, pageCount)
  const pageItems = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const pageHref = (p: number) => {
    const qs = serializeFilters({ ...filters, page: p })
    return qs ? `/directory?${qs}` : '/directory'
  }

  return (
    <div className="kf-route kf-dir">
      <div className="kf-dir-body">
        <aside className="kf-dir-filters scroll-y">
          <div style={{ padding: '22px 22px 40px' }}>
            <DirFilters tree={tree} neighbourhoods={neighbourhoods} />
          </div>
        </aside>

        <section className="kf-dir-list scroll-y">
          <div style={{ padding: '18px 22px 40px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
                flexWrap: 'wrap',
                gap: 10,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <h1 style={{ fontSize: 26 }}>Business Directory</h1>
                <div className="meta" style={{ marginTop: 4, fontSize: 14 }}>
                  <strong style={{ color: 'var(--ink)' }}>{total}</strong>{' '}
                  {total === 1 ? 'place' : 'places'} in {city.name ?? 'Kingston'}
                </div>
              </div>
              <SortSelect />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {pageItems.map((b) => (
                <BusinessCard key={b.id} item={b} />
              ))}
              {pageItems.length === 0 && (
                <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--ink-faint)' }}>
                  <Icon name="search" size={32} stroke={1.4} style={{ margin: '0 auto 10px' }} />
                  <p style={{ fontWeight: 600, color: 'var(--ink-soft)', fontSize: 16 }}>
                    No businesses match your filters.
                  </p>
                </div>
              )}
            </div>

            {pageCount > 1 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 16,
                  marginTop: 28,
                }}
              >
                {page > 1 ? (
                  <Link className="btn btn-ghost btn-sm" href={pageHref(page - 1)}>
                    Previous
                  </Link>
                ) : (
                  <span />
                )}
                <span className="faint" style={{ fontSize: 13.5 }}>
                  Page {page} of {pageCount}
                </span>
                {page < pageCount ? (
                  <Link className="btn btn-ghost btn-sm" href={pageHref(page + 1)}>
                    Next
                  </Link>
                ) : (
                  <span />
                )}
              </div>
            )}
          </div>
        </section>

        <section className="kf-dir-map">
          {/* Interactive MapLibre map lands in Story 2.6; this pane reserves its layout space
              (NFR2 — no CLS) until then. */}
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              background: 'var(--limestone)',
              color: 'var(--ink-faint)',
            }}
          >
            <Icon name="map" size={30} stroke={1.4} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>Map view coming soon</span>
          </div>
        </section>
      </div>
    </div>
  )
}
