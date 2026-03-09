import { headers } from 'next/headers'
import type { City, CityConfig } from './types'

export const CITY_CONFIG: Record<City, CityConfig> = {
  kingston: {
    name: 'Kingston',
    domain: 'kingston.fyi',
    tagline: 'Discover Kingston',
    colors: {
      primary: '#1e40af',
      primaryLight: '#3b82f6',
      gradient: 'from-blue-800 to-blue-500',
    },
    coordinates: { lat: 44.2312, lng: -76.486 },
    timezone: 'America/Toronto',
  },
  ottawa: {
    name: 'Ottawa',
    domain: 'ottawa.fyi',
    tagline: 'Discover Ottawa',
    colors: {
      primary: '#dc2626',
      primaryLight: '#ef4444',
      gradient: 'from-red-700 to-red-400',
    },
    coordinates: { lat: 45.4215, lng: -75.6972 },
    timezone: 'America/Toronto',
  },
  montreal: {
    name: 'Montreal',
    domain: 'montreal.fyi',
    tagline: 'Discover Montreal',
    colors: {
      primary: '#7c3aed',
      primaryLight: '#a78bfa',
      gradient: 'from-violet-700 to-violet-400',
    },
    coordinates: { lat: 45.5017, lng: -73.5673 },
    timezone: 'America/Toronto',
  },
}

export async function getCityFromHeaders(): Promise<City> {
  const headerStore = await headers()
  const city = headerStore.get('x-city') || 'kingston'
  return validateCity(city) ? city : 'kingston'
}

export function validateCity(city: string): city is City {
  return ['kingston', 'ottawa', 'montreal'].includes(city)
}
