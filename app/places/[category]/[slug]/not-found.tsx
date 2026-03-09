import Link from 'next/link'

export default function PlaceNotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold text-gray-900">Place Not Found</h2>
      <p className="mt-2 text-gray-600">
        The place you&apos;re looking for doesn&apos;t exist or is no longer available.
      </p>
      <Link
        href="/places"
        className="mt-6 inline-block rounded-lg bg-[var(--city-primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
      >
        Browse All Places
      </Link>
    </div>
  )
}
