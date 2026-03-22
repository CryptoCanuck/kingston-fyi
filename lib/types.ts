// City identifier type
export type CityId = 'kingston' | 'ottawa' | 'montreal' | 'toronto' | 'vancouver'

// Frontend city configuration (not a DB table)
export interface CityConfig {
  name: string
  domain: string
  tagline: string
  colors: {
    primary: string
    primaryLight: string
    primaryDark: string
    accent: string
    gradient: string
  }
  coordinates: {
    lat: number
    lng: number
  }
  timezone: string
}

// DB table: cities
export interface City {
  id: string
  name: string
  province: string
  country: string
  timezone: string
  // center: GEOGRAPHY — handled by PostGIS functions
  bounds: Record<string, number> | null
  config: Record<string, unknown>
  is_active: boolean
  created_at: string
  updated_at: string
}

// DB table: profiles
export interface Profile {
  id: string
  city_id: string | null
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  role: 'user' | 'business_owner' | 'moderator' | 'admin'
  preferences: Record<string, unknown>
  stats: Record<string, unknown>
  created_at: string
  updated_at: string
}

// DB table: categories
export interface Category {
  id: string
  name: string
  type: 'place' | 'event'
  icon: string | null
  sort_order: number
  parent_id: string | null
  created_at: string
  updated_at: string
}

// DB table: places
export interface Place {
  id: string
  city_id: string
  category_id: string
  owner_id: string | null
  slug: string
  name: string
  description: string | null
  street_address: string | null
  city: string | null
  province: string | null
  postal_code: string | null
  country: string | null
  // location: GEOGRAPHY — handled by PostGIS functions
  phone: string | null
  email: string | null
  website: string | null
  social_media: Record<string, string>
  hours: Record<string, unknown> | null
  price_range: string | null
  subcategories: string[]
  features: string[]
  amenities: string[]
  images: Record<string, unknown>[]
  rating: number
  review_count: number
  is_verified: boolean
  is_featured: boolean
  is_active: boolean
  google_place_id: string | null
  source_metadata: Record<string, unknown>
  ai_enrichment: Record<string, unknown>
  claimed_by: string | null
  claim_status: 'unclaimed' | 'pending' | 'claimed'
  created_at: string
  updated_at: string
}

// DB table: events
export interface Event {
  id: string
  city_id: string
  category_id: string
  place_id: string | null
  organizer_id: string | null
  slug: string
  title: string
  description: string | null
  start_date: string
  end_date: string | null
  start_time: string | null
  end_time: string | null
  venue_name: string | null
  venue_address: string | null
  // venue_location: GEOGRAPHY — handled by PostGIS functions
  organizer_name: string | null
  organizer_email: string | null
  organizer_phone: string | null
  ticket_url: string | null
  ticket_price: string | null
  is_free: boolean
  images: Record<string, unknown>[]
  tags: string[]
  is_featured: boolean
  is_active: boolean
  status: 'draft' | 'published' | 'cancelled'
  created_at: string
  updated_at: string
}

// DB table: reviews
export interface Review {
  id: string
  city_id: string
  place_id: string
  user_id: string
  rating: number
  title: string | null
  content: string | null
  visit_date: string | null
  images: Record<string, unknown>[]
  helpful_count: number
  is_verified: boolean
  moderation_status: 'pending' | 'approved' | 'rejected' | 'flagged'
  sentiment_score: number | null
  moderation_metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// DB table: submissions
export interface Submission {
  id: string
  city_id: string
  type: 'place' | 'event'
  data: Record<string, unknown>
  submitter_name: string | null
  submitter_email: string | null
  submitter_id: string | null
  status: 'pending' | 'approved' | 'rejected'
  review_notes: string | null
  reviewer_id: string | null
  created_at: string
  updated_at: string
}

// DB table: news_sources
export interface NewsSource {
  id: string
  city_id: string
  name: string
  url: string
  type: 'rss' | 'scrape'
  scrape_config: Record<string, unknown>
  is_active: boolean
  last_fetched_at: string | null
  error_count: number
  last_error: string | null
  created_at: string
  updated_at: string
}

// DB table: news_articles
export interface NewsArticle {
  id: string
  city_id: string
  source_id: string
  title: string
  summary: string | null
  content: string | null
  source_url: string
  source_name: string
  categories: string[]
  thumbnail_url: string | null
  sentiment: string | null
  entities: {
    businesses?: string[]
    locations?: string[]
    people?: string[]
  }
  is_duplicate: boolean
  duplicate_of: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

// DB table: business_claims
export interface BusinessClaim {
  id: string
  place_id: string
  user_id: string
  verification_method: 'phone' | 'email' | 'document'
  verification_code: string | null
  verification_expires_at: string | null
  evidence_url: string | null
  status: 'pending' | 'verified' | 'rejected' | 'expired'
  reviewed_by: string | null
  reviewed_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// DB table: business_updates
export interface BusinessUpdate {
  id: string
  place_id: string
  user_id: string
  field_changed: string
  old_value: string | null
  new_value: string | null
  created_at: string
}

// DB table: review_responses
export interface ReviewResponse {
  id: string
  review_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
}

// DB table: notifications
export interface Notification {
  id: string
  user_id: string
  type: 'new_review' | 'claim_status' | 'news_mention' | 'admin_edit' | 'system'
  title: string
  body: string | null
  metadata: Record<string, unknown>
  is_read: boolean
  created_at: string
}

// DB table: analytics_events
export interface AnalyticsEvent {
  id: string
  city_id: string
  event_type: 'page_view' | 'search' | 'click' | 'listing_view' | 'review_submit'
  place_id: string | null
  search_query: string | null
  metadata: Record<string, unknown>
  session_id: string | null
  created_at: string
}

// API response types
export interface ApiResponse<T> {
  data: T
  meta?: Record<string, unknown>
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  error: {
    code: string
    message: string
  }
}
