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
  Croissant
} from 'lucide-react';

const categories = [
  { slug: 'restaurant', name: 'Restaurants', icon: Utensils },
  { slug: 'bar', name: 'Bars', icon: Wine },
  { slug: 'nightclub', name: 'Nightlife', icon: Music },
  { slug: 'cafe', name: 'Cafés', icon: Coffee },
  { slug: 'bakery', name: 'Bakeries', icon: Croissant },
  { slug: 'shopping', name: 'Shopping', icon: ShoppingBag },
  { slug: 'attraction', name: 'Attractions', icon: Camera },
  { slug: 'activity', name: 'Activities', icon: Activity },
  { slug: 'service', name: 'Services', icon: Briefcase },
];

export default function PlacesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* Category Navigation */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="container">
          <div className="flex items-center gap-2 overflow-x-auto py-3 -mx-4 px-4 custom-scrollbar">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.slug}
                  href={`/places/${category.slug}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors whitespace-nowrap"
                >
                  <Icon className="h-4 w-4" />
                  {category.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
      
      {/* Page Content */}
      {children}
    </div>
  );
}