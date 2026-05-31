// Staleness predicate for seeded listings (FR58). A Google-Places-sourced listing must be
// re-fetched on cadence (it's never a frozen copy); when its source data ages past the
// threshold the check-staleness job marks it `stale-unverified` so the UI can signal it.

export const STALE_AFTER_DAYS = 30

/**
 * Is a listing's source data stale as of `now`? A never-refreshed listing (no timestamp,
 * or an unparseable one) counts as stale.
 */
export const isStale = (
  lastRefreshedAt: string | Date | null | undefined,
  now: Date,
  days: number = STALE_AFTER_DAYS,
): boolean => {
  if (!lastRefreshedAt) return true
  const last = new Date(lastRefreshedAt).getTime()
  if (Number.isNaN(last)) return true
  return now.getTime() - last > days * 24 * 60 * 60 * 1000
}
