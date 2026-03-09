'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Loader2, CheckCircle, MapPin, Calendar } from 'lucide-react'
import type { Category } from '@/lib/types'

interface SubmitFormProps {
  userName: string | null
}

type SubmissionType = 'place' | 'event'

interface PlaceData {
  name: string
  category_id: string
  address: string
  phone: string
  website: string
  description: string
}

interface EventData {
  title: string
  description: string
  venue: string
  start_date: string
  end_date: string
  start_time: string
  ticket_price: string
  ticket_url: string
  is_free: boolean
}

const INITIAL_PLACE: PlaceData = {
  name: '',
  category_id: '',
  address: '',
  phone: '',
  website: '',
  description: '',
}

const INITIAL_EVENT: EventData = {
  title: '',
  description: '',
  venue: '',
  start_date: '',
  end_date: '',
  start_time: '',
  ticket_price: '',
  ticket_url: '',
  is_free: false,
}

export function SubmitForm({ userName }: SubmitFormProps) {
  const router = useRouter()
  const [type, setType] = useState<SubmissionType>('place')
  const [placeData, setPlaceData] = useState<PlaceData>(INITIAL_PLACE)
  const [eventData, setEventData] = useState<EventData>(INITIAL_EVENT)
  const [categories, setCategories] = useState<Category[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/places/categories')
        if (res.ok) {
          const json = await res.json()
          setCategories(json.data ?? [])
        }
      } catch {
        // Categories will just be empty — user can still submit
      }
    }
    fetchCategories()
  }, [])

  function updatePlace<K extends keyof PlaceData>(key: K, value: PlaceData[K]) {
    setPlaceData((prev) => ({ ...prev, [key]: value }))
  }

  function updateEvent<K extends keyof EventData>(key: K, value: EventData[K]) {
    setEventData((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const data = type === 'place' ? { ...placeData } : { ...eventData }

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          data,
          submitter_name: userName ?? undefined,
        }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.error?.message ?? 'Failed to submit. Please try again.')
      }

      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
        <CheckCircle size={40} className="mx-auto text-green-600" />
        <h3 className="mt-4 text-lg font-semibold text-green-900">Submission Received!</h3>
        <p className="mt-2 text-sm text-green-700">
          Thank you for contributing to your community. Our team will review your submission and
          get back to you.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => {
              setSubmitted(false)
              setPlaceData(INITIAL_PLACE)
              setEventData(INITIAL_EVENT)
            }}
            className="rounded-lg border border-green-300 bg-white px-4 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-50"
          >
            Submit Another
          </button>
          <button
            onClick={() => router.push('/profile')}
            className="rounded-lg bg-city-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-city-primary-dark"
          >
            View Your Submissions
          </button>
        </div>
      </div>
    )
  }

  const inputClass =
    'block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 shadow-sm transition-colors focus:border-city-primary focus:outline-none focus:ring-2 focus:ring-city-primary/20'

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Type Toggle */}
      <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1">
        <button
          type="button"
          onClick={() => setType('place')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
            type === 'place'
              ? 'bg-white text-city-primary shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <MapPin size={16} />
          Place
        </button>
        <button
          type="button"
          onClick={() => setType('event')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
            type === 'event'
              ? 'bg-white text-city-primary shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Calendar size={16} />
          Event
        </button>
      </div>

      {/* Place Fields */}
      {type === 'place' && (
        <div className="space-y-5">
          <div>
            <label htmlFor="place-name" className="block text-sm font-medium text-gray-700">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="place-name"
              type="text"
              required
              value={placeData.name}
              onChange={(e) => updatePlace('name', e.target.value)}
              placeholder="e.g. The Cozy Corner Cafe"
              className={`mt-1 ${inputClass}`}
            />
          </div>

          <div>
            <label htmlFor="place-category" className="block text-sm font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="place-category"
              required
              value={placeData.category_id}
              onChange={(e) => updatePlace('category_id', e.target.value)}
              className={`mt-1 ${inputClass}`}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="place-address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              id="place-address"
              type="text"
              value={placeData.address}
              onChange={(e) => updatePlace('address', e.target.value)}
              placeholder="123 Princess St, Kingston, ON"
              className={`mt-1 ${inputClass}`}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="place-phone" className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                id="place-phone"
                type="tel"
                value={placeData.phone}
                onChange={(e) => updatePlace('phone', e.target.value)}
                placeholder="(613) 555-0123"
                className={`mt-1 ${inputClass}`}
              />
            </div>
            <div>
              <label htmlFor="place-website" className="block text-sm font-medium text-gray-700">
                Website
              </label>
              <input
                id="place-website"
                type="url"
                value={placeData.website}
                onChange={(e) => updatePlace('website', e.target.value)}
                placeholder="https://example.com"
                className={`mt-1 ${inputClass}`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="place-description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="place-description"
              rows={4}
              value={placeData.description}
              onChange={(e) => updatePlace('description', e.target.value)}
              placeholder="Tell us about this place..."
              className={`mt-1 ${inputClass} resize-none`}
            />
          </div>
        </div>
      )}

      {/* Event Fields */}
      {type === 'event' && (
        <div className="space-y-5">
          <div>
            <label htmlFor="event-title" className="block text-sm font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="event-title"
              type="text"
              required
              value={eventData.title}
              onChange={(e) => updateEvent('title', e.target.value)}
              placeholder="e.g. Downtown Street Festival"
              className={`mt-1 ${inputClass}`}
            />
          </div>

          <div>
            <label htmlFor="event-description" className="block text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="event-description"
              rows={4}
              required
              value={eventData.description}
              onChange={(e) => updateEvent('description', e.target.value)}
              placeholder="What is this event about?"
              className={`mt-1 ${inputClass} resize-none`}
            />
          </div>

          <div>
            <label htmlFor="event-venue" className="block text-sm font-medium text-gray-700">
              Venue
            </label>
            <input
              id="event-venue"
              type="text"
              value={eventData.venue}
              onChange={(e) => updateEvent('venue', e.target.value)}
              placeholder="e.g. Confederation Park"
              className={`mt-1 ${inputClass}`}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="event-start-date" className="block text-sm font-medium text-gray-700">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                id="event-start-date"
                type="date"
                required
                value={eventData.start_date}
                onChange={(e) => updateEvent('start_date', e.target.value)}
                className={`mt-1 ${inputClass}`}
              />
            </div>
            <div>
              <label htmlFor="event-end-date" className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                id="event-end-date"
                type="date"
                value={eventData.end_date}
                onChange={(e) => updateEvent('end_date', e.target.value)}
                className={`mt-1 ${inputClass}`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="event-start-time" className="block text-sm font-medium text-gray-700">
              Start Time
            </label>
            <input
              id="event-start-time"
              type="time"
              value={eventData.start_time}
              onChange={(e) => updateEvent('start_time', e.target.value)}
              className={`mt-1 max-w-xs ${inputClass}`}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                id="event-is-free"
                type="checkbox"
                checked={eventData.is_free}
                onChange={(e) => updateEvent('is_free', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-city-primary focus:ring-city-primary/20"
              />
              <label htmlFor="event-is-free" className="text-sm font-medium text-gray-700">
                This event is free
              </label>
            </div>

            {!eventData.is_free && (
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="event-ticket-price" className="block text-sm font-medium text-gray-700">
                    Ticket Price
                  </label>
                  <input
                    id="event-ticket-price"
                    type="text"
                    value={eventData.ticket_price}
                    onChange={(e) => updateEvent('ticket_price', e.target.value)}
                    placeholder="e.g. $25"
                    className={`mt-1 ${inputClass}`}
                  />
                </div>
                <div>
                  <label htmlFor="event-ticket-url" className="block text-sm font-medium text-gray-700">
                    Ticket URL
                  </label>
                  <input
                    id="event-ticket-url"
                    type="url"
                    value={eventData.ticket_url}
                    onChange={(e) => updateEvent('ticket_url', e.target.value)}
                    placeholder="https://tickets.example.com"
                    className={`mt-1 ${inputClass}`}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center gap-2 rounded-lg bg-city-primary px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-city-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        {submitting ? 'Submitting...' : 'Submit for Review'}
      </button>
    </form>
  )
}
