import Link from 'next/link'
import { MapPin, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--city-surface)]">
        <MapPin className="h-10 w-10 text-[var(--city-primary)]" />
      </div>
      <h1 className="mt-6 text-4xl font-extrabold text-gray-900">Page not found</h1>
      <p className="mt-3 max-w-md text-gray-500">
        Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="btn btn-primary btn-lg mt-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>
    </div>
  )
}
