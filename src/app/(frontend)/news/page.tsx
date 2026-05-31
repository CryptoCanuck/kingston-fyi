import Link from 'next/link'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import { getActiveCity } from '@/lib/city'
import { PUBLIC_STATUSES } from '@/fields/statusField'
import { buildMetadata } from '@/lib/seo/metadata'
import { ArticleCard, type ArticleCardItem } from '@/components/news/ArticleCard'

export const metadata: Metadata = buildMetadata({
  title: 'Local News',
  description: 'Free, no-paywall local news for Kingston, Ontario — cross-linked to the events and businesses each story mentions.',
  path: '/news',
})

type RawSearchParams = Record<string, string | string[] | undefined>

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}) {
  const params = await searchParams
  const activeCat = (Array.isArray(params.cat) ? params.cat[0] : params.cat) ?? 'all'

  const payload = await getPayload({ config: await config })
  const city = await getActiveCity()
  if (!city) {
    return (
      <div className="kf-route kf-wrap" style={{ padding: '60px 28px' }}>
        <h1>Local News</h1>
        <p className="meta">No active city is configured yet.</p>
      </div>
    )
  }

  const [articlesRes, categoriesRes] = await Promise.all([
    payload.find({
      collection: 'articles',
      where: { and: [{ city: { equals: city.id } }, { status: { in: PUBLIC_STATUSES } }] },
      depth: 1,
      limit: 500,
      pagination: false,
      sort: '-publishedAt',
      overrideAccess: true,
    }),
    payload.find({
      collection: 'news-categories',
      where: { city: { equals: city.id } },
      depth: 0,
      limit: 100,
      pagination: false,
      overrideAccess: true,
    }),
  ])

  const all = articlesRes.docs as unknown as ArticleCardItem[]
  const categories = (categoriesRes.docs as { slug?: string | null; name?: string | null }[])
    .map((c) => ({ slug: c.slug ?? '', name: c.name ?? '' }))
    .filter((c) => c.slug)

  const catSlug = (a: ArticleCardItem) =>
    a.category && typeof a.category === 'object' ? a.category.slug ?? null : null
  const list = activeCat === 'all' ? all : all.filter((a) => catSlug(a) === activeCat)
  const lead = list[0]
  const rest = list.slice(1)
  const trending = all.slice(0, 5)

  const catHref = (slug: string) => (slug === 'all' ? '/news' : `/news?cat=${slug}`)
  const tabs = [{ slug: 'all', name: 'All News' }, ...categories]

  return (
    <div className="kf-route kf-wrap" style={{ padding: '30px 28px 56px' }}>
      <div style={{ marginBottom: 8 }}>
        <div className="eyebrow">Kingston.FYI Newsroom</div>
        <h1 style={{ fontSize: 40, marginTop: 6 }}>Local News</h1>
      </div>

      <nav
        className="scroll-x"
        aria-label="News categories"
        style={{
          display: 'flex',
          gap: 9,
          overflowX: 'auto',
          padding: '16px 0 20px',
          borderBottom: '1px solid var(--line)',
          marginBottom: 26,
        }}
      >
        {tabs.map((t) => (
          <Link
            key={t.slug}
            href={catHref(t.slug)}
            className={'chip' + (activeCat === t.slug ? ' is-active' : '')}
            aria-current={activeCat === t.slug ? 'page' : undefined}
          >
            {t.name}
          </Link>
        ))}
      </nav>

      <div className="kf-news-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 40, alignItems: 'start' }}>
        <div>
          {lead ? (
            <>
              <div style={{ marginBottom: 26 }}>
                <ArticleCard item={lead} variant="feature" />
              </div>
              {rest.length > 0 && (
                <div className="kf-news-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--gap, 22px)' }}>
                  {rest.map((a) => (
                    <ArticleCard key={a.id} item={a} variant="grid" />
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="meta" style={{ fontSize: 16, padding: '40px 0' }}>No stories in this section yet.</p>
          )}
        </div>

        <aside className="kf-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 28, position: 'sticky', top: 84 }}>
          {trending.length > 0 && (
            <div className="card" style={{ padding: '20px 22px' }}>
              <div className="section-head" style={{ marginBottom: 14 }}>
                <h2 style={{ fontSize: 21 }}>Trending</h2>
              </div>
              <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column' }}>
                {trending.map((a, i) => (
                  <li
                    key={a.id}
                    style={{ display: 'flex', gap: 14, padding: '13px 0', borderTop: i === 0 ? 'none' : '1px solid var(--line)' }}
                  >
                    <span style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 700, color: 'var(--accent)', lineHeight: 1, width: 26 }}>
                      {i + 1}
                    </span>
                    <Link href={`/news/${a.slug ?? a.id}`} className="kf-cross" style={{ color: 'var(--ink)' }}>
                      <h4 style={{ fontSize: 15.5, lineHeight: 1.22 }}>{a.title}</h4>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          )}
          <div style={{ background: 'var(--limestone)', border: '1px solid var(--line)', borderRadius: 'var(--r)', padding: '18px 20px' }}>
            <div className="eyebrow">Stay in the loop</div>
            <p style={{ fontSize: 14.5, marginTop: 8, marginBottom: 12, color: 'var(--ink-soft)' }}>
              Get Kingston stories in your inbox each morning.
            </p>
            <Link className="btn btn-dark btn-sm" href="/" style={{ width: '100%' }}>
              Subscribe free
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
