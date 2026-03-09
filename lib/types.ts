// City types
export type City = 'kingston' | 'ottawa' | 'montreal'

export interface CityConfig {
  name: string
  domain: string
  tagline: string
  colors: {
    primary: string
    primaryLight: string
    gradient: string
  }
  coordinates: {
    lat: number
    lng: number
  }
  timezone: string
}

// Category
export interface Category {
  id: string
  name: string
  type: 'place' | 'event'
  icon: string
  sortOrder: number
  parentId: string | null
}

// Place
export interface Place {
  id: string
  cityId: City
  categoryId: string
  slug: string
  name: string
  description: string | null
  address: string
  addressLine2: string | null
  city: string
  province: string
  postalCode: string
  location: { lat: number; lng: number } | null
  phone: string | null
  email: string | null
  website: string | null
  hours: Record<string, string> | null
  priceRange: number | null
  rating: number | null
  reviewCount: number
  isVerified: boolean
  isFeatured: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Event
export interface Event {
  id: string
  cityId: City
  categoryId: string
  slug: string
  title: string
  description: string | null
  venueName: string | null
  venueAddress: string | null
  location: { lat: number; lng: number } | null
  startDate: string
  endDate: string | null
  isAllDay: boolean
  isRecurring: boolean
  recurrenceRule: string | null
  ticketUrl: string | null
  ticketPrice: string | null
  organizerName: string | null
  organizerEmail: string | null
  isFeatured: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Review
export interface Review {
  id: string
  placeId: string
  userId: string
  rating: number
  title: string | null
  body: string | null
  isApproved: boolean
  createdAt: string
  updatedAt: string
}

// Submission
export interface Submission {
  id: string
  cityId: City
  type: 'place' | 'event'
  status: 'pending' | 'approved' | 'rejected'
  data: Record<string, unknown>
  submittedBy: string | null
  reviewedBy: string | null
  reviewNote: string | null
  createdAt: string
  updatedAt: string
}

// Profile
export interface Profile {
  id: string
  email: string
  displayName: string | null
  avatarUrl: string | null
  role: 'user' | 'editor' | 'admin'
  cityId: City | null
  createdAt: string
  updatedAt: string
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
