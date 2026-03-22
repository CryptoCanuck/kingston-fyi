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
  toronto: {
    name: 'Toronto',
    domain: 'toronto.fyi',
    tagline: 'The Six',
    colors: {
      primary: '#0369a1',
      primaryLight: '#38bdf8',
      primaryDark: '#075985',
      accent: '#7dd3fc',
      gradient: 'from-sky-800 to-sky-500',
    },
    coordinates: { lat: 43.6532, lng: -79.3832 },
    timezone: 'America/Toronto',
  },
  vancouver: {
    name: 'Vancouver',
    domain: 'vancouver.fyi',
    tagline: 'Pacific Jewel',
    colors: {
      primary: '#0d9488',
      primaryLight: '#2dd4bf',
      primaryDark: '#0f766e',
      accent: '#5eead4',
      gradient: 'from-teal-800 to-teal-500',
    },
    coordinates: { lat: 49.2827, lng: -123.1207 },
    timezone: 'America/Vancouver',
  },
}

export async function getCityFromHeaders(): Promise<CityId> {
  const headerStore = await headers()
  const city = headerStore.get('x-city') || 'kingston'
  return validateCity(city) ? city : 'kingston'
}

export function validateCity(city: string): city is CityId {
  return ['kingston', 'ottawa', 'montreal', 'toronto', 'vancouver'].includes(city)
}
