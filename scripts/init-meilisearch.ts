/**
 * Initialize Meilisearch indexes with correct settings.
 * Run: npx tsx scripts/init-meilisearch.ts
 */

import { MeiliSearch } from 'meilisearch'

const MEILI_URL = process.env.MEILI_URL || 'http://localhost:7700'
const MEILI_KEY = process.env.MEILI_MASTER_KEY || 'dev_master_key'

async function main() {
  const client = new MeiliSearch({ host: MEILI_URL, apiKey: MEILI_KEY })

  console.log(`Connecting to Meilisearch at ${MEILI_URL}...`)
  const health = await client.health()
  console.log(`Health: ${health.status}`)

  // Places index
  console.log('Creating places index...')
  await client.createIndex('places', { primaryKey: 'id' })
  const places = client.index('places')
  await places.updateSettings({
    searchableAttributes: ['name', 'description', 'street_address', 'city'],
    filterableAttributes: ['city_id', 'category_id', 'is_active', 'is_featured', 'rating'],
    sortableAttributes: ['rating', 'review_count', 'name'],
    rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
  })
  console.log('Places index configured.')

  // Events index
  console.log('Creating events index...')
  await client.createIndex('events', { primaryKey: 'id' })
  const events = client.index('events')
  await events.updateSettings({
    searchableAttributes: ['title', 'description', 'venue_name', 'venue_address'],
    filterableAttributes: ['city_id', 'category_id', 'status', 'is_active', 'start_date'],
    sortableAttributes: ['start_date', 'title'],
    rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
  })
  console.log('Events index configured.')

  // News index
  console.log('Creating news index...')
  await client.createIndex('news', { primaryKey: 'id' })
  const news = client.index('news')
  await news.updateSettings({
    searchableAttributes: ['title', 'summary', 'source_name'],
    filterableAttributes: ['city_id', 'categories', 'source_name'],
    sortableAttributes: ['published_at', 'title'],
    rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
  })
  console.log('News index configured.')

  console.log('All indexes initialized successfully.')
}

main().catch((err) => {
  console.error('Failed to initialize Meilisearch:', err)
  process.exit(1)
})
