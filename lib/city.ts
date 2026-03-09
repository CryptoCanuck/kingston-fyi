import { headers } from 'next/headers'
import type { CityId, CityConfig } from './types'

export const CITY_CONFIG: Record<CityId, CityConfig> = {
  kingston: {
    name: 'Kingston',
    domain: 'kingston.fyi',
    tagline: 'The Limestone City',
    colors: {
      primary: '#1e40af',
      primaryLight: '#3b82f6',
      primaryDark: '#1e3a8a',
      accent: '#60a5fa',
      gradient: 'from-blue-800 to-blue-500',
    },
    coordinates: { lat: 44.2312, lng: -76.486 },
    timezone: 'America/Toronto',
  },
  ottawa: {
    name: 'Ottawa',
    domain: 'ottawa.fyi',
    tagline: "Canada's Capital",
    colors: {
      primary: '#dc2626',
      primaryLight: '#ef4444',
      primaryDark: '#b91c1c',
      accent: '#f87171',
      gradient: 'from-red-700 to-red-400',
    },
    coordinates: { lat: 45.4215, lng: -75.6972 },
    timezone: 'America/Toronto',
  },
  montreal: {
    name: 'Montreal',
    domain: 'montreal.fyi',
    tagline: 'La Métropole',
    colors: {
      primary: '#7c3aed',
      primaryLight: '#a78bfa',
      primaryDark: '#6d28d9',
      accent: '#c4b5fd',
      gradient: 'from-violet-700 to-violet-400',
    },
    coordinates: { lat: 45.5019, lng: -73.5674 },
    timezone: 'America/Toronto',
  },
}

export async function getCityFromHeaders(): Promise<CityId> {
  const headerStore = await headers()
  const city = headerStore.get('x-city') || 'kingston'
  return validateCity(city) ? city : 'kingston'
}

export function validateCity(city: string): city is CityId {
  return ['kingston', 'ottawa', 'montreal'].includes(city)
}
