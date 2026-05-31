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
import { geocodeMissingLocation } from '../hooks/geocodeBusiness'
import { revalidateHooks } from '../hooks/revalidate'

const eventsRevalidate = revalidateHooks('events')

/**
 * Events — the second pillar (Epic 3, FR13–FR19). Every event cross-links to its venue (a
 * business) when known, and ALWAYS resolves to a location for the map and Event JSON-LD: it
 * inherits the venue's coordinates, or carries its own address + point as a fallback (FR62).
 *
 * Reads are city-scoped (NFR7) AND moderation-gated (NFR4) like the directory: the public
 * sees only approved/published events in the active city; staff bypass the gate. Aggregated
 * events (Story 3.5) land as draft/pending — never auto-published.
 */
export const Events: CollectionConfig = {
  slug: 'events',
  labels: { singular: 'Event', plural: 'Events' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'startsAt', 'venue', 'status'],
    group: 'Events',
    baseListFilter: cityScopedListFilter(),
  },
  access: {
    read: andAccess(cityScoped(), published()),
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    // Venue / category / neighbourhood must all share the event's city (FR55, NFR7).
    beforeValidate: [
      crossLinkCityInvariant([
        { field: 'venue', relationTo: 'businesses' },
        { field: 'category', relationTo: 'event-categories' },
        { field: 'neighbourhood', relationTo: 'neighbourhoods' },
      ]),
    ],
    // Backfill own coordinates from the event address when there's no venue + no point (FR62),
    // then bounce edits to already-public events back to pending review (NFR4).
    beforeChange: [geocodeMissingLocation(), reModerateOnEdit()],
    afterChange: eventsRevalidate.afterChange,
    afterDelete: eventsRevalidate.afterDelete,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    {
      name: 'blurb',
      type: 'textarea',
      admin: { description: 'Short one-line summary shown on cards and in search results.' },
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Details',
      admin: { description: 'Longer event details for the detail page.' },
    },
    // Canonical machine datetimes drive bucketing, the calendar, and JSON-LD start/endDate.
    {
      type: 'row',
      fields: [
        {
          name: 'startsAt',
          type: 'date',
          required: true,
          index: true,
          admin: { date: { pickerAppearance: 'dayAndTime' }, description: 'Start date & time.' },
        },
        {
          name: 'endsAt',
          type: 'date',
          admin: { date: { pickerAppearance: 'dayAndTime' }, description: 'End date & time (optional).' },
        },
      ],
    },
    // Optional human-friendly display overrides (e.g. "Sat, June 14" / "Doors 7 PM").
    {
      type: 'row',
      fields: [
        { name: 'displayDate', type: 'text', admin: { description: 'Display date override (optional).' } },
        { name: 'displayTime', type: 'text', admin: { description: 'Display time override (optional).' } },
      ],
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'event-categories',
      hasMany: false,
      index: true,
    },
    {
      name: 'neighbourhood',
      type: 'relationship',
      relationTo: 'neighbourhoods',
      hasMany: false,
      index: true,
    },
    // Price + free/paid flag (FR13). `priceText` is the human display ("$15", "$10–$20",
    // "PWYC"); `isFree` is the structured flag the Free/Paid filter (FR16) keys off.
    {
      type: 'row',
      fields: [
        { name: 'isFree', type: 'checkbox', defaultValue: false, label: 'Free event' },
        {
          name: 'priceText',
          type: 'text',
          admin: {
            description: 'Display price (e.g. "$15", "$10–$20"). Ignored when "Free event" is on.',
            condition: (data) => !data?.isFree,
          },
        },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Event image (card + detail hero).' },
    },
    // Nullable venue cross-link (FR38). When set, the event inherits the venue's location and
    // links through to its directory page; the venue's "upcoming events" rail reflects it.
    {
      name: 'venue',
      type: 'relationship',
      relationTo: 'businesses',
      hasMany: false,
      index: true,
      admin: { description: 'Host business/venue. Leave empty for events without a directory venue.' },
    },
    // TODO(Epic 4/6): add `relatedNews` cross-link to the articles collection once News exists
    // (FR38). The bidirectional rails are finalized in Story 6.3.
    //
    // Own-location fallback (FR62): used for map + JSON-LD when there's no venue. Geocoded
    // from the address via MapTiler when coordinates are absent (geocodeMissingLocation).
    {
      name: 'locationName',
      type: 'text',
      admin: { description: 'Place name when there is no venue business (e.g. "Springer Market Square").' },
    },
    {
      name: 'address',
      type: 'group',
      admin: { description: 'Own address — only needed when the event has no venue business.' },
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
    pointField(),
    provenanceField({ defaultSource: 'operator' }),
    statusField(),
    cityField(),
  ],
}
