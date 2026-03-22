'use client'

import { useEffect, useRef } from 'react'
import type { Place } from '@/lib/types'

interface PlaceMapProps {
  latitude: number
  longitude: number
  zoom?: number
  placeName?: string
  className?: string
}

export function PlaceMap({ latitude, longitude, zoom = 15, placeName, className = '' }: PlaceMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    async function initMap() {
      const L = (await import('leaflet')).default
      // @ts-expect-error CSS import for leaflet styles
      await import('leaflet/dist/leaflet.css')

      if (!mapRef.current) return

      const map = L.map(mapRef.current).setView([latitude, longitude], zoom)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      const icon = L.divIcon({
        html: `<div style="background: var(--city-primary); width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        className: '',
      })

      const marker = L.marker([latitude, longitude], { icon }).addTo(map)
      if (placeName) {
        marker.bindPopup(`<strong>${placeName}</strong>`)
      }

      mapInstanceRef.current = map
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove()
        mapInstanceRef.current = null
      }
    }
  }, [latitude, longitude, zoom, placeName])

  return (
    <div
      ref={mapRef}
      className={`rounded-2xl overflow-hidden ${className}`}
      style={{ height: '300px', width: '100%' }}
    />
  )
}
