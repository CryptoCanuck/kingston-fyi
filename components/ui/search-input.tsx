'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchInputProps {
  placeholder?: string
  className?: string
  size?: 'default' | 'lg'
}

export function SearchInput({
  placeholder = 'Search places, events, and more...',
  className,
  size = 'default',
}: SearchInputProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn('relative w-full', className)}>
      <Search className={cn(
        'absolute left-4 top-1/2 -translate-y-1/2 text-gray-400',
        size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
      )} />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        aria-label="Search"
        className={cn(
          'w-full rounded-2xl border-0 bg-white shadow-lg transition-all placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30',
          size === 'lg' ? 'py-4 pl-12 pr-5 text-lg' : 'py-3 pl-11 pr-4 text-base'
        )}
      />
      <button
        type="submit"
        className={cn(
          'absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-[var(--city-primary)] text-white font-semibold transition-all hover:brightness-110',
          size === 'lg' ? 'px-6 py-2.5 text-sm' : 'px-4 py-2 text-sm'
        )}
      >
        Search
      </button>
    </form>
  )
}
