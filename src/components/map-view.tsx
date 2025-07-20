"use client";

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Restaurant } from '@/types';

// Fix for default marker icons in Leaflet
interface IconDefault extends L.Icon.Default {
  _getIconUrl?: string;
}
delete (L.Icon.Default.prototype as IconDefault)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

interface MapViewProps {
  restaurants: Restaurant[];
}

export default function MapView({ restaurants }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    // Initialize map
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([44.2312, -76.4816], 13); // Kingston coordinates

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);
    }

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add restaurant markers
    restaurants.forEach(restaurant => {
      const marker = L.marker([restaurant.coordinates.lat, restaurant.coordinates.lng])
        .addTo(mapRef.current!)
        .bindPopup(`
          <div class="p-3 min-w-[200px]">
            <h3 class="font-semibold text-gray-900 mb-1">${restaurant.name}</h3>
            <p class="text-sm text-gray-600 mb-2">${restaurant.cuisine.join(', ')}</p>
            <div class="flex items-center gap-2 text-sm">
              <span class="text-yellow-500">★</span>
              <span>${restaurant.rating}</span>
              <span class="text-gray-400">•</span>
              <span>${restaurant.priceRange}</span>
            </div>
            <a href="/restaurants/${restaurant.slug}" class="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block">
              View Details →
            </a>
          </div>
        `);
      
      markersRef.current.push(marker);
    });

    return () => {
      // Cleanup on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [restaurants]);

  return <div id="map" className="w-full h-full" />;
}