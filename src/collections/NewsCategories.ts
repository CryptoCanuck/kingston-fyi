import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'
import { cityScoped } from '../access/cityScoped'
import { cityField } from '../fields/cityField'
import { slugField } from '../fields/slugField'

// News categories (FR4) — each carries its editorial `--tag-*` colour (UX-DR).
export const NewsCategories: CollectionConfig = {
  slug: 'news-categories',
  labels: { singular: 'News Category', plural: 'News Categories' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'slug', 'color'], group: 'Taxonomy' },
  access: {
    read: cityScoped(),
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField(),
    {
      name: 'color',
      type: 'text',
      required: true,
      admin: { description: 'Editorial tag colour (hex), e.g. #2f6d6a.' },
    },
    cityField(),
  ],
}
