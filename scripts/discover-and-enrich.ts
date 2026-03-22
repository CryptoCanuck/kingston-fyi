/**
 * For listings without websites:
 * 1. Search Google to find the business website
 * 2. Enrich from that website using Scrapling
 *
 * Run: npx tsx scripts/discover-and-enrich.ts
 */

import { createClient } from '@supabase/supabase-js'
import { MeiliSearch } from 'meilisearch'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:8000'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const MEILI_URL = process.env.MEILI_URL || 'http://localhost:7700'
const MEILI_KEY = process.env.MEILI_MASTER_KEY || ''
const SCRAPER_URL = process.env.SCRAPER_URL || 'http://localhost:8001'

async function searchGoogle(name: string, city: string): Promise<{ website: string | null; error: string | null }> {
  try {
    const res = await fetch(`${SCRAPER_URL}/search/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ business_name: name, city }),
    })
    if (!res.ok) return { website: null, error: `HTTP ${res.status}` }
    const data = await res.json()
    return { website: data.website, error: data.errors?.[0] || null }
  } catch (e) {
    return { website: null, error: String(e) }
  }
}

async function enrichFromWebsite(url: string, name: string): Promise<any> {
  try {
    const res = await fetch(`${SCRAPER_URL}/enrich/website`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, business_name: name }),
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

  // Get all listings without websites OR without images
  const { data: places } = await supabase
    .from('places')
    .select('*')
    .eq('city_id', 'kingston')
    .eq('is_active', true)
    .order('rating', { ascending: false })

  if (!places) {
    console.error('No places found')
    return
  }

  const needsWork = places.filter(p =>
    !p.website ||
    !p.images || (Array.isArray(p.images) && p.images.length === 0)
  )

  console.log(`${places.length} total listings, ${needsWork.length} need enrichment\n`)

  let discovered = 0
  let enriched = 0
  let failed = 0

  for (const place of needsWork) {
    process.stdout.write(`${place.name}... `)

    let website = place.website

    // Step 1: Find website if missing
    if (!website) {
      const search = await searchGoogle(place.name, 'Kingston ON')
      if (search.website) {
        website = search.website
        // Save the discovered website
        await supabase.from('places').update({ website }).eq('id', place.id)
        process.stdout.write(`found ${website}... `)
        discovered++
      } else {
        console.log('no website found')
        failed++
        await new Promise(r => setTimeout(r, 2000))
        continue
      }
    }

    // Step 2: Enrich from website
    const data = await enrichFromWebsite(website, place.name)

    if (!data) {
      console.log('enrich failed')
      failed++
      await new Promise(r => setTimeout(r, 3000))
      continue
    }

    // Check for name mismatch
    const nameMismatch = data.errors?.find((e: string) => e.includes('Name mismatch'))
    if (nameMismatch) {
      console.log(`wrong site, clearing`)
      await supabase.from('places').update({
        website: null,
        ai_enrichment: { ...(place.ai_enrichment || {}), website_rejected: website, reason: nameMismatch },
      }).eq('id', place.id)
      failed++
      await new Promise(r => setTimeout(r, 3000))
      continue
    }

    // Apply enrichment
    const updates: Record<string, unknown> = {}
    const parts: string[] = []

    if (data.images?.length > 0) {
      const goodImages = data.images
        .filter((url: string) => {
          const lower = url.toLowerCase()
          return !lower.includes('logo') && !lower.includes('icon') && !lower.includes('favicon')
            && !lower.includes('spinner') && !lower.includes('placeholder')
        })
        .map((url: string, i: number) => ({ url, alt: `${place.name} photo ${i + 1}`, source: 'scrapling' }))
      if (goodImages.length > 0) {
        updates.images = goodImages
        parts.push(`${goodImages.length} imgs`)
      }
    }

    if (data.social_media && Object.keys(data.social_media).length > 0) {
      updates.social_media = { ...(place.social_media || {}), ...data.social_media }
      parts.push(`${Object.keys(data.social_media).length} social`)
    }

    if (data.email && !place.email) { updates.email = data.email; parts.push('email') }
    if (data.phone && !place.phone) { updates.phone = data.phone; parts.push('phone') }
    if (data.hours && !place.hours) { updates.hours = data.hours; parts.push('hours') }

    if (data.features?.length > 0) {
      const merged = [...new Set([...(place.features || []), ...data.features])]
      if (merged.length > (place.features || []).length) {
        updates.features = merged
        parts.push(`${data.features.length} features`)
      }
    }

    updates.ai_enrichment = {
      ...(place.ai_enrichment || {}),
      scrapling_enriched_at: new Date().toISOString(),
      verified_name: data.verified_name,
    }

    if (parts.length > 0) {
      await supabase.from('places').update(updates).eq('id', place.id)
      console.log(`enriched: ${parts.join(', ')}`)
      enriched++
    } else {
      console.log('no new data')
    }

    // Rate limit
    await new Promise(r => setTimeout(r, 4000))
  }

  console.log(`\n=== Complete ===`)
  console.log(`Websites discovered: ${discovered}`)
  console.log(`Enriched: ${enriched}`)
  console.log(`Failed: ${failed}`)

  // Sync
  console.log('\nSyncing to Meilisearch...')
  const { data: all } = await supabase
    .from('places')
    .select('id, city_id, category_id, slug, name, description, street_address, phone, website, rating, review_count, is_featured, is_active')
    .eq('city_id', 'kingston')
    .eq('is_active', true)
  if (all) {
    await meili.index('places').addDocuments(all)
    console.log(`Synced ${all.length} places`)
  }
}

main().catch(console.error)
