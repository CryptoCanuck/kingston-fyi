/**
 * For each listing, visit its Google Maps page to get detailed info:
 * website, phone, hours, photos, full address.
 *
 * Uses the Scrapling service with Playwright to render Google Maps.
 *
 * Run: npx tsx scripts/scrape-details.ts
 */

import { createClient } from '@supabase/supabase-js'
import { MeiliSearch } from 'meilisearch'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:8000'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const MEILI_URL = process.env.MEILI_URL || 'http://localhost:7700'
const MEILI_KEY = process.env.MEILI_MASTER_KEY || ''
const SCRAPER_URL = process.env.SCRAPER_URL || 'http://localhost:8001'

interface MapsDetail {
  website: string | null
  phone: string | null
  address: string | null
  hours: Record<string, string> | null
  images: string[]
  rating: number | null
  review_count: number | null
}

async function getGoogleMapsDetails(businessName: string, city: string): Promise<MapsDetail> {
  const result: MapsDetail = {
    website: null, phone: null, address: null,
    hours: null, images: [], rating: null, review_count: null,
  }

  try {
    // Use the scraper's enrich endpoint but pointed at Google Maps search
    const searchQuery = encodeURIComponent(`${businessName} ${city}`)
    const mapsUrl = `https://www.google.com/maps/search/${searchQuery}`

    const res = await fetch(`${SCRAPER_URL}/enrich/website`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: mapsUrl,
        business_name: businessName,
      }),
    })

    if (!res.ok) return result
    const data = await res.json()

    // The Google Maps page will have structured data we can extract
    // Website link, phone from the page content
    if (data.phone) result.phone = data.phone
    if (data.images?.length > 0) {
      result.images = data.images.filter((url: string) => {
        const lower = url.toLowerCase()
        return lower.includes('googleusercontent') || lower.includes('gstatic')
          || (!lower.includes('logo') && !lower.includes('icon') && !lower.includes('maps'))
      })
    }

    return result
  } catch {
    return result
  }
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
  const meili = new MeiliSearch({ host: MEILI_URL, apiKey: MEILI_KEY })

  const { data: places } = await supabase
    .from('places')
    .select('*')
    .eq('city_id', 'kingston')
    .eq('is_active', true)
    .or('website.is.null,images.eq.[]')
    .order('rating', { ascending: false })
    .limit(30) // Process in batches

  if (!places || places.length === 0) {
    console.log('No listings need details')
    return
  }

  console.log(`Processing ${places.length} listings for Google Maps details\n`)

  let enriched = 0

  for (const place of places) {
    process.stdout.write(`${place.name}... `)

    const details = await getGoogleMapsDetails(place.name, 'Kingston ON')
    const updates: Record<string, unknown> = {}
    const parts: string[] = []

    if (details.website && !place.website) {
      updates.website = details.website
      parts.push('website')
    }
    if (details.phone && !place.phone) {
      updates.phone = details.phone
      parts.push('phone')
    }
    if (details.images.length > 0 && (!place.images || place.images.length === 0)) {
      updates.images = details.images.map((url: string, i: number) => ({
        url, alt: `${place.name} photo ${i + 1}`, source: 'google_maps',
      }))
      parts.push(`${details.images.length} imgs`)
    }
    if (details.hours && !place.hours) {
      updates.hours = details.hours
      parts.push('hours')
    }

    if (parts.length > 0) {
      updates.ai_enrichment = {
        ...(place.ai_enrichment || {}),
        maps_enriched_at: new Date().toISOString(),
      }
      await supabase.from('places').update(updates).eq('id', place.id)
      console.log(parts.join(', '))
      enriched++
    } else {
      console.log('no new data')
    }

    await new Promise(r => setTimeout(r, 5000))
  }

  console.log(`\nEnriched: ${enriched}/${places.length}`)

  // Sync
  const { data: all } = await supabase
    .from('places')
    .select('id, city_id, category_id, slug, name, description, street_address, phone, website, rating, review_count, is_featured, is_active')
    .eq('city_id', 'kingston')
    .eq('is_active', true)
  if (all) {
    await meili.index('places').addDocuments(all)
    console.log(`Synced ${all.length} places to Meilisearch`)
  }
}

main().catch(console.error)
