'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { User, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from './auth-provider'

export function UserMenu() {
  const { user, loading } = useAuth()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (loading) {
    return (
      <div className="h-8 w-8 rounded-full bg-white/20 animate-pulse" />
    )
  }

  if (!user) {
    return (
      <Link
        href="/auth/sign-in"
        className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/20 transition-colors"
      >
        <User size={16} />
        Sign In
      </Link>
    )
  }

  const displayName =
    user.user_metadata?.display_name ||
    user.email?.split('@')[0] ||
    'Account'

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/20 transition-colors"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <User size={16} />
        <span className="max-w-[120px] truncate">{displayName}</span>
        <ChevronDown
          size={14}
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black/5 z-50">
          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <User size={16} />
              Profile
            </Link>
            <form action="/auth/sign-out" method="POST">
              <button
                type="submit"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
