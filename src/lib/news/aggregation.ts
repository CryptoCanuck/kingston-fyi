// Primary-source news aggregation normalization (FR12, NFR5). Institutional press releases and
// public feeds are normalized into draftable articles; competitor outlets are a SIGNAL only and
// are never republished. Pure + deterministic — the LLM summarization happens in the job.

import { slugify } from '../../fields/slugField'

/** Source kind. Only 'primary' items become drafts; 'competitor' items are signal-only. */
export type NewsSourceKind = 'primary' | 'competitor'

export interface RawNewsItem {
  sourceId?: string | null
  title?: string | null
  /** Raw primary-source text to summarize (press release body / feed summary). */
  body?: string | null
  dek?: string | null
  url?: string | null
  publishedAt?: string | null
  /** Defaults to 'primary'. Competitor items are never republished (NFR5). */
  kind?: NewsSourceKind
}

export interface NormalizedNewsItem {
  title: string
  slug: string
  dek?: string
  sourceText?: string
  sourceUrl?: string
  publishedAt?: string
  dedupKey: string
}

const clean = (v: string | null | undefined): string | undefined => {
  const t = typeof v === 'string' ? v.trim() : ''
  return t.length > 0 ? t : undefined
}

/** First sentence of a block of text (for a fallback dek). */
export const firstSentence = (text: string): string => {
  const m = text.trim().match(/^.*?[.!?](\s|$)/)
  return (m ? m[0] : text).trim().slice(0, 240)
}

export const isPrimary = (raw: RawNewsItem): boolean => (raw.kind ?? 'primary') === 'primary'

/**
 * Normalize a raw primary-source item into a draftable article shell, or null if it lacks a
 * title. The body text is kept for the job to summarize; nothing here is published.
 */
export const normalizeNewsItem = (raw: RawNewsItem): NormalizedNewsItem | null => {
  const title = clean(raw.title)
  if (!title) return null
  const slug = slugify(title)
  if (!slug) return null
  const publishedAt = raw.publishedAt ? new Date(raw.publishedAt) : null
  const publishedIso =
    publishedAt && !Number.isNaN(publishedAt.getTime()) ? publishedAt.toISOString() : undefined

  return {
    title,
    slug,
    dek: clean(raw.dek),
    sourceText: clean(raw.body),
    sourceUrl: clean(raw.url),
    publishedAt: publishedIso,
    dedupKey: clean(raw.sourceId) ?? slug,
  }
}
