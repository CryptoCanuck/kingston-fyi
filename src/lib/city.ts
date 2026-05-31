import { headers as nextHeaders } from 'next/headers'
import { getPayload, type Payload } from 'payload'

import type { City } from '../payload-types'

// Default city for hosts that don't explicitly match (localhost, previews, the launch
// domain before extra cities exist). Kingston launches first; new cities are a rollout.
export const DEFAULT_CITY_SLUG = 'kingston'

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1'])

/** Normalize a Host header to a bare, lowercase hostname (strip port, trim, lowercase). */
export const normalizeHost = (host: string | null | undefined): string => {
  if (!host) return ''
  return host
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, '')
}

/**
 * Resolve the active city for a given host. Matches against each city's `hostnames`
 * list; local hosts and unmatched hosts fall back to the default city (Kingston).
 * Returns null only if the default city itself is missing (unseeded DB).
 */
export const resolveCityByHost = async (
  host: string | null | undefined,
  payload: Payload,
): Promise<City | null> => {
  const hostname = normalizeHost(host)

  const { docs } = await payload.find({
    collection: 'cities',
    limit: 100,
    depth: 0,
    overrideAccess: true,
  })
  const cities = docs as City[]

  if (hostname && !LOCAL_HOSTS.has(hostname)) {
    const matched = cities.find((city) =>
      (city.hostnames ?? []).some((h) => normalizeHost(h.hostname) === hostname),
    )
    if (matched) return matched
  }

  return cities.find((city) => city.slug === DEFAULT_CITY_SLUG) ?? null
}

/** Resolve the active city for the current RSC request via the Host header. */
export const getActiveCity = async (): Promise<City | null> => {
  // Lazy-load the Payload config so this module doesn't statically depend on
  // payload.config (which imports every collection, which imports this module back —
  // a cycle). The config is only needed at request time, never at module-eval.
  const configPromise = (await import('@payload-config')).default
  const payload = await getPayload({ config: configPromise })
  const h = await nextHeaders()
  return resolveCityByHost(h.get('host'), payload)
}

/** Convenience: the active city id for RSC reads (throws if the DB is unseeded). */
export const getActiveCityId = async (): Promise<string> => {
  const city = await getActiveCity()
  if (!city) {
    throw new Error('No active city resolved — is the cities collection seeded?')
  }
  return String(city.id)
}
