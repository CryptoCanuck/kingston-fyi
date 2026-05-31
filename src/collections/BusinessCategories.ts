import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'
import { cityScoped } from '../access/cityScoped'
import { cityField } from '../fields/cityField'
import { slugField } from '../fields/slugField'

// Two-level business category hierarchy (FR4): parent (e.g. "Food & Drink") → leaf
// (e.g. "Coffee Shop"). The parent/breadcrumbs fields are injected by nestedDocsPlugin
// (configured in payload.config.ts) so the hierarchy is editable in the admin.
export const BusinessCategories: CollectionConfig = {
  slug: 'business-categories',
  labels: { singular: 'Business Category', plural: 'Business Categories' },
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
