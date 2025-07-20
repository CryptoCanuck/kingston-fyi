import Link from "next/link";
import { ArrowRight, MapPin, TrendingUp, Calendar, Home as HomeIcon, Utensils, Music } from "lucide-react";
import { RestaurantCard } from "@/components/restaurant-card";
import { getFeaturedRestaurants } from "@/data/mock-restaurants";
import { SearchBar } from "@/components/search-bar";

export default function Home() {
  const featuredRestaurants = getFeaturedRestaurants();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-subtle py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-indigo-950 opacity-50" />
        <div className="container mx-auto text-center relative z-10">
          <h1 className="heading-1 text-gradient-indigo-purple mb-6 animate-fade-in">
            Discover Kingston&apos;s Hidden Gems
          </h1>
          <p className="text-xl text-muted mb-10 max-w-3xl mx-auto animate-slide-up">
            Your local guide to the Limestone City. Explore handpicked restaurants, nightlife, 
            events, and real estate in Kingston, Ontario.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-10">
            <SearchBar />
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/explore"
              className="btn-primary px-8 py-3.5 text-base"
            >
              Explore Kingston
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/map"
              className="btn-outline px-8 py-3.5 text-base"
            >
              <MapPin className="mr-2 h-5 w-5" />
              View Map
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="section px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="heading-2">Featured Restaurants</h2>
            <Link
              href="/restaurants"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium inline-flex items-center transition-colors duration-200"
            >
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRestaurants.map((restaurant) => (
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
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto text-center">
          <blockquote className="text-lg md:text-xl text-gray-700 dark:text-gray-300 italic max-w-3xl mx-auto">
            &ldquo;If the doors of perception were cleansed, everything would appear to man as it is, infinite.&rdquo;
          </blockquote>
          <cite className="text-sm text-gray-600 dark:text-gray-400 mt-2 block">- William Blake</cite>
        </div>
      </section>

      {/* Categories */}
      <section className="section px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <h2 className="heading-2 mb-10 text-center">Explore Kingston</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Link
              href="/places/restaurant"
              className="group card card-hover p-6 text-center"
            >
              <Utensils className="h-12 w-12 mx-auto mb-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-lg mb-2">Restaurants</h3>
              <p className="text-sm text-muted">Discover local dining</p>
            </Link>
            
            <Link
              href="/places/nightlife"
              className="group card card-hover p-6 text-center"
            >
              <Music className="h-12 w-12 mx-auto mb-4 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-lg mb-2">Nightlife</h3>
              <p className="text-sm text-muted">Bars & entertainment</p>
            </Link>
            
            <Link
              href="/events"
              className="group card card-hover p-6 text-center"
            >
              <Calendar className="h-12 w-12 mx-auto mb-4 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-lg mb-2">Events</h3>
              <p className="text-sm text-muted">What&apos;s happening</p>
            </Link>
            
            <Link
              href="/real-estate"
              className="group card card-hover p-6 text-center"
            >
              <HomeIcon className="h-12 w-12 mx-auto mb-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-lg mb-2">Real Estate</h3>
              <p className="text-sm text-muted">Find your home</p>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Are you a local business?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join Kingston.FYI to reach more customers and become part of Kingston&apos;s premier local directory.
          </p>
          <Link
            href="/add-listing"
            className="inline-flex items-center px-8 py-3.5 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            Add Your Listing
            <TrendingUp className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
