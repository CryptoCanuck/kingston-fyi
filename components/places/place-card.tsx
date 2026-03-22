import Link from 'next/link'
import { MapPin, Star, Clock } from 'lucide-react'
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
      className={cn('card group block overflow-hidden', className)}
    >
      {/* Image area */}
      <div className="relative aspect-[16/10] bg-gradient-to-br from-[var(--city-surface)] to-gray-100 flex items-center justify-center overflow-hidden">
        <div className="flex flex-col items-center gap-2 text-[var(--city-primary)]/20">
          <MapPin className="h-12 w-12 opacity-30" />
        </div>
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="badge badge-primary backdrop-blur-sm">
            {place.category_id}
          </span>
        </div>
        {/* Verified badge */}
        {place.is_verified && (
          <div className="absolute top-3 right-3">
            <span className="badge badge-success backdrop-blur-sm">Verified</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-900 group-hover:text-[var(--city-primary)] transition-colors line-clamp-1">
          {place.name}
        </h3>

        {place.street_address && (
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-gray-500 line-clamp-1">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            {place.street_address}
          </p>
        )}

        {place.description && (
          <p className="mt-2 text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {place.description}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-0.5">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-bold text-amber-700">
                {formatRating(place.rating)}
              </span>
            </div>
            {place.review_count > 0 && (
              <span className="text-xs text-gray-400">
                ({place.review_count})
              </span>
            )}
          </div>
          {place.price_range && (
            <span className="text-sm font-medium text-gray-400">
              {place.price_range}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
