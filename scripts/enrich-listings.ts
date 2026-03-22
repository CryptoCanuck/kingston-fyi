/**
 * Enrich existing listings by scraping their websites for additional data.
 * Extracts: images, OpenGraph data, social media links, hours, descriptions.
 *
 * Run: npx tsx scripts/enrich-listings.ts
 */

import { createClient } from '@supabase/supabase-js'
import { MeiliSearch } from 'meilisearch'
import * as cheerio from 'cheerio'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:8000'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const MEILI_URL = process.env.MEILI_URL || 'http://localhost:7700'
const MEILI_KEY = process.env.MEILI_MASTER_KEY || ''

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

interface EnrichmentData {
  images: string[]
  og_image: string | null
  og_description: string | null
  social_media: Record<string, string>
  hours_text: string | null
  email: string | null
  phone: string | null
  extra_description: string | null
  features: string[]
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: controller.signal,
      redirect: 'follow',
    })

    clearTimeout(timeout)

    if (!res.ok) return null
    return await res.text()
  } catch (err) {
    return null
  }
}

function extractFromWebsite(html: string, url: string): EnrichmentData {
  const $ = cheerio.load(html)
  const result: EnrichmentData = {
    images: [],
    og_image: null,
    og_description: null,
    social_media: {},
    hours_text: null,
    email: null,
    phone: null,
    extra_description: null,
    features: [],
  }

  // OpenGraph data
  result.og_image = $('meta[property="og:image"]').attr('content') ||
    $('meta[name="twitter:image"]').attr('content') || null
  result.og_description = $('meta[property="og:description"]').attr('content') ||
    $('meta[name="description"]').attr('content') || null

  // Collect images - look for high-quality ones
  const imageUrls = new Set<string>()

  // OG image first (usually the best)
  if (result.og_image) {
    imageUrls.add(resolveUrl(result.og_image, url))
  }

  // Hero/banner images
  $('img[src]').each((_, el) => {
    const src = $(el).attr('src')
    const alt = $(el).attr('alt') || ''
    const width = parseInt($(el).attr('width') || '0', 10)
    const naturalWidth = parseInt($(el).attr('data-width') || '0', 10)

    if (!src) return
    // Skip tiny images, icons, tracking pixels
    if (src.includes('pixel') || src.includes('spacer') || src.includes('tracking')) return
    if (src.includes('.svg') || src.includes('favicon')) return
    if (width > 0 && width < 100) return

    const resolved = resolveUrl(src, url)
    if (resolved && !resolved.includes('data:image')) {
      imageUrls.add(resolved)
    }
  })

  // Also check CSS background images in style attributes
  $('[style*="background-image"]').each((_, el) => {
    const style = $(el).attr('style') || ''
    const match = style.match(/url\(['"]?([^'")\s]+)['"]?\)/)
    if (match) {
      imageUrls.add(resolveUrl(match[1], url))
    }
  })

  result.images = Array.from(imageUrls).slice(0, 10)

  // Social media links
  const socialPatterns: Record<string, RegExp> = {
    facebook: /facebook\.com\/[^"'\s)]+/i,
    instagram: /instagram\.com\/[^"'\s)]+/i,
    twitter: /(?:twitter|x)\.com\/[^"'\s)]+/i,
    tiktok: /tiktok\.com\/@[^"'\s)]+/i,
    youtube: /youtube\.com\/(?:channel|c|@)[^"'\s)]+/i,
    linkedin: /linkedin\.com\/(?:company|in)\/[^"'\s)]+/i,
    tripadvisor: /tripadvisor\.com\/[^"'\s)]+/i,
    yelp: /yelp\.com\/biz\/[^"'\s)]+/i,
  }

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || ''
    for (const [platform, pattern] of Object.entries(socialPatterns)) {
      if (pattern.test(href) && !result.social_media[platform]) {
        const match = href.match(pattern)
        if (match) {
          result.social_media[platform] = 'https://' + match[0].replace(/\/+$/, '')
        }
      }
    }
  })

  // Email addresses
  const emailMatch = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g)
  if (emailMatch) {
    // Filter out common non-contact emails
    const contactEmail = emailMatch.find(e =>
      !e.includes('example.com') &&
      !e.includes('sentry') &&
      !e.includes('webpack') &&
      !e.includes('wixpress') &&
      !e.includes('schema.org')
    )
    if (contactEmail) result.email = contactEmail
  }

  // Phone numbers
  $('a[href^="tel:"]').each((_, el) => {
    if (!result.phone) {
      result.phone = $(el).attr('href')?.replace('tel:', '').trim() || null
    }
  })

  if (!result.phone) {
    // Try to find phone in text
    const phoneMatch = html.match(/(?:\+1[- ]?)?\(?[0-9]{3}\)?[- ][0-9]{3}[- ][0-9]{4}/g)
    if (phoneMatch) {
      result.phone = phoneMatch[0]
    }
  }

  // Hours - look for common patterns
  const hoursSelectors = [
    '.hours', '.opening-hours', '.business-hours', '[class*="hours"]',
    '#hours', '[data-hours]', '.schedule', '.open-hours',
  ]
  for (const sel of hoursSelectors) {
    const hoursEl = $(sel)
    if (hoursEl.length) {
      result.hours_text = hoursEl.text().replace(/\s+/g, ' ').trim().substring(0, 500)
      break
    }
  }

  // Look for structured data (JSON-LD)
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || '{}')
      const items = Array.isArray(data) ? data : [data]

      for (const item of items) {
        if (item['@type'] === 'Restaurant' || item['@type'] === 'LocalBusiness' ||
            item['@type'] === 'FoodEstablishment' || item['@type'] === 'CafeOrCoffeeShop') {

          if (item.image && !result.images.length) {
            const imgs = Array.isArray(item.image) ? item.image : [item.image]
            result.images = imgs.filter((i: string) => typeof i === 'string').slice(0, 5)
          }

          if (item.telephone && !result.phone) {
            result.phone = item.telephone
          }

          if (item.email && !result.email) {
            result.email = item.email
          }

          if (item.openingHoursSpecification) {
            const specs = Array.isArray(item.openingHoursSpecification)
              ? item.openingHoursSpecification
              : [item.openingHoursSpecification]
            const hoursMap: Record<string, string> = {}
            for (const spec of specs) {
              const days = Array.isArray(spec.dayOfWeek) ? spec.dayOfWeek : [spec.dayOfWeek]
              for (const day of days) {
                const dayName = day.replace('https://schema.org/', '').replace('http://schema.org/', '')
                hoursMap[dayName.toLowerCase()] = `${spec.opens || '?'} - ${spec.closes || '?'}`
              }
            }
            if (Object.keys(hoursMap).length > 0) {
              result.hours_text = JSON.stringify(hoursMap)
            }
          }

          if (item.description && !result.extra_description) {
            result.extra_description = item.description
          }

          if (item.servesCuisine) {
            const cuisines = Array.isArray(item.servesCuisine) ? item.servesCuisine : [item.servesCuisine]
            result.features.push(...cuisines)
          }

          if (item.amenityFeature) {
            const features = Array.isArray(item.amenityFeature) ? item.amenityFeature : [item.amenityFeature]
            result.features.push(...features.map((f: { name?: string; value?: string }) =>
              typeof f === 'string' ? f : f.name || f.value || ''
            ).filter(Boolean))
          }
        }
      }
    } catch {
      // Invalid JSON-LD, skip
    }
  })

  return result
}

function resolveUrl(src: string, base: string): string {
  try {
    if (src.startsWith('//')) return 'https:' + src
    if (src.startsWith('http')) return src
    return new URL(src, base).href
  } catch {
    return src
  }
}

function parseHoursText(text: string): Record<string, unknown> | null {
  // Try JSON first (from structured data)
  try {
    const parsed = JSON.parse(text)
    if (typeof parsed === 'object') return parsed
  } catch {}

  // Try common text patterns
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const hours: Record<string, string> = {}
  const lower = text.toLowerCase()

  for (const day of days) {
    const pattern = new RegExp(`${day}[:\\s]+([0-9:apmAPM\\s–-]+(?:am|pm|AM|PM))`, 'i')
    const match = lower.match(pattern)
    if (match) {
      hours[day] = match[1].trim()
    }
  }

  return Object.keys(hours).length > 0 ? hours : null
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
  const meili = new MeiliSearch({ host: MEILI_URL, apiKey: MEILI_KEY })

  // Fetch all places that have a website
  const { data: places, error } = await supabase
    .from('places')
    .select('*')
    .eq('city_id', 'kingston')
    .eq('is_active', true)
    .order('name')

  if (error || !places) {
    console.error('Failed to fetch places:', error)
    return
  }

  console.log(`Found ${places.length} Kingston listings to enrich\n`)

  let enriched = 0
  let skipped = 0
  let failed = 0

  for (const place of places) {
    process.stdout.write(`${place.name}... `)

    if (!place.website) {
      console.log('no website, skipping')
      skipped++
      continue
    }

    const html = await fetchPage(place.website)
    if (!html) {
      console.log('fetch failed')
      failed++
      continue
    }

    const data = extractFromWebsite(html, place.website)

    // Build update object
    const updates: Record<string, unknown> = {}
    const enrichment: Record<string, unknown> = {
      ...(place.ai_enrichment || {}),
      website_scraped_at: new Date().toISOString(),
    }

    // Images
    if (data.images.length > 0) {
      const imageObjects = data.images.map((url, i) => ({
        url,
        alt: i === 0 ? place.name : `${place.name} photo ${i + 1}`,
        source: 'website',
      }))
      updates.images = imageObjects
      enrichment.images_found = data.images.length
    }

    // Social media
    if (Object.keys(data.social_media).length > 0) {
      updates.social_media = {
        ...(place.social_media || {}),
        ...data.social_media,
      }
      enrichment.social_links_found = Object.keys(data.social_media)
    }

    // Email
    if (data.email && !place.email) {
      updates.email = data.email
    }

    // Phone
    if (data.phone && !place.phone) {
      updates.phone = data.phone
    }

    // Hours
    if (data.hours_text && !place.hours) {
      const parsed = parseHoursText(data.hours_text)
      if (parsed) {
        updates.hours = parsed
      }
    }

    // Description - only if current one is short
    if (data.og_description && (!place.description || place.description.length < 100)) {
      enrichment.og_description = data.og_description
    }
    if (data.extra_description) {
      enrichment.structured_description = data.extra_description
    }

    // Features
    if (data.features.length > 0) {
      const existing = place.features || []
      const newFeatures = [...new Set([...existing, ...data.features])]
      if (newFeatures.length > existing.length) {
        updates.features = newFeatures
      }
    }

    // Store enrichment metadata
    updates.ai_enrichment = enrichment

    // Apply updates
    if (Object.keys(updates).length > 1) { // More than just ai_enrichment
      const { error: updateError } = await supabase
        .from('places')
        .update(updates)
        .eq('id', place.id)

      if (updateError) {
        console.log(`update failed: ${updateError.message}`)
        failed++
      } else {
        const parts: string[] = []
        if (updates.images) parts.push(`${(updates.images as unknown[]).length} images`)
        if (updates.social_media) parts.push(`${Object.keys(data.social_media).length} social`)
        if (updates.email) parts.push('email')
        if (updates.phone) parts.push('phone')
        if (updates.hours) parts.push('hours')
        if (updates.features) parts.push(`${(updates.features as string[]).length} features`)
        console.log(`enriched: ${parts.join(', ')}`)
        enriched++
      }
    } else {
      console.log('no new data found')
      skipped++
    }

    // Rate limit
    await new Promise(r => setTimeout(r, 1000))
  }

  console.log(`\n=== Enrichment Complete ===`)
  console.log(`Enriched: ${enriched}`)
  console.log(`Skipped: ${skipped}`)
  console.log(`Failed: ${failed}`)

  // Re-sync to Meilisearch with updated data
  console.log('\nRe-syncing to Meilisearch...')
  const { data: updated } = await supabase
    .from('places')
    .select('id, city_id, category_id, slug, name, description, street_address, phone, website, rating, review_count, is_featured, is_active')
    .eq('city_id', 'kingston')
    .eq('is_active', true)

  if (updated) {
    await meili.index('places').addDocuments(updated)
    console.log(`Synced ${updated.length} places to Meilisearch`)
  }
}

main().catch(console.error)
