import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Clock, Phone, Globe, Star, Heart, Share2 } from 'lucide-react';
import { Place, OpeningHours } from '@/types/models';

async function getPlaceBySlug(category: string, slug: string): Promise<Place | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  try {
    const response = await fetch(`${baseUrl}/api/places/${slug}`, {
      next: { revalidate: 60 }
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    const place = data.place;
    
    // Verify the place matches the expected category
    if (place.category !== category && category !== 'nightlife') {
      return null;
    }
    
    // Special case for nightlife (includes bars and nightclubs)
    if (category === 'nightlife' && !['bar', 'nightclub'].includes(place.category)) {
      return null;
    }
    
    return place;
  } catch (error) {
    console.error('Error fetching place:', error);
    return null;
  }
}

function formatHours(hours: OpeningHours) {
  if (!hours) return 'Hours not available';
  
  const days: Array<keyof OpeningHours> = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const today = new Date().getDay();
  const todayKey = days[today === 0 ? 6 : today - 1]; // Convert Sunday (0) to Saturday index
  
  const todayHours = hours[todayKey];
  if (!todayHours) return 'Closed today';
  
  return `${todayHours.open} - ${todayHours.close}`;
}

export default async function PlaceDetailPage({
  params
}: {
  params: Promise<{ category: string; slug: string }>
}) {
  const { category, slug } = await params;
  const place = await getPlaceBySlug(category, slug);
  
  if (!place) {
    notFound();
  }
  
  return (
    <div className="min-h-screen">
      {/* Header Image */}
      <div className="relative h-96 bg-gray-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={place.images.main}
          alt={place.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        
        {/* Back Button */}
        <div className="absolute top-8 left-8">
          <Link
            href={`/places/${category}`}
            className="inline-flex items-center px-4 py-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg text-gray-900 dark:text-gray-100 hover:bg-white dark:hover:bg-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {category}
          </Link>
        </div>
        
        {/* Action Buttons */}
        <div className="absolute top-8 right-8 flex space-x-2">
          <button className="p-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg text-gray-900 dark:text-gray-100 hover:bg-white dark:hover:bg-gray-900 transition-colors">
            <Heart className="h-5 w-5" />
          </button>
          <button className="p-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg text-gray-900 dark:text-gray-100 hover:bg-white dark:hover:bg-gray-900 transition-colors">
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="heading-1 mb-2">{place.name}</h1>
                    <p className="text-lg text-muted">
                      {place.subcategories.join(' • ')}
                    </p>
                  </div>
                  {place.priceRange && (
                    <span className="text-2xl font-bold text-muted">
                      {place.priceRange}
                    </span>
                  )}
                </div>
                
                {place.rating && (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      <span className="ml-1 font-semibold text-lg">
                        {place.rating.toFixed(1)}
                      </span>
                      <span className="ml-1 text-muted">
                        ({place.reviewCount} reviews)
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Description */}
              <div className="mb-8">
                <h2 className="heading-3 mb-4">About</h2>
                <p className="text-muted leading-relaxed">
                  {place.description}
                </p>
              </div>
              
              {/* Features & Amenities */}
              {(place.features || place.amenities) && (
                <div className="mb-8">
                  <h2 className="heading-3 mb-4">Features & Amenities</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {place.features && (
                      <div>
                        <h3 className="font-semibold mb-2">Features</h3>
                        <ul className="space-y-1">
                          {place.features.map((feature, index) => (
                            <li key={index} className="text-sm text-muted">
                              • {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {place.amenities && (
                      <div>
                        <h3 className="font-semibold mb-2">Amenities</h3>
                        <ul className="space-y-1">
                          {place.amenities.map((amenity, index) => (
                            <li key={index} className="text-sm text-muted">
                              • {amenity}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="card p-6 space-y-6">
                {/* Location */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Location
                  </h3>
                  <p className="text-sm text-muted mb-2">
                    {place.address.street}
                  </p>
                  <p className="text-sm text-muted">
                    {place.address.city}, {place.address.province} {place.address.postalCode}
                  </p>
                  <button className="mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
                    Get directions
                  </button>
                </div>
                
                {/* Hours */}
                {place.hours && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      Hours
                    </h3>
                    <p className="text-sm text-muted">
                      Today: {formatHours(place.hours)}
                    </p>
                    <button className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
                      View all hours
                    </button>
                  </div>
                )}
                
                {/* Contact */}
                <div>
                  <h3 className="font-semibold mb-3">Contact</h3>
                  <div className="space-y-2">
                    {place.contact.phone && (
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 mr-2 text-muted" />
                        <a 
                          href={`tel:${place.contact.phone}`}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                        >
                          {place.contact.phone}
                        </a>
                      </div>
                    )}
                    {place.contact.website && (
                      <div className="flex items-center text-sm">
                        <Globe className="h-4 w-4 mr-2 text-muted" />
                        <a 
                          href={place.contact.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                        >
                          Visit website
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                
                {place.verified && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      ✓ Verified Business
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}