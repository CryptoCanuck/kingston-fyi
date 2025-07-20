import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Filter } from 'lucide-react';
import { Place, PlaceCategory } from '@/types/models';

const categoryTitles: Record<PlaceCategory | 'nightlife', string> = {
  restaurant: 'Restaurants',
  bar: 'Bars',
  nightclub: 'Nightclubs',
  cafe: 'Cafes',
  bakery: 'Bakeries',
  shopping: 'Shopping',
  attraction: 'Attractions',
  activity: 'Activities',
  service: 'Services',
  nightlife: 'Nightlife'
};

const categoryDescriptions: Record<PlaceCategory | 'nightlife', string> = {
  restaurant: 'Discover the best dining experiences in Kingston',
  bar: 'Find your perfect spot for drinks and good times',
  nightclub: 'Dance the night away at Kingston\'s hottest clubs',
  cafe: 'Cozy coffee shops and cafes for work or relaxation',
  bakery: 'Fresh baked goods and artisan breads',
  shopping: 'Local shops and boutiques for unique finds',
  attraction: 'Must-see destinations and tourist spots',
  activity: 'Fun activities and experiences in Kingston',
  service: 'Essential services for locals and visitors',
  nightlife: 'Bars, clubs, and late-night entertainment'
};

async function getPlacesByCategory(category: string): Promise<Place[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  try {
    const response = await fetch(`${baseUrl}/api/places?category=${category}`, {
      next: { revalidate: 60 } // Cache for 60 seconds
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch places');
    }
    
    const data = await response.json();
    return data.places;
  } catch (error) {
    console.error('Error fetching places:', error);
    return [];
  }
}

export default async function PlaceCategoryPage({
  params
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params;
  
  // Special handling for nightlife which includes bars and nightclubs
  const apiCategory = category === 'nightlife' ? 'bar,nightclub' : category;
  
  // Validate category
  const validCategories = [...Object.keys(categoryTitles)];
  if (!validCategories.includes(category)) {
    notFound();
  }
  
  const places = await getPlacesByCategory(apiCategory);
  const title = categoryTitles[category as PlaceCategory | 'nightlife'];
  const description = categoryDescriptions[category as PlaceCategory | 'nightlife'];
  
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-muted hover:text-indigo-600 dark:hover:text-indigo-400 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-2 text-gradient-indigo-purple mb-2">
                {title}
              </h1>
              <p className="text-lg text-muted">
                {description}
              </p>
            </div>
            
            <button className="btn-outline hidden md:flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
          </div>
        </div>
        
        {/* Results count */}
        <p className="text-muted mb-6">
          Showing {places.length} {places.length === 1 ? 'place' : 'places'}
        </p>
        
        {/* Places Grid */}
        {places.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map((place) => (
              <Link
                key={place.id}
                href={`/places/${place.category}/${place.slug}`}
                className="card card-hover overflow-hidden group"
              >
                {/* Image */}
                <div className="aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={place.images.main}
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">
                      {place.name}
                    </h3>
                    {place.priceRange && (
                      <span className="text-sm text-muted">
                        {place.priceRange}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted mb-3">
                    {place.subcategories.join(', ')}
                  </p>
                  
                  <div className="flex items-center text-sm text-muted">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{place.address.street}</span>
                  </div>
                  
                  {place.rating && (
                    <div className="flex items-center mt-3 text-sm">
                      <span className="text-yellow-500">★</span>
                      <span className="ml-1 font-medium">
                        {place.rating.toFixed(1)}
                      </span>
                      <span className="text-muted ml-1">
                        ({place.reviewCount} reviews)
                      </span>
                    </div>
                  )}
                  
                  {place.featured && (
                    <div className="mt-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
                        Featured
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-muted mb-4">
              No {title.toLowerCase()} found
            </p>
            <p className="text-muted mb-6">
              We&apos;re working on adding more places to this category.
            </p>
            <Link
              href="/add-listing"
              className="btn-primary"
            >
              Add a Listing
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// Generate static params for known categories
export async function generateStaticParams() {
  return [
    { category: 'restaurant' },
    { category: 'bar' },
    { category: 'nightlife' },
    { category: 'cafe' },
    { category: 'shopping' },
    { category: 'attraction' },
    { category: 'activity' },
    { category: 'service' },
  ];
}