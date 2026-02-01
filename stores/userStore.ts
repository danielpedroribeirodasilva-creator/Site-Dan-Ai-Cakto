/**
 * User Store (Zustand)
 * Manages user state, preferences, and session data
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserSession, UserPreferences } from '@/types';

// =============================================================================
// TYPES
// =============================================================================

interface UserState {
    // User data
    user: UserSession | null;
    isLoading: boolean;
    isAuthenticated: boolean;

    // Actions
    setUser: (user: UserSession | null) => void;
    updateUser: (updates: Partial<UserSession>) => void;
    updatePreferences: (preferences: Partial<UserPreferences>) => void;
    updateCredits: (credits: number) => void;
    clearUser: () => void;
    setLoading: (loading: boolean) => void;
}

// =============================================================================
// STORE
// =============================================================================

/**
 * User store with persistence
 * Syncs user data across tabs and persists to localStorage
 */
export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            // Initial state
            user: null,
            isLoading: true,
            isAuthenticated: false,

            // Set user (login/session restore)
            setUser: (user) => {
                set({
                    user,
                    isAuthenticated: !!user,
                    isLoading: false,
                });
            },

            // Update user fields
            updateUser: (updates) => {
                const currentUser = get().user;
                if (!currentUser) return;

                set({
                    user: { ...currentUser, ...updates },
                });
            },

            // Update preferences
            updatePreferences: (preferences) => {
                const currentUser = get().user;
                if (!currentUser) return;

                set({
                    user: {
                        ...currentUser,
                        preferences: {
                            ...currentUser.preferences,
                            ...preferences,
                        },
                    },
                });
            },

            // Update credits (realtime sync)
            updateCredits: (credits) => {
                const currentUser = get().user;
                if (!currentUser) return;

                // Don't update if admin (always infinity)
                if (currentUser.isAdmin) return;

                set({
                    user: {
                        ...currentUser,
                        credits,
                        displayCredits: credits.toFixed(2),
                    },
                });
            },

            // Clear user (logout)
            clearUser: () => {
                set({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
            },

            // Set loading state
            setLoading: (loading) => {
                set({ isLoading: loading });
            },
        }),
        {
            name: 'plataforma-ia-user',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                // Only persist certain fields
                user: state.user,
            }),
        }
    )
);

// =============================================================================
// SELECTORS
// =============================================================================

/**
 * Check if user is admin
 */
export const selectIsAdmin = (state: UserState): boolean => {
    return state.user?.isAdmin ?? false;
};

/**
 * Get user credits display string
 */
export const selectCreditsDisplay = (state: UserState): string => {
    return state.user?.displayCredits ?? '0.00';
};

/**
 * Get user theme preference
 */
export const selectTheme = (state: UserState): 'dark' | 'light' | 'system' => {
    return state.user?.preferences?.theme ?? 'dark';
};

/**
 * Get reduced motion preference
 */
export const selectReducedMotion = (state: UserState): boolean => {
    return state.user?.preferences?.reducedMotion ?? false;
};

export default useUserStore;
