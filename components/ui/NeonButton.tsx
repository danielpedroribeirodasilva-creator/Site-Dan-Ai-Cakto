/**
 * Neon Button Component
 * Glowing button with hover effects and variants
 */

'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// =============================================================================
// VARIANTS
// =============================================================================

const buttonVariants = cva(
    // Base styles
    `inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold
   ring-offset-background transition-all duration-300 ease-out
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-400 focus-visible:ring-offset-2
   disabled:pointer-events-none disabled:opacity-50`,
    {
        variants: {
            variant: {
                // Primary neon button
                default: `
          relative overflow-hidden bg-gradient-to-r from-neon-500 to-neon-400 text-black
          hover:shadow-neon-md hover:scale-105 active:scale-95
          before:absolute before:inset-0 before:opacity-0 before:transition-opacity
          before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
          hover:before:opacity-100 hover:before:animate-shimmer
        `,
                // Ghost button with neon border
                ghost: `
          border border-neon-500/30 text-neon-400 bg-transparent
          hover:bg-neon-500/10 hover:border-neon-500/50 hover:text-neon-300
          active:scale-95
        `,
                // Outline button
                outline: `
          border border-white/20 text-white bg-transparent
          hover:bg-white/5 hover:border-white/30
          active:scale-95
        `,
                // Destructive/danger button
                destructive: `
          relative overflow-hidden bg-gradient-to-r from-red-600 to-red-500 text-white
          hover:shadow-lg hover:shadow-red-500/25 hover:scale-105 active:scale-95
        `,
                // Secondary button
                secondary: `
          bg-white/10 text-white
          hover:bg-white/15 hover:scale-105 active:scale-95
        `,
                // Link style button
                link: `
          text-neon-400 underline-offset-4
          hover:underline hover:text-neon-300
        `,
                // Glass button
                glass: `
          glass text-white
          hover:bg-white/15 hover:scale-105 active:scale-95
        `,
            },
            size: {
                default: 'h-10 px-6 py-2',
                sm: 'h-8 px-4 py-1.5 text-xs',
                lg: 'h-12 px-8 py-3 text-base',
                xl: 'h-14 px-10 py-4 text-lg',
                icon: 'h-10 w-10 p-0',
                'icon-sm': 'h-8 w-8 p-0',
                'icon-lg': 'h-12 w-12 p-0',
            },
            glow: {
                true: 'shadow-neon-sm hover:shadow-neon-md',
                false: '',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
            glow: false,
        },
    }
);

// =============================================================================
// TYPES
// =============================================================================

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    loading?: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * NeonButton - Primary button component with neon styling
 * 
 * @example
 * <NeonButton>Click me</NeonButton>
 * <NeonButton variant="ghost" size="lg">Ghost</NeonButton>
 * <NeonButton loading>Loading...</NeonButton>
 */
const NeonButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, glow, asChild = false, loading, children, disabled, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button';

        return (
            <Comp
                className={cn(buttonVariants({ variant, size, glow, className }))}
                ref={ref}
                disabled={disabled || loading}
                aria-busy={loading}
                {...props}
            >
                {loading ? (
                    <>
                        {/* Loading spinner */}
                        <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        <span>Carregando...</span>
                    </>
                ) : (
                    children
                )}
            </Comp>
        );
    }
);

NeonButton.displayName = 'NeonButton';

export { NeonButton, buttonVariants };
export default NeonButton;
