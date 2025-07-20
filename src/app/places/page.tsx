import Link from 'next/link';
import { 
  Coffee, 
  ShoppingBag, 
  Camera, 
  Activity,
  Briefcase,
  Utensils,
  Wine,
  Music,
  Croissant,
  ArrowRight
} from 'lucide-react';

const categories = [
  { 
    slug: 'restaurant', 
    name: 'Restaurants', 
    icon: Utensils,
    description: 'From fine dining to casual eats',
    gradient: 'from-orange-500 to-red-500',
    count: 45
  },
  { 
    slug: 'bar', 
    name: 'Bars & Pubs', 
    icon: Wine,
    description: 'Craft cocktails and cozy pubs',
    gradient: 'from-purple-500 to-pink-500',
    count: 23
  },
  { 
    slug: 'nightclub', 
    name: 'Nightlife', 
    icon: Music,
    description: 'Dance floors and live music',
    gradient: 'from-purple-600 to-indigo-600',
    count: 12
  },
  { 
    slug: 'cafe', 
    name: 'Cafés', 
    icon: Coffee,
    description: 'Coffee shops and tea houses',
    gradient: 'from-amber-500 to-orange-500',
    count: 34
  },
  { 
    slug: 'bakery', 
    name: 'Bakeries', 
    icon: Croissant,
    description: 'Fresh bread and sweet treats',
    gradient: 'from-yellow-500 to-amber-500',
    count: 18
  },
  { 
    slug: 'shopping', 
    name: 'Shopping', 
    icon: ShoppingBag,
    description: 'Local shops and boutiques',
    gradient: 'from-green-500 to-teal-500',
    count: 56
  },
  { 
    slug: 'attraction', 
    name: 'Attractions', 
    icon: Camera,
    description: 'Museums, tours, and landmarks',
    gradient: 'from-blue-500 to-indigo-500',
    count: 28
  },
  { 
    slug: 'activity', 
    name: 'Activities', 
    icon: Activity,
    description: 'Sports, recreation, and fun',
    gradient: 'from-teal-500 to-cyan-500',
    count: 31
  },
  { 
    slug: 'service', 
    name: 'Services', 
    icon: Briefcase,
    description: 'Business and personal services',
    gradient: 'from-gray-500 to-slate-500',
    count: 67
  },
];

export default function PlacesPage() {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="heading-1 text-gray-900 dark:text-gray-100 mb-4">
            Explore Kingston
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover the best places to eat, drink, shop, and explore in Kingston
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.slug}
                href={`/places/${category.slug}`}
                className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-90 group-hover:opacity-100 transition-opacity`} />
                
                {/* Glass overlay */}
                <div className="absolute inset-0 bg-white/10 dark:bg-black/10 backdrop-blur-sm" />
                
                {/* Content */}
                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-white/20 dark:bg-black/20 rounded-xl backdrop-blur-md">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="px-3 py-1 bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-full text-white text-sm font-medium">
                      {category.count}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {category.name}
                  </h3>
                  
                  <p className="text-white/90 text-sm mb-4">
                    {category.description}
                  </p>
                  
                  <div className="flex items-center text-white/90 text-sm font-medium group-hover:text-white">
                    Browse {category.name}
                    <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -right-10 -bottom-10 h-32 w-32 bg-white/10 rounded-full blur-2xl" />
              </Link>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Know a great place?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Help us grow our directory by submitting new places
              </p>
            </div>
            <button className="btn-primary px-6 py-2.5">
              Submit a Place
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}