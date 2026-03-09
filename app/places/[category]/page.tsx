import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCityFromHeaders, CITY_CONFIG } from '@/lib/city'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { PlaceCard } from '@/components/places/place-card'
import type { Place } from '@/lib/types'

interface Props {
  params: Promise<{ category: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: categorySlug } = await params
  const city = await getCityFromHeaders()
  const config = CITY_CONFIG[city]
  const supabase = await createServerSupabaseClient(city)

  const { data: category } = await supabase
    .from('categories')
    .select('name')
    .eq('id', categorySlug)
    .eq('type', 'place')
    .single()

  if (!category) return { title: 'Category Not Found' }

  return {
    title: `${category.name} in ${config.name}`,
    description: `Browse ${category.name.toLowerCase()} in ${config.name}. Find the best local spots.`,
  }
}

export default async function CategoryPage({ params }: Props) {
  const { category: categorySlug } = await params
  const city = await getCityFromHeaders()
  const config = CITY_CONFIG[city]
  const supabase = await createServerSupabaseClient(city)

  // Validate category
  const { data: category } = await supabase
    .from('categories')
    .select('id, name')
    .eq('id', categorySlug)
    .eq('type', 'place')
    .single()

  if (!category) notFound()

  // Fetch places for this city + category
  const { data: places } = await supabase
    .from('places')
    .select('*')
    .eq('city_id', city)
    .eq('category_id', categorySlug)
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('rating', { ascending: false })
    .limit(50)

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <nav className="mb-4 text-sm text-gray-500">
          <a href="/places" className="hover:text-[var(--city-primary)] transition-colors">
            Places
          </a>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{category.name}</span>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          {category.name} in {config.name}
        </h1>
        <p className="mt-2 text-gray-600">
          {places?.length || 0} {(places?.length || 0) === 1 ? 'place' : 'places'} found
        </p>
      </div>

      {places && places.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {places.map((place: Place) => (
            <PlaceCard
              key={place.id}
              place={place}
              categorySlug={categorySlug}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-100 bg-white py-16 text-center">
          <p className="text-gray-500">No places found in this category yet.</p>
        </div>
      )}
    </div>
  )
}
