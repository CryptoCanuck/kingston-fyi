import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'
import { cityScoped } from '../access/cityScoped'
import { cityField } from '../fields/cityField'
import { slugField } from '../fields/slugField'

// Event categories (FR4): Music, Food, Family, Arts, Sports.
export const EventCategories: CollectionConfig = {
  slug: 'event-categories',
  labels: { singular: 'Event Category', plural: 'Event Categories' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'slug'], group: 'Taxonomy' },
  access: {
    read: cityScoped(),
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField(),
    cityField(),
  ],
}
