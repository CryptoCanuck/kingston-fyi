// Cache tag conventions (Story 1.5 / architecture revalidation strategy).
// RSC reads tag their fetches with these; mutations revalidate them.

export type Pillar = 'news' | 'events' | 'directory' | 'shared'

/** A single entity, by id: revalidated when that record changes. */
export const entityTag = (id: string): string => `entity:${id}`

/** A pillar list for a city: revalidated when any member changes. */
export const listTag = (cityId: string, pillar: Pillar): string => `list:${cityId}:${pillar}`

/** Cross-link rails referencing an entity: revalidated when the entity changes. */
export const crossTag = (id: string): string => `cross:${id}`
