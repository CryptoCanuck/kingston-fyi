import Link from 'next/link'
import { MapPin, Heart } from 'lucide-react'

export function Footer({ cityName }: { cityName: string }) {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                <MapPin className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold">
                {cityName}<span className="text-white/50">.FYI</span>
              </span>
            </Link>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-gray-500">
              Your hyperlocal guide to everything {cityName}. Discover businesses,
              events, and news — all in one place, powered by community and AI.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
              Explore
            </h3>
            <nav className="mt-3 flex flex-col gap-2">
              <Link href="/places" className="text-sm hover:text-white transition-colors">Places</Link>
              <Link href="/events" className="text-sm hover:text-white transition-colors">Events</Link>
              <Link href="/news" className="text-sm hover:text-white transition-colors">News</Link>
              <Link href="/search" className="text-sm hover:text-white transition-colors">Search</Link>
            </nav>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
              Company
            </h3>
            <nav className="mt-3 flex flex-col gap-2">
              <Link href="/about" className="text-sm hover:text-white transition-colors">About</Link>
              <Link href="/contact" className="text-sm hover:text-white transition-colors">Contact</Link>
              <Link href="/privacy" className="text-sm hover:text-white transition-colors">Privacy</Link>
              <Link href="/submit" className="text-sm hover:text-white transition-colors">Submit a Listing</Link>
            </nav>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-6 sm:flex-row">
          <p className="text-xs text-gray-500">
            &copy; {year} {cityName}.FYI. All rights reserved.
          </p>
          <p className="flex items-center gap-1 text-xs text-gray-500">
            Made with <Heart className="h-3 w-3 text-red-400" /> in Canada
          </p>
        </div>
      </div>
    </footer>
  )
}
