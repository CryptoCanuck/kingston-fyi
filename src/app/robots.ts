import type { MetadataRoute } from 'next'

import { SITE_URL } from '@/lib/seo/metadata'
import { ROBOTS_DISALLOW } from '@/lib/seo/routes'

// robots (NFR1): allow crawling of canonical content; disallow admin/API and facet/filter
// query-param URLs (thin/duplicative pages). Points crawlers at the sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [...ROBOTS_DISALLOW],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
