/**
 * Enrich listings using the Scrapling Docker service (Playwright + headless Chromium).
 * Much more reliable than basic fetch — handles JS-rendered pages, Cloudflare, WAFs.
 *
 * Run: npx tsx scripts/enrich-via-scraper.ts
 */

import { createClient } from '@supabase/supabase-js'
import { MeiliSearch } from 'meilisearch'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:8000'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const MEILI_URL = process.env.MEILI_URL || 'http://localhost:7700'
const MEILI_KEY = process.env.MEILI_MASTER_KEY || ''
const SCRAPER_URL = process.env.SCRAPER_URL || 'http://localhost:8001'

interface EnrichResult {
  images: string[]
  og_image: string | null
  og_description: string | null
  social_media: Record<string, string>
  email: string | null
  phone: string | null
  hours: Record<string, string> | null
  features: string[]
  verified_name: string | null
  errors: string[]
}

async function enrichFromWebsite(url: string, businessName: string): Promise<EnrichResult | null> {
  try {
    const res = await fetch(`${SCRAPER_URL}/enrich/website`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, business_name: businessName }),
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
  const meili = new MeiliSearch({ host: MEILI_URL, apiKey: MEILI_KEY })

  const { data: places, error } = await supabase
    .from('places')
    .select('*')
    .eq('city_id', 'kingston')
    .eq('is_active', true)
    .not('website', 'is', null)
    .order('name')

  if (error || !places) {
    console.error('Failed to fetch places:', error)
    return
  }

  console.log(`Found ${places.length} listings with websites to enrich via Scrapling\n`)

  let enriched = 0
  let failed = 0

  for (const place of places) {
    process.stdout.write(`${place.name} (${place.website})... `)

    const data = await enrichFromWebsite(place.website, place.name)

    if (!data) {
      console.log('scraper unreachable')
      failed++
      continue
    }

    if (data.errors.length > 0) {
      // Check for name mismatch
      const nameMismatch = data.errors.find((e: string) => e.includes('Name mismatch'))
      if (nameMismatch) {
        console.log(`WRONG SITE: ${nameMismatch}`)
        // Clear the bad website
        await supabase.from('places').update({
          website: null,
          images: [],
          social_media: {},
          ai_enrichment: {
            ...(place.ai_enrichment || {}),
            website_rejected: place.website,
            rejection_reason: nameMismatch,
          },
        }).eq('id', place.id)
        failed++
        continue
      }
    }

    const updates: Record<string, unknown> = {}
    const parts: string[] = []

    // Images — filter out logos/icons, keep good photos
    if (data.images.length > 0) {
      const goodImages = data.images
        .filter((url: string) => !url.toLowerCase().includes('logo') && !url.toLowerCase().includes('icon'))
        .map((url: string, i: number) => ({
          url,
          alt: i === 0 ? place.name : `${place.name} photo ${i + 1}`,
          source: 'website_scrapling',
        }))
      if (goodImages.length > 0) {
        updates.images = goodImages
        parts.push(`${goodImages.length} images`)
      }
    }

    // Social media
    if (Object.keys(data.social_media).length > 0) {
      updates.social_media = data.social_media
      parts.push(`${Object.keys(data.social_media).length} social`)
    }

    // Contact info
    if (data.email && !place.email) {
      updates.email = data.email
      parts.push('email')
    }
    if (data.phone && !place.phone) {
      updates.phone = data.phone
      parts.push('phone')
    }

    // Hours
    if (data.hours && !place.hours) {
      updates.hours = data.hours
      parts.push('hours')
    }

    // Features
    if (data.features.length > 0) {
      const existing = place.features || []
      const merged = [...new Set([...existing, ...data.features])]
      if (merged.length > existing.length) {
        updates.features = merged
        parts.push(`${data.features.length} features`)
      }
    }

    // Enrichment metadata
    updates.ai_enrichment = {
      ...(place.ai_enrichment || {}),
      scrapling_enriched_at: new Date().toISOString(),
      verified_name: data.verified_name,
      og_description: data.og_description,
    }

    if (parts.length > 0) {
      const { error: updateError } = await supabase
        .from('places')
        .update(updates)
        .eq('id', place.id)

      if (updateError) {
        console.log(`update failed: ${updateError.message}`)
        failed++
      } else {
        console.log(`enriched: ${parts.join(', ')}`)
        enriched++
      }
    } else {
      console.log('no new data')
    }

    // Rate limit — give the headless browser time
    await new Promise(r => setTimeout(r, 3000))
  }

  console.log(`\n=== Enrichment Complete ===`)
  console.log(`Enriched: ${enriched}`)
  console.log(`Failed: ${failed}`)

  // Re-sync to Meilisearch
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
