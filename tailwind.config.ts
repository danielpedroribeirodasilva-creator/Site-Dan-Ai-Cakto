import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

/**
 * Tailwind CSS Configuration
 * Advanced setup with custom theme extensions, animations, and plugins
 */
const config: Config = {
    darkMode: ['class'],
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './lib/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px',
            },
        },
        extend: {
            // Custom color palette - Neon Green Theme
            colors: {
                // Primary neon green palette
                neon: {
                    50: '#f0fff4',
                    100: '#dcffe4',
                    200: '#a7ffca',
                    300: '#6fffab',
                    400: '#00ff9d',
                    500: '#00ff00', // Primary neon
                    600: '#00cc00',
                    700: '#009900',
                    800: '#006600',
                    900: '#003300',
                    950: '#001a00',
                },
                // Background gradient colors
                abyss: {
                    50: '#1a1a2e',
                    100: '#16162a',
                    200: '#121226',
                    300: '#0e0e22',
                    400: '#0a0a1e',
                    500: '#06061a',
                    600: '#040416',
                    700: '#020212',
                    800: '#01010e',
                    900: '#00000a',
                    950: '#000006',
                },
                // Accent colors
                accent: {
                    cyan: '#00ffff',
                    magenta: '#ff00ff',
                    yellow: '#ffff00',
                    red: '#ff0055',
                    blue: '#0066ff',
                },
                // Semantic colors
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent2: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
            },

            // Typography
            fontFamily: {
                sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
                mono: ['var(--font-mono)', 'JetBrains Mono', 'Fira Code', 'monospace'],
                display: ['var(--font-display)', 'Inter', 'sans-serif'],
            },
            fontSize: {
                '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
                '10xl': ['10rem', { lineHeight: '1' }],
                '11xl': ['12rem', { lineHeight: '1' }],
                '12xl': ['14rem', { lineHeight: '1' }],
            },

            // Spacing
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '112': '28rem',
                '128': '32rem',
                '144': '36rem',
            },

            // Border radius
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
                '4xl': '2rem',
                '5xl': '2.5rem',
            },

            // Box shadows with neon glow effects
            boxShadow: {
                'neon-sm': '0 0 5px rgba(0, 255, 157, 0.5), 0 0 10px rgba(0, 255, 157, 0.3)',
                'neon-md': '0 0 10px rgba(0, 255, 157, 0.5), 0 0 20px rgba(0, 255, 157, 0.3), 0 0 30px rgba(0, 255, 157, 0.2)',
                'neon-lg': '0 0 15px rgba(0, 255, 157, 0.5), 0 0 30px rgba(0, 255, 157, 0.3), 0 0 45px rgba(0, 255, 157, 0.2), 0 0 60px rgba(0, 255, 157, 0.1)',
                'neon-xl': '0 0 20px rgba(0, 255, 157, 0.6), 0 0 40px rgba(0, 255, 157, 0.4), 0 0 60px rgba(0, 255, 157, 0.3), 0 0 80px rgba(0, 255, 157, 0.2)',
                'neon-pulse': '0 0 20px rgba(0, 255, 0, 0.8), 0 0 40px rgba(0, 255, 0, 0.6), 0 0 60px rgba(0, 255, 0, 0.4)',
                'inner-neon': 'inset 0 0 20px rgba(0, 255, 157, 0.2)',
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                'glass-lg': '0 16px 64px 0 rgba(0, 0, 0, 0.5)',
            },

            // Backdrop blur
            backdropBlur: {
                xs: '2px',
            },

            // Animations
            keyframes: {
                // Accordion animations
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' },
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' },
                },
                // Glow pulse animation
                'glow-pulse': {
                    '0%, 100%': {
                        boxShadow: '0 0 10px rgba(0, 255, 157, 0.5), 0 0 20px rgba(0, 255, 157, 0.3)',
                    },
                    '50%': {
                        boxShadow: '0 0 20px rgba(0, 255, 157, 0.8), 0 0 40px rgba(0, 255, 157, 0.5), 0 0 60px rgba(0, 255, 157, 0.3)',
                    },
                },
                // Text glow animation
                'text-glow': {
                    '0%, 100%': {
                        textShadow: '0 0 10px rgba(0, 255, 157, 0.5), 0 0 20px rgba(0, 255, 157, 0.3)',
                    },
                    '50%': {
                        textShadow: '0 0 20px rgba(0, 255, 157, 0.8), 0 0 40px rgba(0, 255, 157, 0.5)',
                    },
                },
                // Float animation
                'float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                // Spin slow
                'spin-slow': {
                    from: { transform: 'rotate(0deg)' },
                    to: { transform: 'rotate(360deg)' },
                },
                // Shimmer effect
                'shimmer': {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                // Fade in up
                'fade-in-up': {
                    from: { opacity: '0', transform: 'translateY(20px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                // Fade in down
                'fade-in-down': {
                    from: { opacity: '0', transform: 'translateY(-20px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                // Scale in
                'scale-in': {
                    from: { opacity: '0', transform: 'scale(0.9)' },
                    to: { opacity: '1', transform: 'scale(1)' },
                },
                // Slide in from left
                'slide-in-left': {
                    from: { opacity: '0', transform: 'translateX(-100%)' },
                    to: { opacity: '1', transform: 'translateX(0)' },
                },
                // Slide in from right
                'slide-in-right': {
                    from: { opacity: '0', transform: 'translateX(100%)' },
                    to: { opacity: '1', transform: 'translateX(0)' },
                },
                // Gradient shift
                'gradient-shift': {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
                // Particle float
                'particle-float': {
                    '0%': { transform: 'translate(0, 0) rotate(0deg)', opacity: '1' },
                    '100%': { transform: 'translate(100px, -100px) rotate(360deg)', opacity: '0' },
                },
                // Glitch effect
                'glitch': {
                    '0%': { transform: 'translate(0)' },
                    '20%': { transform: 'translate(-2px, 2px)' },
                    '40%': { transform: 'translate(-2px, -2px)' },
                    '60%': { transform: 'translate(2px, 2px)' },
                    '80%': { transform: 'translate(2px, -2px)' },
                    '100%': { transform: 'translate(0)' },
                },
                // Typing cursor
                'blink': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0' },
                },
                // Bounce subtle
                'bounce-subtle': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
                'text-glow': 'text-glow 2s ease-in-out infinite',
                'float': 'float 3s ease-in-out infinite',
                'spin-slow': 'spin-slow 8s linear infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'fade-in-up': 'fade-in-up 0.5s ease-out',
                'fade-in-down': 'fade-in-down 0.5s ease-out',
                'scale-in': 'scale-in 0.3s ease-out',
                'slide-in-left': 'slide-in-left 0.5s ease-out',
                'slide-in-right': 'slide-in-right 0.5s ease-out',
                'gradient-shift': 'gradient-shift 3s ease infinite',
                'particle-float': 'particle-float 3s ease-out forwards',
                'glitch': 'glitch 0.3s ease-in-out',
                'blink': 'blink 1s step-end infinite',
                'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
            },

            // Background images for gradients
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'neon-glow': 'linear-gradient(135deg, rgba(0, 255, 157, 0.1) 0%, rgba(0, 255, 0, 0.05) 50%, rgba(0, 255, 157, 0.1) 100%)',
                'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                'mesh-gradient': 'radial-gradient(at 40% 20%, rgba(0, 255, 157, 0.1) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(0, 255, 0, 0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(0, 255, 157, 0.05) 0px, transparent 50%)',
            },

            // Z-index scale
            zIndex: {
                '60': '60',
                '70': '70',
                '80': '80',
                '90': '90',
                '100': '100',
                '999': '999',
                '1000': '1000',
            },

            // Transition timing functions
            transitionTimingFunction: {
                'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                'smooth-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
            },

            // Custom aspect ratios
            aspectRatio: {
                'portrait': '3/4',
                'landscape': '4/3',
                'ultrawide': '21/9',
            },
        },
    },
    plugins: [
        tailwindcssAnimate,
        // Custom plugin for text-shadow utilities
        function ({ addUtilities }: { addUtilities: (utilities: Record<string, Record<string, string>>) => void }) {
            addUtilities({
                '.text-shadow-neon': {
                    textShadow: '0 0 10px rgba(0, 255, 157, 0.8), 0 0 20px rgba(0, 255, 157, 0.6), 0 0 30px rgba(0, 255, 157, 0.4), 0 0 40px rgba(0, 255, 157, 0.2)',
                },
                '.text-shadow-neon-sm': {
                    textShadow: '0 0 5px rgba(0, 255, 157, 0.6), 0 0 10px rgba(0, 255, 157, 0.4)',
                },
                '.text-shadow-neon-lg': {
                    textShadow: '0 0 20px rgba(0, 255, 157, 1), 0 0 40px rgba(0, 255, 157, 0.8), 0 0 60px rgba(0, 255, 157, 0.6), 0 0 80px rgba(0, 255, 157, 0.4)',
                },
                '.text-shadow-none': {
                    textShadow: 'none',
                },
                '.glass': {
                    background: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                },
                '.glass-strong': {
                    background: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(40px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                },
            });
        },
    ],
};

export default config;
