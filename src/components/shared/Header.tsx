import Link from 'next/link'
import React from 'react'

import { Icon, Logo } from '@/components/ui'

import { HeaderNav, type NavItem } from './HeaderNav'
import { HeaderSearch } from './HeaderSearch'
import { MobileMenu } from './MobileMenu'

const NAV_ITEMS: NavItem[] = [
  { label: 'News', href: '/news', match: ['/article'] },
  { label: 'Events', href: '/events', match: ['/event'] },
  { label: 'Directory', href: '/directory', match: ['/business'] },
]

const SUBMIT_HREF = '/submit'

/* Sticky site-wide header: wordmark · primary nav · persistent search · Submit CTA.
   Collapses to a hamburger + search drawer ≤860px (MobileMenu island). RSC shell with small
   client islands for the active-state nav, router-aware search, and mobile drawer. */
export const Header = () => {
  return (
    <header className="kf-header">
      <a href="#main" className="kf-skip-link">
        Skip to content
      </a>
      <div className="kf-wrap kf-header-bar">
        <Logo href="/" size={25} />

        <HeaderNav items={NAV_ITEMS} />

        <div className="kf-desktop-search">
          <HeaderSearch compact />
        </div>

        <Link href={SUBMIT_HREF} className="btn btn-primary kf-desktop-cta">
          <Icon name="plus" size={16} /> Submit
        </Link>

        <MobileMenu items={NAV_ITEMS} submitHref={SUBMIT_HREF} />
      </div>
    </header>
  )
}
