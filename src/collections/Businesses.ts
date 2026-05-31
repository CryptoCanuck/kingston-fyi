import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'
import { cityScoped, cityScopedListFilter } from '../access/cityScoped'
import { published } from '../access/published'
import { andAccess } from '../access/combine'
import { cityField } from '../fields/cityField'
import { slugField } from '../fields/slugField'
import { statusField } from '../fields/statusField'
import { pointField } from '../fields/pointField'
import { provenanceField } from '../fields/provenance'
import { crossLinkCityInvariant } from '../hooks/crossLinkCityInvariant'
import { reModerateOnEdit } from '../hooks/moderationState'
import { revalidateHooks } from '../hooks/revalidate'

// Days of the week for structured opening hours. Used by Open-Now derivation (Story 2.3),
// computed in America/Toronto.
const WEEKDAYS = [
  { label: 'Monday', value: 'monday' },
  { label: 'Tuesday', value: 'tuesday' },
  { label: 'Wednesday', value: 'wednesday' },
  { label: 'Thursday', value: 'thursday' },
  { label: 'Friday', value: 'friday' },
  { label: 'Saturday', value: 'saturday' },
  { label: 'Sunday', value: 'sunday' },
]

const directoryRevalidate = revalidateHooks('directory')

/**
 * Businesses — the directory centerpiece (Epic 2, FR20–FR29). Carries the full listing
 * data model with geospatial coordinates (PostGIS point) and emits most-specific
 * LocalBusiness JSON-LD via `lib/seo` (never `aggregateRating`).
 *
 * Reads are city-scoped (NFR7) AND moderation-gated (NFR4): the public sees only
 * approved/published listings in the active city; staff bypass the moderation gate.
 * Owner editing of claimed listings lands in Epic 5; for now writes are staff-only.
 */
export const Businesses: CollectionConfig = {
  slug: 'businesses',
  labels: { singular: 'Business', plural: 'Businesses' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'neighbourhood', 'status'],
    group: 'Directory',
    // Keep the admin list city-scoped too (NFR7) so it never leaks across cities.
    baseListFilter: cityScopedListFilter(),
  },
  access: {
    read: andAccess(cityScoped(), published()),
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    // Every relationship endpoint must share the listing's city (FR55, NFR7).
    beforeValidate: [
      crossLinkCityInvariant([
        { field: 'category', relationTo: 'business-categories' },
        { field: 'neighbourhood', relationTo: 'neighbourhoods' },
      ]),
    ],
    // Edits to already-public listings drop back to pending review (FR59 scaffold).
    beforeChange: [reModerateOnEdit()],
    afterChange: directoryRevalidate.afterChange,
    afterDelete: directoryRevalidate.afterDelete,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField(),
    {
      name: 'blurb',
      type: 'textarea',
      admin: { description: 'Short one-line summary shown on cards and in search results.' },
    },
    {
      name: 'description',
      type: 'richText',
      label: 'About',
      admin: { description: 'Longer "About" content for the detail page.' },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'business-categories',
      hasMany: false,
      index: true,
      admin: {
        description: 'The most-specific (leaf) category. The parent is derived from the category hierarchy.',
      },
    },
    {
      name: 'neighbourhood',
      type: 'relationship',
      relationTo: 'neighbourhoods',
      hasMany: false,
      index: true,
    },
    {
      name: 'priceTier',
      type: 'select',
      options: [
        { label: '$', value: '$' },
        { label: '$$', value: '$$' },
        { label: '$$$', value: '$$$' },
        { label: '$$$$', value: '$$$$' },
      ],
      admin: { description: 'Relative price level.' },
    },
    {
      name: 'hours',
      type: 'array',
      label: 'Structured hours',
      labels: { singular: 'Opening interval', plural: 'Opening intervals' },
      admin: {
        description:
          'Structured opening intervals (one row per open period). A day with no row is treated as closed. Open-Now is derived from these in America/Toronto.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'day', type: 'select', required: true, options: WEEKDAYS },
            { name: 'opens', type: 'text', required: true, admin: { description: '24h HH:MM' } },
            { name: 'closes', type: 'text', required: true, admin: { description: '24h HH:MM' } },
          ],
        },
      ],
    },
    {
      name: 'address',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'street', type: 'text' },
            { name: 'locality', type: 'text', defaultValue: 'Kingston' },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'region', type: 'text', defaultValue: 'ON' },
            { name: 'postalCode', type: 'text' },
            { name: 'country', type: 'text', defaultValue: 'CA' },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'phone', type: 'text' },
        { name: 'website', type: 'text', admin: { description: 'Full URL including https://' } },
      ],
    },
    {
      name: 'amenities',
      type: 'text',
      hasMany: true,
      admin: { description: 'Amenity tags (e.g. "patio", "wheelchair accessible", "wifi").' },
    },
    {
      name: 'photos',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      admin: { description: 'Photo gallery (first image is the lead). Stored via the media adapter.' },
    },
    // Sourced/imported display rating + count (FR61). These are for display only and are
    // NEVER emitted as `aggregateRating` JSON-LD (NFR1). The rating histogram + individual
    // reviews come from the reviews collection (Story 2.3).
    {
      type: 'row',
      fields: [
        {
          name: 'rating',
          type: 'number',
          min: 0,
          max: 5,
          admin: { description: 'Sourced display rating (0–5). Never emitted as structured aggregateRating.' },
        },
        {
          name: 'reviewCount',
          type: 'number',
          min: 0,
          admin: { description: 'Sourced review count (display only).' },
        },
      ],
    },
    pointField(),
    provenanceField(),
    statusField(),
    cityField(),
  ],
}
