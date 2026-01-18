import {
  Client,
  PlaceDetailsRequest,
  TextSearchRequest,
  Status,
} from '@googlemaps/google-maps-services-js';
import type {
  GooglePlacesResult,
  GooglePlacesSearchResult,
  GooglePlacesDetailsResponse,
  GooglePlacesSearchResponse,
  GooglePlacesStatus,
} from '@/types/google-places';

// Google Places API configuration
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

if (!GOOGLE_MAPS_API_KEY) {
  console.warn('GOOGLE_MAPS_API_KEY not defined - Google Places API will not work');
}

// Singleton client instance
let client: Client | null = null;

/**
 * Get or create the Google Maps client instance
 */
function getClient(): Client {
  if (!client) {
    client = new Client({});
  }
  return client;
}

/**
 * Fields to request from Place Details API
 * Using field masks to optimize response size and reduce API costs
 */
const PLACE_DETAILS_FIELDS = [
  'place_id',
  'name',
  'formatted_address',
  'address_components',
  'geometry',
  'formatted_phone_number',
  'international_phone_number',
  'website',
  'url',
  'opening_hours',
  'types',
  'price_level',
  'rating',
  'user_ratings_total',
  'business_status',
  'editorial_summary',
  'photos',
];

/**
 * Error class for Google Places API errors
 */
export class GooglePlacesError extends Error {
  public status: GooglePlacesStatus;
  public isRateLimited: boolean;

  constructor(message: string, status: GooglePlacesStatus) {
    super(message);
    this.name = 'GooglePlacesError';
    this.status = status;
    this.isRateLimited = status === 'OVER_QUERY_LIMIT';
  }
}

/**
 * Map SDK status to our GooglePlacesStatus type
 */
function mapStatus(status: Status): GooglePlacesStatus {
  const statusMap: Partial<Record<Status, GooglePlacesStatus>> = {
    [Status.OK]: 'OK',
    [Status.ZERO_RESULTS]: 'ZERO_RESULTS',
    [Status.INVALID_REQUEST]: 'INVALID_REQUEST',
    [Status.OVER_QUERY_LIMIT]: 'OVER_QUERY_LIMIT',
    [Status.OVER_DAILY_LIMIT]: 'OVER_QUERY_LIMIT',
    [Status.REQUEST_DENIED]: 'REQUEST_DENIED',
    [Status.NOT_FOUND]: 'NOT_FOUND',
    [Status.UNKNOWN_ERROR]: 'UNKNOWN_ERROR',
    [Status.MAX_WAYPOINTS_EXCEEDED]: 'INVALID_REQUEST',
    [Status.MAX_ROUTE_LENGTH_EXCEEDED]: 'INVALID_REQUEST',
  };
  return statusMap[status] || 'UNKNOWN_ERROR';
}

/**
 * Fetch detailed place information from Google Places API
 *
 * @param placeId - The Google Place ID to fetch details for
 * @returns Promise containing place details response
 * @throws GooglePlacesError if the API returns an error
 */
export async function fetchPlaceDetails(
  placeId: string
): Promise<GooglePlacesDetailsResponse> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new GooglePlacesError(
      'Google Maps API key not configured',
      'REQUEST_DENIED'
    );
  }

  if (!placeId || typeof placeId !== 'string' || placeId.trim() === '') {
    throw new GooglePlacesError(
      'Invalid place ID provided',
      'INVALID_REQUEST'
    );
  }

  const googleClient = getClient();

  try {
    const request: PlaceDetailsRequest = {
      params: {
        place_id: placeId,
        key: GOOGLE_MAPS_API_KEY,
        fields: PLACE_DETAILS_FIELDS,
      },
    };

    const response = await googleClient.placeDetails(request);
    const status = mapStatus(response.data.status);

    if (status !== 'OK') {
      throw new GooglePlacesError(
        response.data.error_message || `Google Places API error: ${status}`,
        status
      );
    }

    // Transform response to our type format
    const result: GooglePlacesResult = {
      place_id: response.data.result.place_id || placeId,
      name: response.data.result.name || '',
      formatted_address: response.data.result.formatted_address || '',
      address_components: response.data.result.address_components?.map((comp) => ({
        long_name: comp.long_name,
        short_name: comp.short_name,
        types: comp.types,
      })),
      geometry: {
        location: {
          lat: response.data.result.geometry?.location?.lat || 0,
          lng: response.data.result.geometry?.location?.lng || 0,
        },
        viewport: response.data.result.geometry?.viewport
          ? {
              northeast: {
                lat: response.data.result.geometry.viewport.northeast.lat,
                lng: response.data.result.geometry.viewport.northeast.lng,
              },
              southwest: {
                lat: response.data.result.geometry.viewport.southwest.lat,
                lng: response.data.result.geometry.viewport.southwest.lng,
              },
            }
          : undefined,
      },
      formatted_phone_number: response.data.result.formatted_phone_number,
      international_phone_number: response.data.result.international_phone_number,
      website: response.data.result.website,
      url: response.data.result.url,
      opening_hours: response.data.result.opening_hours
        ? {
            open_now: response.data.result.opening_hours.open_now,
            periods: response.data.result.opening_hours.periods?.map((period) => ({
              open: {
                day: period.open?.day || 0,
                time: period.open?.time || '0000',
              },
              close: period.close
                ? {
                    day: period.close.day,
                    time: period.close.time || '0000',
                  }
                : undefined,
            })),
            weekday_text: response.data.result.opening_hours.weekday_text,
          }
        : undefined,
      types: response.data.result.types || [],
      price_level: response.data.result.price_level as 0 | 1 | 2 | 3 | 4 | undefined,
      rating: response.data.result.rating,
      user_ratings_total: response.data.result.user_ratings_total,
      business_status: response.data.result.business_status as
        | 'OPERATIONAL'
        | 'CLOSED_TEMPORARILY'
        | 'CLOSED_PERMANENTLY'
        | undefined,
      editorial_summary: response.data.result.editorial_summary
        ? {
            overview: response.data.result.editorial_summary.overview,
            language: response.data.result.editorial_summary.language,
          }
        : undefined,
      photos: response.data.result.photos?.map((photo) => ({
        photo_reference: photo.photo_reference,
        height: photo.height,
        width: photo.width,
        html_attributions: photo.html_attributions || [],
      })),
    };

    return {
      result,
      status,
      html_attributions: response.data.html_attributions,
    };
  } catch (error) {
    if (error instanceof GooglePlacesError) {
      throw error;
    }

    // Handle axios/network errors
    const axiosError = error as { response?: { data?: { status?: Status; error_message?: string } } };
    if (axiosError.response?.data?.status) {
      const status = mapStatus(axiosError.response.data.status);
      throw new GooglePlacesError(
        axiosError.response.data.error_message || `Google Places API error: ${status}`,
        status
      );
    }

    throw new GooglePlacesError(
      `Failed to fetch place details: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN_ERROR'
    );
  }
}

/**
 * Search for places using Google Places Text Search API
 *
 * @param query - The search query (e.g., "Pizza in Kingston, ON")
 * @param location - Optional location to bias results (lat, lng)
 * @param radius - Optional radius in meters to restrict results
 * @returns Promise containing search results
 * @throws GooglePlacesError if the API returns an error
 */
export async function searchPlaces(
  query: string,
  location?: { lat: number; lng: number },
  radius?: number
): Promise<GooglePlacesSearchResponse> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new GooglePlacesError(
      'Google Maps API key not configured',
      'REQUEST_DENIED'
    );
  }

  if (!query || typeof query !== 'string' || query.trim() === '') {
    throw new GooglePlacesError(
      'Search query is required',
      'INVALID_REQUEST'
    );
  }

  const googleClient = getClient();

  try {
    const request: TextSearchRequest = {
      params: {
        query: query.trim(),
        key: GOOGLE_MAPS_API_KEY,
        ...(location && {
          location: `${location.lat},${location.lng}`,
        }),
        ...(radius && { radius }),
      },
    };

    const response = await googleClient.textSearch(request);
    const status = mapStatus(response.data.status);

    // ZERO_RESULTS is not an error, just empty results
    if (status !== 'OK' && status !== 'ZERO_RESULTS') {
      throw new GooglePlacesError(
        response.data.error_message || `Google Places API error: ${status}`,
        status
      );
    }

    // Transform response to our type format
    const results: GooglePlacesSearchResult[] = (response.data.results || []).map(
      (place) => ({
        place_id: place.place_id || '',
        name: place.name || '',
        formatted_address: place.formatted_address || '',
        geometry: {
          location: {
            lat: place.geometry?.location?.lat || 0,
            lng: place.geometry?.location?.lng || 0,
          },
        },
        types: place.types || [],
        rating: place.rating,
        user_ratings_total: place.user_ratings_total,
        price_level: place.price_level as 0 | 1 | 2 | 3 | 4 | undefined,
        business_status: place.business_status as
          | 'OPERATIONAL'
          | 'CLOSED_TEMPORARILY'
          | 'CLOSED_PERMANENTLY'
          | undefined,
        opening_hours: place.opening_hours
          ? { open_now: place.opening_hours.open_now }
          : undefined,
        photos: place.photos?.map((photo) => ({
          photo_reference: photo.photo_reference,
          height: photo.height,
          width: photo.width,
          html_attributions: photo.html_attributions || [],
        })),
      })
    );

    return {
      results,
      status,
      next_page_token: response.data.next_page_token,
      html_attributions: response.data.html_attributions,
    };
  } catch (error) {
    if (error instanceof GooglePlacesError) {
      throw error;
    }

    // Handle axios/network errors
    const axiosError = error as { response?: { data?: { status?: Status; error_message?: string } } };
    if (axiosError.response?.data?.status) {
      const status = mapStatus(axiosError.response.data.status);
      throw new GooglePlacesError(
        axiosError.response.data.error_message || `Google Places API error: ${status}`,
        status
      );
    }

    throw new GooglePlacesError(
      `Failed to search places: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN_ERROR'
    );
  }
}

/**
 * Validate a Google Place ID format
 * Google Place IDs start with "ChIJ" or similar patterns
 */
export function isValidPlaceIdFormat(placeId: string): boolean {
  if (!placeId || typeof placeId !== 'string') {
    return false;
  }
  // Google Place IDs are typically 27+ characters and start with specific patterns
  return placeId.length >= 20 && /^[a-zA-Z0-9_-]+$/.test(placeId);
}

/**
 * Check if API key is configured
 */
export function isApiKeyConfigured(): boolean {
  return Boolean(GOOGLE_MAPS_API_KEY);
}
