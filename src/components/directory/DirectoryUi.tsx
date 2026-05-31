'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

import { Icon } from '@/components/ui'

type View = 'list' | 'map'

interface DirectoryUiValue {
  view: View
  setView: (v: View) => void
  drawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  isMobile: boolean
  filterButtonRef: React.MutableRefObject<HTMLButtonElement | null>
}

const DirectoryUiContext = createContext<DirectoryUiValue | null>(null)

const useDirectoryUi = (): DirectoryUiValue => {
  const ctx = useContext(DirectoryUiContext)
  if (!ctx) throw new Error('DirectoryUi components must be used within <DirectoryUiProvider>')
  return ctx
}

const DRAWER_ID = 'kf-dir-filters'
const MOBILE_QUERY = '(max-width: 860px)'

/**
 * Owns the directory's mobile UI state (list/map view + filter-drawer open) in React, so it
 * survives the RSC re-renders that fire when filters change the URL (imperative DOM-class
 * toggling would be wiped). Pane wrappers below read this to apply the right classes.
 */
export const DirectoryUiProvider = ({ children }: { children: React.ReactNode }) => {
  const [view, setView] = useState<View>('list')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const filterButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY)
    const sync = () => {
      setIsMobile(mq.matches)
      // Leaving mobile width must never leave a drawer "open" in the desktop layout.
      if (!mq.matches) setDrawerOpen(false)
    }
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const openDrawer = useCallback(() => setDrawerOpen(true), [])
  const closeDrawer = useCallback(() => {
    setDrawerOpen(false)
    filterButtonRef.current?.focus()
  }, [])

  return (
    <DirectoryUiContext.Provider
      value={{ view, setView, drawerOpen, openDrawer, closeDrawer, isMobile, filterButtonRef }}
    >
      {children}
    </DirectoryUiContext.Provider>
  )
}

/** Mobile-only control bar (≤860px): opens the filter drawer and toggles list/map view. */
export const DirMobileBar = () => {
  const { view, setView, drawerOpen, openDrawer, closeDrawer, filterButtonRef } = useDirectoryUi()
  return (
    <>
      <div className="kf-dir-mobilebar">
        <button
          ref={filterButtonRef}
          type="button"
          className="btn btn-ghost btn-sm"
          aria-haspopup="dialog"
          aria-expanded={drawerOpen}
          aria-controls={DRAWER_ID}
          onClick={openDrawer}
        >
          <Icon name="filter" size={16} /> Filters
        </button>
        <div className="kf-viewtoggle" role="group" aria-label="Directory view">
          <button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}>
            <Icon name="list" size={15} /> List
          </button>
          <button type="button" aria-pressed={view === 'map'} onClick={() => setView('map')}>
            <Icon name="map" size={15} /> Map
          </button>
        </div>
      </div>
      {drawerOpen && (
        <div className="kf-dir-scrim" aria-hidden="true" onClick={closeDrawer} />
      )}
    </>
  )
}

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

/**
 * The filters column. On desktop it's a static sidebar; on mobile it becomes a slide-in dialog
 * with focus management (focus moves in on open, Tab is trapped, Escape closes) and is made
 * `inert` when closed so off-canvas controls aren't focusable (NFR3).
 */
export const FiltersDrawer = ({ children }: { children: React.ReactNode }) => {
  const { drawerOpen, closeDrawer, isMobile } = useDirectoryUi()
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!drawerOpen) return
    const node = ref.current
    node?.querySelector<HTMLElement>(FOCUSABLE)?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDrawer()
        return
      }
      if (e.key !== 'Tab' || !node) return
      const focusables = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
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
  }, [drawerOpen, closeDrawer])

  const asDialog = isMobile
  return (
    <aside
      ref={ref}
      id={DRAWER_ID}
      className={'kf-dir-filters scroll-y' + (drawerOpen ? ' is-open' : '')}
      // Only behaves as a modal dialog on mobile; on desktop it's a plain sidebar region.
      role={asDialog ? 'dialog' : undefined}
      aria-modal={asDialog ? true : undefined}
      aria-label={asDialog ? 'Filters' : undefined}
      inert={isMobile && !drawerOpen ? true : undefined}
    >
      <div style={{ padding: '22px 22px 40px' }}>
        <div className="kf-drawer-head">
          <h2 style={{ fontSize: 18 }}>Filters</h2>
          <button
            type="button"
            className="kf-icon-btn"
            aria-label="Close filters"
            onClick={closeDrawer}
          >
            <Icon name="close" size={18} />
          </button>
        </div>
        {children}
      </div>
    </aside>
  )
}

/** "Show N results" — applies the (already-live) filters by closing the drawer (mobile only). */
export const ApplyFiltersButton = ({ total }: { total: number }) => {
  const { closeDrawer } = useDirectoryUi()
  return (
    <button
      type="button"
      className="btn btn-dark kf-apply-filters"
      style={{ width: '100%', marginTop: 20 }}
      onClick={closeDrawer}
    >
      Show {total} {total === 1 ? 'result' : 'results'}
    </button>
  )
}

/** List column wrapper — hidden on mobile when the map view is active. */
export const DirListPane = ({ children }: { children: React.ReactNode }) => {
  const { view } = useDirectoryUi()
  return (
    <section className={'kf-dir-list scroll-y' + (view === 'map' ? ' kf-mobile-hidden' : '')}>
      {children}
    </section>
  )
}

/** Map column wrapper — hidden on mobile when the list view is active. */
export const DirMapPane = ({ children }: { children: React.ReactNode }) => {
  const { view } = useDirectoryUi()
  return (
    <section className={'kf-dir-map' + (view === 'list' ? ' kf-mobile-hidden' : '')}>
      {children}
    </section>
  )
}
