import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'

import { getActiveCity } from '@/lib/city'
import { SITE_URL } from '@/lib/seo/metadata'
import { STATIC_ROUTES, fetchContentSitemapEntries } from '@/lib/seo/routes'

// Sitemap (NFR1): static pillar routes + PUBLISHED, city-scoped content. Content
// collections (articles/events/businesses) don't exist yet — they register themselves
// in SITEMAP_CONTENT_COLLECTIONS as later epics land, with no change needed here.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path === '/' ? '' : path}`,
    lastModified: now,
  }))

  const city = await getActiveCity()
  if (!city) return staticEntries

  const payload = await getPayload({ config: await config })
  const contentEntries = await fetchContentSitemapEntries(payload, String(city.id), SITE_URL)

  return [
    ...staticEntries,
    ...contentEntries.map((e) => ({ url: e.url, lastModified: e.lastModified ?? now })),
  ]
}
