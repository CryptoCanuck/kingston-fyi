import type { Field } from 'payload'

export const slugify = (input: string): string =>
  input
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/**
 * URL-safe slug field. Auto-generates from `sourceField` (default "name") when left
 * blank, normalizes any value the editor types. Indexed for lookups; not globally
 * unique (the same slug may exist in another city/collection).
 */
export const slugField = (sourceField = 'name'): Field => ({
  name: 'slug',
  type: 'text',
  index: true,
  admin: {
    position: 'sidebar',
    description: `Leave blank to derive from ${sourceField}.`,
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (typeof value === 'string' && value.trim().length > 0) return slugify(value)
        const src = data?.[sourceField]
        if (typeof src === 'string' && src.length > 0) return slugify(src)
        return value
      },
    ],
  },
})
