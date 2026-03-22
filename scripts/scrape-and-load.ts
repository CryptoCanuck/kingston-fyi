/**
 * Scrape businesses from Google Maps via the Scrapling service
 * and load them into Supabase + Meilisearch with dedup.
 *
 * Run: npx tsx scripts/scrape-and-load.ts
 */

import { createClient } from '@supabase/supabase-js'
import { MeiliSearch } from 'meilisearch'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:8000'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const MEILI_URL = process.env.MEILI_URL || 'http://localhost:7700'
const MEILI_KEY = process.env.MEILI_MASTER_KEY || ''
const SCRAPER_URL = process.env.SCRAPER_URL || 'http://localhost:8001'

const KINGSTON_BOUNDS = { north: 44.27, south: 44.21, east: -76.44, west: -76.52 }

const CATEGORIES_TO_SCRAPE = [
  { search: 'restaurants', category_id: 'restaurant', max: 30 },
  { search: 'cafes coffee shops', category_id: 'cafe', max: 15 },
  { search: 'bars pubs', category_id: 'bar', max: 15 },
  { search: 'shopping stores boutiques', category_id: 'shopping', max: 15 },
  { search: 'tourist attractions museums', category_id: 'attraction', max: 15 },
  { search: 'gyms fitness yoga', category_id: 'activity', max: 10 },
  { search: 'bakeries', category_id: 'bakery', max: 10 },
]

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').substring(0, 80)
}

function levenshtein(a: string, b: string): number {
  const m: number[][] = []
  for (let i = 0; i <= b.length; i++) m[i] = [i]
  for (let j = 0; j <= a.length; j++) m[0][j] = j
  for (let i = 1; i <= b.length; i++)
    for (let j = 1; j <= a.length; j++)
      m[i][j] = b[i-1] === a[j-1] ? m[i-1][j-1] : Math.min(m[i-1][j-1]+1, m[i][j-1]+1, m[i-1][j]+1)
  return m[b.length][a.length]
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
  const meili = new MeiliSearch({ host: MEILI_URL, apiKey: MEILI_KEY })

  // Get existing places for dedup
  const { data: existing } = await supabase
    .from('places')
    .select('id, name, slug, google_place_id')
    .eq('city_id', 'kingston')

  const existingNames = new Set((existing || []).map(p => p.name.toLowerCase()))
  const existingSlugs = new Set((existing || []).map(p => p.slug))
  const existingPlaceIds = new Set((existing || []).filter(p => p.google_place_id).map(p => p.google_place_id))

  console.log(`Existing: ${existingNames.size} Kingston listings\n`)

  let totalInserted = 0
  let totalSkipped = 0

  for (const cat of CATEGORIES_TO_SCRAPE) {
    console.log(`\n=== Scraping: ${cat.search} (→ ${cat.category_id}) ===`)

    let scraped: any[] = []
    try {
      const res = await fetch(`${SCRAPER_URL}/scrape/businesses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city_id: 'kingston',
          category: cat.search,
          bounds: KINGSTON_BOUNDS,
          max_results: cat.max,
        }),
      })
      const data = await res.json()
      scraped = data.businesses || []
      console.log(`Scraped ${scraped.length} results (${data.errors?.length || 0} errors)`)
    } catch (err) {
      console.error(`Scrape failed: ${err}`)
      continue
    }

    for (const biz of scraped) {
      const nameLower = biz.name.toLowerCase()
      const slug = slugify(biz.name)

      // Dedup: check exact name, slug, place_id, or fuzzy name match
      if (existingNames.has(nameLower)) {
        totalSkipped++
        continue
      }
      if (existingSlugs.has(slug)) {
        totalSkipped++
        continue
      }
      if (biz.google_place_id && existingPlaceIds.has(biz.google_place_id)) {
        totalSkipped++
        continue
      }
      // Fuzzy name check against existing
      let fuzzyMatch = false
      for (const existingName of existingNames) {
        if (levenshtein(nameLower, existingName) < 3) {
          fuzzyMatch = true
          break
        }
      }
      if (fuzzyMatch) {
        totalSkipped++
        continue
      }

      // Insert
      const placeData = {
        city_id: 'kingston',
        category_id: cat.category_id,
        slug: slug + '-' + Date.now().toString(36).slice(-4),
        name: biz.name,
        description: biz.category ? `${biz.category} in Kingston.` : null,
        street_address: biz.address || null,
        city: 'Kingston',
        province: 'ON',
        country: 'CA',
        phone: biz.phone || null,
        rating: biz.rating || 0,
        review_count: biz.review_count || 0,
        google_place_id: biz.google_place_id || null,
        is_active: true,
        is_featured: false,
        claim_status: 'unclaimed',
        source_metadata: {
          source: 'google_maps_scrapling',
          scraped_at: new Date().toISOString(),
          raw_category: biz.category,
        },
      }

      const { error } = await supabase.from('places').insert(placeData)

      if (error) {
        console.log(`  ✗ ${biz.name}: ${error.message}`)
      } else {
        console.log(`  ✓ ${biz.name} (${biz.rating || '?'}/5)`)
        existingNames.add(nameLower)
        existingSlugs.add(placeData.slug)
        totalInserted++
      }
    }

    // Rate limit between categories
    await new Promise(r => setTimeout(r, 3000))
  }

  console.log(`\n=== Summary ===`)
  console.log(`Inserted: ${totalInserted}`)
  console.log(`Skipped (duplicates): ${totalSkipped}`)

  // Sync all to Meilisearch
  console.log('\nSyncing to Meilisearch...')
  const { data: allPlaces } = await supabase
    .from('places')
    .select('id, city_id, category_id, slug, name, description, street_address, phone, website, rating, review_count, is_featured, is_active')
    .eq('city_id', 'kingston')
    .eq('is_active', true)

  if (allPlaces) {
    await meili.index('places').addDocuments(allPlaces)
    console.log(`Synced ${allPlaces.length} total places to Meilisearch`)
  }
}

main().catch(console.error)
