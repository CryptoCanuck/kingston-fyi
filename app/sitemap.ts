import { MetadataRoute } from 'next'
import { CITY_CONFIG } from '@/lib/city'

// Force dynamic generation (requires Supabase connection)
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  const CATEGORIES = [
    'restaurant', 'bar', 'nightclub', 'cafe', 'bakery',
    'shopping', 'attraction', 'activity', 'service',
  ]

  for (const [, config] of Object.entries(CITY_CONFIG)) {
    const baseUrl = `https://${config.domain}`

    // Static pages
    entries.push(
      { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
      { url: `${baseUrl}/places`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
      { url: `${baseUrl}/events`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
      { url: `${baseUrl}/news`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.8 },
    )

    // Category pages
    for (const cat of CATEGORIES) {
      entries.push({
        url: `${baseUrl}/places/${cat}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.7,
      })
    }
  }

  // Dynamic place pages would be added at runtime when Supabase is available
  // For now, the static pages provide good crawl coverage

  return entries
}
