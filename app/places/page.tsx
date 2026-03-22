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
  ArrowRight,
} from 'lucide-react'
import { getCityFromHeaders, CITY_CONFIG } from '@/lib/city'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { SearchInput } from '@/components/ui/search-input'

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

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, icon, sort_order')
    .eq('type', 'place')
    .order('sort_order')

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

  const totalCount = Object.values(countMap).reduce((a, b) => a + b, 0)

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Places in {config.name}
        </h1>
        <p className="mt-2 text-lg text-gray-500">
          {totalCount} local businesses, restaurants, and attractions to explore.
        </p>
        <div className="mt-6 max-w-lg">
          <SearchInput placeholder={`Search places in ${config.name}...`} />
        </div>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories?.map((cat) => {
          const Icon = ICON_MAP[cat.icon || ''] || Landmark
          const count = countMap[cat.id] || 0

          return (
            <Link
              key={cat.id}
              href={`/places/${cat.id}`}
              className="card group flex flex-col items-center gap-3 p-6 text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--city-surface)] text-[var(--city-primary)] transition-all duration-200 group-hover:bg-[var(--city-primary)] group-hover:text-white group-hover:scale-110">
                <Icon className="h-8 w-8" />
              </div>
              <div className="text-center">
                <h2 className="font-bold text-gray-900 group-hover:text-[var(--city-primary)] transition-colors">
                  {cat.name}
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  {count} {count === 1 ? 'place' : 'places'}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-[var(--city-primary)] transition-all group-hover:translate-x-1" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
