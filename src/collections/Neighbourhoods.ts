import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'
import { cityScoped } from '../access/cityScoped'
import { cityField } from '../fields/cityField'
import { slugField } from '../fields/slugField'

// Shared neighbourhood facet (FR4), used by Events + Businesses.
export const Neighbourhoods: CollectionConfig = {
  slug: 'neighbourhoods',
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
