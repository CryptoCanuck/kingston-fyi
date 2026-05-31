import type { RelationshipField } from 'payload'

type CityFieldOptions = {
  /** Whether a city is required on this collection. Defaults to true (NFR7). */
  required?: boolean
  /** Override admin display position. Defaults to the sidebar. */
  sidebar?: boolean
}

// Reusable city relationship for every content collection (FR5 / NFR7).
// Indexed for fast city-scoped queries; lives in the sidebar by default.
export const cityField = (options: CityFieldOptions = {}): RelationshipField => {
  const { required = true, sidebar = true } = options
  return {
    name: 'city',
    type: 'relationship',
    relationTo: 'cities',
    required,
    index: true,
    admin: {
      position: sidebar ? 'sidebar' : undefined,
      description: 'The city this record belongs to. Enforced by cityScoped() access.',
    },
  }
}
