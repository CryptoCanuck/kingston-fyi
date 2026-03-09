import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { getCityFromHeaders, CITY_CONFIG } from '@/lib/city'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export async function generateMetadata(): Promise<Metadata> {
  const city = await getCityFromHeaders()
  const config = CITY_CONFIG[city]

  return {
    title: {
      default: `${config.name}.FYI - ${config.tagline}`,
      template: `%s | ${config.name}.FYI`,
    },
    description: `${config.tagline} - Your local community directory for ${config.name}. Find places, events, and more.`,
    openGraph: {
      siteName: `${config.name}.FYI`,
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const city = await getCityFromHeaders()
  const config = CITY_CONFIG[city]

  return (
    <html
      lang="en"
      style={{
        '--city-primary': config.colors.primary,
        '--city-primary-light': config.colors.primaryLight,
        '--city-primary-dark': config.colors.primary,
        '--city-accent': config.colors.primaryLight,
      } as React.CSSProperties}
    >
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <Header cityName={config.name} />
        <main className="flex-1">{children}</main>
        <Footer cityName={config.name} />
      </body>
    </html>
  )
}
