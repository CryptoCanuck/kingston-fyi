'use client'

import dynamic from 'next/dynamic'
import React from 'react'

import { Icon } from '@/components/ui'
import type { MapPin } from './DirectoryMapImpl'

export type { MapPin }

const Fallback = ({ label }: { label: string }) => (
  <div className="kf-dir-map-fallback">
    <Icon name="map" size={30} stroke={1.4} />
    <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
  </div>
)

// MapLibre's WebGL bundle is heavy and client-only; load it lazily and never on the server so
// it stays off the initial JS / LCP path (NFR2). The .kf-dir-map cell reserves the space, so
// swapping the loader for the canvas causes no layout shift (NFR2 — CLS).
const DirectoryMapImpl = dynamic(() => import('./DirectoryMapImpl'), {
  ssr: false,
  loading: () => <Fallback label="Loading map…" />,
})

export const DirectoryMap = ({ pins }: { pins: MapPin[] }) => {
  if (!process.env.NEXT_PUBLIC_MAPTILER_KEY) {
    return <Fallback label="Map unavailable" />
  }
  return <DirectoryMapImpl pins={pins} />
}
