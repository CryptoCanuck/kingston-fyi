import React from 'react'

import type { JsonLd as JsonLdData } from './jsonld'

interface JsonLdProps {
  /** One JSON-LD node, or several to emit as separate <script> tags. */
  data: JsonLdData | JsonLdData[]
}

/**
 * Server component that renders structured data as <script type="application/ld+json">.
 * The single rendering point for JSON-LD — feed it builder output from `lib/seo/jsonld`.
 *
 * JSON is serialized with `<` escaped to `<` to prevent the closing-tag/script
 * injection class of XSS when embedding JSON in an HTML <script> element.
 */
export const JsonLd: React.FC<JsonLdProps> = ({ data }) => {
  const nodes = Array.isArray(data) ? data : [data]
  return (
    <>
      {nodes.map((node, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(node).replace(/</g, '\\u003c') }}
        />
      ))}
    </>
  )
}
