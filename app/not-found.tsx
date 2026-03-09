import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 className="text-6xl font-bold text-[var(--city-primary)]">404</h1>
      <p className="mt-4 text-xl text-gray-600">Page not found</p>
      <p className="mt-2 text-gray-500">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center px-6 py-3 rounded-lg bg-[var(--city-primary)] text-white font-medium hover:bg-[var(--city-primary-light)] transition-colors"
      >
        Back to Home
      </Link>
    </div>
  )
}
