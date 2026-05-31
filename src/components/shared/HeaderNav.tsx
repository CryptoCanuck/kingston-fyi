'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

export type NavItem = {
  label: string
  href: string
  /* extra path prefixes that should also mark this item active (detail routes) */
  match?: string[]
}

type HeaderNavProps = {
  items: NavItem[]
  dark?: boolean
}

const isActive = (pathname: string, item: NavItem) => {
  const prefixes = [item.href, ...(item.match ?? [])]
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

/* Desktop primary nav. Client-only so it can mark the active route via usePathname.
   Links are real <Link>s — keyboard-operable, no JS handlers required. */
export const HeaderNav = ({ items, dark = false }: HeaderNavProps) => {
  const pathname = usePathname() || '/'
  return (
    <nav className="kf-desktop-nav" aria-label="Primary">
      {items.map((it) => {
        const active = isActive(pathname, it)
        return (
          <Link
            key={it.href}
            href={it.href}
            className="kf-nav-link"
            data-dark={dark ? '' : undefined}
            aria-current={active ? 'page' : undefined}
          >
            {it.label}
            {active ? <span className="kf-nav-underline" aria-hidden="true" /> : null}
          </Link>
        )
      })}
    </nav>
  )
}
