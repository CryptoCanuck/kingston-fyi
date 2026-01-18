import { NextRequest, NextResponse } from 'next/server';
import { searchPlaces, GooglePlacesError, isApiKeyConfigured } from '@/lib/google-places';
import type { GooglePlacesSearchResultSimplified, GooglePlacesSearchApiResponse } from '@/types/google-places';

/**
 * GET /api/import/google-places/search
 *
 * Search for businesses on Google Places to find place_ids for import.
 *
 * Query Parameters:
 * - query (required): Search term (e.g., "Joe's Pizza Kingston ON")
 * - location (optional): Lat,lng to bias results (e.g., "44.2312,-76.4860")
 *
 * Returns:
 * - results: Array of simplified search results with placeId, name, address, types
 */
export async function GET(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!isApiKeyConfigured()) {
      return NextResponse.json(
        {
          results: [],
          error: 'Google Maps API key not configured'
        } as GooglePlacesSearchApiResponse,
        { status: 503 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const locationParam = searchParams.get('location');

    // Validate required query parameter
    if (!query || query.trim() === '') {
      return NextResponse.json(
        {
          results: [],
          error: 'Missing required parameter: query'
        } as GooglePlacesSearchApiResponse,
        { status: 400 }
      );
    }

    // Parse optional location parameter
    let location: { lat: number; lng: number } | undefined;
    if (locationParam) {
      const parts = locationParam.split(',');
      if (parts.length === 2) {
        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);
        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          location = { lat, lng };
        } else {
          return NextResponse.json(
            {
              results: [],
              error: 'Invalid location format. Expected "lat,lng" with valid coordinates'
            } as GooglePlacesSearchApiResponse,
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          {
            results: [],
            error: 'Invalid location format. Expected "lat,lng"'
          } as GooglePlacesSearchApiResponse,
          { status: 400 }
        );
      }
    }

    // Search Google Places
    const searchResponse = await searchPlaces(query.trim(), location);

    // Transform results to simplified format
    const results: GooglePlacesSearchResultSimplified[] = searchResponse.results.map((place) => ({
      placeId: place.place_id,
      name: place.name,
      address: place.formatted_address,
      types: place.types,
      rating: place.rating,
      businessStatus: place.business_status,
    }));

    return NextResponse.json({
      results,
    } as GooglePlacesSearchApiResponse);

  } catch (error) {
    // Handle GooglePlacesError specifically
    if (error instanceof GooglePlacesError) {
      const statusCode = error.isRateLimited ? 429 :
                         error.status === 'REQUEST_DENIED' ? 403 :
                         error.status === 'INVALID_REQUEST' ? 400 : 500;

      return NextResponse.json(
        {
          results: [],
          error: error.message
        } as GooglePlacesSearchApiResponse,
        { status: statusCode }
      );
    }

    // Handle unexpected errors
    console.error('Error searching Google Places:', error);
    return NextResponse.json(
      {
        results: [],
        error: 'Failed to search Google Places'
      } as GooglePlacesSearchApiResponse,
      { status: 500 }
    );
  }
}
