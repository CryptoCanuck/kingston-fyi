// NewsArticle JSON-LD adapter (FR11, NFR1). Maps an article document to a schema.org
// NewsArticle via lib/seo/jsonld.

import { type JsonLd, buildNewsArticle } from './jsonld'

export interface ArticleJsonLdSource {
  title: string
  /** Site-relative canonical path to the article. */
  path: string
  dek?: string | null
  byline?: string | null
  publishedAt?: string | null
  updatedAt?: string | null
  imageUrls?: string[]
}

export const buildArticleJsonLd = (source: ArticleJsonLdSource): JsonLd =>
  buildNewsArticle({
    headline: source.title,
    path: source.path,
    description: source.dek ?? undefined,
    datePublished: source.publishedAt ?? undefined,
    dateModified: source.updatedAt ?? undefined,
    authorName: source.byline ?? undefined,
    imageUrls: source.imageUrls,
  })
