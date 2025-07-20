import { PlaceCategory } from '@/types/models';
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

interface CategoryHeaderProps {
  category: PlaceCategory;
  count?: number;
}

const categoryInfo: Record<PlaceCategory, {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}> = {
  restaurant: {
    title: 'Restaurants',
    description: 'Discover the best dining experiences in Kingston',
    icon: Utensils,
    gradient: 'from-orange-500 to-red-500',
  },
  bar: {
    title: 'Bars & Pubs',
    description: 'Find your perfect spot for drinks and good times',
    icon: Wine,
    gradient: 'from-purple-500 to-pink-500',
  },
  nightclub: {
    title: 'Nightlife',
    description: 'Experience Kingston\'s vibrant nightlife scene',
    icon: Music,
    gradient: 'from-purple-600 to-indigo-600',
  },
  cafe: {
    title: 'Cafés',
    description: 'Cozy spots for coffee, tea, and light bites',
    icon: Coffee,
    gradient: 'from-amber-500 to-orange-500',
  },
  bakery: {
    title: 'Bakeries',
    description: 'Fresh bread, pastries, and sweet treats',
    icon: Croissant,
    gradient: 'from-yellow-500 to-amber-500',
  },
  shopping: {
    title: 'Shopping',
    description: 'Browse local shops and retail destinations',
    icon: ShoppingBag,
    gradient: 'from-green-500 to-teal-500',
  },
  attraction: {
    title: 'Attractions',
    description: 'Must-see destinations and tourist spots',
    icon: Camera,
    gradient: 'from-blue-500 to-indigo-500',
  },
  activity: {
    title: 'Activities',
    description: 'Fun things to do and experiences to enjoy',
    icon: Activity,
    gradient: 'from-teal-500 to-cyan-500',
  },
  service: {
    title: 'Services',
    description: 'Essential services and businesses',
    icon: Briefcase,
    gradient: 'from-gray-500 to-slate-500',
  },
};

export function CategoryHeader({ category, count }: CategoryHeaderProps) {
  const info = categoryInfo[category];
  const Icon = info.icon;

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Background with gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${info.gradient} opacity-90`} />
      
      {/* Glass overlay */}
      <div className="absolute inset-0 bg-white/10 dark:bg-black/10 backdrop-blur-sm" />
      
      {/* Content */}
      <div className="relative px-6 py-12 md:px-8 md:py-16">
        <div className="max-w-4xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 dark:bg-black/20 rounded-xl backdrop-blur-md">
              <Icon className="h-8 w-8 text-white" />
            </div>
            {count !== undefined && (
              <span className="px-3 py-1 bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-full text-white text-sm font-medium">
                {count} {count === 1 ? 'place' : 'places'}
              </span>
            )}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {info.title}
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 max-w-2xl">
            {info.description}
          </p>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute -right-20 -top-20 h-64 w-64 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute -left-20 -bottom-20 h-64 w-64 bg-black/10 rounded-full blur-3xl" />
    </div>
  );
}