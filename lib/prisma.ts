/**
 * Prisma Client Singleton
 * Prevents multiple instances of PrismaClient in development
 * Includes query logging and extended client features
 */

import { PrismaClient } from '@prisma/client';

// Declare global type for PrismaClient singleton
declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

/**
 * Creates a new PrismaClient instance with logging configuration
 * based on the current environment
 */
const createPrismaClient = (): PrismaClient => {
    return new PrismaClient({
        log:
            process.env.NODE_ENV === 'development'
                ? [
                    { emit: 'event', level: 'query' },
                    { emit: 'stdout', level: 'info' },
                    { emit: 'stdout', level: 'warn' },
                    { emit: 'stdout', level: 'error' },
                ]
                : [
                    { emit: 'stdout', level: 'error' },
                ],
    });
};

/**
 * Singleton PrismaClient instance
 * Uses global variable in development to prevent hot-reload issues
 */
export const prisma = globalThis.prisma ?? createPrismaClient();

// Log queries in development mode
if (process.env.NODE_ENV === 'development') {
    // @ts-expect-error - Event listener type
    prisma.$on('query', (e: { query: string; params: string; duration: number }) => {
        console.log('Query: ' + e.query);
        console.log('Params: ' + e.params);
        console.log('Duration: ' + e.duration + 'ms');
    });
}

// Store client in global for development
if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = prisma;
}

export default prisma;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type {
    User,
    Plan,
    Project,
    Conversation,
    Message,
    CreditTransaction,
    AuditLog,
    ApiKey,
    SystemSetting,
    Role,
    PlanTier,
    TransactionType,
    ProjectStatus,
    ConversationStatus,
    MessageRole,
} from '@prisma/client';
