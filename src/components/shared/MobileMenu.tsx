'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useCallback, useEffect, useId, useRef, useState } from 'react'

import { Icon } from '@/components/ui'

import { HeaderSearch } from './HeaderSearch'
import type { NavItem } from './HeaderNav'

type MobileMenuProps = {
  items: NavItem[]
  submitHref: string
  dark?: boolean
}

type Panel = null | 'menu' | 'search'

const FOCUSABLE = 'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'

const isActive = (pathname: string, item: NavItem) => {
  const prefixes = [item.href, ...(item.match ?? [])]
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

/* Mobile header controls (≤860px): hamburger + search toggle that open an inline panel.
   The open panel is keyboard-operable, focus-trapped while open, and restores focus to the
   trigger on close (Esc, scrim click, or route change). */
export const MobileMenu = ({ items, submitHref, dark = false }: MobileMenuProps) => {
  const [panel, setPanel] = useState<Panel>(null)
  const pathname = usePathname() || '/'
  const panelRef = useRef<HTMLDivElement>(null)
  const lastTrigger = useRef<HTMLButtonElement | null>(null)
  const menuId = useId()
  const searchId = useId()

  // Close on route change — adjust state during render (no effect), the React-recommended
  // pattern for resetting state when a prop changes.
  const [seenPath, setSeenPath] = useState(pathname)
  if (pathname !== seenPath) {
    setSeenPath(pathname)
    setPanel(null)
  }

  const close = useCallback(() => {
    setPanel(null)
    lastTrigger.current?.focus()
  }, [])

  const onSearchClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    lastTrigger.current = e.currentTarget
    setPanel((cur) => (cur === 'search' ? null : 'search'))
  }, [])
  const onMenuClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    lastTrigger.current = e.currentTarget
    setPanel((cur) => (cur === 'menu' ? null : 'menu'))
  }, [])

  // Esc to close + focus trap while a panel is open.
  useEffect(() => {
    if (!panel) return
    const node = panelRef.current
    node?.querySelectorAll<HTMLElement>(FOCUSABLE)[0]?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
        return
      }
      if (e.key !== 'Tab' || !node) return
      const els = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      )
      if (els.length === 0) return
      const first = els[0]
      const last = els[els.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [panel, close])

  return (
    <>
      <div className="kf-mobile-controls">
        <button
          type="button"
          className="kf-icon-btn"
          data-dark={dark ? '' : undefined}
          aria-label="Search"
          aria-expanded={panel === 'search'}
          aria-controls={searchId}
          onClick={onSearchClick}
        >
          <Icon name="search" size={20} />
        </button>
        <button
          type="button"
          className="kf-icon-btn"
          data-dark={dark ? '' : undefined}
          aria-label={panel === 'menu' ? 'Close menu' : 'Open menu'}
          aria-expanded={panel === 'menu'}
          aria-controls={menuId}
          onClick={onMenuClick}
        >
          <Icon name={panel === 'menu' ? 'close' : 'menu'} size={22} />
        </button>
      </div>

      {panel ? <div className="kf-mobile-scrim" onClick={close} aria-hidden="true" /> : null}

      {panel === 'search' ? (
        <div ref={panelRef} id={searchId} className="kf-mobile-panel kf-mobile-only">
          <HeaderSearch label="Site search" />
        </div>
      ) : null}

      {panel === 'menu' ? (
        <div ref={panelRef} id={menuId} className="kf-mobile-panel kf-mobile-only">
          <nav aria-label="Primary">
            {items.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                className="kf-mobile-nav-link"
                aria-current={isActive(pathname, it) ? 'page' : undefined}
              >
                {it.label}
                <Icon name="chevR" size={18} style={{ opacity: 0.5 }} />
              </Link>
            ))}
          </nav>
          <Link href={submitHref} className="btn btn-primary btn-lg kf-mobile-submit">
            <Icon name="plus" size={18} /> Submit a listing or event
          </Link>
        </div>
      ) : null}
    </>
  )
}
