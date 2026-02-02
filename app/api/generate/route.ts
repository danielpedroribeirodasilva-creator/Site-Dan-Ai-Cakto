/**
 * Generate API Route
 * Handles AI-powered code/site generation using Emergent API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, deductCredits } from '@/lib/auth';
import { emergent } from '@/lib/emergent';
import { prisma } from '@/lib/prisma';
import { generateRequestSchema } from '@/lib/schemas';
import { slugify } from '@/lib/utils';

// =============================================================================
// ROUTE HANDLERS
// =============================================================================

/**
 * POST /api/generate
 * Generate a new project from a prompt
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

        // Parse and validate request body
        const body = await request.json();
        const validatedData = generateRequestSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: validatedData.error.format() },
                { status: 400 }
            );
        }

        const { prompt, options } = validatedData.data;

        // Generate using Emergent API
        const result = await emergent.generate({ prompt, options });

        if (!result.success) {
            return NextResponse.json(
                { error: result.error ?? 'Generation failed' },
                { status: 500 }
            );
        }

        // Check and deduct credits (admins bypass)
        if (!user.isAdmin) {
            if (user.credits < result.estimatedCost) {
                return NextResponse.json(
                    {
                        error: 'Insufficient credits',
                        required: result.estimatedCost,
                        available: user.credits,
                    },
                    { status: 402 }
                );
            }
        }

        // Create project in database
        const projectName = `Projeto ${new Date().toLocaleDateString('pt-BR')}`;
        const baseSlug = slugify(prompt.slice(0, 50));
        const timestamp = Date.now().toString(36);
        const slug = `${baseSlug}-${timestamp}`;

        // Convert files array to object
        const filesObject: Record<string, string> = {};
        for (const file of result.files) {
            filesObject[file.path] = file.content;
        }

        const project = await prisma.project.create({
            data: {
                userId: user.id,
                name: projectName,
                slug,
                description: prompt.slice(0, 500),
                prompt,
                techStack: options ?? {},
                files: filesObject,
                status: 'READY',
                creditsCost: result.estimatedCost,
            },
        });

        // Deduct credits after successful generation
        await deductCredits(
            user.id,
            result.estimatedCost,
            `Site generation: ${projectName} (${project.id})`
        );

        return NextResponse.json({
            success: true,
            data: {
                projectId: project.id,
                slug: project.slug,
                files: result.files,
                preview: result.preview,
                creditsCost: result.estimatedCost,
            },
        });
    } catch (error) {
        console.error('[Generate API] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/generate
 * Get generation status or preview
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
        const projectId = searchParams.get('projectId');

        if (!projectId) {
            return NextResponse.json(
                { error: 'Project ID required' },
                { status: 400 }
            );
        }

        const project = await prisma.project.findUnique({
            where: { id: projectId, userId: user.id },
            select: {
                id: true,
                name: true,
                slug: true,
                status: true,
                files: true,
                previewUrl: true,
                createdAt: true,
            },
        });

        if (!project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ project });
    } catch (error) {
        console.error('[Generate API] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
