import { headers } from 'next/headers'
import type { CityId, CityConfig } from './types'

export const CITY_CONFIG: Record<CityId, CityConfig> = {
  kingston: {
    name: 'Kingston',
    domain: 'kingston.fyi',
    tagline: 'The Limestone City',
    description: 'Historic waterfront charm meets vibrant arts and dining',
    colors: {
      primary: '#1e40af',
      primaryLight: '#3b82f6',
      primaryDark: '#1e3a8a',
      accent: '#60a5fa',
      gradientFrom: '#1e3a8a',
      gradientTo: '#3b82f6',
      surface: '#eff6ff',
      gradient: 'from-blue-900 to-blue-500',
    },
    coordinates: { lat: 44.2312, lng: -76.486 },
    timezone: 'America/Toronto',
  },
  ottawa: {
    name: 'Ottawa',
    domain: 'ottawa.fyi',
    tagline: "Canada's Capital",
    description: 'Where politics meets culture along the historic Rideau Canal',
    colors: {
      primary: '#b91c1c',
      primaryLight: '#ef4444',
      primaryDark: '#991b1b',
      accent: '#f87171',
      gradientFrom: '#991b1b',
      gradientTo: '#ef4444',
      surface: '#fef2f2',
      gradient: 'from-red-800 to-red-500',
    },
    coordinates: { lat: 45.4215, lng: -75.6972 },
    timezone: 'America/Toronto',
  },
  montreal: {
    name: 'Montreal',
    domain: 'montreal.fyi',
    tagline: 'La Métropole',
    description: 'A cultural mosaic of food, festivals, and joie de vivre',
    colors: {
      primary: '#7c3aed',
      primaryLight: '#a78bfa',
      primaryDark: '#6d28d9',
      accent: '#c4b5fd',
      gradientFrom: '#5b21b6',
      gradientTo: '#a78bfa',
      surface: '#f5f3ff',
      gradient: 'from-violet-800 to-violet-400',
    },
    coordinates: { lat: 45.5019, lng: -73.5674 },
    timezone: 'America/Toronto',
  },
  toronto: {
    name: 'Toronto',
    domain: 'toronto.fyi',
    tagline: 'The Six',
    description: "Canada's largest city — diverse, dynamic, and always buzzing",
    colors: {
      primary: '#0369a1',
      primaryLight: '#38bdf8',
      primaryDark: '#075985',
      accent: '#7dd3fc',
      gradientFrom: '#0c4a6e',
      gradientTo: '#38bdf8',
      surface: '#f0f9ff',
      gradient: 'from-sky-900 to-sky-400',
    },
    coordinates: { lat: 43.6532, lng: -79.3832 },
    timezone: 'America/Toronto',
  },
  vancouver: {
    name: 'Vancouver',
    domain: 'vancouver.fyi',
    tagline: 'Pacific Jewel',
    description: 'Mountains, ocean, and world-class dining in perfect harmony',
    colors: {
      primary: '#0d9488',
      primaryLight: '#2dd4bf',
      primaryDark: '#0f766e',
      accent: '#5eead4',
      gradientFrom: '#134e4a',
      gradientTo: '#2dd4bf',
      surface: '#f0fdfa',
      gradient: 'from-teal-900 to-teal-400',
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
