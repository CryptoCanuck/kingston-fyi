import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Utensils,
  Beer,
  Music,
  Coffee,
  Cake,
  ShoppingBag,
  Landmark,
  Activity,
  Briefcase,
} from 'lucide-react'
import { getCityFromHeaders, CITY_CONFIG } from '@/lib/city'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  utensils: Utensils,
  beer: Beer,
  music: Music,
  coffee: Coffee,
  cake: Cake,
  'shopping-bag': ShoppingBag,
  landmark: Landmark,
  activity: Activity,
  briefcase: Briefcase,
}

export async function generateMetadata(): Promise<Metadata> {
  const city = await getCityFromHeaders()
  const config = CITY_CONFIG[city]

  return {
    title: `Places in ${config.name}`,
    description: `Browse local businesses, restaurants, shops, and attractions in ${config.name}.`,
  }
}

export default async function PlacesPage() {
  const city = await getCityFromHeaders()
  const config = CITY_CONFIG[city]
  const supabase = await createServerSupabaseClient(city)

  // Fetch place categories with counts
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, icon, sort_order')
    .eq('type', 'place')
    .order('sort_order')

  // Get place counts per category for this city
  const { data: counts } = await supabase
    .from('places')
    .select('category_id')
    .eq('city_id', city)
    .eq('is_active', true)

  const countMap: Record<string, number> = {}
  if (counts) {
    for (const row of counts) {
      countMap[row.category_id] = (countMap[row.category_id] || 0) + 1
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Places in {config.name}
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Discover local businesses, restaurants, and attractions.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories?.map((cat) => {
          const Icon = ICON_MAP[cat.icon || ''] || Landmark
          const count = countMap[cat.id] || 0

          return (
            <Link
              key={cat.id}
              href={`/places/${cat.id}`}
              className="group flex flex-col items-center gap-3 rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--city-primary)]/10">
                <Icon className="h-7 w-7 text-[var(--city-primary)]" />
              </div>
              <div className="text-center">
                <h2 className="font-semibold text-gray-900 group-hover:text-[var(--city-primary)] transition-colors">
                  {cat.name}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {count} {count === 1 ? 'place' : 'places'}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
