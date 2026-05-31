import type { CollectionConfig } from 'payload'

import type { User } from '../payload-types'
import { isAdmin, isAdminFieldLevel, isAdminUser } from '../access/isAdmin'
import { isAdminOrSelf } from '../access/isAdminOrSelf'

// Roles (FR48/FR49):
// - admin / operator → staff the Payload admin (content, moderation, config)
// - business-owner   → claim & manage their listing(s); NO admin-panel access
// Residents browse and submit without any account.
export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'roles'],
    group: 'Configuration',
  },
  auth: true,
  access: {
    // Only admins/operators may enter the Payload admin panel.
    admin: ({ req }) => isAdminUser(req.user as User | null | undefined),
    create: isAdmin,
    read: isAdminOrSelf,
    update: isAdminOrSelf,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      // The very first user bootstrapped into an empty system becomes an admin,
      // so a fresh install always has a way into the admin panel.
      async ({ req, operation, data }) => {
        if (operation === 'create') {
          const { totalDocs } = await req.payload.count({ collection: 'users' })
          if (totalDocs === 0) {
            return { ...data, roles: ['admin'] }
          }
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['business-owner'],
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Operator', value: 'operator' },
        { label: 'Business Owner', value: 'business-owner' },
      ],
      access: {
        // Only admins can grant/alter roles (prevents privilege escalation).
        create: isAdminFieldLevel,
        update: isAdminFieldLevel,
      },
      admin: {
        description: 'admin/operator staff the CMS; business-owner manages claimed listings only.',
      },
    },
  ],
}
