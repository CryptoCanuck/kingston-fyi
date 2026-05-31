import React from 'react'
import { Newsreader, Source_Sans_3 } from 'next/font/google'

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

export const metadata = {
  description: 'Kingston.FYI — hyperlocal news, events, and business directory for Kingston, ON.',
  title: 'Kingston.FYI',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" className={`${newsreader.variable} ${sourceSans.variable}`}>
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
