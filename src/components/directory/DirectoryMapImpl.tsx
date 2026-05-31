'use client'

import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

export interface MapPin {
  id: string
  slug?: string | null
  name: string
  lng: number
  lat: number
}

const KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY
const STYLE_URL = `https://api.maptiler.com/maps/streets-v2/style.json?key=${KEY}`
// Downtown Kingston — the framing fallback when there are no pins to fit.
const KINGSTON_CENTER: [number, number] = [-76.4813, 44.2312]

// Teardrop marker matching the design system pin (fill via currentColor so CSS owns the
// active/idle colour). Inner span is what we scale on hover — MapLibre owns the element's
// own transform for positioning, so we must not touch it.
const PIN_SVG =
  '<span class="kf-pin-inner"><svg width="28" height="35" viewBox="0 0 24 30" aria-hidden="true">' +
  '<path d="M12 0a9 9 0 0 0-9 9c0 6.5 9 21 9 21s9-14.5 9-21a9 9 0 0 0-9-9z" fill="currentColor" stroke="#fff" stroke-width="1.4"/>' +
  '<circle cx="12" cy="9" r="3.4" fill="#fff"/></svg></span>'

function createPinEl(pin: MapPin): HTMLButtonElement {
  const el = document.createElement('button')
  el.type = 'button'
  el.className = 'kf-pin'
  el.setAttribute('aria-label', pin.name)
  el.dataset.pinId = pin.id
  el.innerHTML = PIN_SVG
  return el
}

/**
 * Default-exported so the wrapper can `next/dynamic`-load it (ssr: false) — keeps MapLibre's
 * WebGL bundle out of the initial JS (NFR2). Plots one marker per result, frames them in view,
 * and routes to the detail page on pin click. List⇄map hover sync is layered on in a follow-up.
 */
export default function DirectoryMapImpl({ pins }: { pins: MapPin[] }) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])

  // Stable key so the marker effect only re-runs when the result set actually changes.
  const pinsKey = pins.map((p) => p.id).join(',')

  // Initialise the map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: KINGSTON_CENTER,
      zoom: 12.5,
      attributionControl: { compact: true },
    })
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right')
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // (Re)place markers whenever the result set changes, then frame them.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    if (pins.length === 0) {
      map.easeTo({ center: KINGSTON_CENTER, zoom: 12.5 })
      return
    }

    const bounds = new maplibregl.LngLatBounds()
    for (const pin of pins) {
      const el = createPinEl(pin)
      el.addEventListener('click', (e) => {
        e.preventDefault()
        router.push(`/business/${pin.slug ?? pin.id}`)
      })
      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([pin.lng, pin.lat])
        .addTo(map)
      markersRef.current.push(marker)
      bounds.extend([pin.lng, pin.lat])
    }

    if (pins.length === 1) {
      map.easeTo({ center: [pins[0].lng, pins[0].lat], zoom: 15 })
    } else {
      map.fitBounds(bounds, { padding: 56, maxZoom: 15, duration: 400 })
    }
    // pinsKey captures the meaningful change in `pins`; router is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinsKey, router])

  return <div ref={containerRef} className="kf-map-canvas" />
}
