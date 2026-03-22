import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { getCityFromHeaders, CITY_CONFIG } from '@/lib/city'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { AuthProvider } from '@/components/auth/auth-provider'
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
      default: `${config.name}.FYI — ${config.tagline}`,
      template: `%s | ${config.name}.FYI`,
    },
    description: `${config.description}. Your local community directory for ${config.name}. Find places, events, news, and more.`,
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

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <html
      lang="en"
      style={{
        '--city-primary': config.colors.primary,
        '--city-primary-light': config.colors.primaryLight,
        '--city-primary-dark': config.colors.primaryDark,
        '--city-accent': config.colors.accent,
        '--city-gradient-from': config.colors.gradientFrom,
        '--city-gradient-to': config.colors.gradientTo,
        '--city-surface': config.colors.surface,
      } as React.CSSProperties}
    >
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col bg-gray-50`}>
        <AuthProvider initialUser={user}>
          <Header cityName={config.name} cityTagline={config.tagline} />
          <main className="flex-1">{children}</main>
          <Footer cityName={config.name} />
        </AuthProvider>
      </body>
    </html>
  )
}
