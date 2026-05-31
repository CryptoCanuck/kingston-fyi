import type { CollectionBeforeChangeHook } from 'payload'

import { readingTimeMinutes } from '../lib/news/readingTime'

/**
 * Derive an article's read-time (minutes) from its body word count when the operator hasn't
 * set one explicitly (FR7). A manual value is always respected; an empty body leaves it unset.
 */
export const computeReadTime = (): CollectionBeforeChangeHook => {
  return ({ data }) => {
    if (!data) return data
    if (typeof data.readTime === 'number' && data.readTime > 0) return data
    const minutes = readingTimeMinutes(data.body)
    if (minutes) data.readTime = minutes
    return data
  }
}
