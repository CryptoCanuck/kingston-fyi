import type { PointField } from 'payload'

type PointFieldOptions = {
  /** Field name (and DB column). Defaults to `location`. */
  name?: string
  /** Whether coordinates are required. Defaults to false (seeded/manual entries may lack them). */
  required?: boolean
  /** Admin label. Defaults to `Location`. */
  label?: string
}

/**
 * Geospatial point field (FR24, architecture §Geospatial). Payload's `point` type stores
 * `[longitude, latitude]` and the @payloadcms/db-postgres adapter materializes it as a
 * PostGIS `geometry(Point, 4326)` column — the `geometryColumn('point','POINT',4326)` the
 * architecture calls for. A GiST index is added on top via migration so `lib/geo` can run
 * `ST_DWithin` / `ST_MakeEnvelope` for radius / "near me" / map-bounds queries.
 */
export const pointField = (options: PointFieldOptions = {}): PointField => {
  const { name = 'location', required = false, label = 'Location' } = options
  return {
    name,
    type: 'point',
    label,
    required,
    admin: {
      description:
        'Coordinates as [longitude, latitude] (SRID 4326). Stored as a PostGIS geometry(Point,4326); a GiST index powers radius / map-bounds queries.',
    },
  }
}
