import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, SlidersHorizontal } from 'lucide-react'
import { getCityFromHeaders, CITY_CONFIG } from '@/lib/city'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { PlaceCard } from '@/components/places/place-card'
import { SearchInput } from '@/components/ui/search-input'
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

  const { data: category } = await supabase
    .from('categories')
    .select('id, name')
    .eq('id', categorySlug)
    .eq('type', 'place')
    .single()

  if (!category) notFound()

  const { data: places } = await supabase
    .from('places')
    .select('*')
    .eq('city_id', city)
    .eq('category_id', categorySlug)
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('rating', { ascending: false })
    .limit(50)

  const placeCount = places?.length || 0

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1 text-sm text-gray-400">
        <Link href="/places" className="hover:text-[var(--city-primary)] transition-colors">Places</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-700 font-medium">{category.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          {category.name} in {config.name}
        </h1>
        <p className="mt-2 text-gray-500">
          {placeCount} {placeCount === 1 ? 'place' : 'places'} found
        </p>
        <div className="mt-5 max-w-lg">
          <SearchInput placeholder={`Search ${category.name.toLowerCase()} in ${config.name}...`} />
        </div>
      </div>

      {/* Results */}
      {placeCount > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(places as Place[]).map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              categorySlug={categorySlug}
            />
          ))}
        </div>
      ) : (
        <div className="card p-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
            <SlidersHorizontal className="h-8 w-8 text-gray-300" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-gray-900">No places found</h2>
          <p className="mt-2 text-sm text-gray-500">
            No {category.name.toLowerCase()} listed in {config.name} yet. Be the first to add one!
          </p>
          <Link href="/submit" className="btn btn-primary mt-6">
            Submit a Listing
          </Link>
        </div>
      )}
    </div>
  )
}
