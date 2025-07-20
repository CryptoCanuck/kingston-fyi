import Link from 'next/link';
import { Utensils, Music, Coffee, ShoppingBag, Activity, Landmark } from 'lucide-react';

const categories = [
  {
    title: "Restaurants",
    icon: Utensils,
    href: "/places/restaurant",
    description: "From cozy cafés to fine dining",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-900/20"
  },
  {
    title: "Nightlife",
    icon: Music,
    href: "/places/nightlife",
    description: "Bars, clubs, and live music venues",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-900/20"
  },
  {
    title: "Cafés",
    icon: Coffee,
    href: "/places/cafe",
    description: "Coffee shops and tea houses",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-900/20"
  },
  {
    title: "Shopping",
    icon: ShoppingBag,
    href: "/places/shopping",
    description: "Local boutiques and stores",
    color: "text-pink-600 dark:text-pink-400",
    bgColor: "bg-pink-50 dark:bg-pink-900/20"
  },
  {
    title: "Activities",
    icon: Activity,
    href: "/places/activity",
    description: "Things to do and experiences",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-900/20"
  },
  {
    title: "Attractions",
    icon: Landmark,
    href: "/places/attraction",
    description: "Museums, galleries, and landmarks",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-900/20"
  }
];

export default function ExplorePage() {
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="heading-1 text-gradient-indigo-purple mb-4">
            Explore Kingston
          </h1>
          <p className="text-xl text-muted max-w-3xl mx-auto">
            Discover the best of Kingston, from hidden gems to local favorites. 
            Your guide to everything the Limestone City has to offer.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.title}
                href={category.href}
                className="group card card-hover p-6"
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${category.bgColor}`}>
                    <Icon className={`h-8 w-8 ${category.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-sm text-muted">
                      {category.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Featured Section */}
        <section>
          <h2 className="heading-2 mb-6">Popular This Week</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6">
              <h3 className="font-semibold mb-2">The Mansion</h3>
              <p className="text-sm text-muted mb-3">Historic gastropub with live music</p>
              <div className="flex items-center justify-between">
                <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">Nightlife</span>
                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">View →</span>
              </div>
            </div>
            
            <div className="card p-6">
              <h3 className="font-semibold mb-2">Pan Chancho</h3>
              <p className="text-sm text-muted mb-3">Artisan bakery & café</p>
              <div className="flex items-center justify-between">
                <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">Café</span>
                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">View →</span>
              </div>
            </div>
            
            <div className="card p-6">
              <h3 className="font-semibold mb-2">Fort Henry</h3>
              <p className="text-sm text-muted mb-3">Historic military fortress</p>
              <div className="flex items-center justify-between">
                <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">Attraction</span>
                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">View →</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}