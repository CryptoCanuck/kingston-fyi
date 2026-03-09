import Link from 'next/link'
import { MapPin, Star } from 'lucide-react'
import { cn, formatRating } from '@/lib/utils'
import type { Place } from '@/lib/types'

interface PlaceCardProps {
  place: Place
  categorySlug?: string
  className?: string
}

export function PlaceCard({ place, categorySlug, className }: PlaceCardProps) {
  const href = categorySlug
    ? `/places/${categorySlug}/${place.slug}`
    : `/places/${place.category_id}/${place.slug}`

  return (
    <Link
      href={href}
      className={cn(
        'group block overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5',
        className
      )}
    >
      <div className="aspect-[4/3] bg-gradient-to-br from-city-primary/10 to-city-primary-light/10 flex items-center justify-center">
        <MapPin className="h-10 w-10 text-city-primary/30" />
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-city-primary transition-colors line-clamp-1">
          {place.name}
        </h3>

        {place.street_address && (
          <p className="mt-1 flex items-center gap-1 text-sm text-gray-500 line-clamp-1">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {place.street_address}
          </p>
        )}

        <div className="mt-2 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium text-gray-700">
              {formatRating(place.rating)}
            </span>
          </div>
          {place.review_count > 0 && (
            <span className="text-sm text-gray-400">
              ({place.review_count})
            </span>
          )}
          {place.price_range && (
            <span className="ml-auto text-sm text-gray-500">
              {place.price_range}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
