import Link from 'next/link';
import { Star, MapPin, DollarSign } from 'lucide-react';
import { RestaurantListItem } from '@/types';
import { cn, formatRating } from '@/lib/utils';

interface RestaurantCardProps {
  restaurant: RestaurantListItem;
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Link 
      href={`/restaurants/${restaurant.slug}`}
      className="group block card card-hover"
    >
      {/* Image */}
      <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
        {restaurant.featured && (
          <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
            Featured
          </div>
        )}
        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
          {/* Placeholder for restaurant image */}
          <MapPin className="h-12 w-12" />
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
          {restaurant.name}
        </h3>
        
        {/* Cuisine tags */}
        <div className="mt-1 flex flex-wrap gap-1">
          {restaurant.cuisine.slice(0, 2).map((cuisine) => (
            <span key={cuisine} className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
              {cuisine}
            </span>
          ))}
          {restaurant.cuisine.length > 2 && (
            <span className="text-xs text-gray-500">
              +{restaurant.cuisine.length - 2} more
            </span>
          )}
        </div>
        
        {/* Info row */}
        <div className="mt-3 flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            {/* Rating */}
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="font-medium text-gray-900 dark:text-gray-100">{formatRating(restaurant.rating)}</span>
              <span className="text-gray-500 dark:text-gray-500">({restaurant.reviewCount})</span>
            </div>
            
            {/* Price */}
            <div className="flex items-center">
              {[...Array(4)].map((_, i) => (
                <DollarSign
                  key={i}
                  className={cn(
                    "h-3 w-3",
                    i < restaurant.priceRange.length
                      ? "text-gray-900 dark:text-gray-100"
                      : "text-gray-300 dark:text-gray-700"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Address */}
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 truncate">
          {restaurant.address.street}
        </p>
      </div>
    </Link>
  );
}