/**
 * Glow Card Component
 * Glass morphism card with neon glow effects
 */

'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// =============================================================================
// VARIANTS
// =============================================================================

const cardVariants = cva(
    // Base styles
    `relative rounded-2xl transition-all duration-300`,
    {
        variants: {
            variant: {
                // Default glass card
                default: `
          bg-black/40 backdrop-blur-xl border border-white/10
          hover:border-neon-500/30 hover:bg-black/50
        `,
                // Glass with stronger blur
                glass: `
          bg-white/5 backdrop-blur-2xl border border-white/10
          hover:bg-white/10
        `,
                // Solid dark card
                solid: `
          bg-abyss-800 border border-white/5
          hover:bg-abyss-700
        `,
                // Outlined card
                outline: `
          bg-transparent border border-white/10
          hover:border-neon-500/30 hover:bg-white/5
        `,
                // Neon bordered card
                neon: `
          bg-black/60 backdrop-blur-xl border border-neon-500/30
          shadow-neon-sm hover:shadow-neon-md hover:border-neon-500/50
        `,
                // Interactive card with 3D tilt effect
                interactive: `
          bg-black/40 backdrop-blur-xl border border-white/10
          hover:border-neon-500/30 cursor-pointer
          transform-gpu perspective-1000
        `,
            },
            padding: {
                none: 'p-0',
                sm: 'p-4',
                default: 'p-6',
                lg: 'p-8',
                xl: 'p-10',
            },
            hover: {
                none: '',
                lift: 'hover:-translate-y-1',
                scale: 'hover:scale-[1.02]',
                glow: 'hover:shadow-neon-md',
                all: 'hover:-translate-y-1 hover:scale-[1.01] hover:shadow-neon-sm',
            },
        },
        defaultVariants: {
            variant: 'default',
            padding: 'default',
            hover: 'none',
        },
    }
);

// =============================================================================
// TYPES
// =============================================================================

export interface GlowCardProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
    /** Enable mouse-following glow effect */
    glowOnHover?: boolean;
    /** Enable 3D tilt effect on mouse move */
    tiltOnHover?: boolean;
    /** Animation delay for staggered animations */
    animationDelay?: number;
    /** Whether to animate on mount */
    animateOnMount?: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * GlowCard - Glass morphism card with optional glow and tilt effects
 * 
 * @example
 * <GlowCard>Content</GlowCard>
 * <GlowCard variant="neon" hover="all">Neon card</GlowCard>
 * <GlowCard glowOnHover tiltOnHover>Interactive card</GlowCard>
 */
const GlowCard = React.forwardRef<HTMLDivElement, GlowCardProps>(
    (
        {
            className,
            variant,
            padding,
            hover,
            glowOnHover = false,
            tiltOnHover = false,
            animationDelay = 0,
            animateOnMount = false,
            children,
            onMouseMove,
            onMouseLeave,
            style,
            ...props
        },
        ref
    ) => {
        const cardRef = React.useRef<HTMLDivElement>(null);
        const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
        const [isHovered, setIsHovered] = React.useState(false);

        // Handle mouse move for glow and tilt effects
        const handleMouseMove = React.useCallback(
            (e: React.MouseEvent<HTMLDivElement>) => {
                if (!cardRef.current) return;

                const rect = cardRef.current.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                setMousePosition({
                    x: (x / rect.width) * 100,
                    y: (y / rect.height) * 100,
                });

                onMouseMove?.(e);
            },
            [onMouseMove]
        );

        const handleMouseEnter = React.useCallback(() => {
            setIsHovered(true);
        }, []);

        const handleMouseLeave = React.useCallback(
            (e: React.MouseEvent<HTMLDivElement>) => {
                setIsHovered(false);
                setMousePosition({ x: 50, y: 50 });
                onMouseLeave?.(e);
            },
            [onMouseLeave]
        );

        // Calculate tilt transform
        const tiltTransform = React.useMemo(() => {
            if (!tiltOnHover || !isHovered) return 'rotateX(0) rotateY(0)';

            const rotateX = (mousePosition.y - 50) * -0.1;
            const rotateY = (mousePosition.x - 50) * 0.1;

            return `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        }, [tiltOnHover, isHovered, mousePosition]);

        // Dynamic glow style
        const glowStyle = React.useMemo(() => {
            if (!glowOnHover || !isHovered) return {};

            return {
                background: `radial-gradient(
          400px circle at ${mousePosition.x}% ${mousePosition.y}%,
          rgba(0, 255, 157, 0.1),
          transparent 40%
        )`,
            };
        }, [glowOnHover, isHovered, mousePosition]);

        const combinedStyle = {
            ...style,
            transform: tiltTransform,
            transition: 'transform 0.15s ease-out',
        };

        const CardContent = (
            <div
                ref={(node) => {
                    // Handle both refs
                    (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
                    if (typeof ref === 'function') {
                        ref(node);
                    } else if (ref) {
                        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
                    }
                }}
                className={cn(cardVariants({ variant, padding, hover, className }))}
                style={combinedStyle}
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                {...props}
            >
                {/* Glow overlay */}
                {glowOnHover && (
                    <div
                        className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300"
                        style={{
                            ...glowStyle,
                            opacity: isHovered ? 1 : 0,
                        }}
                        aria-hidden="true"
                    />
                )}

                {/* Content */}
                <div className="relative z-10">{children}</div>
            </div>
        );

        // Wrap with motion for mount animation
        if (animateOnMount) {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.5,
                        delay: animationDelay,
                        ease: 'easeOut',
                    }}
                >
                    {CardContent}
                </motion.div>
            );
        }

        return CardContent;
    }
);

GlowCard.displayName = 'GlowCard';

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

/**
 * Card Header
 */
const CardHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('flex flex-col space-y-1.5', className)}
        {...props}
    />
));
CardHeader.displayName = 'CardHeader';

/**
 * Card Title
 */
const CardTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn('text-xl font-bold text-white', className)}
        {...props}
    />
));
CardTitle.displayName = 'CardTitle';

/**
 * Card Description
 */
const CardDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn('text-sm text-gray-400', className)}
        {...props}
    />
));
CardDescription.displayName = 'CardDescription';

/**
 * Card Content
 */
const CardContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
));
CardContent.displayName = 'CardContent';

/**
 * Card Footer
 */
const CardFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('flex items-center pt-4', className)}
        {...props}
    />
));
CardFooter.displayName = 'CardFooter';

export {
    GlowCard,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
    cardVariants,
};
export default GlowCard;
