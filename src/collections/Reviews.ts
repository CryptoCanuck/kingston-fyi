import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'
import { cityScoped, cityScopedListFilter } from '../access/cityScoped'
import { published } from '../access/published'
import { andAccess } from '../access/combine'
import { cityField } from '../fields/cityField'
import { statusField } from '../fields/statusField'
import { provenanceField } from '../fields/provenance'
import { crossLinkCityInvariant } from '../hooks/crossLinkCityInvariant'
import { recomputeBusinessRatingHooks } from '../hooks/recomputeBusinessRating'

const ratingHooks = recomputeBusinessRatingHooks()

/**
 * Reviews — sourced/imported ratings for directory listings (FR61, Story 2.3). At MVP these
 * are imported display data (e.g. from the seeding pipeline), NOT public user submissions —
 * native reviews are Phase 2 (FR50). Each review's provenance group is its source label.
 *
 * Status defaults to `published` because these are operator-imported (not public
 * submissions), so they display by default; an operator can still unpublish a problem
 * review, which drops it from both the listing and the derived rating.
 */
export const Reviews: CollectionConfig = {
  slug: 'reviews',
  labels: { singular: 'Review', plural: 'Reviews' },
  admin: {
    useAsTitle: 'author',
    defaultColumns: ['author', 'rating', 'business', 'status'],
    group: 'Directory',
    baseListFilter: cityScopedListFilter(),
  },
  access: {
    read: andAccess(cityScoped(), published()),
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeValidate: [crossLinkCityInvariant([{ field: 'business', relationTo: 'businesses' }])],
    afterChange: ratingHooks.afterChange,
    afterDelete: ratingHooks.afterDelete,
  },
  fields: [
    { name: 'author', type: 'text', admin: { description: 'Reviewer display name from the source.' } },
    {
      name: 'rating',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
      admin: { description: 'Star rating, 1–5.' },
    },
    { name: 'reviewDate', type: 'date', label: 'Date' },
    { name: 'text', type: 'textarea' },
    {
      name: 'business',
      type: 'relationship',
      relationTo: 'businesses',
      required: true,
      index: true,
    },
    // Provenance group doubles as the per-review source label (e.g. google-places).
    provenanceField(),
    statusField('published'),
    cityField(),
  ],
}
