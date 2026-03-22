import { Worker, Queue } from 'bullmq'
import { connection } from '../connection'
import { QUEUE_NAMES } from '../queues'

const CITY_BOUNDS: Record<string, { north: number; south: number; east: number; west: number }> = {
  kingston: { north: 44.28, south: 44.2, east: -76.42, west: -76.56 },
  ottawa: { north: 45.5, south: 45.35, east: -75.6, west: -75.8 },
  montreal: { north: 45.58, south: 45.44, east: -73.48, west: -73.66 },
  toronto: { north: 43.8555, south: 43.581, east: -79.1168, west: -79.6393 },
  vancouver: { north: 49.317, south: 49.199, east: -123.0234, west: -123.2247 },
}

const CATEGORIES = [
  'restaurant', 'bar', 'nightclub', 'cafe', 'bakery',
  'shopping', 'attraction', 'activity', 'service',
]

const SCRAPER_URL = process.env.SCRAPER_URL || 'http://fyi-scraper:8001'

export interface ScrapeJobData {
  cityId: string
  category: string
  mode: 'full' | 'delta'
}

export interface ExtractJobData {
  cityId: string
  category: string
  businesses: Array<{
    name: string
    address?: string
    phone?: string
    website?: string
    rating?: number
    review_count?: number
    category?: string
    google_place_id?: string
    latitude?: number
    longitude?: number
    description?: string
    hours?: Record<string, unknown>
    photos?: string[]
  }>
}

const enrichmentQueue = new Queue(QUEUE_NAMES.ENRICHMENT, { connection })

/** Orchestrator: triggers scraping for a city+category, then enqueues enrichment */
export const scrapingWorker = new Worker(
  QUEUE_NAMES.SCRAPING,
  async (job) => {
    const { cityId, category } = job.data as ScrapeJobData
    const bounds = CITY_BOUNDS[cityId]

    if (!bounds) {
      throw new Error(`Unknown city: ${cityId}`)
    }

    console.log(`[Scraping] Starting ${cityId}/${category}...`)

    // Call the Python scraper service
    const response = await fetch(`${SCRAPER_URL}/scrape/businesses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        city_id: cityId,
        category,
        bounds,
        max_results: 200,
      }),
    })

    if (!response.ok) {
      throw new Error(`Scraper returned ${response.status}: ${await response.text()}`)
    }

    const result = await response.json()
    console.log(`[Scraping] ${cityId}/${category}: found ${result.total_found} businesses, ${result.errors.length} errors`)

    if (result.businesses.length > 0) {
      // Enqueue enrichment job with the scraped data
      await enrichmentQueue.add('enrich', {
        cityId,
        category,
        businesses: result.businesses,
      } as ExtractJobData)
    }

    return {
      cityId,
      category,
      found: result.total_found,
      errors: result.errors.length,
    }
  },
  { connection, concurrency: 2 }
)

/** Schedule full scrapes for all cities and categories */
export async function scheduleFullScrape() {
  const scrapingQueue = new Queue(QUEUE_NAMES.SCRAPING, { connection })

  for (const cityId of Object.keys(CITY_BOUNDS)) {
    for (const category of CATEGORIES) {
      await scrapingQueue.add(
        `scrape-${cityId}-${category}`,
        { cityId, category, mode: 'full' } as ScrapeJobData,
        {
          jobId: `full-${cityId}-${category}-${Date.now()}`,
        }
      )
    }
  }
}
