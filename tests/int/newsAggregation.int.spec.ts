import { getPayload, type Payload } from 'payload'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import config from '@/payload.config'
import { DEFAULT_CITY_SLUG } from '@/lib/city'
import { normalizeNewsItem, isPrimary, firstSentence } from '@/lib/news/aggregation'
import { runAggregatePressReleases } from '@/jobs/aggregatePressReleases'

describe('normalizeNewsItem (FR12)', () => {
  it('cleans, slugs, and keeps source text + url; competitor detection', () => {
    const n = normalizeNewsItem({
      title: '  City Opens New Bridge  ',
      body: 'The city opened a bridge today.',
      url: 'https://city.example/pr/1',
      sourceId: 'pr-1',
    })
    expect(n!.slug).toBe('city-opens-new-bridge')
    expect(n!.sourceText).toBe('The city opened a bridge today.')
    expect(n!.dedupKey).toBe('pr-1')
    expect(isPrimary({ title: 'x' })).toBe(true)
    expect(isPrimary({ title: 'x', kind: 'competitor' })).toBe(false)
  })

  it('firstSentence extracts the lead sentence', () => {
    expect(firstSentence('Council voted 9-2. The rest follows.')).toBe('Council voted 9-2.')
  })
})

describe('runAggregatePressReleases — live (FR12, NFR4/NFR5)', () => {
  let payload: Payload
  let cityId: string
  const slug = 'agg-news-test-bridge'

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    const { docs } = await payload.find({ collection: 'cities', where: { slug: { equals: DEFAULT_CITY_SLUG } }, limit: 1, overrideAccess: true })
    cityId = String(docs[0].id)
  })

  afterAll(async () => {
    const { docs } = await payload.find({ collection: 'articles', where: { slug: { equals: slug } }, limit: 1, overrideAccess: true })
    if (docs[0]) await payload.delete({ collection: 'articles', id: String(docs[0].id), overrideAccess: true })
  })

  it('drafts primary items, records the source, and never republishes competitors', async () => {
    const res = await runAggregatePressReleases(payload, {
      items: [
        {
          title: 'Agg News Test Bridge',
          body: 'The municipality announced the completion of a new pedestrian bridge connecting two neighbourhoods.',
          url: 'https://city.example/pr/bridge',
          kind: 'primary',
        },
        { title: 'Rival Outlet Scoop', body: 'Full competitor article text.', kind: 'competitor' },
      ],
    })
    expect(res.configured).toBe(true)
    expect(res.created).toBe(1)
    expect(res.signalOnly).toBe(1) // competitor never republished (NFR5)

    const { docs } = await payload.find({ collection: 'articles', where: { slug: { equals: slug } }, limit: 1, depth: 0, overrideAccess: true })
    expect(docs[0].status).toBe('draft') // never auto-published (NFR4)
    expect(docs[0].sourceUrl).toBe('https://city.example/pr/bridge')
    expect(docs[0].provenance?.source).toBe('seeded')
  })

  it('is a graceful no-op with nothing to ingest', async () => {
    const res = await runAggregatePressReleases(payload, {})
    expect(res.configured).toBe(false)
  })
})
