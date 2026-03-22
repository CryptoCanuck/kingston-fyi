'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin, Calendar, Search, Menu, X, Newspaper, LayoutDashboard } from 'lucide-react'
import { UserMenu } from '@/components/auth/user-menu'

const navLinks = [
  { href: '/places', label: 'Places', icon: MapPin },
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/news', label: 'News', icon: Newspaper },
  { href: '/search', label: 'Search', icon: Search },
]

interface HeaderProps {
  cityName: string
  cityTagline: string
}

export function Header({ cityName, cityTagline }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 city-gradient text-white shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm transition-colors group-hover:bg-white/25">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-tight tracking-tight">
                {cityName}<span className="text-white/60">.FYI</span>
              </span>
              <span className="hidden sm:block text-[10px] font-medium uppercase tracking-widest text-white/50 leading-none">
                {cityTagline}
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white/75 hover:text-white hover:bg-white/10 transition-all"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
            <div className="ml-3 pl-3 border-l border-white/15">
              <UserMenu />
            </div>
          </nav>

          {/* Mobile toggle */}
          <button
            className="md:hidden flex items-center justify-center h-10 w-10 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-white/10 px-4 pb-4 pt-2 space-y-1 animate-fade-in">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
          <div className="px-3 py-2.5 border-t border-white/10 mt-2 pt-3">
            <UserMenu />
          </div>
        </nav>
      )}
    </header>
  )
}
