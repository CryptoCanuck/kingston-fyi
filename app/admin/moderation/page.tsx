'use client'

import { useState, useEffect } from 'react'

interface FlaggedReview {
  id: string
  rating: number
  title: string | null
  content: string | null
  moderation_status: string
  moderation_metadata: {
    classification?: string
    confidence?: number
    reasoning?: string
  }
  created_at: string
  profiles: { display_name: string | null } | null
  places: { name: string; city_id: string } | null
}

export default function ModerationPage() {
  const [reviews, setReviews] = useState<FlaggedReview[]>([])
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0 })
  const [loading, setLoading] = useState(true)

  async function fetchData() {
    try {
      const res = await fetch('/api/admin/moderation')
      if (res.ok) {
        const data = await res.json()
        setReviews(data.reviews)
        setStats(data.stats)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  async function handleAction(reviewId: string, action: 'approve' | 'reject') {
    await fetch('/api/admin/moderation', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewId, action }),
    })
    setReviews(reviews.filter(r => r.id !== reviewId))
    setStats(prev => ({
      ...prev,
      pending: prev.pending - 1,
      approved: action === 'approve' ? prev.approved + 1 : prev.approved,
    }))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Review Moderation</h1>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Total Reviews</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Approved</p>
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Needs Review</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
      </div>

      {/* Queue */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-800">Moderation Queue</h2>
        {loading ? (
          <p className="mt-4 text-gray-500">Loading...</p>
        ) : reviews.length === 0 ? (
          <p className="mt-4 text-gray-500">No reviews pending moderation.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-lg border bg-white p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {review.places?.name} ({review.places?.city_id})
                      </span>
                      <span className="text-yellow-500">{'★'.repeat(review.rating)}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      By: {review.profiles?.display_name || 'Anonymous'} —{' '}
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`rounded px-2 py-1 text-xs font-medium ${
                    review.moderation_status === 'flagged'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {review.moderation_status}
                  </span>
                </div>

                {review.title && (
                  <p className="mt-2 font-medium text-gray-900">{review.title}</p>
                )}
                {review.content && (
                  <p className="mt-1 text-sm text-gray-700">{review.content}</p>
                )}

                {/* AI Reasoning */}
                {review.moderation_metadata?.reasoning && (
                  <div className="mt-2 rounded bg-gray-50 p-2 text-xs text-gray-600">
                    <span className="font-medium">AI: </span>
                    {review.moderation_metadata.classification} ({Math.round((review.moderation_metadata.confidence || 0) * 100)}%) — {review.moderation_metadata.reasoning}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleAction(review.id, 'approve')}
                    className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(review.id, 'reject')}
                    className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
