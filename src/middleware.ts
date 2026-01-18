import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import NextAuth from 'next-auth';
import { authEdgeConfig } from '@/lib/auth.edge';

// Create an edge-compatible auth instance for middleware
const { auth } = NextAuth(authEdgeConfig);

// Define protected routes and their required roles
const protectedRoutes = {
  '/admin': ['admin'],
  '/moderate': ['admin', 'moderator'],
  '/business': ['admin', 'business_owner'],
  '/profile': ['user', 'business_owner', 'moderator', 'admin'],
  '/add-listing': ['user', 'business_owner', 'moderator', 'admin'],
};

// Define API routes and their required roles
const protectedApiRoutes: Record<string, Record<string, string[]>> = {
  '/api/submissions': {
    GET: ['admin', 'moderator'],
    POST: ['user', 'business_owner', 'moderator', 'admin'],
    PUT: ['admin', 'moderator'],
    DELETE: ['admin'],
  },
  '/api/places': {
    POST: ['business_owner', 'moderator', 'admin'],
    PUT: ['business_owner', 'moderator', 'admin'],
    DELETE: ['admin'],
  },
  '/api/events': {
    POST: ['business_owner', 'moderator', 'admin'],
    PUT: ['business_owner', 'moderator', 'admin'],
    DELETE: ['admin'],
  },
  '/api/reviews': {
    POST: ['user', 'business_owner', 'moderator', 'admin'],
    PUT: ['user', 'business_owner', 'moderator', 'admin'],
    DELETE: ['user', 'business_owner', 'moderator', 'admin'],
  },
  '/api/admin': {
    ALL: ['admin'],
  },
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Check if the route is protected
  const isProtectedRoute = Object.keys(protectedRoutes).some(route => 
    pathname.startsWith(route)
  );

  // Check if the API route is protected
  const protectedApiRoute = Object.keys(protectedApiRoutes).find(route =>
    pathname.startsWith(route)
  );

  // If neither protected route nor API, allow access
  if (!isProtectedRoute && !protectedApiRoute) {
    return NextResponse.next();
  }

  try {
    // Get the session
    const session = await auth();

    // If no session, redirect to sign in
    if (!session?.user) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Check role-based access for protected routes
    if (isProtectedRoute) {
      const requiredRoles = Object.entries(protectedRoutes).find(([route]) =>
        pathname.startsWith(route)
      )?.[1];

      if (requiredRoles && !requiredRoles.includes(session.user.role)) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }

    // Check role-based access for API routes
    if (protectedApiRoute) {
      const routeConfig = protectedApiRoutes[protectedApiRoute];
      const requiredRoles =
        routeConfig[method] ||
        routeConfig['ALL'] ||
        null;

      if (requiredRoles && !requiredRoles.includes(session.user.role)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
    }

    // Add user info to headers for API routes
    if (pathname.startsWith('/api/')) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', session.user.id);
      requestHeaders.set('x-user-role', session.user.role);
      requestHeaders.set('x-user-email', session.user.email || '');

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
    
    return NextResponse.redirect(new URL('/error', request.url));
  }
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - auth routes (sign in/out pages)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|auth).*)',
  ],
};