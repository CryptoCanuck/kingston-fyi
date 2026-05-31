// Duplicate-detection heuristic (FR58). Pure + testable. The dedup-flag job uses this to
// flag likely-duplicate seeded listings for operator review; the actual merge (preserving
// cross-links) lands in Epic 5. lib/inference can refine borderline pairs when an endpoint
// is configured, but the heuristic stands alone so dedup degrades gracefully without it.

export interface DedupCandidate {
  id: string
  name: string
  /** [longitude, latitude] or null/absent. */
  location?: [number, number] | null
}

export interface DuplicateFlag {
  /** The listing to flag as a likely duplicate. */
  duplicateId: string
  /** The earlier listing it likely duplicates. */
  ofId: string
}

/** Normalize a business name for comparison: lowercase, strip punctuation, collapse spaces. */
export const normalizeName = (name: string): string =>
  name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')

/** Great-circle distance in metres between two [lng,lat] points. */
export const haversineMeters = (a: [number, number], b: [number, number]): number => {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const [lng1, lat1] = a
  const [lng2, lat2] = b
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}

/**
 * Flag likely duplicates. Two listings are likely duplicates when their normalized names
 * match AND (they're within `maxMeters` of each other, OR coordinates are missing on either
 * side). Process in a stable order (e.g. oldest first) so the earlier listing is kept and
 * later ones are flagged.
 */
export const detectDuplicates = (
  items: DedupCandidate[],
  opts: { maxMeters?: number } = {},
): DuplicateFlag[] => {
  const maxMeters = opts.maxMeters ?? 120
  const flags: DuplicateFlag[] = []
  const kept: DedupCandidate[] = []

  for (const item of items) {
    const norm = normalizeName(item.name)
    const match = kept.find((seen) => {
      if (normalizeName(seen.name) !== norm) return false
      if (item.location && seen.location) {
        return haversineMeters(item.location, seen.location) <= maxMeters
      }
      return true // same name, missing coords → treat as a likely duplicate
    })
    if (match) flags.push({ duplicateId: item.id, ofId: match.id })
    else kept.push(item)
  }

  return flags
}
