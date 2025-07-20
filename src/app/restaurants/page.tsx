import { Filter, SortDesc } from 'lucide-react';
import { RestaurantCard } from '@/components/restaurant-card';
import { mockRestaurants } from '@/data/mock-restaurants';

export default function RestaurantsPage() {
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            All Restaurants in Kingston
          </h1>
          <p className="text-gray-600">
            Browse {mockRestaurants.length} restaurants in the Limestone City
          </p>
        </div>

        {/* Filters and Sort */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex gap-2">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <SortDesc className="h-4 w-4 mr-2" />
              Sort by
            </button>
          </div>
          
          {/* View toggle placeholder */}
          <div className="text-sm text-gray-600">
            Showing all restaurants
          </div>
        </div>

        {/* Restaurant Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockRestaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={{
                id: restaurant.id,
                slug: restaurant.slug,
                name: restaurant.name,
                cuisine: restaurant.cuisine,
                priceRange: restaurant.priceRange,
                address: {
                  street: restaurant.address.street,
                  city: restaurant.address.city,
                },
                coordinates: restaurant.coordinates,
                rating: restaurant.rating,
                reviewCount: restaurant.reviewCount,
                images: {
                  main: restaurant.images.main,
                },
                featured: restaurant.featured,
              }}
            />
          ))}
        </div>

        {/* Placeholder for pagination */}
        <div className="mt-12 flex justify-center">
          <nav className="flex items-center gap-2">
            <button
              disabled
              className="px-3 py-2 text-sm font-medium text-gray-400 bg-white border border-gray-300 rounded-md cursor-not-allowed"
            >
              Previous
            </button>
            <button className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-md">
              1
            </button>
            <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              2
            </button>
            <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              3
            </button>
            <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Next
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}