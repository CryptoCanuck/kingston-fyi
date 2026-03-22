import { MapPin } from 'lucide-react'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--city-surface)]">
              <MapPin className="h-5 w-5 text-[var(--city-primary)]" />
            </div>
            <span className="text-xl font-bold">
              City<span className="text-[var(--city-primary)]">.FYI</span>
            </span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  )
}
