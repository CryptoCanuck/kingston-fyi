import { Place, PlaceCategory } from '@/types/models';
import { generateRealPlaces } from './real-places';
import { generateKingstonBusinesses } from './kingston-business-generator';

// Combine real places with generated ones for a full directory
const realPlaces = generateRealPlaces();
const generatedPlaces = generateKingstonBusinesses(75); // Generate 75 additional businesses

export const mockPlaces: Place[] = [...realPlaces, ...generatedPlaces];

export function getPlacesByCategory(category: PlaceCategory): Place[] {
  return mockPlaces.filter(place => place.category === category);
}

export function getPlaceBySlug(slug: string): Place | undefined {
  return mockPlaces.find(place => place.slug === slug);
}

export function getFeaturedPlaces(limit: number = 6): Place[] {
  return mockPlaces.filter(place => place.featured).slice(0, limit);
}

export function searchPlaces(query: string): Place[] {
  const lowercaseQuery = query.toLowerCase();
  return mockPlaces.filter(place => 
    place.name.toLowerCase().includes(lowercaseQuery) ||
    place.description.toLowerCase().includes(lowercaseQuery) ||
    place.subcategories.some(cat => cat.toLowerCase().includes(lowercaseQuery))
  );
}