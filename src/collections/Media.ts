import type { CollectionConfig } from 'payload'

import { cityField } from '../fields/cityField'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    // Media is city-scoped (NFR7). Optional for now so admin uploads work before a
    // city is chosen; tightened alongside the R2 storage + upload flows in Epic 2.
    cityField({ required: false }),
  ],
  upload: true,
}
