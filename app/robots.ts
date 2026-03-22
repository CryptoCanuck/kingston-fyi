import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/dashboard/', '/claim/', '/api/', '/profile/'],
      },
    ],
    sitemap: 'https://kingston.fyi/sitemap.xml',
  }
}
