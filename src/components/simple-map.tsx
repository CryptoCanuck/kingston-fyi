"use client";

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

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

export default function SimpleMap() {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapStyle, setMapStyle] = useState('default');

  useEffect(() => {
    // Add custom map styles
    if (!document.getElementById('map-styles')) {
      const style = document.createElement('style');
      style.id = 'map-styles';
      style.textContent = `
        .leaflet-container {
          font-family: system-ui, -apple-system, sans-serif;
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
        
        .custom-marker {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
          border: 3px solid white;
          cursor: pointer;
        }
        
        .custom-marker::after {
          content: '📍';
          transform: rotate(45deg);
          font-size: 16px;
        }
        
        .map-controls {
          position: absolute;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .map-control-btn {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          padding: 8px;
          cursor: pointer;
          transition: all 0.2s;
          color: #374151;
        }
        
        .map-control-btn:hover {
          background: rgba(255, 255, 255, 1);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
      `;
      document.head.appendChild(style);
    }
    
    if (!mapRef.current && mapContainerRef.current) {
      console.log('Initializing styled map...');
      
      try {
        mapRef.current = L.map(mapContainerRef.current, {
          center: [44.2312, -76.4816],
          zoom: 13,
          zoomControl: false, // We'll add custom controls
          attributionControl: false
        });

        // Add modern CartoDB tile layer for better styling
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '© OpenStreetMap © CARTO',
          subdomains: 'abcd',
          maxZoom: 19
        }).addTo(mapRef.current);

        // Add custom marker with modern styling
        const customIcon = L.divIcon({
          html: '<div class="custom-marker"></div>',
          className: 'custom-marker-container',
          iconSize: [40, 40],
          iconAnchor: [20, 40],
          popupAnchor: [0, -40]
        });

        L.marker([44.2312, -76.4816], { icon: customIcon })
          .addTo(mapRef.current)
          .bindPopup(`
            <div style="font-family: system-ui; padding: 8px;">
              <h3 style="margin: 0 0 8px 0; font-weight: 600; color: #1f2937;">Kingston, Ontario</h3>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">The Limestone City</p>
            </div>
          `);

        // Add attribution in a custom position
        L.control.attribution({
          position: 'bottomleft',
          prefix: false
        }).addTo(mapRef.current);

        console.log('Styled map initialized successfully');
      } catch (error) {
        console.error('Error initializing styled map:', error);
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

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

  const handleReset = () => {
    if (mapRef.current) {
      mapRef.current.setView([44.2312, -76.4816], 13);
    }
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
        // Dark style
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '© OpenStreetMap © CARTO',
          subdomains: 'abcd',
          maxZoom: 19
        }).addTo(mapRef.current);
        newStyle = 'dark';
      } else if (mapStyle === 'dark') {
        // Satellite style
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: '© Esri'
        }).addTo(mapRef.current);
        newStyle = 'satellite';
      } else {
        // Back to default
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '© OpenStreetMap © CARTO',
          subdomains: 'abcd',
          maxZoom: 19
        }).addTo(mapRef.current);
        newStyle = 'default';
      }
      setMapStyle(newStyle);
    }
  };

  return (
    <div className="w-full h-full relative">
      <div 
        ref={mapContainerRef}
        className="w-full h-full rounded-lg overflow-hidden"
        style={{ minHeight: '400px' }}
      />
      
      {/* Custom Map Controls */}
      <div className="map-controls">
        <button onClick={handleZoomIn} className="map-control-btn" title="Zoom In">
          <ZoomIn size={20} />
        </button>
        <button onClick={handleZoomOut} className="map-control-btn" title="Zoom Out">
          <ZoomOut size={20} />
        </button>
        <button onClick={handleReset} className="map-control-btn" title="Reset View">
          <RotateCcw size={20} />
        </button>
        <button onClick={handleToggleStyle} className="map-control-btn" title="Toggle Style">
          <Layers size={20} />
        </button>
      </div>
    </div>
  );
}