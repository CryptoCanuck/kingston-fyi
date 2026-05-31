import { describe, it, expect } from 'vitest'

import { Articles } from '@/collections/Articles'
import { readingTimeMinutes, richTextWordCount } from '@/lib/news/readingTime'
import { buildArticleJsonLd } from '@/lib/seo/article'

type AnyField = { name?: string; type?: string; fields?: AnyField[]; relationTo?: string; hasMany?: boolean; required?: boolean; defaultValue?: unknown }
const namedFields = (fields: AnyField[]): Record<string, AnyField> => {
  const out: Record<string, AnyField> = {}
  for (const f of fields) {
    if (f.name) out[f.name] = f
    if (Array.isArray(f.fields)) Object.assign(out, namedFields(f.fields))
  }
  return out
}

describe('Articles collection (Story 4.1)', () => {
  const fields = namedFields(Articles.fields as AnyField[])

  it('has the full article model (FR7)', () => {
    expect(Articles.slug).toBe('articles')
    for (const name of [
      'title', 'slug', 'dek', 'body', 'byline', 'publishedAt', 'readTime',
      'category', 'heroImage', 'relatedEvents', 'mentionedBusinesses', 'provenance', 'status', 'city',
    ]) {
      expect(fields[name], `missing field: ${name}`).toBeTruthy()
    }
  })

  it('cross-links to events and businesses (FR38)', () => {
    expect(fields.relatedEvents.relationTo).toBe('events')
    expect(fields.relatedEvents.hasMany).toBe(true)
    expect(fields.mentionedBusinesses.relationTo).toBe('businesses')
  })

  it('never auto-publishes — defaults to draft (NFR4)', () => {
    expect(fields.status.defaultValue).toBe('draft')
    expect(Articles.hooks?.beforeValidate?.length).toBeGreaterThan(0)
    expect(Articles.hooks?.beforeChange?.length).toBeGreaterThanOrEqual(2)
  })
})

const richText = (text: string) => ({
  root: { children: [{ type: 'paragraph', children: [{ type: 'text', text }] }] },
})

describe('readingTime (FR7)', () => {
  it('counts words and estimates minutes', () => {
    const body = richText(Array.from({ length: 440 }, () => 'word').join(' '))
    expect(richTextWordCount(body)).toBe(440)
    expect(readingTimeMinutes(body)).toBe(2) // 440 / 220
    expect(readingTimeMinutes(richText('short note'))).toBe(1) // min 1
    expect(readingTimeMinutes(null)).toBeNull()
  })
})

describe('buildArticleJsonLd (FR11)', () => {
  it('emits a NewsArticle node', () => {
    const node = buildArticleJsonLd({
      title: 'City approves new bike lanes',
      path: '/news/bike-lanes',
      dek: 'Council voted 9-2.',
      byline: 'A. Reporter',
      publishedAt: '2026-05-30T12:00:00.000Z',
    }) as Record<string, unknown>
    expect(node['@type']).toBe('NewsArticle')
    expect(node.headline).toBe('City approves new bike lanes')
    expect((node.author as Record<string, unknown>).name).toBe('A. Reporter')
  })
})
