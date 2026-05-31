import React from 'react'
import type { Metadata } from 'next'
import { Newsreader, Source_Sans_3 } from 'next/font/google'

import { Footer, Header } from '@/components/shared'
import { JsonLd, buildBreadcrumbList, buildOrganization, rootMetadata } from '@/lib/seo'

import '@/styles/globals.css'

// Serif headlines — warm contemporary serif, weight 600, balanced.
const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-newsreader',
})

// Body / UI sans — base 17px / 1.55 (see globals.css).
const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  display: 'swap',
  variable: '--font-source-sans',
})

// Site-wide metadata defaults (FR6 / NFR1) — title template, description, metadataBase.
export const metadata: Metadata = rootMetadata()

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  // Site-wide structured data (NFR1): Organization + a root BreadcrumbList (Home).
  const siteJsonLd = [buildOrganization(), buildBreadcrumbList([{ name: 'Home', path: '/' }])]

  return (
    <html lang="en" className={`${newsreader.variable} ${sourceSans.variable}`}>
      <body>
        <JsonLd data={siteJsonLd} />
        <div className="kf-app">
          <Header />
          <main id="main" className="kf-main">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
