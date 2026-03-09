import Link from 'next/link'
import { Calendar } from 'lucide-react'

export default function EventNotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <Calendar className="h-16 w-16 text-gray-300" />
      <h1 className="mt-6 text-2xl font-bold text-gray-900">Event not found</h1>
      <p className="mt-2 text-gray-500">
        This event may have been removed or the link is incorrect.
      </p>
      <Link
        href="/events"
        className="mt-6 rounded-lg bg-city-primary px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
      >
        Browse events
      </Link>
    </div>
  )
}
