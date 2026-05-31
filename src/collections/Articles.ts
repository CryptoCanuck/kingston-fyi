import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'
import { cityScoped, cityScopedListFilter } from '../access/cityScoped'
import { published } from '../access/published'
import { andAccess } from '../access/combine'
import { cityField } from '../fields/cityField'
import { slugField } from '../fields/slugField'
import { statusField } from '../fields/statusField'
import { provenanceField } from '../fields/provenance'
import { crossLinkCityInvariant } from '../hooks/crossLinkCityInvariant'
import { reModerateOnEdit } from '../hooks/moderationState'
import { revalidateHooks } from '../hooks/revalidate'
import { computeReadTime } from '../hooks/readTime'

const newsRevalidate = revalidateHooks('news')

/**
 * Articles — the Local News pillar (Epic 4, FR7–FR12). Free, no-paywall local journalism,
 * cross-linked to the events and businesses each story mentions, and emitting NewsArticle
 * JSON-LD via `lib/seo`. Aggregated drafts (Story 4.4) are summarized from primary sources —
 * never auto-published (NFR4) and never republished competitor copy (NFR5).
 *
 * Reads are city-scoped (NFR7) AND moderation-gated (NFR4): the public sees only
 * approved/published articles in the active city; staff bypass the gate.
 */
export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: { singular: 'Article', plural: 'Articles' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', 'status'],
    group: 'News',
    baseListFilter: cityScopedListFilter(),
  },
  access: {
    read: andAccess(cityScoped(), published()),
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    // Cross-links (related events, mentioned businesses) and category must share the city.
    beforeValidate: [
      crossLinkCityInvariant([
        { field: 'category', relationTo: 'news-categories' },
        { field: 'relatedEvents', relationTo: 'events' },
        { field: 'mentionedBusinesses', relationTo: 'businesses' },
      ]),
    ],
    // Derive read-time from the body when unset, then re-moderate edits to public articles.
    beforeChange: [computeReadTime(), reModerateOnEdit()],
    afterChange: newsRevalidate.afterChange,
    afterDelete: newsRevalidate.afterDelete,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField('title'),
    {
      name: 'dek',
      type: 'textarea',
      label: 'Dek / standfirst',
      admin: { description: 'Short summary shown under the headline and on cards.' },
    },
    {
      name: 'body',
      type: 'richText',
      admin: { description: 'Article body.' },
    },
    {
      type: 'row',
      fields: [
        { name: 'byline', type: 'text', admin: { description: 'Author / byline.' } },
        {
          name: 'publishedAt',
          type: 'date',
          index: true,
          admin: { date: { pickerAppearance: 'dayAndTime' }, description: 'Publish date & time.' },
        },
      ],
    },
    {
      name: 'readTime',
      type: 'number',
      min: 1,
      admin: { position: 'sidebar', description: 'Estimated read time in minutes (auto-derived from the body when blank).' },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'news-categories',
      hasMany: false,
      index: true,
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Lead image (card + article hero).' },
    },
    // Cross-link rails (FR38): the events and businesses this story is about.
    {
      name: 'relatedEvents',
      type: 'relationship',
      relationTo: 'events',
      hasMany: true,
      admin: { description: 'Events this article is about.' },
    },
    {
      name: 'mentionedBusinesses',
      type: 'relationship',
      relationTo: 'businesses',
      hasMany: true,
      admin: { description: 'Businesses this article mentions.' },
    },
    // Source attribution for aggregated drafts (FR12/NFR5) — never republished competitor copy.
    {
      name: 'sourceUrl',
      type: 'text',
      admin: { position: 'sidebar', description: 'Primary source URL (for aggregated drafts).' },
    },
    provenanceField({ defaultSource: 'operator' }),
    statusField(),
    cityField(),
  ],
}
