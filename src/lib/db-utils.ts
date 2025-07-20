import { ObjectId } from 'mongodb';

/**
 * Safely convert a string to MongoDB ObjectId
 * Returns null if the string is not a valid ObjectId
 */
export function toObjectId(id: string | ObjectId | null | undefined): ObjectId | null {
  if (!id) return null;
  
  try {
    return typeof id === 'string' ? new ObjectId(id) : id;
  } catch {
    return null;
  }
}

/**
 * Check if a string is a valid MongoDB ObjectId
 */
export function isValidObjectId(id: string | undefined | null): boolean {
  if (!id) return false;
  
  try {
    new ObjectId(id);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate a URL-safe slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '') // Remove leading hyphens
    .replace(/-+$/, ''); // Remove trailing hyphens
}

/**
 * Create a unique slug by appending a random suffix if needed
 */
export function createUniqueSlug(baseSlug: string): string {
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${baseSlug}-${randomSuffix}`;
}

/**
 * Convert MongoDB document to plain object
 */
export function toPlainObject<T>(doc: unknown): T {
  return JSON.parse(JSON.stringify(doc));
}

/**
 * Build MongoDB pagination options
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
}

export function buildPaginationOptions(options: PaginationOptions) {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 20));
  const skip = (page - 1) * limit;

  return {
    skip,
    limit,
    sort: options.sort || { createdAt: -1 as const },
  };
}

/**
 * Calculate total pages for pagination
 */
export function calculateTotalPages(totalItems: number, limit: number): number {
  return Math.ceil(totalItems / limit);
}

/**
 * Build text search query for MongoDB
 */
export function buildTextSearchQuery(searchTerm: string, fields: string[]) {
  if (!searchTerm || !fields.length) return {};

  const regex = new RegExp(searchTerm, 'i');
  return {
    $or: fields.map(field => ({ [field]: regex })),
  };
}

/**
 * Sanitize user input for database operations
 */
export function sanitizeInput<T = unknown>(input: T): T {
  if (typeof input === 'string') {
    return input.trim() as T;
  }
  
  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item)).filter(Boolean) as T;
  }
  
  if (input && typeof input === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      if (value !== null && value !== undefined) {
        sanitized[key] = sanitizeInput(value);
      }
    }
    return sanitized as T;
  }
  
  return input;
}

/**
 * Build geospatial query for location-based searches
 */
export interface GeoQuery {
  lat: number;
  lng: number;
  radiusInKm?: number;
}

export function buildGeoNearQuery(location: GeoQuery) {
  const radiusInMeters = (location.radiusInKm || 10) * 1000;
  
  return {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [location.lng, location.lat],
        },
        $maxDistance: radiusInMeters,
      },
    },
  };
}

/**
 * Format MongoDB aggregation pipeline for common operations
 */
export function buildAggregationPipeline(stages: Record<string, unknown>[]) {
  return stages.filter(stage => {
    const key = Object.keys(stage)[0];
    const value = stage[key];
    return value !== null && value !== undefined &&
           (typeof value !== 'object' || Object.keys(value as Record<string, unknown>).length > 0);
  });
}