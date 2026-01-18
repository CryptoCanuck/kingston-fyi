// Google Places API Types
// Types for Google Places API responses used in the import system

/**
 * Google Places API location/geometry types
 */
export interface GooglePlacesLocation {
  lat: number;
  lng: number;
}

export interface GooglePlacesGeometry {
  location: GooglePlacesLocation;
  viewport?: {
    northeast: GooglePlacesLocation;
    southwest: GooglePlacesLocation;
  };
}

/**
 * Google Places API opening hours types
 */
export interface GooglePlacesPeriod {
  open: {
    day: number; // 0-6 (Sunday = 0)
    time: string; // HHMM format
  };
  close?: {
    day: number;
    time: string;
  };
}

export interface GooglePlacesOpeningHours {
  open_now?: boolean;
  periods?: GooglePlacesPeriod[];
  weekday_text?: string[]; // e.g., ["Monday: 9:00 AM – 5:00 PM", ...]
}

/**
 * Google Places API address component types
 */
export interface GooglePlacesAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

/**
 * Google Places API photo reference types
 */
export interface GooglePlacesPhoto {
  photo_reference: string;
  height: number;
  width: number;
  html_attributions: string[];
}

/**
 * Google Places API review types
 */
export interface GooglePlacesReview {
  author_name: string;
  author_url?: string;
  language: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

/**
 * Business status from Google Places API
 */
export type GooglePlacesBusinessStatus =
  | 'OPERATIONAL'
  | 'CLOSED_TEMPORARILY'
  | 'CLOSED_PERMANENTLY';

/**
 * Price level from Google Places API (0-4)
 * 0: Free
 * 1: Inexpensive ($)
 * 2: Moderate ($$)
 * 3: Expensive ($$$)
 * 4: Very Expensive ($$$$)
 */
export type GooglePlacesPriceLevel = 0 | 1 | 2 | 3 | 4;

/**
 * Main Google Places API Place Details response
 * Represents the place object returned from Place Details API
 */
export interface GooglePlacesResult {
  place_id: string;
  name: string;
  formatted_address: string;
  address_components?: GooglePlacesAddressComponent[];
  geometry: GooglePlacesGeometry;
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  url?: string; // Google Maps URL
  opening_hours?: GooglePlacesOpeningHours;
  types: string[];
  price_level?: GooglePlacesPriceLevel;
  rating?: number;
  user_ratings_total?: number;
  business_status?: GooglePlacesBusinessStatus;
  photos?: GooglePlacesPhoto[];
  reviews?: GooglePlacesReview[];
  vicinity?: string;
  utc_offset?: number;
  editorial_summary?: {
    overview?: string;
    language?: string;
  };
}

/**
 * Google Places API Place Details Response wrapper
 */
export interface GooglePlacesDetailsResponse {
  result: GooglePlacesResult;
  status: GooglePlacesStatus;
  error_message?: string;
  info_messages?: string[];
  html_attributions?: string[];
}

/**
 * Google Places API Text Search / Nearby Search result
 * Subset of fields returned in search results
 */
export interface GooglePlacesSearchResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: GooglePlacesGeometry;
  types: string[];
  rating?: number;
  user_ratings_total?: number;
  price_level?: GooglePlacesPriceLevel;
  business_status?: GooglePlacesBusinessStatus;
  opening_hours?: {
    open_now?: boolean;
  };
  photos?: GooglePlacesPhoto[];
}

/**
 * Google Places API Text Search Response wrapper
 */
export interface GooglePlacesSearchResponse {
  results: GooglePlacesSearchResult[];
  status: GooglePlacesStatus;
  error_message?: string;
  info_messages?: string[];
  next_page_token?: string;
  html_attributions?: string[];
}

/**
 * Google Places API status codes
 */
export type GooglePlacesStatus =
  | 'OK'
  | 'ZERO_RESULTS'
  | 'INVALID_REQUEST'
  | 'OVER_QUERY_LIMIT'
  | 'REQUEST_DENIED'
  | 'NOT_FOUND'
  | 'UNKNOWN_ERROR';

/**
 * Common Google Place types used for categorization
 * Reference: https://developers.google.com/maps/documentation/places/web-service/supported_types
 */
export type GooglePlaceType =
  // Food & Drink
  | 'restaurant'
  | 'cafe'
  | 'bar'
  | 'bakery'
  | 'meal_delivery'
  | 'meal_takeaway'
  | 'food'
  // Nightlife
  | 'night_club'
  // Shopping
  | 'store'
  | 'shopping_mall'
  | 'clothing_store'
  | 'book_store'
  | 'electronics_store'
  | 'furniture_store'
  | 'hardware_store'
  | 'home_goods_store'
  | 'jewelry_store'
  | 'shoe_store'
  | 'supermarket'
  | 'convenience_store'
  | 'liquor_store'
  // Attractions
  | 'tourist_attraction'
  | 'museum'
  | 'art_gallery'
  | 'park'
  | 'amusement_park'
  | 'zoo'
  | 'aquarium'
  // Activities
  | 'gym'
  | 'bowling_alley'
  | 'movie_theater'
  | 'spa'
  | 'stadium'
  // Services
  | 'bank'
  | 'atm'
  | 'post_office'
  | 'hospital'
  | 'pharmacy'
  | 'doctor'
  | 'dentist'
  | 'lawyer'
  | 'real_estate_agency'
  | 'insurance_agency'
  | 'accounting'
  | 'car_dealer'
  | 'car_rental'
  | 'car_repair'
  | 'car_wash'
  | 'gas_station'
  | 'parking'
  | 'lodging'
  | 'travel_agency'
  // General
  | 'establishment'
  | 'point_of_interest'
  | 'locality'
  | 'political'
  | string; // Allow additional types not in this list

/**
 * Request types for the import API
 */
export interface GooglePlacesImportRequest {
  placeId: string;
}

/**
 * Search query parameters for Google Places search
 */
export interface GooglePlacesSearchParams {
  query: string;
  location?: {
    lat: number;
    lng: number;
  };
  radius?: number; // in meters
}

/**
 * Simplified search result for API response
 */
export interface GooglePlacesSearchResultSimplified {
  placeId: string;
  name: string;
  address: string;
  types: string[];
  rating?: number;
  businessStatus?: GooglePlacesBusinessStatus;
}

/**
 * Import result response
 */
export interface GooglePlacesImportResult {
  success: boolean;
  place?: import('./models').Place;
  imported: boolean;
  message?: string;
  error?: string;
}

/**
 * Search result response
 */
export interface GooglePlacesSearchApiResponse {
  results: GooglePlacesSearchResultSimplified[];
  error?: string;
}
