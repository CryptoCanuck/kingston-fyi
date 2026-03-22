'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import type { Place, Review } from '@/lib/types'

export default function BusinessManagePage() {
  const params = useParams()
  const placeId = params.placeId as string

  const [place, setPlace] = useState<Place | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [tab, setTab] = useState<'edit' | 'reviews' | 'analytics'>('edit')
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Place>>({})

  useEffect(() => {
    async function load() {
      const [placeRes, reviewsRes] = await Promise.all([
        fetch(`/api/dashboard/${placeId}`),
        fetch(`/api/dashboard/${placeId}?section=reviews`),
      ])
      if (placeRes.ok) {
        const data = await placeRes.json()
        setPlace(data.place)
        setEditForm(data.place)
      }
      if (reviewsRes.ok) {
        const data = await reviewsRes.json()
        setReviews(data.reviews || [])
      }
    }
    load()
  }, [placeId])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/dashboard/${placeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      if (res.ok) {
        const data = await res.json()
        setPlace(data.place)
      }
    } finally {
      setSaving(false)
    }
  }

  async function respondToReview(reviewId: string, content: string) {
    await fetch(`/api/reviews/${reviewId}/response`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
  }

  if (!place) {
    return <div className="mx-auto max-w-4xl px-4 py-10 text-gray-500">Loading...</div>
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">{place.name}</h1>
      <p className="text-gray-500">{place.city_id} — {place.category_id}</p>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 border-b">
        {(['edit', 'reviews', 'analytics'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize ${
              tab === t
                ? 'border-b-2 border-city-primary text-city-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Edit Tab */}
      {tab === 'edit' && (
        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Business Name</label>
            <input
              type="text"
              value={editForm.name || ''}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={editForm.description || ''}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              rows={4}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                value={editForm.phone || ''}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Website</label>
              <input
                type="url"
                value={editForm.website || ''}
                onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              value={editForm.street_address || ''}
              onChange={(e) => setEditForm({ ...editForm, street_address: e.target.value })}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={editForm.email || ''}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-city-primary px-6 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {/* Reviews Tab */}
      {tab === 'reviews' && (
        <div className="mt-6 space-y-4">
          {reviews.length === 0 ? (
            <p className="text-gray-500">No reviews yet.</p>
          ) : (
            reviews.map((review) => (
              <ReviewItem key={review.id} review={review} onRespond={respondToReview} />
            ))
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {tab === 'analytics' && (
        <div className="mt-6 text-gray-500">
          <p>Analytics dashboard coming soon. View counts, search impressions, and review trends will appear here.</p>
        </div>
      )}
    </div>
  )
}

function ReviewItem({
  review,
  onRespond,
}: {
  review: Review
  onRespond: (reviewId: string, content: string) => void
}) {
  const [showReply, setShowReply] = useState(false)
  const [reply, setReply] = useState('')

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium text-yellow-600">{'★'.repeat(review.rating)}</span>
          <span className="text-sm text-gray-500">
            {new Date(review.created_at).toLocaleDateString()}
          </span>
        </div>
        <span className={`rounded px-2 py-0.5 text-xs ${
          review.moderation_status === 'approved' ? 'bg-green-100 text-green-700' :
          review.moderation_status === 'flagged' ? 'bg-red-100 text-red-700' :
          'bg-gray-100 text-gray-500'
        }`}>
          {review.moderation_status}
        </span>
      </div>
      {review.content && (
        <p className="mt-2 text-sm text-gray-700">{review.content}</p>
      )}
      <div className="mt-2">
        <button
          onClick={() => setShowReply(!showReply)}
          className="text-xs text-city-primary hover:underline"
        >
          {showReply ? 'Cancel' : 'Respond'}
        </button>
        {showReply && (
          <div className="mt-2 space-y-2">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Write your response..."
              rows={3}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
            <button
              onClick={() => {
                onRespond(review.id, reply)
                setShowReply(false)
                setReply('')
              }}
              className="rounded-md bg-city-primary px-4 py-1.5 text-xs text-white"
            >
              Send Response
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
