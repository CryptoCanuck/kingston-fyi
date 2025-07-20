import Link from 'next/link';
import { Star, MapPin, DollarSign, Clock } from 'lucide-react';
import { Place } from '@/types/models';
import { cn, formatRating } from '@/lib/utils';
import Image from 'next/image';

interface PlaceCardProps {
  place: Place;
}

const categoryColors: Record<string, string> = {
  restaurant: 'from-orange-500 to-red-500',
  bar: 'from-purple-500 to-pink-500',
  nightclub: 'from-purple-600 to-indigo-600',
  cafe: 'from-amber-500 to-orange-500',
  bakery: 'from-yellow-500 to-amber-500',
  shopping: 'from-green-500 to-teal-500',
  attraction: 'from-blue-500 to-indigo-500',
  activity: 'from-teal-500 to-cyan-500',
  service: 'from-gray-500 to-slate-500',
};

export function PlaceCard({ place }: PlaceCardProps) {
  const gradientClass = categoryColors[place.category] || 'from-gray-500 to-slate-500';
  
  return (
    <Link 
      href={`/places/${place.category}/${place.slug}`}
      className="group block card card-hover"
    >
      {/* Image */}
      <div className="aspect-[4/3] relative overflow-hidden bg-gray-100 dark:bg-gray-800">
        {place.featured && (
          <div className={`absolute top-3 left-3 z-10 bg-gradient-to-r ${gradientClass} text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg`}>
            Featured
          </div>
        )}
        {place.verified && (
          <div className="absolute top-3 right-3 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-green-600 dark:text-green-400 px-2 py-1 rounded-full text-xs font-medium shadow-md flex items-center gap-1">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
            Verified
          </div>
        )}
        <div className="relative w-full h-full">
          <Image
            src={place.images.main}
            alt={place.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Category Badge */}
        <div className="flex items-center gap-2 mb-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${gradientClass} text-white`}>
            {place.category.charAt(0).toUpperCase() + place.category.slice(1)}
          </span>
          {place.subcategories.length > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {place.subcategories[0]}
            </span>
          )}
        </div>
        
        <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-indigo-500 group-hover:to-purple-500 group-hover:bg-clip-text transition-all duration-200">
          {place.name}
        </h3>
        
        {/* Description */}
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {place.description}
        </p>
        
        {/* Info row */}
        <div className="mt-3 flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            {/* Rating */}
            {place.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="font-medium text-gray-900 dark:text-gray-100">{formatRating(place.rating)}</span>
                {place.reviewCount && (
                  <span className="text-gray-500 dark:text-gray-500">({place.reviewCount})</span>
                )}
              </div>
            )}
            
            {/* Price */}
            {place.priceRange && (
              <div className="flex items-center">
                {[...Array(4)].map((_, i) => (
                  <DollarSign
                    key={i}
                    className={cn(
                      "h-3 w-3",
                      i < place.priceRange!.length
                        ? "text-gray-900 dark:text-gray-100"
                        : "text-gray-300 dark:text-gray-700"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Hours indicator */}
          {place.hours && (
            <div className="flex items-center gap-1 text-xs">
              <Clock className="h-3 w-3" />
              <span className="text-green-600 dark:text-green-400">Open</span>
            </div>
          )}
        </div>
        
        {/* Features */}
        {place.features && place.features.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {place.features.slice(0, 3).map((feature) => (
              <span key={feature} className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                {feature}
              </span>
            ))}
            {place.features.length > 3 && (
              <span className="text-xs text-gray-500">
                +{place.features.length - 3}
              </span>
            )}
          </div>
        )}
        
        {/* Address */}
        <div className="mt-3 flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
          <MapPin className="h-3 w-3 flex-shrink-0" />
          <p className="truncate">
            {place.address.street}, {place.address.city}
          </p>
        </div>
      </div>
    </Link>
  );
}