import { MeiliSearch, Index } from 'meilisearch'

let client: MeiliSearch | null = null

export function getMeiliClient(): MeiliSearch {
  if (!client) {
    client = new MeiliSearch({
      host: process.env.MEILI_URL || 'http://localhost:7700',
      apiKey: process.env.MEILI_MASTER_KEY || '',
    })
  }
  return client
}

export function getPlacesIndex(): Index {
  return getMeiliClient().index('places')
}

export function getEventsIndex(): Index {
  return getMeiliClient().index('events')
}

export function getNewsIndex(): Index {
  return getMeiliClient().index('news')
}

export interface MeiliPlace {
  id: string
  city_id: string
  category_id: string
  slug: string
  name: string
  description: string | null
  street_address: string | null
  city: string | null
  province: string | null
  postal_code: string | null
  phone: string | null
  website: string | null
  rating: number
  review_count: number
  is_featured: boolean
  is_active: boolean
  lat: number | null
  lng: number | null
}

export interface MeiliNewsArticle {
  id: string
  city_id: string
  title: string
  summary: string | null
  source_url: string
  source_name: string
  categories: string[]
  published_at: string | null
}

export async function searchPlaces(
  query: string,
  options?: {
    cityId?: string
    categoryId?: string
    limit?: number
    offset?: number
  }
) {
  const filter: string[] = ['is_active = true']
  if (options?.cityId) filter.push(`city_id = "${options.cityId}"`)
  if (options?.categoryId) filter.push(`category_id = "${options.categoryId}"`)

  return getPlacesIndex().search<MeiliPlace>(query, {
    filter: filter.join(' AND '),
    limit: options?.limit ?? 20,
    offset: options?.offset ?? 0,
    attributesToHighlight: ['name', 'description'],
  })
}

export async function searchNews(
  query: string,
  options?: {
    cityId?: string
    category?: string
    limit?: number
    offset?: number
  }
) {
  const filter: string[] = []
  if (options?.cityId) filter.push(`city_id = "${options.cityId}"`)
  if (options?.category) filter.push(`categories = "${options.category}"`)

  return getNewsIndex().search<MeiliNewsArticle>(query, {
    filter: filter.length > 0 ? filter.join(' AND ') : undefined,
    limit: options?.limit ?? 20,
    offset: options?.offset ?? 0,
  })
}
