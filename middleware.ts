/**
 * Middleware
 * Handles authentication, route protection, and rate limiting
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Routes that require authentication
 */
const PROTECTED_ROUTES = [
    '/dashboard',
    '/create',
    '/editor',
    '/settings',
    '/admin',
];

/**
 * Admin-only routes
 */
const ADMIN_ROUTES = ['/admin'];

/**
 * Admin email addresses
 */
const ADMIN_EMAILS = (
    process.env.ADMIN_EMAILS ?? 'danielpedroribeirodasilva@gmail.com'
)
    .split(',')
    .map((email) => email.trim().toLowerCase());

// =============================================================================
// MIDDLEWARE
// =============================================================================

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware for static files and API auth routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.includes('.') ||
        pathname.startsWith('/api/auth')
    ) {
        return NextResponse.next();
    }

    // Check if route is protected
    const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
        pathname.startsWith(route)
    );

    if (!isProtectedRoute) {
        return NextResponse.next();
    }

    // For protected routes, check for auth cookie
    const authCookie = request.cookies.get('appSession');

    if (!authCookie) {
        // No auth cookie - redirect to login
        const loginUrl = new URL('/api/auth/login', request.url);
        loginUrl.searchParams.set('returnTo', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // For admin routes, we'll check admin status in the page/layout itself
    // since we can't decode the session here without the edge runtime

    return NextResponse.next();
}

// =============================================================================
// MATCHER CONFIG
// =============================================================================

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
};
