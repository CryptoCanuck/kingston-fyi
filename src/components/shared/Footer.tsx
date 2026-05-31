import Link from 'next/link'
import React from 'react'

import { Icon, type IconName, Logo } from '@/components/ui'

import { NewsletterBand } from './NewsletterBand'

type FooterColumn = {
  heading: string
  links: { label: string; href: string }[]
}

const COLUMNS: FooterColumn[] = [
  {
    heading: 'Sections',
    links: [
      { label: 'Local News', href: '/news' },
      { label: 'Events', href: '/events' },
      { label: 'Business Directory', href: '/directory' },
      { label: 'Submit a Listing', href: '/submit' },
    ],
  },
  {
    heading: 'Explore',
    links: [
      { label: 'This Weekend', href: '/events' },
      { label: 'Open Now', href: '/directory' },
      { label: 'Trending', href: '/news' },
      { label: 'Neighbourhoods', href: '/directory' },
    ],
  },
  {
    heading: 'About',
    links: [
      { label: 'Our Mission', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Advertise', href: '/advertise' },
      { label: 'Editorial Policy', href: '/editorial-policy' },
    ],
  },
]

const SOCIAL: { icon: IconName; label: string; href: string }[] = [
  { icon: 'share', label: 'Share Kingston.FYI', href: '#' },
  { icon: 'mail', label: 'Email us', href: '#' },
  { icon: 'globe', label: 'Our website', href: '#' },
]

/* Site-wide footer: newsletter band + link columns + social + legal row. RSC. */
export const Footer = () => {
  return (
    <footer className="kf-footer">
      <NewsletterBand />
      <div className="kf-wrap kf-footer-inner">
        <div className="kf-footer-grid">
          <div className="kf-footer-brand">
            <Logo light href="/" size={26} />
            <p className="kf-footer-blurb">
              Independent, hyperlocal coverage of Kingston, Ontario — the news, events and
              businesses that make the Limestone City tick.
            </p>
            <div className="kf-footer-social">
              {SOCIAL.map((s) => (
                <a key={s.label} href={s.href} aria-label={s.label} className="kf-social-link">
                  <Icon name={s.icon} size={17} />
                </a>
              ))}
            </div>
          </div>
          {COLUMNS.map((col) => (
            <nav key={col.heading} className="kf-footer-col" aria-label={col.heading}>
              <h2 className="kf-footer-col-head">{col.heading}</h2>
              <ul className="kf-footer-col-list">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="kf-footer-link">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="kf-footer-legal">
          <span>© 2026 Kingston.FYI — A community publication.</span>
          <span className="kf-footer-legal-links">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <span>Kingston, Ontario</span>
          </span>
        </div>
      </div>
    </footer>
  )
}
