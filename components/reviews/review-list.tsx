import { Star } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Review, Profile } from '@/lib/types'

interface ReviewWithProfile extends Review {
  profiles: Pick<Profile, 'display_name' | 'avatar_url'> | null
}

interface ReviewListProps {
  placeId: string
  cityId: string
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? 'fill-amber-400 text-amber-400'
              : 'fill-none text-gray-300'
          }`}
        />
      ))}
    </div>
  )
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function ReviewList({ placeId, cityId }: ReviewListProps) {
  const supabase = await createServerSupabaseClient(cityId)

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, profiles:user_id(display_name, avatar_url)')
    .eq('place_id', placeId)
    .eq('city_id', cityId)
    .order('created_at', { ascending: false })
    .limit(20)

  const typedReviews = (reviews ?? []) as ReviewWithProfile[]

  if (typedReviews.length === 0) {
    return (
      <p className="text-gray-500 text-sm py-4">
        No reviews yet. Be the first to share your experience!
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {typedReviews.map((review) => (
        <div
          key={review.id}
          className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <StarRating rating={review.rating} />
              {review.title && (
                <h4 className="font-semibold text-gray-900">{review.title}</h4>
              )}
            </div>
            <div className="text-right text-sm text-gray-500 shrink-0">
              <p>{formatDate(review.created_at)}</p>
              {review.visit_date && (
                <p className="text-xs text-gray-400">
                  Visited {formatDate(review.visit_date)}
                </p>
              )}
            </div>
          </div>

          {review.content && (
            <p className="mt-3 text-gray-600 leading-relaxed whitespace-pre-line">
              {review.content}
            </p>
          )}

          <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
            <span className="font-medium text-gray-700">
              {review.profiles?.display_name || 'Anonymous'}
            </span>
            {review.is_verified && (
              <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                Verified
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
