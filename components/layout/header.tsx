'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin, Calendar, Search, Menu, X } from 'lucide-react'

const navLinks = [
  { href: '/', label: 'Home', icon: null },
  { href: '/places', label: 'Places', icon: MapPin },
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/search', label: 'Search', icon: Search },
]

export function Header({ cityName }: { cityName: string }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="bg-[var(--city-primary)] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <span>{cityName}</span>
            <span className="text-white/70">.FYI</span>
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-6">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white transition-colors"
              >
                {Icon && <Icon size={16} />}
                {label}
              </Link>
            ))}
          </nav>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-white/80 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-white/10 px-4 pb-4 pt-2 space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {Icon && <Icon size={18} />}
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
