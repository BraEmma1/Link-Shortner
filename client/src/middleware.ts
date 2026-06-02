import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/links',
  '/analytics',
  '/qrcodes',
  '/settings',
];

// Routes that authenticated users should not access
const AUTH_ROUTES = ['/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('vaultz_token')?.value;
  const isAuthenticated = Boolean(token);

  // ── Guard: unauthenticated user trying to access protected route ──
  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    // Preserve the intended destination so we can redirect after login
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Guard: authenticated user trying to access login page ──
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Run middleware on all routes except Next.js internals and static files
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
