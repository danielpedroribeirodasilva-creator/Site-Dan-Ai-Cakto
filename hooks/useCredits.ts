/**
 * useCredits Hook
 * Real-time credit balance management with polling
 */

'use client';

import * as React from 'react';
import useSWR from 'swr';
import { useUserStore } from '@/stores/userStore';

// =============================================================================
// TYPES
// =============================================================================

interface CreditsData {
    balance: {
        credits: number;
        displayCredits: string;
        isAdmin: boolean;
    };
    transactions?: Array<{
        id: string;
        type: string;
        amount: number;
        balance: number;
        description: string;
        createdAt: string;
    }>;
    pagination?: {
        page: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

interface UseCreditsReturn {
    /** Current credit balance */
    credits: number;
    /** Display string for credits */
    displayCredits: string;
    /** Whether user is admin (infinite credits) */
    isAdmin: boolean;
    /** Recent transactions */
    transactions: CreditsData['transactions'];
    /** Pagination info */
    pagination: CreditsData['pagination'];
    /** Whether data is loading */
    isLoading: boolean;
    /** Error if any */
    error: Error | undefined;
    /** Refetch credits data */
    refetch: () => Promise<void>;
    /** Check if user has enough credits */
    hasEnough: (amount: number) => boolean;
}

// =============================================================================
// FETCHER
// =============================================================================

const fetcher = async (url: string): Promise<CreditsData> => {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error('Failed to fetch credits');
    }
    return res.json();
};

// =============================================================================
// HOOK
// =============================================================================

/**
 * useCredits - Real-time credit balance hook with polling
 * 
 * @param options - Configuration options
 * @param options.includeHistory - Include transaction history
 * @param options.pollingInterval - Polling interval in ms (default: 5000)
 * 
 * @example
 * const { credits, hasEnough, refetch } = useCredits();
 * if (hasEnough(2)) { // Check if user has 2+ credits
 *   // Proceed with action
 * }
 */
export function useCredits(options?: {
    includeHistory?: boolean;
    pollingInterval?: number;
}): UseCreditsReturn {
    const { includeHistory = false, pollingInterval = 5000 } = options ?? {};
    const { updateCredits } = useUserStore();

    // Build API URL
    const url = includeHistory ? '/api/credits?history=true' : '/api/credits';

    // Fetch with SWR
    const { data, error, isLoading, mutate } = useSWR<CreditsData>(
        url,
        fetcher,
        {
            refreshInterval: pollingInterval,
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            dedupingInterval: 2000,
        }
    );

    // Sync credits to store when data changes
    React.useEffect(() => {
        if (data?.balance && !data.balance.isAdmin) {
            updateCredits(data.balance.credits);
        }
    }, [data, updateCredits]);

    // Refetch function
    const refetch = React.useCallback(async () => {
        await mutate();
    }, [mutate]);

    // Check if user has enough credits
    const hasEnough = React.useCallback(
        (amount: number): boolean => {
            if (data?.balance.isAdmin) return true;
            return (data?.balance.credits ?? 0) >= amount;
        },
        [data]
    );

    return {
        credits: data?.balance.credits ?? 0,
        displayCredits: data?.balance.displayCredits ?? '0.00',
        isAdmin: data?.balance.isAdmin ?? false,
        transactions: data?.transactions,
        pagination: data?.pagination,
        isLoading,
        error,
        refetch,
        hasEnough,
    };
}

export default useCredits;
