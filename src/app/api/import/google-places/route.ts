import { NextRequest, NextResponse } from 'next/server';
import { connectMongoose } from '@/lib/mongodb';
import { Place } from '@/models/Place';
import {
  fetchPlaceDetails,
  GooglePlacesError,
  isApiKeyConfigured,
  isValidPlaceIdFormat,
} from '@/lib/google-places';
import { mapGooglePlaceToPlace } from '@/lib/google-places-mapper';

/**
 * POST /api/import/google-places
 *
 * Import a place by Google Place ID.
 *
 * Request Body:
 * - placeId (required): The Google Place ID to import
 *
 * Returns:
 * - 201: Place imported successfully
 * - 200: Place already exists (not imported again)
 * - 400: Invalid request (missing/invalid placeId)
 * - 429: Rate limited by Google API
 * - 503: Google API key not configured
 * - 500: Server error
 */
export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!isApiKeyConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Google Maps API key not configured',
        },
        { status: 503 }
      );
    }

    // Parse request body
    let body: { placeId?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body',
        },
        { status: 400 }
      );
    }

    const { placeId } = body;

    // Validate placeId is provided
    if (!placeId || typeof placeId !== 'string' || placeId.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: placeId',
        },
        { status: 400 }
      );
    }

    const trimmedPlaceId = placeId.trim();

    // Validate placeId format
    if (!isValidPlaceIdFormat(trimmedPlaceId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid placeId format',
        },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectMongoose();

    // Check if place already exists (duplicate detection)
    const existingPlace = await Place.findOne({ googlePlaceId: trimmedPlaceId }).lean();

    if (existingPlace) {
      return NextResponse.json(
        {
          success: true,
          place: existingPlace,
          imported: false,
          message: 'Place already exists',
        },
        { status: 200 }
      );
    }

    // Fetch place details from Google Places API
    const googleResponse = await fetchPlaceDetails(trimmedPlaceId);

    // Transform Google Places data to Place model format
    const placeData = mapGooglePlaceToPlace(googleResponse.result);

    // Create new place document
    const newPlace = new Place({
      ...placeData,
      // Convert location from {lat, lng} to GeoJSON format for MongoDB
      location: {
        type: 'Point',
        coordinates: [placeData.location.lng, placeData.location.lat],
      },
    });

    // Save to database
    await newPlace.save();

    // Return the saved place (using toJSON to get proper format)
    const savedPlace = newPlace.toJSON();

    return NextResponse.json(
      {
        success: true,
        place: savedPlace,
        imported: true,
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle GooglePlacesError specifically
    if (error instanceof GooglePlacesError) {
      const statusCode = error.isRateLimited
        ? 429
        : error.status === 'REQUEST_DENIED'
          ? 403
          : error.status === 'NOT_FOUND'
            ? 400
            : error.status === 'INVALID_REQUEST'
              ? 400
              : 500;

      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: statusCode }
      );
    }

    // Handle mapper validation errors (e.g., business is closed)
    if (error instanceof Error && error.message.includes('not operational')) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 }
      );
    }

    // Handle missing required fields error
    if (error instanceof Error && error.message.includes('Missing required fields')) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 }
      );
    }

    // Handle duplicate key error (race condition - place was created between check and insert)
    if (error instanceof Error && error.message.includes('duplicate key')) {
      // Fetch and return the existing place
      try {
        await connectMongoose();
        const body = await request.clone().json();
        const existingPlace = await Place.findOne({
          googlePlaceId: body.placeId?.trim(),
        }).lean();

        if (existingPlace) {
          return NextResponse.json(
            {
              success: true,
              place: existingPlace,
              imported: false,
              message: 'Place already exists',
            },
            { status: 200 }
          );
        }
      } catch {
        // Fall through to generic error
      }
    }

    // Handle unexpected errors
    console.error('Error importing place from Google:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to import place from Google',
      },
      { status: 500 }
    );
  }
}
