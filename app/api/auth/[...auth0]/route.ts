/**
 * Auth0 Route Handler
 * Handles authentication routes for Auth0 v4
 */

import { NextRequest, NextResponse } from 'next/server';

// Auth0 v4 uses a different approach - we redirect to Auth0 Universal Login
const AUTH0_DOMAIN = process.env.AUTH0_ISSUER_BASE_URL?.replace('https://', '') ?? '';
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID ?? '';
const AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET ?? '';
const APP_BASE_URL = process.env.AUTH0_BASE_URL ?? 'http://localhost:3000';

/**
 * Dynamic route handler for Auth0 authentication
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ auth0: string[] }> }
) {
    const { auth0 } = await params;
    const action = auth0?.[0];

    switch (action) {
        case 'login':
            return handleLogin(request);
        case 'logout':
            return handleLogout(request);
        case 'callback':
            return handleCallback(request);
        case 'me':
            return handleMe(request);
        default:
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
}

/**
 * Handle login - redirect to Auth0 Universal Login
 */
function handleLogin(request: NextRequest) {
    const returnTo = request.nextUrl.searchParams.get('returnTo') ?? '/dashboard';

    const authUrl = new URL(`https://${AUTH0_DOMAIN}/authorize`);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', AUTH0_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', `${APP_BASE_URL}/api/auth/callback`);
    authUrl.searchParams.set('scope', 'openid profile email');
    authUrl.searchParams.set('state', encodeURIComponent(returnTo));

    return NextResponse.redirect(authUrl);
}

/**
 * Handle logout - redirect to Auth0 logout
 */
function handleLogout(request: NextRequest) {
    const returnTo = request.nextUrl.searchParams.get('returnTo') ?? '/';

    const logoutUrl = new URL(`https://${AUTH0_DOMAIN}/v2/logout`);
    logoutUrl.searchParams.set('client_id', AUTH0_CLIENT_ID);
    logoutUrl.searchParams.set('returnTo', `${APP_BASE_URL}${returnTo}`);

    // Clear the session cookie
    const response = NextResponse.redirect(logoutUrl);
    response.cookies.delete('appSession');

    return response;
}

/**
 * Handle callback - exchange code for tokens
 */
async function handleCallback(request: NextRequest) {
    const code = request.nextUrl.searchParams.get('code');
    const state = request.nextUrl.searchParams.get('state');
    const returnTo = state ? decodeURIComponent(state) : '/dashboard';

    if (!code) {
        return NextResponse.redirect(new URL('/api/auth/login', APP_BASE_URL));
    }

    try {
        // Exchange code for tokens
        const tokenResponse = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                grant_type: 'authorization_code',
                client_id: AUTH0_CLIENT_ID,
                client_secret: AUTH0_CLIENT_SECRET,
                code,
                redirect_uri: `${APP_BASE_URL}/api/auth/callback`,
            }),
        });

        if (!tokenResponse.ok) {
            console.error('Token exchange failed');
            return NextResponse.redirect(new URL('/?error=auth_failed', APP_BASE_URL));
        }

        const tokens = await tokenResponse.json();

        // Get user info
        const userInfoResponse = await fetch(`https://${AUTH0_DOMAIN}/userinfo`, {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });

        const userInfo = await userInfoResponse.json();

        // Create session data
        const sessionData = {
            user: {
                sub: userInfo.sub,
                email: userInfo.email,
                name: userInfo.name,
                picture: userInfo.picture,
            },
            accessToken: tokens.access_token,
            expiresAt: Date.now() + tokens.expires_in * 1000,
        };

        // Set session cookie
        const response = NextResponse.redirect(new URL(returnTo, APP_BASE_URL));
        response.cookies.set('appSession', Buffer.from(JSON.stringify(sessionData)).toString('base64'), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Callback error:', error);
        return NextResponse.redirect(new URL('/?error=auth_failed', APP_BASE_URL));
    }
}

/**
 * Handle /me - return current user info
 */
function handleMe(request: NextRequest) {
    const sessionCookie = request.cookies.get('appSession');

    if (!sessionCookie) {
        return NextResponse.json({ user: null });
    }

    try {
        const session = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString());

        if (session.expiresAt < Date.now()) {
            return NextResponse.json({ user: null });
        }

        return NextResponse.json({ user: session.user });
    } catch {
        return NextResponse.json({ user: null });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ auth0: string[] }> }
) {
    return GET(request, { params });
}
