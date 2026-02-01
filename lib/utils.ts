/**
 * Utility Functions
 * Collection of helper functions used throughout the application
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// =============================================================================
// CLASSNAME UTILITIES
// =============================================================================

/**
 * Merge Tailwind CSS classes with conflict resolution
 * Combines clsx for conditional classes and tailwind-merge for deduplication
 * 
 * @param inputs - Class values to merge
 * @returns Merged class string
 * 
 * @example
 * cn('px-4 py-2', isActive && 'bg-neon-500', 'hover:bg-neon-600')
 */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}

// =============================================================================
// STRING UTILITIES
// =============================================================================

/**
 * Generate a URL-friendly slug from a string
 * 
 * @param str - String to slugify
 * @returns Slugified string
 */
export function slugify(str: string): string {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Truncate a string to a maximum length with ellipsis
 * 
 * @param str - String to truncate
 * @param maxLength - Maximum length (default: 50)
 * @returns Truncated string
 */
export function truncate(str: string, maxLength: number = 50): string {
    if (str.length <= maxLength) return str;
    return `${str.slice(0, maxLength).trim()}...`;
}

/**
 * Capitalize the first letter of a string
 * 
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate a random string of specified length
 * 
 * @param length - Length of the string (default: 8)
 * @returns Random string
 */
export function randomString(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// =============================================================================
// NUMBER UTILITIES
// =============================================================================

/**
 * Format a number as currency (BRL default)
 * 
 * @param value - Number to format
 * @param currency - Currency code (default: 'BRL')
 * @param locale - Locale (default: 'pt-BR')
 * @returns Formatted currency string
 */
export function formatCurrency(
    value: number,
    currency: string = 'BRL',
    locale: string = 'pt-BR'
): string {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

/**
 * Format a number with thousands separators
 * 
 * @param value - Number to format
 * @param locale - Locale (default: 'pt-BR')
 * @returns Formatted number string
 */
export function formatNumber(value: number, locale: string = 'pt-BR'): string {
    return new Intl.NumberFormat(locale).format(value);
}

/**
 * Format credits display with appropriate precision
 * Handles infinity for admin users
 * 
 * @param credits - Credits value
 * @returns Formatted credits string
 */
export function formatCredits(credits: number): string {
    if (!isFinite(credits)) return '∞';
    return credits.toFixed(2);
}

/**
 * Clamp a number between min and max values
 * 
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/**
 * Generate a random number between min and max (inclusive)
 * 
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Random number
 */
export function randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// =============================================================================
// DATE UTILITIES
// =============================================================================

/**
 * Format a date to relative time (e.g., "2 hours ago")
 * 
 * @param date - Date to format
 * @param locale - Locale (default: 'pt-BR')
 * @returns Relative time string
 */
export function formatRelativeTime(
    date: Date | string,
    locale: string = 'pt-BR'
): string {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    const intervals = [
        { label: 'ano', seconds: 31536000 },
        { label: 'mês', seconds: 2592000 },
        { label: 'semana', seconds: 604800 },
        { label: 'dia', seconds: 86400 },
        { label: 'hora', seconds: 3600 },
        { label: 'minuto', seconds: 60 },
        { label: 'segundo', seconds: 1 },
    ];

    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) {
            const plural = count > 1 ? 's' : '';
            return `há ${count} ${interval.label}${plural}`;
        }
    }

    return 'agora mesmo';
}

/**
 * Format a date to a localized string
 * 
 * @param date - Date to format
 * @param options - Intl.DateTimeFormatOptions
 * @param locale - Locale (default: 'pt-BR')
 * @returns Formatted date string
 */
export function formatDate(
    date: Date | string,
    options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    },
    locale: string = 'pt-BR'
): string {
    return new Intl.DateTimeFormat(locale, options).format(new Date(date));
}

// =============================================================================
// ASYNC UTILITIES
// =============================================================================

/**
 * Debounce a function
 * 
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout>;

    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}

/**
 * Throttle a function
 * 
 * @param fn - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
    fn: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle = false;

    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            fn(...args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
}

/**
 * Sleep for a specified duration
 * 
 * @param ms - Duration in milliseconds
 * @returns Promise that resolves after the duration
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 * 
 * @param fn - Async function to retry
 * @param maxRetries - Maximum number of retries (default: 3)
 * @param baseDelay - Base delay in ms (default: 1000)
 * @returns Result of the function
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));

            if (attempt < maxRetries) {
                const delay = baseDelay * Math.pow(2, attempt);
                await sleep(delay);
            }
        }
    }

    throw lastError;
}

// =============================================================================
// OBJECT UTILITIES
// =============================================================================

/**
 * Deep clone an object
 * 
 * @param obj - Object to clone
 * @returns Cloned object
 */
export function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 * 
 * @param value - Value to check
 * @returns True if empty
 */
export function isEmpty(value: unknown): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
}

/**
 * Pick specific keys from an object
 * 
 * @param obj - Source object
 * @param keys - Keys to pick
 * @returns New object with only specified keys
 */
export function pick<T extends Record<string, unknown>, K extends keyof T>(
    obj: T,
    keys: K[]
): Pick<T, K> {
    const result = {} as Pick<T, K>;
    for (const key of keys) {
        if (key in obj) {
            result[key] = obj[key];
        }
    }
    return result;
}

/**
 * Omit specific keys from an object
 * 
 * @param obj - Source object
 * @param keys - Keys to omit
 * @returns New object without specified keys
 */
export function omit<T extends Record<string, unknown>, K extends keyof T>(
    obj: T,
    keys: K[]
): Omit<T, K> {
    const result = { ...obj };
    for (const key of keys) {
        delete result[key];
    }
    return result;
}

// =============================================================================
// ARRAY UTILITIES
// =============================================================================

/**
 * Group an array by a key
 * 
 * @param array - Array to group
 * @param key - Key to group by
 * @returns Grouped object
 */
export function groupBy<T>(
    array: T[],
    key: keyof T
): Record<string, T[]> {
    return array.reduce(
        (result, item) => {
            const groupKey = String(item[key]);
            if (!result[groupKey]) {
                result[groupKey] = [];
            }
            result[groupKey].push(item);
            return result;
        },
        {} as Record<string, T[]>
    );
}

/**
 * Remove duplicates from an array
 * 
 * @param array - Array with potential duplicates
 * @param key - Optional key for object arrays
 * @returns Array without duplicates
 */
export function unique<T>(array: T[], key?: keyof T): T[] {
    if (key) {
        const seen = new Set();
        return array.filter((item) => {
            const value = item[key];
            if (seen.has(value)) return false;
            seen.add(value);
            return true;
        });
    }
    return [...new Set(array)];
}

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

/**
 * Check if a string is a valid email
 * 
 * @param email - Email to validate
 * @returns True if valid email
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Check if a string is a valid URL
 * 
 * @param url - URL to validate
 * @returns True if valid URL
 */
export function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// =============================================================================
// BROWSER UTILITIES
// =============================================================================

/**
 * Check if code is running in browser
 */
export const isBrowser = typeof window !== 'undefined';

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
    if (!isBrowser) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Copy text to clipboard
 * 
 * @param text - Text to copy
 * @returns Promise that resolves when copied
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    if (!isBrowser) return false;

    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        return success;
    }
}

/**
 * Download a file from a blob or string
 * 
 * @param content - File content
 * @param filename - File name
 * @param mimeType - MIME type (default: 'text/plain')
 */
export function downloadFile(
    content: string | Blob,
    filename: string,
    mimeType: string = 'text/plain'
): void {
    if (!isBrowser) return;

    const blob = typeof content === 'string'
        ? new Blob([content], { type: mimeType })
        : content;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
