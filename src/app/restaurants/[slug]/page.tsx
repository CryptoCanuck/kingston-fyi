import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, DollarSign, Globe, Mail, MapPin, Phone, Star } from 'lucide-react';
import { getRestaurantBySlug } from '@/data/mock-restaurants';
import { cn, formatPhoneNumber, formatRating, isRestaurantOpen } from '@/lib/utils';

interface RestaurantPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function RestaurantPage({ params }: RestaurantPageProps) {
  const { slug } = await params;
  const restaurant = getRestaurantBySlug(slug);

  if (!restaurant) {
    notFound();
  }

  const isOpen = isRestaurantOpen(restaurant.hours);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl">
        {/* Back button */}
        <Link
          href="/restaurants"
          className="inline-flex items-center text-muted hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to all restaurants
        </Link>

        {/* Restaurant header */}
        <div className="card mb-8">
          {/* Hero image placeholder */}
          <div className="h-64 bg-gray-200 flex items-center justify-center">
            <MapPin className="h-16 w-16 text-gray-400" />
          </div>

          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
              <div>
                <h1 className="heading-1 mb-2">{restaurant.name}</h1>
                <div className="flex flex-wrap gap-2 mb-3">
                  {restaurant.cuisine.map((cuisine) => (
                    <span key={cuisine} className="text-sm text-muted bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                      {cuisine}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="text-2xl font-bold text-gray-900">{formatRating(restaurant.rating)}</span>
                  </div>
                  <p className="text-sm text-gray-600">{restaurant.reviewCount} reviews</p>
                </div>
                
                <div className="flex items-center">
                  {[...Array(4)].map((_, i) => (
                    <DollarSign
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < restaurant.priceRange.length ? "text-gray-900" : "text-gray-300"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>

            <p className="text-gray-600 mb-6">{restaurant.description}</p>

            {/* Quick info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Address</p>
                  <p className="text-gray-600">
                    {restaurant.address.street}<br />
                    {restaurant.address.city}, {restaurant.address.province} {restaurant.address.postalCode}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Status</p>
                  <p className={cn(
                    "font-medium",
                    isOpen ? "text-green-600" : "text-red-600"
                  )}>
                    {isOpen ? "Open Now" : "Closed"}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact info */}
            <div className="flex flex-wrap gap-4">
              {restaurant.phone && (
                <a
                  href={`tel:${restaurant.phone}`}
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <Phone className="h-4 w-4" />
                  {formatPhoneNumber(restaurant.phone)}
                </a>
              )}
              
              {restaurant.website && (
                <a
                  href={restaurant.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <Globe className="h-4 w-4" />
                  Website
                </a>
              )}
              
              {restaurant.email && (
                <a
                  href={`mailto:${restaurant.email}`}
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Hours section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Hours of Operation</h2>
          <div className="space-y-2">
            {days.map((day, index) => {
              const hours = restaurant.hours[dayKeys[index]];
              const isClosed = hours === 'Closed';
              
              return (
                <div key={day} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="font-medium text-gray-900">{day}</span>
                  <span className={cn(
                    isClosed ? "text-gray-500" : "text-gray-600"
                  )}>
                    {isClosed ? 'Closed' : `${hours.open} - ${hours.close}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Features section */}
        {restaurant.features.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Features & Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {restaurant.features.map((feature) => (
                <span
                  key={feature}
                  className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}