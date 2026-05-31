// Geospatial queries (FR24, architecture §Geospatial). Radius / "near me" / map-bounds
// searches run as raw PostGIS SQL through Drizzle against the GiST-indexed `location` column
// (Story 2.1). Each helper returns lightweight { id, distanceM? } hits; the directory then
// fetches full docs by id THROUGH Payload access control, so geo never bypasses scoping.

import { sql } from 'drizzle-orm'
import type { Payload } from 'payload'

import { PUBLIC_STATUSES } from '../../fields/statusField'

export interface GeoHit {
  id: string
  /** Metres from the query point (radius search only). */
  distanceM?: number
}

export interface MapBounds {
  minLng: number
  minLat: number
  maxLng: number
  maxLat: number
}

// Drizzle's execute() returns a driver-shaped result; node-postgres puts rows on `.rows`.
const rowsOf = (res: unknown): Record<string, unknown>[] => {
  const r = res as { rows?: Record<string, unknown>[] }
  return r.rows ?? (res as Record<string, unknown>[])
}

// Build `IN ($1, $2, …)` from a status list as individual bound params (avoids array-cast
// type issues with `= ANY($1::text[])`).
const statusInList = (statuses: string[]) => sql.join(statuses.map((s) => sql`${s}`), sql`, `)

/**
 * Businesses within `radiusM` metres of a point, nearest first (FR24). Distance is computed
 * on the geography cast so it's true metres. Defaults to publicly-visible statuses.
 */
export const businessesWithinRadius = async (
  payload: Payload,
  args: {
    cityId: string
    center: [number, number] // [lng, lat]
    radiusM: number
    statuses?: string[]
    limit?: number
  },
): Promise<GeoHit[]> => {
  const { cityId, center, radiusM, statuses = PUBLIC_STATUSES, limit = 500 } = args
  const [lng, lat] = center
  const res = await payload.db.drizzle.execute(sql`
    SELECT id::text AS id,
           ST_Distance(
             location::geography,
             ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
           ) AS distance_m
    FROM businesses
    WHERE city_id = ${cityId}::uuid
      AND location IS NOT NULL
      AND status::text IN (${statusInList(statuses)})
      AND ST_DWithin(
            location::geography,
            ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
            ${radiusM}
          )
    ORDER BY distance_m ASC
    LIMIT ${limit}
  `)
  return rowsOf(res).map((r) => ({ id: String(r.id), distanceM: Number(r.distance_m) }))
}

/**
 * Businesses whose point falls inside a map viewport (FR22/FR24) via ST_MakeEnvelope. Returns
 * ids only (the map/list decides ordering). Defaults to publicly-visible statuses.
 */
export const businessesInBounds = async (
  payload: Payload,
  args: { cityId: string; bounds: MapBounds; statuses?: string[]; limit?: number },
): Promise<GeoHit[]> => {
  const { cityId, bounds, statuses = PUBLIC_STATUSES, limit = 1000 } = args
  const { minLng, minLat, maxLng, maxLat } = bounds
  const res = await payload.db.drizzle.execute(sql`
    SELECT id::text AS id
    FROM businesses
    WHERE city_id = ${cityId}::uuid
      AND location IS NOT NULL
      AND status::text IN (${statusInList(statuses)})
      AND ST_Intersects(
            location,
            ST_MakeEnvelope(${minLng}, ${minLat}, ${maxLng}, ${maxLat}, 4326)
          )
    LIMIT ${limit}
  `)
  return rowsOf(res).map((r) => ({ id: String(r.id) }))
}
