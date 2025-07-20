"use client";

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { Filter, Search, MapPin, Layers } from 'lucide-react';
import { Place, Event, PlaceCategory } from '@/types/models';
import 'leaflet/dist/leaflet.css';

// Dynamically import the map component to avoid SSR issues
const InteractiveMap = dynamic(
  () => import('@/components/interactive-map'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-gray-900 dark:to-gray-800 animate-pulse flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-indigo-200 dark:bg-indigo-800 rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-muted">Loading interactive map...</p>
        </div>
      </div>
    )
  }
);

const categoryFilters = [
  { key: 'all', label: 'All Places', color: 'bg-gray-500' },
  { key: 'restaurant', label: 'Restaurants', color: 'bg-indigo-500' },
  { key: 'bar', label: 'Bars', color: 'bg-purple-500' },
  { key: 'cafe', label: 'Cafes', color: 'bg-amber-500' },
  { key: 'attraction', label: 'Attractions', color: 'bg-blue-500' },
  { key: 'activity', label: 'Activities', color: 'bg-green-500' },
  { key: 'shopping', label: 'Shopping', color: 'bg-pink-500' },
];

interface MapData {
  places: Place[];
  events: Event[];
}

export default function MapPage() {
  const [mapData, setMapData] = useState<MapData>({ places: [], events: [] });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'all' | PlaceCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEvents, setShowEvents] = useState(false);

  useEffect(() => {
    async function loadMapData() {
      try {
        const [placesRes, eventsRes] = await Promise.all([
          fetch('/api/places'),
          fetch('/api/events')
        ]);
        
        const placesData = await placesRes.json();
        const eventsData = await eventsRes.json();
        
        setMapData({
          places: placesData.places || [],
          events: eventsData.events || []
        });
      } catch (error) {
        console.error('Error loading map data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadMapData();
  }, []);

  const filteredPlaces = mapData.places.filter(place => {
    const matchesCategory = selectedCategory === 'all' || place.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.subcategories.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const filteredEvents = showEvents ? mapData.events.filter(event => {
    return !searchQuery || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.category.toLowerCase().includes(searchQuery.toLowerCase());
  }) : [];

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="relative z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-2 text-gradient-indigo-purple">
                Kingston Map
              </h1>
              <p className="text-muted">
                Explore {filteredPlaces.length} places {showEvents && `and ${filteredEvents.length} events`} in Kingston
              </p>
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowEvents(!showEvents)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  showEvents 
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' 
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                }`}
              >
                <Layers className="h-4 w-4 mr-2 inline" />
                Events
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
        {/* Map */}
        <div className="absolute inset-0">
          <InteractiveMap 
            places={filteredPlaces}
            events={filteredEvents}
            loading={loading}
          />
        </div>

        {/* Search Bar */}
        <div className="absolute top-6 left-6 right-6 z-[1000] pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search places and events..."
                className="w-full pl-12 pr-4 py-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="absolute top-24 left-6 z-[1000] pointer-events-none">
          <div className="glass-effect rounded-xl p-4 max-w-sm pointer-events-auto">
            <div className="flex items-center mb-3">
              <Filter className="h-4 w-4 mr-2 text-muted" />
              <span className="text-sm font-medium">Filter by Category</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {categoryFilters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setSelectedCategory(filter.key as 'all' | PlaceCategory)}
                  className={`flex items-center px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                    selectedCategory === filter.key
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                      : 'bg-gray-50 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className={`w-2 h-2 ${filter.color} rounded-full mr-2`}></div>
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="absolute bottom-6 left-6 z-[1000] pointer-events-none">
          <div className="glass-effect rounded-xl p-4 pointer-events-auto">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-indigo-500 mr-2" />
                <span className="text-sm font-medium">{filteredPlaces.length}</span>
                <span className="text-xs text-muted ml-1">places</span>
              </div>
              {showEvents && (
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-purple-500 rounded mr-2"></div>
                  <span className="text-sm font-medium">{filteredEvents.length}</span>
                  <span className="text-xs text-muted ml-1">events</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}