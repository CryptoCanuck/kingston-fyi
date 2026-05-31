// Sourced-rating derivation (FR61, Story 2.3). At MVP, ratings are imported/sourced (no
// native user reviews — that's Phase 2, FR50). A business's displayed rating + count, and
// the detail-page histogram, all derive from the available review records. Everything here
// is null-rating-safe: a business with no reviews yields a null average and sorts gracefully.

/** Minimal review shape needed to summarize (decoupled from generated types). */
export interface RatingLike {
  rating?: number | null
}

export interface ReviewSummary {
  /** Mean rating rounded to 1 decimal, or null when there are no rated reviews. */
  average: number | null
  /** Number of rated reviews contributing to the average. */
  count: number
  /** Counts per star, 5★ → 1★ (index 0 = 5 stars). */
  histogram: [number, number, number, number, number]
}

const EMPTY_SUMMARY: ReviewSummary = {
  average: null,
  count: 0,
  histogram: [0, 0, 0, 0, 0],
}

/**
 * Summarize a set of reviews into a display rating, count, and 5★→1★ histogram. Only
 * reviews with a valid 1–5 rating are counted; anything else is ignored. Returns the
 * null-safe empty summary when there are no usable ratings.
 */
export const summarizeReviews = (reviews: RatingLike[] | null | undefined): ReviewSummary => {
  if (!reviews || reviews.length === 0) return EMPTY_SUMMARY

  const histogram: [number, number, number, number, number] = [0, 0, 0, 0, 0]
  let sum = 0
  let count = 0

  for (const review of reviews) {
    const rating = review?.rating
    if (typeof rating !== 'number' || Number.isNaN(rating)) continue
    const rounded = Math.round(rating)
    if (rounded < 1 || rounded > 5) continue
    histogram[5 - rounded] += 1
    sum += rating
    count += 1
  }

  if (count === 0) return EMPTY_SUMMARY

  return {
    average: Math.round((sum / count) * 10) / 10,
    count,
    histogram,
  }
}
