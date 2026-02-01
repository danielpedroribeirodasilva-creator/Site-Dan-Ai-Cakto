/**
 * Auth Helpers
 * Server-side authentication utilities
 */

import { cookies } from 'next/headers';
import { prisma } from './prisma';

// =============================================================================
// TYPES
// =============================================================================

export interface SessionUser {
    sub: string;
    email: string;
    name: string;
    picture?: string;
}

export interface Session {
    user: SessionUser;
    accessToken: string;
    expiresAt: number;
}

export interface AppUser {
    id: string;
    auth0Id: string;
    email: string;
    name: string | null;
    picture: string | null;
    credits: number;
    role: string;
    isAdmin: boolean;
}

// =============================================================================
// ADMIN CONFIG
// =============================================================================

const ADMIN_EMAILS = (
    process.env.ADMIN_EMAILS ?? 'danielpedroribeirodasilva@gmail.com'
)
    .split(',')
    .map((email) => email.trim().toLowerCase());

// =============================================================================
// SESSION HELPERS
// =============================================================================

/**
 * Get the current session from cookies
 */
export async function getSession(): Promise<Session | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('appSession');

    if (!sessionCookie) {
        return null;
    }

    try {
        const session = JSON.parse(
            Buffer.from(sessionCookie.value, 'base64').toString()
        ) as Session;

        // Check if expired
        if (session.expiresAt < Date.now()) {
            return null;
        }

        return session;
    } catch {
        return null;
    }
}

/**
 * Get current user from session and sync with database
 */
export async function getCurrentUser(): Promise<AppUser | null> {
    const session = await getSession();

    if (!session?.user) {
        return null;
    }

    const { sub, email, name, picture } = session.user;

    try {
        // Upsert user in database
        const user = await prisma.user.upsert({
            where: { auth0Id: sub },
            update: {
                email,
                name,
                picture,
                lastLoginAt: new Date(),
            },
            create: {
                auth0Id: sub,
                email,
                name,
                picture,
                credits: 100, // Starting credits
                role: ADMIN_EMAILS.includes(email.toLowerCase()) ? 'ADMIN' : 'USER',
            },
        });

        const isAdmin = user.role === 'ADMIN' || ADMIN_EMAILS.includes(email.toLowerCase());

        return {
            id: user.id,
            auth0Id: user.auth0Id,
            email: user.email,
            name: user.name,
            picture: user.picture,
            credits: isAdmin ? Infinity : user.credits,
            role: user.role,
            isAdmin,
        };
    } catch (error) {
        console.error('[Auth] Error syncing user:', error);

        // Return basic user info even if DB fails
        return {
            id: sub,
            auth0Id: sub,
            email,
            name,
            picture,
            credits: 0,
            role: 'USER',
            isAdmin: ADMIN_EMAILS.includes(email.toLowerCase()),
        };
    }
}

/**
 * Check if current user is admin
 */
export async function isAdmin(): Promise<boolean> {
    const user = await getCurrentUser();
    return user?.isAdmin ?? false;
}

/**
 * Deduct credits from user account
 */
export async function deductCredits(
    userId: string,
    amount: number,
    description: string
): Promise<{ success: boolean; remaining: number }> {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return { success: false, remaining: 0 };
        }

        // Admin has unlimited credits
        if (user.role === 'ADMIN' || ADMIN_EMAILS.includes(user.email.toLowerCase())) {
            return { success: true, remaining: Infinity };
        }

        // Check sufficient credits
        if (user.credits < amount) {
            return { success: false, remaining: user.credits };
        }

        // Deduct credits
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                credits: { decrement: amount },
            },
        });

        // Log transaction
        await prisma.creditTransaction.create({
            data: {
                userId,
                amount: -amount,
                type: 'USAGE',
                description,
            },
        });

        return { success: true, remaining: updatedUser.credits };
    } catch (error) {
        console.error('[Auth] Error deducting credits:', error);
        return { success: false, remaining: 0 };
    }
}

/**
 * Add credits to user account
 */
export async function addCredits(
    userId: string,
    amount: number,
    description: string,
    type: 'PURCHASE' | 'BONUS' | 'REFUND' = 'PURCHASE'
): Promise<{ success: boolean; total: number }> {
    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                credits: { increment: amount },
            },
        });

        await prisma.creditTransaction.create({
            data: {
                userId,
                amount,
                type,
                description,
            },
        });

        return { success: true, total: updatedUser.credits };
    } catch (error) {
        console.error('[Auth] Error adding credits:', error);
        return { success: false, total: 0 };
    }
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(): Promise<AppUser> {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    return user;
}

/**
 * Require admin role - throws if not admin
 */
export async function requireAdmin(): Promise<AppUser> {
    const user = await requireAuth();

    if (!user.isAdmin) {
        throw new Error('Forbidden');
    }

    return user;
}
