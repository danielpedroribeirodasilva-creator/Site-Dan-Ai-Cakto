/**
 * Loading Component
 * Animated loading spinner with neon styling
 */

'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

interface LoadingProps {
    /** Size of the loader */
    size?: 'sm' | 'md' | 'lg' | 'xl';
    /** Optional text to display */
    text?: string;
    /** Whether to display full screen overlay */
    fullScreen?: boolean;
    /** Custom class name */
    className?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function Loading({
    size = 'md',
    text,
    fullScreen = false,
    className,
}: LoadingProps) {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24',
    };

    const borderSizes = {
        sm: 'border-2',
        md: 'border-[3px]',
        lg: 'border-4',
        xl: 'border-[5px]',
    };

    const textSizes = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg',
    };

    const Loader = (
        <div className={cn('flex flex-col items-center gap-4', className)}>
            {/* Spinner */}
            <div className="relative">
                {/* Outer ring */}
                <div
                    className={cn(
                        'rounded-full border-neon-500/20',
                        sizeClasses[size],
                        borderSizes[size]
                    )}
                />
                {/* Spinning ring */}
                <div
                    className={cn(
                        'absolute inset-0 rounded-full border-neon-500 border-t-transparent animate-spin',
                        sizeClasses[size],
                        borderSizes[size]
                    )}
                />
                {/* Glow effect */}
                <div
                    className={cn(
                        'absolute inset-0 rounded-full bg-neon-400/20 blur-md',
                        sizeClasses[size]
                    )}
                />
            </div>

            {/* Text */}
            {text && (
                <p className={cn('text-gray-400 animate-pulse', textSizes[size])}>
                    {text}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            >
                {Loader}
            </motion.div>
        );
    }

    return Loader;
}

// =============================================================================
// SKELETON COMPONENT
// =============================================================================

interface SkeletonProps {
    className?: string;
    /** Width class or value */
    width?: string;
    /** Height class or value */
    height?: string;
    /** Whether to display as circle */
    circle?: boolean;
}

export function Skeleton({
    className,
    width = 'w-full',
    height = 'h-4',
    circle = false,
}: SkeletonProps) {
    return (
        <div
            className={cn(
                'animate-pulse bg-white/5 rounded',
                circle ? 'rounded-full aspect-square' : 'rounded-lg',
                width,
                height,
                className
            )}
        />
    );
}

// =============================================================================
// PAGE LOADING COMPONENT
// =============================================================================

export function PageLoading({ text = 'Carregando...' }: { text?: string }) {
    return (
        <div className="min-h-[50vh] flex items-center justify-center">
            <Loading size="lg" text={text} />
        </div>
    );
}

export default Loading;
