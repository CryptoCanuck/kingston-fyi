import type { Payload, TaskConfig } from 'payload'

import { DEFAULT_CITY_SLUG } from '../lib/city'
import {
  normalizeNewsItem,
  isPrimary,
  firstSentence,
  type RawNewsItem,
} from '../lib/news/aggregation'
import { textToLexical } from '../lib/news/lexical'
import { getInferenceClient } from '../lib/inference'
import { ingestDraftDefaults } from './draftDefaults'

export interface AggregatePressReleasesResult {
  discovered: number
  created: number
  updated: number
  skipped: number
  /** Competitor items used as signal only — never republished (NFR5). */
  signalOnly: number
  configured: boolean
}

export interface AggregatePressReleasesOptions {
  items?: RawNewsItem[]
}

// Summarize a primary-source release into a neutral local-news brief (AR23). Graceful: falls
// back to the raw text (lightly trimmed) when inference isn't configured or errors — the result
// is always an operator-editable DRAFT, never an auto-published republish.
const summarize = async (
  payload: Payload,
  title: string,
  sourceText: string,
): Promise<string> => {
  const client = getInferenceClient()
  if (!client.configured) return sourceText
  try {
    const res = await client.complete(
      [
        {
          role: 'system',
          content:
            'You are a local-news editor. Summarize the institutional press release into a neutral 2–3 sentence brief in your own words. Plain text only, no headline.',
        },
        { role: 'user', content: `Title: ${title}\n\n${sourceText}` },
      ],
      { maxTokens: 220 },
    )
    return res.text?.trim() || sourceText
  } catch (err) {
    payload.logger.warn(`[aggregate-press-releases] inference skipped: ${(err as Error).message}`)
    return sourceText
  }
}

/**
 * Aggregate primary-source local news into the moderation queue (FR12). Each PRIMARY item is
 * normalized, summarized via lib/inference into an operator-authored DRAFT (ingestDraftDefaults
 * — never auto-published, NFR4) with its source URL + provenance recorded. COMPETITOR items are
 * treated as a signal only and never republished (NFR5). Upserts by slug; degrades to a no-op
 * when there's nothing to ingest.
 */
export const runAggregatePressReleases = async (
  payload: Payload,
  options: AggregatePressReleasesOptions = {},
): Promise<AggregatePressReleasesResult> => {
  const items = options.items ?? []
  const result: AggregatePressReleasesResult = {
    discovered: items.length,
    created: 0,
    updated: 0,
    skipped: 0,
    signalOnly: 0,
    configured: items.length > 0,
  }
  if (!result.configured) {
    payload.logger.warn('[aggregate-press-releases] no source/import provided — skipping')
    return result
  }

  const { docs: cities } = await payload.find({
    collection: 'cities',
    where: { slug: { equals: DEFAULT_CITY_SLUG } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const city = cities[0]
  if (!city) throw new Error('[aggregate-press-releases] launch city is not seeded')
  const cityId = city.id as string

  for (const raw of items) {
    // NFR5: competitor outlets inform editorial judgement but are never republished.
    if (!isPrimary(raw)) {
      result.signalOnly += 1
      continue
    }
    const norm = normalizeNewsItem(raw)
    if (!norm || !norm.sourceText) {
      result.skipped += 1
      continue
    }

    const summary = await summarize(payload, norm.title, norm.sourceText)
    const data: Record<string, unknown> = {
      title: norm.title,
      slug: norm.slug,
      dek: norm.dek ?? firstSentence(summary),
      body: textToLexical(summary),
      city: cityId,
      provenance: {
        source: 'seeded',
        refreshRequired: false,
        lastRefreshedAt: new Date().toISOString(),
      },
    }
    if (norm.publishedAt) data.publishedAt = norm.publishedAt
    if (norm.sourceUrl) data.sourceUrl = norm.sourceUrl

    const { docs: existing } = await payload.find({
      collection: 'articles',
      where: { and: [{ slug: { equals: norm.slug } }, { city: { equals: cityId } }] },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (existing[0]) {
      await payload.update({
        collection: 'articles',
        id: existing[0].id,
        data: data as never,
        depth: 0,
        overrideAccess: true,
        context: { skipReModeration: true },
      })
      result.updated += 1
    } else {
      await payload.create({
        collection: 'articles',
        data: ingestDraftDefaults(data) as never,
        depth: 0,
        overrideAccess: true,
      })
      result.created += 1
    }
  }

  payload.logger.info(
    `[aggregate-press-releases] discovered=${result.discovered} created=${result.created} updated=${result.updated} signalOnly=${result.signalOnly} skipped=${result.skipped}`,
  )
  return result
}

export const aggregatePressReleasesTask: TaskConfig<{
  input: Record<string, never>
  output: AggregatePressReleasesResult
}> = {
  slug: 'aggregate-press-releases',
  label: 'Aggregate primary-source news into the moderation queue',
  outputSchema: [
    { name: 'discovered', type: 'number' },
    { name: 'created', type: 'number' },
    { name: 'updated', type: 'number' },
    { name: 'skipped', type: 'number' },
    { name: 'signalOnly', type: 'number' },
    { name: 'configured', type: 'checkbox' },
  ],
  // No press-release source is wired yet (a known seam); a safe no-op until a source/import
  // feeds runAggregatePressReleases directly.
  handler: async ({ req }) => {
    const output = await runAggregatePressReleases(req.payload)
    return { output }
  },
}
