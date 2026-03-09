'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star } from 'lucide-react'
import { useAuth } from '@/components/auth/auth-provider'
import Link from 'next/link'

interface ReviewFormProps {
  placeId: string
  cityId: string
}

export default function ReviewForm({ placeId, cityId }: ReviewFormProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [visitDate, setVisitDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (loading) {
    return null
  }

  if (!user) {
    return (
      <div className="rounded-lg border border-gray-100 bg-gray-50 p-5 text-center">
        <p className="text-gray-600">
          <Link href="/auth/sign-in" className="text-city-primary font-medium hover:underline">
            Sign in
          </Link>{' '}
          to leave a review
        </p>
      </div>
    )
  }

  if (success) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-5 text-center">
        <p className="text-green-700 font-medium">
          Thank you! Your review has been submitted.
        </p>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (rating === 0) {
      setError('Please select a rating.')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          place_id: placeId,
          rating,
          title: title.trim() || undefined,
          content: content.trim() || undefined,
          visit_date: visitDate || undefined,
        }),
      })

      if (!res.ok) {
        const body = await res.json()
        const message = body?.error?.message || 'Failed to submit review.'

        if (res.status === 409) {
          setError('You have already reviewed this place.')
        } else {
          setError(message)
        }
        return
      }

      setSuccess(true)
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const displayRating = hoveredRating || rating

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm space-y-4">
      <h3 className="font-semibold text-gray-900">Write a Review</h3>

      {/* Star rating selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-city-primary rounded"
              aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
            >
              <Star
                className={`h-7 w-7 transition-colors ${
                  star <= displayRating
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-none text-gray-300'
                }`}
              />
            </button>
          ))}
          {displayRating > 0 && (
            <span className="ml-2 text-sm text-gray-500">
              {displayRating} / 5
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <div>
        <label htmlFor="review-title" className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-xs text-gray-400">(optional)</span>
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-city-primary focus:outline-none focus:ring-1 focus:ring-city-primary"
          placeholder="Summarize your experience"
        />
      </div>

      {/* Content */}
      <div>
        <label htmlFor="review-content" className="block text-sm font-medium text-gray-700 mb-1">
          Review <span className="text-xs text-gray-400">(optional)</span>
        </label>
        <textarea
          id="review-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          maxLength={2000}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-city-primary focus:outline-none focus:ring-1 focus:ring-city-primary"
          placeholder="Tell others about your experience..."
        />
      </div>

      {/* Visit date */}
      <div>
        <label htmlFor="review-visit-date" className="block text-sm font-medium text-gray-700 mb-1">
          Visit Date <span className="text-xs text-gray-400">(optional)</span>
        </label>
        <input
          id="review-visit-date"
          type="date"
          value={visitDate}
          onChange={(e) => setVisitDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-city-primary focus:outline-none focus:ring-1 focus:ring-city-primary"
        />
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center rounded-md bg-city-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-city-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}
