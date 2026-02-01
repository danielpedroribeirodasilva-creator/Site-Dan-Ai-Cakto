/**
 * useUser Hook
 * Custom hook for user authentication state
 */

'use client';

import * as React from 'react';
import useSWR from 'swr';
import { useUserStore, UserState } from '@/stores/userStore';

// =============================================================================
// TYPES
// =============================================================================

interface Auth0User {
    sub: string;
    email: string;
    name: string;
    picture?: string;
}

interface UseUserReturn {
    user: UserState | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: Error | undefined;
    refresh: () => Promise<void>;
}

// =============================================================================
// FETCHER
// =============================================================================

async function fetcher(url: string) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
}

// =============================================================================
// HOOK
// =============================================================================

export function useUser(): UseUserReturn {
    const { user: storeUser, setUser, clearUser } = useUserStore();

    // Fetch user from API
    const { data, error, isLoading, mutate } = useSWR<{ user: Auth0User | null }>(
        '/api/auth/me',
        fetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 60000, // 1 minute
        }
    );

    // Sync with store
    React.useEffect(() => {
        if (data?.user) {
            const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? 'danielpedroribeirodasilva@gmail.com')
                .split(',')
                .map((e) => e.trim().toLowerCase());

            const isAdmin = adminEmails.includes(data.user.email?.toLowerCase() ?? '');

            setUser({
                id: data.user.sub,
                email: data.user.email,
                name: data.user.name,
                picture: data.user.picture,
                isAdmin,
                credits: isAdmin ? Infinity : 0,
                displayCredits: isAdmin ? '∞' : '0.00',
            });
        } else if (data && !data.user) {
            clearUser();
        }
    }, [data, setUser, clearUser]);

    const refresh = React.useCallback(async () => {
        await mutate();
    }, [mutate]);

    return {
        user: storeUser,
        isLoading,
        isAuthenticated: !!storeUser,
        error,
        refresh,
    };
}

export default useUser;
