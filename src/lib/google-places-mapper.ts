// Google Places Data Mapper
// Transforms Google Places API data to Place model format

import type {
  GooglePlacesResult,
  GooglePlacesAddressComponent,
  GooglePlacesPriceLevel,
  GooglePlacesOpeningHours,
} from '@/types/google-places';
import type {
  Place,
  PlaceCategory,
  Address,
  Location,
  ContactInfo,
  OpeningHours,
} from '@/types/models';
import { generateSlug, createUniqueSlug } from '@/lib/db-utils';

/**
 * Placeholder image URL for imported places
 * Photo import is out of scope for this feature
 */
const PLACEHOLDER_IMAGE = '/images/placeholder-place.jpg';

/**
 * Category mapping from Google Place types to PlaceCategory
 * Maps are checked in order - first match wins
 */
const GOOGLE_TYPE_TO_CATEGORY: Record<string, PlaceCategory> = {
  // Food & Drink
  restaurant: 'restaurant',
  food: 'restaurant',
  meal_delivery: 'restaurant',
  meal_takeaway: 'restaurant',
  cafe: 'cafe',
  bakery: 'bakery',
  bar: 'bar',
  night_club: 'nightclub',
  // Shopping
  store: 'shopping',
  shopping_mall: 'shopping',
  clothing_store: 'shopping',
  book_store: 'shopping',
  electronics_store: 'shopping',
  furniture_store: 'shopping',
  hardware_store: 'shopping',
  home_goods_store: 'shopping',
  jewelry_store: 'shopping',
  shoe_store: 'shopping',
  supermarket: 'shopping',
  convenience_store: 'shopping',
  liquor_store: 'shopping',
  // Attractions
  tourist_attraction: 'attraction',
  museum: 'attraction',
  art_gallery: 'attraction',
  park: 'attraction',
  amusement_park: 'attraction',
  zoo: 'attraction',
  aquarium: 'attraction',
  // Activities
  gym: 'activity',
  bowling_alley: 'activity',
  movie_theater: 'activity',
  spa: 'activity',
  stadium: 'activity',
  // Services (default fallback)
  bank: 'service',
  atm: 'service',
  post_office: 'service',
  hospital: 'service',
  pharmacy: 'service',
  doctor: 'service',
  dentist: 'service',
  lawyer: 'service',
  real_estate_agency: 'service',
  insurance_agency: 'service',
  accounting: 'service',
  car_dealer: 'service',
  car_rental: 'service',
  car_repair: 'service',
  car_wash: 'service',
  gas_station: 'service',
  parking: 'service',
  lodging: 'service',
  travel_agency: 'service',
};

/**
 * Price level mapping from Google (0-4) to our format ($-$$$$)
 */
const PRICE_LEVEL_MAP: Record<GooglePlacesPriceLevel, Place['priceRange']> = {
  0: '$', // Free
  1: '$',
  2: '$$',
  3: '$$$',
  4: '$$$$',
};

/**
 * Day name mapping from weekday index (0=Sunday) to day name
 */
const DAY_NAMES = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;

type DayName = (typeof DAY_NAMES)[number];

/**
 * Parse address from Google Places address components
 *
 * @param addressComponents - Google Places address components array
 * @param formattedAddress - Fallback formatted address string
 * @returns Parsed Address object
 */
export function parseAddress(
  addressComponents: GooglePlacesAddressComponent[] | undefined,
  formattedAddress: string
): Address {
  const address: Address = {
    street: '',
    city: '',
    province: '',
    postalCode: '',
    country: '',
  };

  if (!addressComponents || addressComponents.length === 0) {
    // Fallback: try to parse from formatted address
    return parseAddressFromString(formattedAddress);
  }

  let streetNumber = '';
  let route = '';

  for (const component of addressComponents) {
    const types = component.types;

    if (types.includes('street_number')) {
      streetNumber = component.long_name;
    } else if (types.includes('route')) {
      route = component.long_name;
    } else if (types.includes('locality') || types.includes('sublocality')) {
      if (!address.city) {
        address.city = component.long_name;
      }
    } else if (types.includes('administrative_area_level_1')) {
      // Province/State
      address.province = component.short_name;
    } else if (types.includes('postal_code')) {
      address.postalCode = component.long_name;
    } else if (types.includes('country')) {
      address.country = component.long_name;
    }
  }

  // Combine street number and route
  address.street = [streetNumber, route].filter(Boolean).join(' ').trim();

  // If street is still empty, try to extract from formatted address
  if (!address.street && formattedAddress) {
    const parts = formattedAddress.split(',');
    if (parts.length > 0) {
      address.street = parts[0].trim();
    }
  }

  return address;
}

/**
 * Parse address from a formatted address string
 * Handles common Canadian address formats
 *
 * @param formattedAddress - Full formatted address string
 * @returns Parsed Address object
 */
export function parseAddressFromString(formattedAddress: string): Address {
  const address: Address = {
    street: '',
    city: '',
    province: '',
    postalCode: '',
    country: '',
  };

  if (!formattedAddress) {
    return address;
  }

  // Split by comma
  const parts = formattedAddress.split(',').map((p) => p.trim());

  if (parts.length === 0) {
    return address;
  }

  // First part is typically street address
  address.street = parts[0];

  // Canadian postal code regex (e.g., "K7L 3N6")
  const postalCodeRegex = /[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d/;

  // Canadian province abbreviations
  const canadianProvinces: Record<string, string> = {
    ON: 'ON',
    Ontario: 'ON',
    BC: 'BC',
    'British Columbia': 'BC',
    AB: 'AB',
    Alberta: 'AB',
    SK: 'SK',
    Saskatchewan: 'SK',
    MB: 'MB',
    Manitoba: 'MB',
    QC: 'QC',
    Quebec: 'QC',
    NB: 'NB',
    'New Brunswick': 'NB',
    NS: 'NS',
    'Nova Scotia': 'NS',
    PE: 'PE',
    'Prince Edward Island': 'PE',
    NL: 'NL',
    'Newfoundland and Labrador': 'NL',
    YT: 'YT',
    Yukon: 'YT',
    NT: 'NT',
    'Northwest Territories': 'NT',
    NU: 'NU',
    Nunavut: 'NU',
  };

  // Process remaining parts
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];

    // Check for postal code
    const postalMatch = part.match(postalCodeRegex);
    if (postalMatch) {
      address.postalCode = postalMatch[0].toUpperCase();
      // Extract province from this part if present
      const beforePostal = part.replace(postalCodeRegex, '').trim();
      if (beforePostal && canadianProvinces[beforePostal]) {
        address.province = canadianProvinces[beforePostal];
      }
      continue;
    }

    // Check for country (typically last)
    if (
      i === parts.length - 1 &&
      (part.toLowerCase() === 'canada' || part.toLowerCase() === 'usa')
    ) {
      address.country = part;
      continue;
    }

    // Check for province
    const provinceMatch = Object.keys(canadianProvinces).find(
      (key) => part.includes(key) || part === key
    );
    if (provinceMatch) {
      address.province = canadianProvinces[provinceMatch];
      // If there's more in this part, it might be city + province
      const cityPart = part.replace(provinceMatch, '').trim();
      if (cityPart && !address.city) {
        address.city = cityPart;
      }
      continue;
    }

    // If no city yet, this is likely the city
    if (!address.city) {
      address.city = part;
    }
  }

  // Default country if not found
  if (!address.country) {
    address.country = 'Canada';
  }

  return address;
}

/**
 * Parse opening hours from Google Places format
 *
 * @param openingHours - Google Places opening hours object
 * @returns OpeningHours object or undefined if no hours available
 */
export function parseHours(
  openingHours: GooglePlacesOpeningHours | undefined
): OpeningHours | undefined {
  if (!openingHours) {
    return undefined;
  }

  // Prefer weekday_text for easier parsing
  if (openingHours.weekday_text && openingHours.weekday_text.length > 0) {
    return parseHoursFromWeekdayText(openingHours.weekday_text);
  }

  // Fallback to periods
  if (openingHours.periods && openingHours.periods.length > 0) {
    return parseHoursFromPeriods(openingHours.periods);
  }

  return undefined;
}

/**
 * Parse hours from weekday_text format
 * e.g., ["Monday: 9:00 AM – 5:00 PM", "Tuesday: 9:00 AM – 5:00 PM", ...]
 *
 * @param weekdayText - Array of day/hours strings
 * @returns OpeningHours object
 */
function parseHoursFromWeekdayText(weekdayText: string[]): OpeningHours {
  const hours: OpeningHours = {};

  for (const text of weekdayText) {
    // Match pattern like "Monday: 9:00 AM – 5:00 PM"
    const match = text.match(
      /^(\w+):\s*(.+)$/i
    );

    if (!match) continue;

    const dayName = match[1].toLowerCase() as DayName;
    const timeStr = match[2].trim();

    // Check if closed
    if (
      timeStr.toLowerCase() === 'closed' ||
      timeStr.toLowerCase().includes('closed')
    ) {
      continue; // Skip closed days
    }

    // Check for 24 hours
    if (
      timeStr.toLowerCase().includes('open 24 hours') ||
      timeStr.toLowerCase() === '24 hours'
    ) {
      if (isValidDayName(dayName)) {
        hours[dayName] = { open: '00:00', close: '23:59' };
      }
      continue;
    }

    // Parse time range (handle various dash characters)
    const timeMatch = timeStr.match(
      /(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)\s*[–\-−—]\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)/i
    );

    if (timeMatch && isValidDayName(dayName)) {
      const openTime = parseTimeString(timeMatch[1]);
      const closeTime = parseTimeString(timeMatch[2]);

      if (openTime && closeTime) {
        hours[dayName] = { open: openTime, close: closeTime };
      }
    }
  }

  return hours;
}

/**
 * Parse hours from periods format (Google Places API periods array)
 *
 * @param periods - Array of Google Places periods
 * @returns OpeningHours object
 */
function parseHoursFromPeriods(
  periods: GooglePlacesOpeningHours['periods']
): OpeningHours {
  const hours: OpeningHours = {};

  if (!periods) return hours;

  for (const period of periods) {
    const dayIndex = period.open.day;
    const dayName = DAY_NAMES[dayIndex];

    if (!dayName) continue;

    const openTime = formatTime(period.open.time);
    const closeTime = period.close ? formatTime(period.close.time) : '23:59';

    hours[dayName] = { open: openTime, close: closeTime };
  }

  return hours;
}

/**
 * Check if a string is a valid day name
 */
function isValidDayName(day: string): day is DayName {
  return DAY_NAMES.includes(day as DayName);
}

/**
 * Parse a time string like "9:00 AM" or "5:00 PM" to 24-hour format "HH:MM"
 *
 * @param timeStr - Time string in various formats
 * @returns 24-hour format time string or null if invalid
 */
function parseTimeString(timeStr: string): string | null {
  if (!timeStr) return null;

  const cleaned = timeStr.trim().toUpperCase();

  // Match patterns like "9:00 AM", "9 AM", "9:00AM", "09:00"
  const match = cleaned.match(
    /^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/
  );

  if (!match) return null;

  let hour = parseInt(match[1], 10);
  const minute = match[2] ? parseInt(match[2], 10) : 0;
  const period = match[3];

  // Convert to 24-hour format
  if (period === 'PM' && hour !== 12) {
    hour += 12;
  } else if (period === 'AM' && hour === 12) {
    hour = 0;
  }

  // Validate
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }

  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

/**
 * Format HHMM time string to HH:MM
 *
 * @param time - Time in HHMM format
 * @returns Time in HH:MM format
 */
function formatTime(time: string): string {
  if (!time || time.length < 4) {
    return '00:00';
  }
  return `${time.slice(0, 2)}:${time.slice(2, 4)}`;
}

/**
 * Map Google Place types to PlaceCategory
 * Returns the first matching category or 'service' as default
 *
 * @param types - Array of Google Place types
 * @returns PlaceCategory value
 */
export function mapCategory(types: string[]): PlaceCategory {
  if (!types || types.length === 0) {
    return 'service';
  }

  // Check each type in order
  for (const type of types) {
    const category = GOOGLE_TYPE_TO_CATEGORY[type];
    if (category) {
      return category;
    }
  }

  // Default to 'service' for unmapped types
  return 'service';
}

/**
 * Extract subcategories from Google Place types
 * Returns types that aren't the primary category
 *
 * @param types - Array of Google Place types
 * @param primaryCategory - The mapped primary category
 * @returns Array of subcategory strings
 */
export function extractSubcategories(
  types: string[],
  primaryCategory: PlaceCategory
): string[] {
  if (!types || types.length === 0) {
    return [];
  }

  // Filter out generic types and the primary category type
  const genericTypes = ['establishment', 'point_of_interest', 'locality', 'political'];
  const primaryTypes = Object.entries(GOOGLE_TYPE_TO_CATEGORY)
    .filter(([, cat]) => cat === primaryCategory)
    .map(([type]) => type);

  return types
    .filter((type) => !genericTypes.includes(type) && !primaryTypes.includes(type))
    .map((type) => formatTypeName(type));
}

/**
 * Format a Google type name to human-readable format
 * e.g., "meal_delivery" -> "Meal Delivery"
 *
 * @param type - Google type string
 * @returns Formatted string
 */
function formatTypeName(type: string): string {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Map price level from Google (0-4) to our format ($-$$$$)
 *
 * @param priceLevel - Google price level (0-4)
 * @returns Price range string or undefined
 */
export function mapPriceLevel(
  priceLevel: GooglePlacesPriceLevel | undefined
): Place['priceRange'] | undefined {
  if (priceLevel === undefined || priceLevel === null) {
    return undefined;
  }
  return PRICE_LEVEL_MAP[priceLevel];
}

/**
 * Extract location from Google Places geometry
 *
 * @param geometry - Google Places geometry object
 * @returns Location object
 */
export function extractLocation(geometry: GooglePlacesResult['geometry']): Location {
  return {
    lat: geometry?.location?.lat || 0,
    lng: geometry?.location?.lng || 0,
  };
}

/**
 * Build contact info from Google Places result
 *
 * @param result - Google Places result object
 * @returns ContactInfo object
 */
export function buildContactInfo(result: GooglePlacesResult): ContactInfo {
  return {
    phone: result.formatted_phone_number,
    website: result.website,
  };
}

/**
 * Generate description from Google Places data
 * Uses editorial summary if available, otherwise creates a generic description
 *
 * @param result - Google Places result object
 * @param category - Mapped category
 * @returns Description string
 */
export function generateDescription(
  result: GooglePlacesResult,
  category: PlaceCategory
): string {
  // Use editorial summary if available
  if (result.editorial_summary?.overview) {
    return result.editorial_summary.overview;
  }

  // Generate generic description based on category and info
  const categoryName = formatTypeName(category);
  const locationInfo = result.vicinity || result.formatted_address?.split(',')[1]?.trim() || '';

  let description = `${result.name} is a ${categoryName.toLowerCase()}`;

  if (locationInfo) {
    description += ` located in ${locationInfo}`;
  }

  if (result.rating) {
    description += `. Rated ${result.rating} out of 5`;
    if (result.user_ratings_total) {
      description += ` based on ${result.user_ratings_total} reviews`;
    }
  }

  description += '.';

  return description;
}

/**
 * Validate that required fields are present in Google Places result
 *
 * @param result - Google Places result object
 * @throws Error if required fields are missing
 */
export function validateGooglePlacesResult(result: GooglePlacesResult): void {
  const missingFields: string[] = [];

  if (!result.name) {
    missingFields.push('name');
  }
  if (!result.formatted_address) {
    missingFields.push('formatted_address');
  }
  if (!result.geometry?.location) {
    missingFields.push('geometry.location');
  }

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Validate coordinates are within valid range
  const { lat, lng } = result.geometry.location;
  if (lat < -90 || lat > 90) {
    throw new Error(`Invalid latitude: ${lat}`);
  }
  if (lng < -180 || lng > 180) {
    throw new Error(`Invalid longitude: ${lng}`);
  }
}

/**
 * Check if a Google Place is currently operational
 *
 * @param businessStatus - Google Places business status
 * @returns True if operational, false if closed
 */
export function isOperational(
  businessStatus: GooglePlacesResult['business_status']
): boolean {
  if (!businessStatus) {
    return true; // Assume operational if not specified
  }
  return businessStatus === 'OPERATIONAL';
}

/**
 * Transform a Google Places result to Place model format
 * This is the main transformation function
 *
 * @param result - Google Places API result
 * @returns Partial Place object (without id, createdAt, updatedAt)
 * @throws Error if required fields are missing or business is closed
 */
export function mapGooglePlaceToPlace(
  result: GooglePlacesResult
): Omit<Place, 'id' | 'createdAt' | 'updatedAt'> {
  // Validate required fields
  validateGooglePlacesResult(result);

  // Check business status
  if (!isOperational(result.business_status)) {
    throw new Error(
      `Business is not operational (status: ${result.business_status})`
    );
  }

  const category = mapCategory(result.types);
  const subcategories = extractSubcategories(result.types, category);

  // Generate slug with unique suffix to prevent collisions
  const baseSlug = generateSlug(result.name);
  const slug = createUniqueSlug(baseSlug);

  return {
    googlePlaceId: result.place_id,
    slug,
    name: result.name,
    category,
    subcategories,
    description: generateDescription(result, category),
    address: parseAddress(result.address_components, result.formatted_address),
    location: extractLocation(result.geometry),
    contact: buildContactInfo(result),
    hours: parseHours(result.opening_hours),
    priceRange: mapPriceLevel(result.price_level),
    rating: result.rating,
    reviewCount: result.user_ratings_total,
    images: {
      main: PLACEHOLDER_IMAGE,
      gallery: [],
    },
    features: [],
    amenities: [],
    verified: false,
    featured: false,
  };
}

/**
 * Transform multiple Google Places results to Place model format
 * Filters out places that fail validation
 *
 * @param results - Array of Google Places results
 * @returns Array of transformed Place objects
 */
export function mapGooglePlacesToPlaces(
  results: GooglePlacesResult[]
): Omit<Place, 'id' | 'createdAt' | 'updatedAt'>[] {
  const places: Omit<Place, 'id' | 'createdAt' | 'updatedAt'>[] = [];

  for (const result of results) {
    try {
      const place = mapGooglePlaceToPlace(result);
      places.push(place);
    } catch {
      // Skip places that fail validation (e.g., closed businesses)
      continue;
    }
  }

  return places;
}
