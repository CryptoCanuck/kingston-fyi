import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const VALID_CITIES = ['kingston', 'ottawa', 'montreal', 'toronto', 'vancouver'] as const
type City = (typeof VALID_CITIES)[number]

const PROTECTED_PATHS = ['/profile', '/submit']

function extractCityFromHost(host: string): City {
  const domain = host.split(':')[0].toLowerCase()

  for (const city of VALID_CITIES) {
    if (domain.startsWith(`${city}.`) || domain === `${city}.fyi`) {
      return city
    }
  }

  return 'kingston'
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || 'localhost'
  const city = extractCityFromHost(host)

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-city', city)

  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request: { headers: requestHeaders },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  if (!user && PROTECTED_PATHS.some((path) => pathname.startsWith(path))) {
    const signInUrl = request.nextUrl.clone()
    signInUrl.pathname = '/auth/sign-in'
    signInUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(signInUrl)
  }

  supabaseResponse.headers.set('x-city', city)

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
