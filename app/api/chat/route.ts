/**
 * Chat API Route
 * Handles AI chat with streaming responses
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, deductCredits } from '@/lib/auth';
import { emergent } from '@/lib/emergent';
import { CREDIT_COSTS } from '@/lib/constants';
import { prisma } from '@/lib/prisma';

// =============================================================================
// TYPES
// =============================================================================

interface ChatRequestBody {
    conversationId?: string;
    message: string;
    attachments?: Array<{
        type: string;
        name: string;
        content?: string;
    }>;
}

// =============================================================================
// ROUTE HANDLERS
// =============================================================================

/**
 * POST /api/chat
 * Send a message and get AI response (streaming)
 */
export async function POST(request: NextRequest) {
    try {
        // Authenticate user
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Parse request body
        const body: ChatRequestBody = await request.json();
        const { conversationId, message, attachments = [] } = body;

        if (!message?.trim()) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        // Calculate credit cost
        const hasAttachments = attachments.length > 0;
        const creditCost = hasAttachments
            ? CREDIT_COSTS.chat.withDocument
            : CREDIT_COSTS.chat.simple;

        // Check and deduct credits (admins bypass)
        if (!user.isAdmin) {
            if (user.credits < creditCost) {
                return NextResponse.json(
                    { error: 'Insufficient credits', required: creditCost, available: user.credits },
                    { status: 402 }
                );
            }
        }

        // Get or create conversation
        let conversation;
        if (conversationId) {
            conversation = await prisma.conversation.findUnique({
                where: { id: conversationId, userId: user.id },
            });
        }

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    userId: user.id,
                    title: message.slice(0, 100),
                },
            });
        }

        // Save user message
        await prisma.message.create({
            data: {
                conversationId: conversation.id,
                role: 'USER',
                content: message,
                attachments: attachments,
            },
        });

        // Deduct credits before API call
        await deductCredits(
            user.id,
            creditCost,
            `Chat message in conversation ${conversation.id}`
        );

        // Get conversation history for context
        const previousMessages = await prisma.message.findMany({
            where: { conversationId: conversation.id },
            orderBy: { createdAt: 'asc' },
            take: 10, // Last 10 messages for context
        });

        const messages = previousMessages.map((msg) => ({
            role: msg.role.toLowerCase() as 'user' | 'assistant' | 'system',
            content: msg.content,
        }));

        // Add system prompt
        messages.unshift({
            role: 'system' as const,
            content: `Você é um assistente de IA avançado da PlataformaIA. Você ajuda usuários a criar aplicações web, escrever código, e responder perguntas técnicas. Seja prestativo, preciso e forneça exemplos de código quando apropriado. Responda em português brasileiro.`,
        });

        // Create streaming response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    let fullResponse = '';

                    // Stream from Emergent API
                    for await (const chunk of emergent.chatStream({ messages, stream: true })) {
                        fullResponse += chunk;
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
                    }

                    // Save assistant response
                    await prisma.message.create({
                        data: {
                            conversationId: conversation.id,
                            role: 'ASSISTANT',
                            content: fullResponse,
                        },
                    });

                    // Update conversation message count
                    await prisma.conversation.update({
                        where: { id: conversation.id },
                        data: {
                            messageCount: { increment: 2 },
                            updatedAt: new Date(),
                        },
                    });

                    // Send done signal
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                    controller.close();
                } catch (error) {
                    console.error('[Chat API] Stream error:', error);
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`)
                    );
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'X-Conversation-Id': conversation.id,
            },
        });
    } catch (error) {
        console.error('[Chat API] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/chat
 * Get conversation history
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
        const conversationId = searchParams.get('conversationId');

        if (conversationId) {
            // Get specific conversation with messages
            const conversation = await prisma.conversation.findUnique({
                where: { id: conversationId, userId: user.id },
                include: {
                    messages: {
                        orderBy: { createdAt: 'asc' },
                    },
                },
            });

            if (!conversation) {
                return NextResponse.json(
                    { error: 'Conversation not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({ conversation });
        } else {
            // Get all conversations
            const conversations = await prisma.conversation.findMany({
                where: { userId: user.id, status: 'ACTIVE' },
                orderBy: { updatedAt: 'desc' },
                take: 50,
                select: {
                    id: true,
                    title: true,
                    messageCount: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

            return NextResponse.json({ conversations });
        }
    } catch (error) {
        console.error('[Chat API] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
