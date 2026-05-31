import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

// Cities are the tenant boundary (FR5 / NFR7). Every content entity is scoped to a
// city via `cityField`. Cities themselves are NOT city-scoped — they are the tenants.
export const Cities: CollectionConfig = {
  slug: 'cities',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'timezone'],
    group: 'Configuration',
  },
  access: {
    // Cities must be readable by anyone so hostname→city resolution works for public reads.
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'URL-safe identifier, e.g. "kingston".' },
    },
    {
      name: 'hostnames',
      type: 'array',
      required: true,
      labels: { singular: 'Hostname', plural: 'Hostnames' },
      admin: {
        description:
          'Hostnames that resolve to this city (e.g. kingston.fyi, www.kingston.fyi, localhost). Case-insensitive, port-stripped.',
      },
      fields: [
        {
          name: 'hostname',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'timezone',
      type: 'text',
      required: true,
      defaultValue: 'America/Toronto',
      admin: { description: 'IANA timezone, e.g. America/Toronto.' },
    },
  ],
}
