import React from 'react'

import { Ph, Icon } from '@/components/ui'

export interface GalleryPhoto {
  url?: string | null
  alt?: string | null
}

const HUES = ['ph-a', 'ph-c', 'ph-b', 'ph-e', 'ph-f'] as const

/**
 * Photo-gallery mosaic for the detail header (FR27, UX-DR12): one large lead image plus four
 * thumbnails. Real uploads render as <img>; empty slots fall back to limestone placeholders so
 * the 5-cell grid never collapses. The lead image loads eagerly (it's the LCP element); the
 * rest are lazy. Extra photos beyond five surface as a "+N photos" overlay on the last cell.
 */
export const BusinessGallery = ({
  photos,
  name,
}: {
  photos: GalleryPhoto[]
  name: string
}) => {
  const usable = photos.filter((p) => p?.url)
  const cells = Array.from({ length: 5 }, (_, i) => usable[i])
  const extra = Math.max(0, usable.length - 5)

  const cell = (photo: GalleryPhoto | undefined, i: number, isLast: boolean) => {
    const inner = photo?.url ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photo.url}
        alt={photo.alt ?? `${name} photo ${i + 1}`}
        loading={i === 0 ? 'eager' : 'lazy'}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    ) : (
      <Ph hue={HUES[i % HUES.length]} height="100%" icon={i === 0 ? 'pin' : undefined} />
    )
    return (
      <div
        key={i}
        style={{
          position: 'relative',
          ...(i === 0 ? { gridRow: '1 / span 2' } : null),
        }}
      >
        {inner}
        {isLast && extra > 0 && (
          <span
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(16,24,30,.55)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7,
            }}
          >
            <Icon name="grid" size={16} /> +{extra} photos
          </span>
        )}
      </div>
    )
  }

  return (
    <div
      className="kf-gallery"
      style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: 8,
        height: 340,
        borderRadius: 'var(--r)',
        overflow: 'hidden',
      }}
    >
      {cells.map((p, i) => cell(p, i, i === 4))}
    </div>
  )
}
