import type { Metadata } from 'next'

// Centralized metadata helper (FR6, NFR1). Every page derives its Next `Metadata`
// from this one place so titles, descriptions, and canonical URLs stay consistent.
// Pages pass only their specifics; site defaults + canonical are filled in here.

/** Public origin for absolute canonical URLs. Falls back to localhost in dev. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'
).replace(/\/$/, '')

/** Site-wide defaults — the single source of truth for branding strings. */
export const SITE_NAME = 'Kingston.FYI'
export const SITE_DESCRIPTION =
  'Kingston.FYI — hyperlocal news, events, and business directory for Kingston, ON.'

/** Title template: page titles render as "Page Title · Kingston.FYI". */
const TITLE_TEMPLATE = `%s · ${SITE_NAME}`

export interface BuildMetadataInput {
  /** Page-specific title. Omit for the bare site title (home). */
  title?: string
  /** Page-specific description. Defaults to the site description. */
  description?: string
  /**
   * Path (with leading slash) for the canonical URL, e.g. `/news`. The origin is
   * prepended from NEXT_PUBLIC_SERVER_URL. Omit on the root layout (no canonical).
   */
  path?: string
  /**
   * Crawl-control: when true, emit `robots: noindex, follow`. Later epics use this to
   * gate thin/unclaimed listings and filter/facet URLs (NFR1).
   */
  noindex?: boolean
  /** Extra OpenGraph fields merged onto the defaults (later epics pass images, type). */
  openGraph?: Metadata['openGraph']
}

/** Build an absolute canonical URL from a path. */
export const canonicalUrl = (path?: string): string => {
  if (!path) return SITE_URL
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * Produce Next `Metadata` from page specifics + site defaults. This is the ONLY place
 * pages should construct metadata (no per-feature ad-hoc metadata — architecture rule).
 */
export const buildMetadata = (input: BuildMetadataInput = {}): Metadata => {
  const { title, description, path, noindex, openGraph } = input
  const resolvedDescription = description ?? SITE_DESCRIPTION
  const canonical = path !== undefined ? canonicalUrl(path) : undefined

  const metadata: Metadata = {
    title: title ?? SITE_NAME,
    description: resolvedDescription,
    openGraph: {
      siteName: SITE_NAME,
      title: title ? `${title} · ${SITE_NAME}` : SITE_NAME,
      description: resolvedDescription,
      type: 'website',
      ...(canonical ? { url: canonical } : {}),
      ...openGraph,
    },
  }

  if (canonical) {
    metadata.alternates = { canonical }
  }

  if (noindex) {
    metadata.robots = { index: false, follow: true }
  }

  return metadata
}

/**
 * Site-wide root metadata for the frontend layout. Sets the title template so child
 * pages' `title` strings compose as "Title · Kingston.FYI", the default description,
 * and `metadataBase` so relative OG/canonical URLs resolve absolutely.
 */
export const rootMetadata = (): Metadata => ({
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: TITLE_TEMPLATE,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    type: 'website',
    url: SITE_URL,
  },
})
