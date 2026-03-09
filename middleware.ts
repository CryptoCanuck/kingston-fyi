import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const VALID_CITIES = ['kingston', 'ottawa', 'montreal'] as const
type City = (typeof VALID_CITIES)[number]

function extractCityFromHost(host: string): City {
  // Extract domain from host (remove port if present)
  const domain = host.split(':')[0].toLowerCase()

  // Check for city-specific domains
  for (const city of VALID_CITIES) {
    if (domain.startsWith(`${city}.`) || domain === `${city}.fyi`) {
      return city
    }
  }

  // Default to kingston for localhost or unknown domains
  return 'kingston'
}

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || 'localhost'
  const city = extractCityFromHost(host)

  // Clone the request headers and add x-city
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-city', city)

  // Create response with modified headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Also set x-city in response headers for debugging
  response.headers.set('x-city', city)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
