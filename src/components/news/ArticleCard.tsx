import Link from 'next/link'
import React from 'react'

import { Ph, CatTag, DotSep } from '@/components/ui'

export interface ArticleCardItem {
  id: string
  slug?: string | null
  title: string
  dek?: string | null
  byline?: string | null
  publishedAt?: string | null
  readTime?: number | null
  category?: { slug?: string | null; name?: string | null } | string | null
  heroImage?: { url?: string | null; alt?: string | null } | string | null
}

export type ArticleCardVariant = 'grid' | 'feature' | 'compact'

const cat = (item: ArticleCardItem) =>
  item.category && typeof item.category === 'object'
    ? { slug: item.category.slug ?? undefined, name: item.category.name ?? '' }
    : null

const hero = (item: ArticleCardItem) =>
  item.heroImage && typeof item.heroImage === 'object' ? item.heroImage : null

const formatDate = (value?: string | null): string => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
}

const metaLine = (item: ArticleCardItem): React.ReactNode => {
  const date = formatDate(item.publishedAt)
  const read = item.readTime ? `${item.readTime} min read` : null
  const bits = [date, read].filter(Boolean)
  return bits.map((b, i) => (
    <React.Fragment key={i}>
      {i > 0 && <DotSep />}
      {b}
    </React.Fragment>
  ))
}

const CardImage = ({ item, ratio, minHeight }: { item: ArticleCardItem; ratio?: number; minHeight?: number }) => {
  const img = hero(item)
  if (img?.url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={img.url}
        alt={img.alt ?? item.title}
        loading="lazy"
        style={{
          width: '100%',
          height: minHeight ? '100%' : undefined,
          aspectRatio: ratio ? String(ratio) : undefined,
          objectFit: 'cover',
          display: 'block',
          minHeight,
        }}
      />
    )
  }
  return <Ph hue="ph-c" ratio={ratio} height={minHeight ? '100%' : undefined} icon="grid" style={{ minHeight }} />
}

/** News article card (FR8/FR9). Server component — links to the article detail page. */
export const ArticleCard = ({ item, variant = 'grid' }: { item: ArticleCardItem; variant?: ArticleCardVariant }) => {
  const href = `/news/${item.slug ?? item.id}`
  const c = cat(item)

  if (variant === 'feature') {
    return (
      <Link href={href} className="card card-link kf-feature" style={{ display: 'block' }}>
        <CardImage item={item} ratio={16 / 9} />
        <div style={{ padding: '22px 24px 26px' }}>
          {c && <CatTag catKey={c.slug} label={c.name} />}
          <h2 style={{ fontSize: 34, marginTop: 14, lineHeight: 1.08 }}>{item.title}</h2>
          {item.dek && <p className="muted" style={{ marginTop: 12, fontSize: 17, lineHeight: 1.5 }}>{item.dek}</p>}
          <div className="meta" style={{ marginTop: 16, gap: 8 }}>
            {item.byline && (
              <>
                <span style={{ fontWeight: 600, color: 'var(--ink-soft)' }}>{item.byline}</span>
                <DotSep />
              </>
            )}
            {metaLine(item)}
          </div>
        </div>
      </Link>
    )
  }

  if (variant === 'compact') {
    return (
      <Link href={href} className="kf-cross" style={{ display: 'flex', gap: 14, padding: '13px 0', color: 'var(--ink)' }}>
        <div style={{ width: 84, height: 64, flexShrink: 0, borderRadius: 'var(--r-sm)', overflow: 'hidden' }}>
          <CardImage item={item} minHeight={64} />
        </div>
        <div style={{ minWidth: 0 }}>
          {c?.name && (
            <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--accent-strong)' }}>
              {c.name}
            </div>
          )}
          <h4 style={{ fontSize: 16, marginTop: 4, lineHeight: 1.2 }}>{item.title}</h4>
          <div className="meta" style={{ marginTop: 5, fontSize: 12.5 }}>{formatDate(item.publishedAt)}</div>
        </div>
      </Link>
    )
  }

  // grid
  return (
    <Link href={href} className="card card-link" style={{ display: 'flex', flexDirection: 'column' }}>
      <CardImage item={item} ratio={16 / 10} />
      <div style={{ padding: '16px 18px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 9 }}>
        {c && <CatTag catKey={c.slug} label={c.name} small />}
        <h3 style={{ fontSize: 20.5, lineHeight: 1.16 }}>{item.title}</h3>
        {item.dek && (
          <p
            className="muted"
            style={{
              fontSize: 14.5,
              lineHeight: 1.45,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {item.dek}
          </p>
        )}
        <div className="meta" style={{ paddingTop: 4 }}>{metaLine(item)}</div>
      </div>
    </Link>
  )
}
