/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable Turbopack for development
    experimental: {
        // Server Actions are stable in Next.js 15+
        serverActions: {
            bodySizeLimit: '10mb',
            allowedOrigins: ['localhost:3000'],
        },
        // Optimize package imports
        optimizePackageImports: [
            'lucide-react',
            '@radix-ui/react-icons',
            'framer-motion',
            'recharts',
            '@react-three/drei',
        ],
    },

    // Image optimization configuration
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 's.gravatar.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'cdn.auth0.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'avatars.githubusercontent.com',
                pathname: '/**',
            },
        ],
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    },

    // Headers for security
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on',
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN',
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },
                ],
            },
        ];
    },

    // Redirects configuration
    async redirects() {
        return [
            {
                source: '/home',
                destination: '/',
                permanent: true,
            },
        ];
    },

    // Webpack customization for Three.js and Monaco
    webpack: (config, { isServer }) => {
        // Handle Three.js imports
        config.externals = config.externals || [];

        // Monaco Editor worker configuration
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false,
                crypto: false,
            };
        }

        // GLSL shader support
        config.module.rules.push({
            test: /\.(glsl|vs|fs|vert|frag)$/,
            exclude: /node_modules/,
            use: ['raw-loader', 'glslify-loader'],
        });

        return config;
    },

    // Enable source maps in production for Sentry
    productionBrowserSourceMaps: true,

    // TypeScript and ESLint configuration
    typescript: {
        // Type checking is handled by CI/CD
        ignoreBuildErrors: false,
    },
    eslint: {
        // ESLint is handled by CI/CD
        ignoreDuringBuilds: false,
    },

    // Logging configuration
    logging: {
        fetches: {
            fullUrl: true,
        },
    },

    // Power by header
    poweredByHeader: false,
};

export default nextConfig;
