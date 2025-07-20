"use client";

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { Place, Event, PlaceCategory } from '@/types/models';
import { MapControls } from './map-controls';

// Category icon mapping
const categoryIcons: Record<PlaceCategory, string> = {
  restaurant: '🍽️',
  bar: '🍷',
  nightclub: '🎭',
  cafe: '☕',
  bakery: '🥐',
  shopping: '🛍️',
  attraction: '📸',
  activity: '🎯',
  service: '🏢'
};

// Category colors
const categoryColors: Record<PlaceCategory, string> = {
  restaurant: '#6366f1', // indigo
  bar: '#a855f7',        // purple
  nightclub: '#8b5cf6',  // violet
  cafe: '#f59e0b',       // amber
  bakery: '#f97316',     // orange
  shopping: '#ec4899',   // pink
  attraction: '#3b82f6', // blue
  activity: '#10b981',   // green
  service: '#6b7280'     // gray
};

interface InteractiveMapProps {
  places: Place[];
  events: Event[];
  loading: boolean;
}

// Custom marker creation
function createCustomMarker(place: Place) {
  const icon = categoryIcons[place.category] || '📍';
  const color = categoryColors[place.category] || '#6b7280';
  
  return L.divIcon({
    html: `
      <div class="custom-marker" style="background-color: ${color};">
        <span class="marker-icon">${icon}</span>
        ${place.featured ? '<div class="marker-badge">★</div>' : ''}
      </div>
    `,
    className: 'custom-marker-container',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
}

function createEventMarker() {
  return L.divIcon({
    html: `
      <div class="event-marker">
        <span class="event-icon">📅</span>
      </div>
    `,
    className: 'event-marker-container',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
}

function createCustomPopup(place: Place) {
  const rating = place.rating ? `
    <div class="flex items-center mt-2 text-sm">
      <span class="text-yellow-500">★</span>
      <span class="ml-1 font-medium">${place.rating.toFixed(1)}</span>
      <span class="text-gray-500 ml-1">(${place.reviewCount} reviews)</span>
    </div>
  ` : '';

  const priceRange = place.priceRange ? `
    <span class="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs font-medium">
      ${place.priceRange}
    </span>
  ` : '';

  return `
    <div class="custom-popup">
      <div class="popup-header">
        <img src="${place.images.main}" alt="${place.name}" class="popup-image" />
        <div class="popup-content">
          <h3 class="popup-title">${place.name}</h3>
          <p class="popup-category">${place.subcategories.join(' • ')}</p>
          ${rating}
          <div class="popup-meta">
            <div class="popup-address">
              📍 ${place.address.street}
            </div>
            ${priceRange}
          </div>
          <div class="popup-actions">
            <a href="/places/${place.category}/${place.slug}" class="popup-button">
              View Details
            </a>
            ${place.contact.phone ? `<a href="tel:${place.contact.phone}" class="popup-button-secondary">Call</a>` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}

function createEventPopup(eventData: Event) {
  const eventDate = new Date(eventData.startDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return `
    <div class="custom-popup event-popup">
      <div class="popup-header">
        <img src="${eventData.images.main}" alt="${eventData.title}" class="popup-image" />
        <div class="popup-content">
          <h3 class="popup-title">${eventData.title}</h3>
          <p class="popup-category">${eventData.category}</p>
          <div class="popup-meta">
            <div class="popup-date">📅 ${eventDate} at ${eventData.startTime}</div>
            <div class="popup-location">📍 ${eventData.location.name}</div>
            ${eventData.ticketInfo ? `<div class="popup-price">💰 $${eventData.ticketInfo.price}</div>` : ''}
          </div>
          <div class="popup-actions">
            <a href="/events/${eventData.slug}" class="popup-button">
              View Event
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}

export default function InteractiveMap({ places, events, loading }: InteractiveMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.MarkerClusterGroup | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapStyle, setMapStyle] = useState('default');

  useEffect(() => {
    console.log('Map useEffect running, container ref:', mapContainerRef.current);
    
    // Add custom styles
    if (!document.getElementById('map-custom-styles')) {
      const style = document.createElement('style');
      style.id = 'map-custom-styles';
      style.textContent = `
        .custom-marker-container {
          background: transparent !important;
          border: none !important;
        }
        
        .custom-marker {
          width: 40px;
          height: 40px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border: 3px solid white;
          position: relative;
        }
        
        .marker-icon {
          transform: rotate(45deg);
          font-size: 16px;
          filter: brightness(0) invert(1);
        }
        
        .marker-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #fbbf24;
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
          transform: rotate(45deg);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .event-marker-container {
          background: transparent !important;
          border: none !important;
        }
        
        .event-marker {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #8b5cf6, #a855f7);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
          border: 2px solid white;
          transform: rotate(45deg);
        }
        
        .event-icon {
          transform: rotate(-45deg);
          font-size: 14px;
        }
        
        .custom-popup {
          min-width: 280px !important;
          font-family: system-ui, -apple-system, sans-serif;
        }
        
        .popup-header {
          display: flex;
          gap: 12px;
        }
        
        .popup-image {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
          flex-shrink: 0;
        }
        
        .popup-content {
          flex: 1;
          min-width: 0;
        }
        
        .popup-title {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 4px 0;
          line-height: 1.2;
        }
        
        .popup-category {
          font-size: 12px;
          color: #6b7280;
          margin: 0 0 8px 0;
        }
        
        .popup-meta {
          margin: 8px 0;
        }
        
        .popup-address, .popup-date, .popup-location, .popup-price {
          font-size: 12px;
          color: #6b7280;
          margin: 2px 0;
        }
        
        .popup-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }
        
        .popup-button {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s;
        }
        
        .popup-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
        
        .popup-button-secondary {
          background: #f3f4f6;
          color: #374151;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          text-decoration: none;
          border: 1px solid #d1d5db;
        }
        
        .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15) !important;
          border: 1px solid rgba(0, 0, 0, 0.05) !important;
        }
        
        .leaflet-popup-tip {
          box-shadow: none !important;
          border: 1px solid rgba(0, 0, 0, 0.05) !important;
        }
        
        .marker-cluster {
          background: rgba(99, 102, 241, 0.1) !important;
          border: 3px solid #6366f1 !important;
          border-radius: 50% !important;
          color: #6366f1 !important;
          font-weight: 600 !important;
          backdrop-filter: blur(8px) !important;
        }
        
        .marker-cluster div {
          background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
          border-radius: 50% !important;
          color: white !important;
          font-weight: 600 !important;
          font-size: 12px !important;
        }
        
        .user-location-container {
          background: transparent !important;
          border: none !important;
        }
        
        .user-location-marker {
          width: 30px;
          height: 30px;
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
          border: 3px solid white;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
      `;
      document.head.appendChild(style);
    }

    // Initialize map
    if (!mapRef.current && mapContainerRef.current) {
      console.log('Initializing Leaflet map...');
      try {
        mapRef.current = L.map(mapContainerRef.current, {
          center: [44.2312, -76.4816], // Kingston coordinates
          zoom: 13,
          zoomControl: false,
          attributionControl: false
        });
        console.log('Map initialized successfully:', mapRef.current);
      } catch (error) {
        console.error('Error initializing map:', error);
        return;
      }

      // Add default tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);

      // Don't add default zoom control since we have custom ones
      
      // Initialize marker cluster group
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        markersRef.current = (L as any).markerClusterGroup({
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true,
          maxClusterRadius: 50,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          iconCreateFunction: function(cluster: any) {
            return L.divIcon({
              html: `<div><span>${cluster.getChildCount()}</span></div>`,
              className: 'marker-cluster',
              iconSize: [40, 40]
            });
          }
        });
        console.log('Marker cluster group created');
      } catch (error) {
        console.error('Error creating marker cluster group:', error);
        // Fallback to regular layer group
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        markersRef.current = L.layerGroup() as any;
      }

      mapRef.current.addLayer(markersRef.current);
      setMapReady(true);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = null;
        setMapReady(false);
      }
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !markersRef.current) return;

    // Clear existing markers
    markersRef.current.clearLayers();

    // Add place markers
    places.forEach(place => {
      const marker = L.marker(
        [place.location.lat, place.location.lng],
        { icon: createCustomMarker(place) }
      ).bindPopup(createCustomPopup(place), {
        maxWidth: 320,
        className: 'custom-popup-wrapper'
      });

      markersRef.current!.addLayer(marker);
    });

    // Add event markers
    events.forEach(event => {
      const marker = L.marker(
        [event.location.coordinates.lat, event.location.coordinates.lng],
        { icon: createEventMarker() }
      ).bindPopup(createEventPopup(event), {
        maxWidth: 320,
        className: 'custom-popup-wrapper event-popup-wrapper'
      });

      markersRef.current!.addLayer(marker);
    });

  }, [places, events, mapReady]);

  // Map control handlers
  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  const handleLocate = () => {
    if (mapRef.current && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        mapRef.current!.setView([latitude, longitude], 15);
        
        // Add user location marker
        L.marker([latitude, longitude], {
          icon: L.divIcon({
            html: '<div class="user-location-marker">📍</div>',
            className: 'user-location-container',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          })
        }).addTo(mapRef.current!).bindPopup('Your Location');
      });
    }
  };

  const handleReset = () => {
    if (mapRef.current) {
      mapRef.current.setView([44.2312, -76.4816], 13);
    }
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    // Note: Actual fullscreen implementation would require additional logic
  };

  const handleToggleStyle = () => {
    if (mapRef.current) {
      // Remove current tile layer
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
          mapRef.current!.removeLayer(layer);
        }
      });

      // Add new tile layer based on current style
      let newStyle = 'default';
      if (mapStyle === 'default') {
        // Satellite view
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: '© Esri'
        }).addTo(mapRef.current);
        newStyle = 'satellite';
      } else {
        // Default view
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapRef.current);
        newStyle = 'default';
      }
      setMapStyle(newStyle);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-indigo-200 dark:bg-indigo-800 rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-muted">Loading map data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div 
        ref={mapContainerRef}
        className="w-full h-full rounded-lg overflow-hidden" 
      />
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onLocate={handleLocate}
        onReset={handleReset}
        onFullscreen={handleFullscreen}
        onToggleStyle={handleToggleStyle}
        isFullscreen={isFullscreen}
      />
    </div>
  );
}