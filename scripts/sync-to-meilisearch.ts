/**
 * Sync all existing places and events from Supabase to Meilisearch.
 * Run: MEILI_URL=http://localhost:7700 MEILI_MASTER_KEY=xxx SUPABASE_URL=http://localhost:8000 SUPABASE_KEY=xxx npx tsx scripts/sync-to-meilisearch.ts
 */

import { MeiliSearch } from 'meilisearch'
import { createClient } from '@supabase/supabase-js'

const MEILI_URL = process.env.MEILI_URL || 'http://localhost:7700'
const MEILI_KEY = process.env.MEILI_MASTER_KEY || 'dev_master_key'
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:8000'
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''

async function main() {
  const meili = new MeiliSearch({ host: MEILI_URL, apiKey: MEILI_KEY })
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  console.log('Syncing places to Meilisearch...')

  const { data: places, error: placesErr } = await supabase
    .from('places')
    .select('id, city_id, category_id, slug, name, description, street_address, city, province, postal_code, phone, website, rating, review_count, is_featured, is_active')
    .eq('is_active', true)

  if (placesErr) {
    console.error('Failed to fetch places:', placesErr)
  } else if (places && places.length > 0) {
    const result = await meili.index('places').addDocuments(places)
    console.log(`Synced ${places.length} places. Task: ${result.taskUid}`)
  } else {
    console.log('No places to sync.')
  }

  console.log('Syncing events to Meilisearch...')

  const { data: events, error: eventsErr } = await supabase
    .from('events')
    .select('id, city_id, category_id, slug, title, description, venue_name, venue_address, start_date, status, is_active')
    .eq('is_active', true)

  if (eventsErr) {
    console.error('Failed to fetch events:', eventsErr)
  } else if (events && events.length > 0) {
    const result = await meili.index('events').addDocuments(events)
    console.log(`Synced ${events.length} events. Task: ${result.taskUid}`)
  } else {
    console.log('No events to sync.')
  }

  console.log('Syncing news articles to Meilisearch...')

  const { data: articles, error: newsErr } = await supabase
    .from('news_articles')
    .select('id, city_id, title, summary, source_url, source_name, categories, published_at')
    .eq('is_duplicate', false)

  if (newsErr) {
    console.error('Failed to fetch articles:', newsErr)
  } else if (articles && articles.length > 0) {
    const result = await meili.index('news').addDocuments(articles)
    console.log(`Synced ${articles.length} articles. Task: ${result.taskUid}`)
  } else {
    console.log('No articles to sync.')
  }

  console.log('Done!')
}

main().catch((err) => {
  console.error('Sync failed:', err)
  process.exit(1)
})
