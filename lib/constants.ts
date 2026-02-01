/**
 * Application Constants
 * Centralized configuration values and constants used throughout the application
 */

// =============================================================================
// COLOR PALETTE
// =============================================================================

/**
 * Neon color palette for consistent theming
 */
export const COLORS = {
    // Primary neon green
    neon: {
        primary: '#00ff9d',
        secondary: '#00ff00',
        tertiary: '#10b981',
        dark: '#001f00',
        light: '#a7ffca',
    },
    // Background gradient colors
    background: {
        start: '#000000',
        middle: '#001a00',
        end: '#000000',
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
    semantic: {
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
    },
} as const;

// =============================================================================
// PLAN DEFINITIONS
// =============================================================================

/**
 * Plan tier types
 */
export type PlanTierType = 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';

/**
 * Plan feature definition
 */
export interface PlanFeature {
    name: string;
    included: boolean;
    limit?: string;
}

/**
 * Complete plan definition
 */
export interface PlanDefinition {
    id: string;
    name: string;
    tier: PlanTierType;
    description: string;
    priceMonthly: number;
    priceYearly: number;
    currency: string;
    creditsMonthly: number;
    creditsDaily: number;
    maxProjects: number;
    maxSitesPerMonth: number;
    features: PlanFeature[];
    isPopular?: boolean;
    stripePriceId?: string;
}

/**
 * Available subscription plans
 */
export const PLANS: PlanDefinition[] = [
    {
        id: 'free',
        name: 'Free',
        tier: 'FREE',
        description: 'Para começar a explorar',
        priceMonthly: 0,
        priceYearly: 0,
        currency: 'BRL',
        creditsMonthly: 5,
        creditsDaily: 1,
        maxProjects: 10,
        maxSitesPerMonth: 2,
        features: [
            { name: 'Chat com IA', included: true, limit: 'Básico' },
            { name: 'Criação de sites', included: true, limit: '2/mês' },
            { name: 'Editor de código', included: true, limit: 'Básico' },
            { name: 'Histórico de conversas', included: true, limit: '7 dias' },
            { name: 'Suporte', included: false },
            { name: 'API access', included: false },
        ],
    },
    {
        id: 'basic',
        name: 'Basic',
        tier: 'BASIC',
        description: 'Para criadores individuais',
        priceMonthly: 29.90,
        priceYearly: 299.00,
        currency: 'BRL',
        creditsMonthly: 500,
        creditsDaily: 0,
        maxProjects: 50,
        maxSitesPerMonth: 10,
        features: [
            { name: 'Chat com IA', included: true, limit: 'Ilimitado básico' },
            { name: 'Criação de sites', included: true, limit: '10/mês' },
            { name: 'Editor de código', included: true, limit: 'Completo' },
            { name: 'Histórico de conversas', included: true, limit: '30 dias' },
            { name: 'Suporte', included: true, limit: 'Email' },
            { name: 'API access', included: false },
        ],
        stripePriceId: 'price_basic_monthly',
    },
    {
        id: 'pro',
        name: 'Pro',
        tier: 'PRO',
        description: 'Para profissionais e equipes pequenas',
        priceMonthly: 39.90,
        priceYearly: 399.00,
        currency: 'BRL',
        creditsMonthly: Infinity,
        creditsDaily: 0,
        maxProjects: 200,
        maxSitesPerMonth: 50,
        isPopular: true,
        features: [
            { name: 'Chat com IA', included: true, limit: 'Ilimitado avançado' },
            { name: 'Criação de sites', included: true, limit: '50/mês' },
            { name: 'Editor de código', included: true, limit: 'Avançado + Colab' },
            { name: 'Histórico de conversas', included: true, limit: 'Ilimitado' },
            { name: 'Suporte', included: true, limit: 'Prioritário' },
            { name: 'API access', included: true, limit: '1000 req/dia' },
        ],
        stripePriceId: 'price_pro_monthly',
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        tier: 'ENTERPRISE',
        description: 'Para grandes equipes e empresas',
        priceMonthly: 45.90,
        priceYearly: 459.00,
        currency: 'BRL',
        creditsMonthly: Infinity,
        creditsDaily: 0,
        maxProjects: Infinity,
        maxSitesPerMonth: Infinity,
        features: [
            { name: 'Chat com IA', included: true, limit: 'Ilimitado + Custom' },
            { name: 'Criação de sites', included: true, limit: 'Ilimitado' },
            { name: 'Editor de código', included: true, limit: 'Full + Team' },
            { name: 'Histórico de conversas', included: true, limit: 'Ilimitado + Export' },
            { name: 'Suporte', included: true, limit: 'Dedicado 24/7' },
            { name: 'API access', included: true, limit: 'Ilimitado' },
            { name: 'SSO & SAML', included: true },
            { name: 'Custom AI Models', included: true },
            { name: 'Team seats', included: true, limit: 'Ilimitado' },
        ],
        stripePriceId: 'price_enterprise_monthly',
    },
];

// =============================================================================
// CREDIT COSTS
// =============================================================================

/**
 * Credit costs for various operations
 */
export const CREDIT_COSTS = {
    // Chat operations
    chat: {
        simple: 0.30,
        withImage: 0.40,
        withDocument: 0.50,
        complex: 0.50,
    },
    // Site generation
    siteGeneration: {
        basic: 2.0,
        standard: 5.0,
        advanced: 10.0,
    },
    // Code operations
    code: {
        refactor: 0.20,
        generate: 0.50,
        explain: 0.10,
    },
} as const;

// =============================================================================
// API CONFIGURATION
// =============================================================================

/**
 * Emergent API configuration
 */
export const EMERGENT_CONFIG = {
    baseUrl: process.env.EMERGENT_API_URL ?? 'https://api.emergent.sh/v1',
    timeout: Number(process.env.EMERGENT_TIMEOUT_MS ?? 60000),
    maxRetries: 3,
    retryDelay: 1000,
} as const;

/**
 * Rate limiting configuration
 */
export const RATE_LIMIT = {
    window: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60000),
    maxRequests: {
        free: 20,
        basic: 60,
        pro: 120,
        enterprise: 300,
        admin: Infinity,
    },
} as const;

// =============================================================================
// UI CONFIGURATION
// =============================================================================

/**
 * Animation configuration for Framer Motion
 */
export const ANIMATION = {
    // Spring configurations
    spring: {
        stiff: { type: 'spring', stiffness: 400, damping: 30 },
        gentle: { type: 'spring', stiffness: 200, damping: 20 },
        bouncy: { type: 'spring', stiffness: 500, damping: 15 },
    },
    // Transition presets
    transition: {
        fast: { duration: 0.15, ease: 'easeOut' },
        normal: { duration: 0.3, ease: 'easeInOut' },
        slow: { duration: 0.5, ease: 'easeInOut' },
    },
    // Stagger children configuration
    stagger: {
        fast: 0.05,
        normal: 0.1,
        slow: 0.15,
    },
} as const;

/**
 * Breakpoints for responsive design
 */
export const BREAKPOINTS = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
} as const;

// =============================================================================
// NAVIGATION
// =============================================================================

/**
 * Navigation item definition
 */
export interface NavItem {
    name: string;
    href: string;
    icon: string;
    badge?: string;
    adminOnly?: boolean;
}

/**
 * Main navigation items
 */
export const NAV_ITEMS: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
    { name: 'Chat IA', href: '/dashboard/chat', icon: 'MessageSquare' },
    { name: 'Criar Site', href: '/create', icon: 'Sparkles' },
    { name: 'Meus Projetos', href: '/dashboard/projects', icon: 'FolderOpen' },
    { name: 'Editor', href: '/editor', icon: 'Code2' },
    { name: 'Planos', href: '/pricing', icon: 'CreditCard' },
    { name: 'Configurações', href: '/settings', icon: 'Settings' },
];

/**
 * Admin-only navigation items
 */
export const ADMIN_NAV_ITEMS: NavItem[] = [
    { name: 'Admin Panel', href: '/admin', icon: 'Shield', adminOnly: true },
    { name: 'Usuários', href: '/admin/users', icon: 'Users', adminOnly: true },
    { name: 'Analytics', href: '/admin/analytics', icon: 'BarChart3', adminOnly: true },
    { name: 'Logs', href: '/admin/logs', icon: 'FileText', adminOnly: true },
];

// =============================================================================
// TECH STACK OPTIONS
// =============================================================================

/**
 * Available tech stack options for site generation
 */
export const TECH_STACK_OPTIONS = {
    frameworks: [
        { id: 'nextjs', name: 'Next.js', icon: 'nextjs' },
        { id: 'react', name: 'React', icon: 'react' },
        { id: 'vue', name: 'Vue.js', icon: 'vue' },
        { id: 'svelte', name: 'Svelte', icon: 'svelte' },
    ],
    styling: [
        { id: 'tailwind', name: 'Tailwind CSS', icon: 'tailwind' },
        { id: 'css', name: 'CSS Modules', icon: 'css' },
        { id: 'styled', name: 'Styled Components', icon: 'styled' },
    ],
    backend: [
        { id: 'nodejs', name: 'Node.js', icon: 'nodejs' },
        { id: 'prisma', name: 'Prisma', icon: 'prisma' },
        { id: 'supabase', name: 'Supabase', icon: 'supabase' },
    ],
    features: [
        { id: 'auth', name: 'Authentication', icon: 'lock' },
        { id: 'ecommerce', name: 'E-commerce', icon: 'shopping-cart' },
        { id: 'cms', name: 'CMS', icon: 'file-text' },
        { id: 'analytics', name: 'Analytics', icon: 'bar-chart' },
    ],
} as const;

// =============================================================================
// ERROR MESSAGES
// =============================================================================

/**
 * User-friendly error messages
 */
export const ERROR_MESSAGES = {
    // Authentication errors
    auth: {
        notAuthenticated: 'Você precisa fazer login para continuar.',
        notAuthorized: 'Você não tem permissão para acessar este recurso.',
        sessionExpired: 'Sua sessão expirou. Por favor, faça login novamente.',
    },
    // Credit errors
    credits: {
        insufficient: 'Créditos insuficientes. Atualize seu plano para continuar.',
        deductionFailed: 'Erro ao processar créditos. Tente novamente.',
    },
    // API errors
    api: {
        networkError: 'Erro de conexão. Verifique sua internet.',
        serverError: 'Erro no servidor. Tente novamente em alguns instantes.',
        timeout: 'A requisição demorou muito. Tente novamente.',
        rateLimited: 'Muitas requisições. Aguarde um momento.',
    },
    // Form errors
    form: {
        required: 'Este campo é obrigatório.',
        invalidEmail: 'Email inválido.',
        invalidUrl: 'URL inválida.',
        tooShort: 'Muito curto.',
        tooLong: 'Muito longo.',
    },
    // Generic errors
    generic: {
        unknown: 'Algo deu errado. Tente novamente.',
        notFound: 'Recurso não encontrado.',
        conflict: 'Conflito detectado. Atualize a página.',
    },
} as const;

// =============================================================================
// METADATA
// =============================================================================

/**
 * Application metadata for SEO
 */
export const APP_METADATA = {
    name: 'PlataformaIA',
    title: 'PlataformaIA - Crie Apps e Sites com Inteligência Artificial',
    description: 'Plataforma revolucionária de IA para criar aplicações e sites completos com apenas um prompt. Chat avançado, editor profissional e muito mais.',
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://plataforma-ia.com',
    keywords: [
        'IA',
        'Inteligência Artificial',
        'Criar sites',
        'Criar apps',
        'No-code',
        'Low-code',
        'Chat IA',
        'Gerador de código',
    ],
    author: 'PlataformaIA',
    twitterHandle: '@plataformaia',
} as const;
