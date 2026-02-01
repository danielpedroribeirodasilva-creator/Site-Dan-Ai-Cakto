/**
 * Credits API Route
 * Handles credit balance, transactions, and management
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, addCredits } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// =============================================================================
// HELPERS
// =============================================================================

const ADMIN_EMAILS = (
    process.env.ADMIN_EMAILS ?? 'danielpedroribeirodasilva@gmail.com'
)
    .split(',')
    .map((email) => email.trim().toLowerCase());

function checkIsAdmin(email: string, role: string): boolean {
    return role === 'ADMIN' || ADMIN_EMAILS.includes(email.toLowerCase());
}

function formatCredits(credits: number, isAdmin: boolean): string {
    return isAdmin ? '∞' : credits.toFixed(2);
}

// =============================================================================
// ROUTE HANDLERS
// =============================================================================

/**
 * GET /api/credits
 * Get current user's credit balance and transaction history
 */
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const includeHistory = searchParams.get('history') === 'true';
        const page = parseInt(searchParams.get('page') ?? '1', 10);
        const limit = parseInt(searchParams.get('limit') ?? '20', 10);

        // Get current balance
        const balance = {
            credits: user.credits,
            displayCredits: formatCredits(user.credits, user.isAdmin),
            isAdmin: user.isAdmin,
        };

        // Get transaction history if requested
        let transactions = null;
        let pagination = null;

        if (includeHistory) {
            const skip = (page - 1) * limit;

            const [history, totalCount] = await Promise.all([
                prisma.creditTransaction.findMany({
                    where: { userId: user.id },
                    orderBy: { createdAt: 'desc' },
                    take: limit,
                    skip,
                    select: {
                        id: true,
                        type: true,
                        amount: true,
                        balance: true,
                        description: true,
                        createdAt: true,
                    },
                }),
                prisma.creditTransaction.count({
                    where: { userId: user.id },
                }),
            ]);

            transactions = history;
            pagination = {
                page,
                pageSize: limit,
                totalItems: totalCount,
                totalPages: Math.ceil(totalCount / limit),
                hasNext: page * limit < totalCount,
                hasPrev: page > 1,
            };
        }

        return NextResponse.json({
            balance,
            transactions,
            pagination,
        });
    } catch (error) {
        console.error('[Credits API] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/credits
 * Add credits (admin only or webhook)
 */
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        // Check webhook secret for automated credit additions
        const webhookSecret = request.headers.get('x-webhook-secret');
        const isWebhook = webhookSecret === process.env.CREDITS_WEBHOOK_SECRET;

        if (!user && !isWebhook) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Non-webhook requests require admin
        if (!isWebhook && user && !user.isAdmin) {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { userId, amount, type, description } = body;

        if (!userId || typeof amount !== 'number' || !type) {
            return NextResponse.json(
                { error: 'Missing required fields: userId, amount, type' },
                { status: 400 }
            );
        }

        // Validate type
        const validTypes = ['REFILL', 'PURCHASE', 'BONUS', 'REFUND'] as const;
        if (!validTypes.includes(type)) {
            return NextResponse.json(
                { error: 'Invalid type. Must be: REFILL, PURCHASE, BONUS, or REFUND' },
                { status: 400 }
            );
        }

        // Add credits
        const result = await addCredits(
            userId,
            amount,
            description ?? `Credit ${type.toLowerCase()}`,
            type
        );

        // Log admin action
        if (user?.isAdmin) {
            await prisma.auditLog.create({
                data: {
                    userId: user.id,
                    action: 'credits.add',
                    entityType: 'user',
                    entityId: userId,
                    details: { amount, type, description },
                },
            });
        }

        return NextResponse.json({
            success: result.success,
            data: {
                userId,
                newBalance: result.total,
            },
        });
    } catch (error) {
        console.error('[Credits API] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/credits
 * Adjust credits (admin only)
 */
export async function PATCH(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        if (!user.isAdmin) {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { userId, amount, reason } = body;

        if (!userId || typeof amount !== 'number' || !reason) {
            return NextResponse.json(
                { error: 'Missing required fields: userId, amount, reason' },
                { status: 400 }
            );
        }

        // Get target user
        const targetUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, credits: true, email: true, role: true },
        });

        if (!targetUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Don't adjust admin credits
        if (checkIsAdmin(targetUser.email, targetUser.role)) {
            return NextResponse.json(
                { error: 'Cannot adjust admin credits' },
                { status: 400 }
            );
        }

        // Perform adjustment
        const newBalance = Math.max(0, targetUser.credits + amount);

        const updatedUser = await prisma.$transaction(async (tx) => {
            const updated = await tx.user.update({
                where: { id: userId },
                data: { credits: newBalance },
            });

            await tx.creditTransaction.create({
                data: {
                    userId,
                    type: 'ADJUSTMENT',
                    amount,
                    balance: newBalance,
                    description: `[ADMIN] ${reason}`,
                },
            });

            return updated;
        });

        // Log admin action
        await prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'credits.adjust',
                entityType: 'user',
                entityId: userId,
                details: { amount, reason, previousBalance: targetUser.credits, newBalance },
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                userId: updatedUser.id,
                previousBalance: targetUser.credits,
                adjustment: amount,
                newBalance: updatedUser.credits,
            },
        });
    } catch (error) {
        console.error('[Credits API] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
