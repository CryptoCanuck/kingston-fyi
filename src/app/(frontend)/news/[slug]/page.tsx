import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { cache } from 'react'
import React from 'react'

import config from '@/payload.config'
import { getActiveCity } from '@/lib/city'
import { PUBLIC_STATUSES } from '@/fields/statusField'
import { buildMetadata } from '@/lib/seo/metadata'
import { buildArticleJsonLd } from '@/lib/seo/article'
import { JsonLd } from '@/lib/seo'
import { hasRichTextContent } from '@/lib/directory/quality'
import { formatEventWhen } from '@/lib/events/format'
import { Ph, CatTag, Icon, DotSep } from '@/components/ui'
import { ArticleCard, type ArticleCardItem } from '@/components/news/ArticleCard'

type Rel = { id?: string; slug?: string | null; name?: string | null } & Record<string, unknown>
const rel = (v: unknown): Rel | null => (v && typeof v === 'object' ? (v as Rel) : null)
const relList = (v: unknown): Rel[] =>
  Array.isArray(v) ? v.filter((x): x is Rel => !!x && typeof x === 'object') : []

const formatDate = (value?: string | null): string => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
}

const loadArticle = cache(async (slug: string) => {
  const payload = await getPayload({ config: await config })
  const city = await getActiveCity()
  if (!city) return null
  const { docs } = await payload.find({
    collection: 'articles',
    where: {
      and: [{ city: { equals: city.id } }, { slug: { equals: slug } }, { status: { in: PUBLIC_STATUSES } }],
    },
    depth: 2,
    limit: 1,
    overrideAccess: true,
  })
  const article = docs[0]
  if (!article) return null
  return { payload, city, article: article as unknown as Record<string, unknown> }
})

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const loaded = await loadArticle(slug)
  if (!loaded) return buildMetadata({ title: 'Article not found', noindex: true })
  const { article } = loaded
  const hero = rel(article.heroImage)
  return buildMetadata({
    title: String(article.title ?? 'Article'),
    description: (article.dek as string | null) ?? undefined,
    path: `/news/${slug}`,
    openGraph: hero?.url ? { images: [hero.url as string], type: 'article' } : { type: 'article' },
  })
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const loaded = await loadArticle(slug)
  if (!loaded) notFound()
  const { payload, city, article } = loaded

  const title = String(article.title ?? 'Article')
  const dek = (article.dek as string | null) ?? null
  const byline = (article.byline as string | null) ?? null
  const category = rel(article.category)
  const hero = rel(article.heroImage)
  const readTime = (article.readTime as number | null) ?? null
  const relatedEvents = relList(article.relatedEvents)
  const mentionedBusinesses = relList(article.mentionedBusinesses)

  const jsonLd = buildArticleJsonLd({
    title,
    path: `/news/${slug}`,
    dek,
    byline,
    publishedAt: (article.publishedAt as string | null) ?? null,
    updatedAt: (article.updatedAt as string | null) ?? null,
    imageUrls: hero?.url ? [hero.url as string] : undefined,
  })

  // "More from {category}": same category, newest, excluding this one (fallback to recent).
  const moreRes = await payload.find({
    collection: 'articles',
    where: {
      and: [
        { city: { equals: city.id } },
        { status: { in: PUBLIC_STATUSES } },
        { id: { not_equals: article.id } },
        ...(category?.id ? [{ category: { equals: category.id } }] : []),
      ],
    },
    depth: 1,
    sort: '-publishedAt',
    limit: 3,
    overrideAccess: true,
  })
  const more = moreRes.docs as unknown as ArticleCardItem[]

  const metaBits = [byline ? `By ${byline}` : null, formatDate(article.publishedAt as string | null), readTime ? `${readTime} min read` : null].filter(Boolean)

  return (
    <div className="kf-route">
      <JsonLd data={jsonLd} />

      <article className="kf-wrap" style={{ maxWidth: 1080, padding: '26px 28px 8px' }}>
        <Link
          href={category?.slug ? `/news?cat=${category.slug}` : '/news'}
          style={{ color: 'var(--ink-soft)', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 14 }}
        >
          <Icon name="chevL" size={16} /> Back to {category?.name ?? 'News'}
        </Link>

        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            {category && <CatTag catKey={category.slug ?? undefined} label={category.name ?? ''} />}
            <h1 style={{ fontSize: 46, marginTop: 18, lineHeight: 1.08 }}>{title}</h1>
            {dek && (
              <p className="muted" style={{ fontSize: 20, marginTop: 16, lineHeight: 1.45, fontFamily: 'var(--serif)', fontStyle: 'italic' }}>
                {dek}
              </p>
            )}
            <div className="meta" style={{ justifyContent: 'center', marginTop: 18, gap: 10, fontSize: 14.5 }}>
              {metaBits.map((b, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <DotSep />}
                  {b}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </article>

      {/* hero */}
      <div className="kf-wrap" style={{ maxWidth: 1080, padding: '24px 28px 0' }}>
        <div style={{ borderRadius: 'var(--r)', overflow: 'hidden' }}>
          {hero?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={hero.url as string} alt={(hero.alt as string) ?? title} style={{ width: '100%', aspectRatio: '21 / 9', objectFit: 'cover', display: 'block' }} />
          ) : (
            <Ph hue="ph-b" ratio={21 / 9} icon="grid" rounded />
          )}
        </div>
      </div>

      {/* body + related rail */}
      <div className="kf-wrap" style={{ maxWidth: 1080, padding: '30px 28px 8px' }}>
        <div className="kf-article-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 48, alignItems: 'start' }}>
          <div style={{ maxWidth: 720 }}>
            {hasRichTextContent(article.body) ? (
              <div className="kf-prose kf-article-body">
                <RichText data={article.body as never} />
              </div>
            ) : (
              <p className="meta" style={{ fontSize: 16 }}>This story has no body yet.</p>
            )}
          </div>

          <aside className="kf-related" style={{ display: 'flex', flexDirection: 'column', gap: 22, position: 'sticky', top: 84 }}>
            {relatedEvents.length > 0 && (
              <div className="card" style={{ padding: '18px 18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Icon name="calendar" size={17} style={{ color: 'var(--accent-strong)' }} />
                  <h3 style={{ fontSize: 17 }}>Related Events</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {relatedEvents.map((e) => {
                    const when = formatEventWhen(e.startsAt as string, e as { displayDate?: string | null; displayTime?: string | null })
                    return (
                      <Link key={e.id} href={`/events/${e.slug ?? e.id}`} className="kf-cross" style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px', borderRadius: 'var(--r-sm)', color: 'var(--ink)' }}>
                        <div style={{ width: 46, flexShrink: 0, textAlign: 'center' }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-strong)', textTransform: 'uppercase' }}>{when.weekday}</div>
                          <div style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 700, lineHeight: 1 }}>{when.day}</div>
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 14.5, lineHeight: 1.2 }}>{String(e.title ?? '')}</div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {mentionedBusinesses.length > 0 && (
              <div className="card" style={{ padding: '18px 18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Icon name="pin" size={17} style={{ color: 'var(--accent-strong)' }} />
                  <h3 style={{ fontSize: 17 }}>Mentioned Businesses</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {mentionedBusinesses.map((b) => {
                    const photos = b.photos
                    const photo = Array.isArray(photos) && photos[0] && typeof photos[0] === 'object' ? (photos[0] as { url?: string | null }) : null
                    return (
                      <Link key={b.id} href={`/business/${b.slug ?? b.id}`} className="kf-cross" style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px', borderRadius: 'var(--r-sm)', color: 'var(--ink)' }}>
                        <div style={{ width: 46, height: 46, flexShrink: 0, borderRadius: 'var(--r-sm)', overflow: 'hidden' }}>
                          {photo?.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={photo.url} alt={String(b.name ?? '')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <Ph hue="ph-a" height="100%" />
                          )}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 14.5, lineHeight: 1.2 }}>{String(b.name ?? '')}</div>
                          {rel(b.category)?.name && (
                            <div className="meta" style={{ fontSize: 12.5, marginTop: 3 }}>{rel(b.category)?.name}</div>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            <div style={{ background: 'var(--limestone)', border: '1px solid var(--line)', borderRadius: 'var(--r)', padding: '18px 20px' }}>
              <div className="eyebrow">Stay in the loop</div>
              <p style={{ fontSize: 14.5, marginTop: 8, marginBottom: 12, color: 'var(--ink-soft)' }}>Get stories like this each morning.</p>
              <Link className="btn btn-dark btn-sm" href="/" style={{ width: '100%' }}>Subscribe free</Link>
            </div>
          </aside>
        </div>
      </div>

      {more.length > 0 && (
        <section className="kf-wrap" style={{ maxWidth: 1080, padding: '30px 28px 56px' }}>
          <div className="section-head" style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 24 }}>More from {category?.name ?? 'Kingston'}</h2>
          </div>
          <div className="kf-news-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--gap, 22px)' }}>
            {more.map((a) => (
              <ArticleCard key={a.id} item={a} variant="grid" />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
