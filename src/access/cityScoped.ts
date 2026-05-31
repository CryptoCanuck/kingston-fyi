import type { Access, Where } from 'payload'

import { resolveCityByHost } from '../lib/city'

/**
 * Mandatory city-scoping (NFR7). Returns a Where constraint binding queries to the
 * request's active city (resolved from the Host header). If no city can be resolved,
 * returns `false` — denying the query outright rather than leaking across cities.
 *
 * Usable as both `access.read` and `baseListFilter` (compatible signatures).
 */
export const cityScoped = (): Access => {
  return async ({ req }) => {
    const host = req.headers?.get('host')
    const city = await resolveCityByHost(host, req.payload)
    if (!city) return false
    return { city: { equals: city.id } } satisfies Where
  }
}

/**
 * Same constraint, shaped for `baseListFilter` (always returns a Where; a deny becomes
 * an unsatisfiable filter so admin lists never leak across cities either).
 */
export const cityScopedListFilter = () => {
  return async ({ req }: { req: Parameters<Access>[0]['req'] }): Promise<Where> => {
    const host = req.headers?.get('host')
    const city = await resolveCityByHost(host, req.payload)
    if (!city) return { id: { equals: '00000000-0000-0000-0000-000000000000' } }
    return { city: { equals: city.id } }
  }
}
