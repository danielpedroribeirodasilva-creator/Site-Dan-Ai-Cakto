/**
 * Root Layout
 * Main application layout with providers, fonts, and 3D background
 */

import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Auth0Provider } from '@auth0/nextjs-auth0/client';
import { Toaster } from 'sonner';
import './globals.css';

// =============================================================================
// FONTS
// =============================================================================

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
    preload: true,
});

// =============================================================================
// METADATA
// =============================================================================

export const metadata: Metadata = {
    title: {
        template: '%s | PlataformaIA',
        default: 'PlataformaIA - Crie Apps e Sites com Inteligência Artificial',
    },
    description:
        'Plataforma revolucionária de IA para criar aplicações e sites completos com apenas um prompt. Chat avançado, editor profissional e muito mais.',
    keywords: [
        'IA',
        'Inteligência Artificial',
        'Criar sites',
        'Criar apps',
        'No-code',
        'Low-code',
        'Chat IA',
        'Gerador de código',
        'SaaS',
        'Desenvolvimento web',
    ],
    authors: [{ name: 'PlataformaIA' }],
    creator: 'PlataformaIA',
    publisher: 'PlataformaIA',
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    openGraph: {
        type: 'website',
        locale: 'pt_BR',
        url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://plataforma-ia.com',
        siteName: 'PlataformaIA',
        title: 'PlataformaIA - Crie Apps e Sites com Inteligência Artificial',
        description:
            'Plataforma revolucionária de IA para criar aplicações e sites completos com apenas um prompt.',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'PlataformaIA',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'PlataformaIA - Crie Apps e Sites com IA',
        description:
            'Plataforma revolucionária de IA para criar aplicações e sites completos com apenas um prompt.',
        images: ['/og-image.png'],
        creator: '@plataformaia',
    },
    manifest: '/manifest.json',
    icons: {
        icon: [
            { url: '/favicon.ico', sizes: 'any' },
            { url: '/icon.svg', type: 'image/svg+xml' },
        ],
        apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    },
    metadataBase: new URL(
        process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    ),
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    themeColor: [
        { media: '(prefers-color-scheme: dark)', color: '#000000' },
        { media: '(prefers-color-scheme: light)', color: '#000000' },
    ],
    colorScheme: 'dark',
};

// =============================================================================
// LAYOUT
// =============================================================================

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR" className="dark" suppressHydrationWarning>
            <head>
                {/* Preconnect to external resources */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
            </head>
            <body
                className={`${inter.variable} font-sans antialiased bg-black text-white min-h-screen`}
                suppressHydrationWarning
            >
                {/* Auth0 Provider for client-side session */}
                <Auth0Provider>
                    {/* Main content */}
                    <div className="relative min-h-screen">
                        {/* Background gradient */}
                        <div
                            className="fixed inset-0 bg-gradient-to-br from-black via-abyss-900 to-black pointer-events-none"
                            aria-hidden="true"
                        />

                        {/* Subtle grid pattern overlay */}
                        <div
                            className="fixed inset-0 opacity-[0.02] pointer-events-none"
                            style={{
                                backgroundImage: `linear-gradient(rgba(0, 255, 157, 0.1) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(0, 255, 157, 0.1) 1px, transparent 1px)`,
                                backgroundSize: '50px 50px',
                            }}
                            aria-hidden="true"
                        />

                        {/* Content layer */}
                        <div className="relative z-10">{children}</div>
                    </div>

                    {/* Toast notifications */}
                    <Toaster
                        position="bottom-right"
                        expand={true}
                        richColors
                        closeButton
                        theme="dark"
                        toastOptions={{
                            style: {
                                background: 'rgba(0, 0, 0, 0.9)',
                                border: '1px solid rgba(0, 255, 157, 0.2)',
                                backdropFilter: 'blur(20px)',
                            },
                            classNames: {
                                toast: 'glass border-neon/20',
                                title: 'text-white font-medium',
                                description: 'text-gray-400',
                                actionButton: 'bg-neon-500 text-black',
                                cancelButton: 'bg-white/10 text-white',
                                closeButton: 'bg-white/10 hover:bg-white/20',
                                success: 'border-l-4 border-l-neon-500',
                                error: 'border-l-4 border-l-red-500',
                                warning: 'border-l-4 border-l-yellow-500',
                                info: 'border-l-4 border-l-blue-500',
                            },
                        }}
                    />
                </Auth0Provider>
            </body>
        </html>
    );
}
