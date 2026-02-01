/**
 * Zod Validation Schemas
 * Type-safe form validation and API request/response schemas
 */

import { z } from 'zod';

// =============================================================================
// COMMON SCHEMAS
// =============================================================================

/**
 * Email validation schema
 */
export const emailSchema = z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido')
    .transform((email) => email.toLowerCase().trim());

/**
 * Password validation schema with strong requirements
 */
export const passwordSchema = z
    .string()
    .min(12, 'Senha deve ter pelo menos 12 caracteres')
    .regex(/[a-z]/, 'Senha deve conter letra minúscula')
    .regex(/[A-Z]/, 'Senha deve conter letra maiúscula')
    .regex(/[0-9]/, 'Senha deve conter número')
    .regex(/[^a-zA-Z0-9]/, 'Senha deve conter caractere especial');

/**
 * Simple password for login (less strict)
 */
export const loginPasswordSchema = z
    .string()
    .min(1, 'Senha é obrigatória');

/**
 * URL validation schema
 */
export const urlSchema = z
    .string()
    .url('URL inválida')
    .optional()
    .or(z.literal(''));

/**
 * Slug validation schema
 */
export const slugSchema = z
    .string()
    .min(3, 'Slug deve ter pelo menos 3 caracteres')
    .max(50, 'Slug deve ter no máximo 50 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens');

// =============================================================================
// AUTH SCHEMAS
// =============================================================================

/**
 * Login form schema
 */
export const loginSchema = z.object({
    email: emailSchema,
    password: loginPasswordSchema,
    rememberMe: z.boolean().optional().default(false),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Signup form schema
 */
export const signupSchema = z.object({
    name: z
        .string()
        .min(2, 'Nome deve ter pelo menos 2 caracteres')
        .max(100, 'Nome deve ter no máximo 100 caracteres'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, {
        message: 'Você deve aceitar os termos de uso',
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
});

export type SignupFormData = z.infer<typeof signupSchema>;

// =============================================================================
// USER SCHEMAS
// =============================================================================

/**
 * User preferences schema
 */
export const userPreferencesSchema = z.object({
    theme: z.enum(['dark', 'light', 'system']).default('dark'),
    language: z.enum(['pt-BR', 'en']).default('pt-BR'),
    notifications: z.boolean().default(true),
    reducedMotion: z.boolean().default(false),
    emailDigest: z.enum(['daily', 'weekly', 'never']).default('weekly'),
});

export type UserPreferences = z.infer<typeof userPreferencesSchema>;

/**
 * User profile update schema
 */
export const userProfileSchema = z.object({
    name: z
        .string()
        .min(2, 'Nome deve ter pelo menos 2 caracteres')
        .max(100, 'Nome deve ter no máximo 100 caracteres')
        .optional(),
    picture: urlSchema,
    preferences: userPreferencesSchema.optional(),
});

export type UserProfileFormData = z.infer<typeof userProfileSchema>;

// =============================================================================
// PROJECT SCHEMAS
// =============================================================================

/**
 * Project creation schema
 */
export const createProjectSchema = z.object({
    name: z
        .string()
        .min(3, 'Nome deve ter pelo menos 3 caracteres')
        .max(100, 'Nome deve ter no máximo 100 caracteres'),
    description: z
        .string()
        .max(500, 'Descrição deve ter no máximo 500 caracteres')
        .optional(),
    prompt: z
        .string()
        .min(10, 'Prompt deve ter pelo menos 10 caracteres')
        .max(5000, 'Prompt deve ter no máximo 5000 caracteres'),
    techStack: z.object({
        framework: z.string().optional(),
        styling: z.string().optional(),
        backend: z.string().optional(),
        features: z.array(z.string()).optional(),
    }).optional(),
});

export type CreateProjectFormData = z.infer<typeof createProjectSchema>;

/**
 * Project update schema
 */
export const updateProjectSchema = z.object({
    name: z
        .string()
        .min(3, 'Nome deve ter pelo menos 3 caracteres')
        .max(100, 'Nome deve ter no máximo 100 caracteres')
        .optional(),
    description: z
        .string()
        .max(500, 'Descrição deve ter no máximo 500 caracteres')
        .optional(),
    isPublic: z.boolean().optional(),
});

export type UpdateProjectFormData = z.infer<typeof updateProjectSchema>;

// =============================================================================
// CHAT SCHEMAS
// =============================================================================

/**
 * Chat message schema
 */
export const chatMessageSchema = z.object({
    content: z
        .string()
        .min(1, 'Mensagem não pode ser vazia')
        .max(10000, 'Mensagem muito longa'),
    attachments: z.array(z.object({
        type: z.enum(['image', 'pdf', 'text', 'code']),
        name: z.string(),
        url: z.string().url().optional(),
        content: z.string().optional(),
        size: z.number().optional(),
    })).optional().default([]),
});

export type ChatMessageFormData = z.infer<typeof chatMessageSchema>;

/**
 * Conversation schema
 */
export const conversationSchema = z.object({
    title: z
        .string()
        .min(1, 'Título é obrigatório')
        .max(200, 'Título muito longo'),
});

export type ConversationFormData = z.infer<typeof conversationSchema>;

// =============================================================================
// API REQUEST/RESPONSE SCHEMAS
// =============================================================================

/**
 * Emergent API generation request schema
 */
export const generateRequestSchema = z.object({
    prompt: z.string().min(10).max(5000),
    options: z.object({
        framework: z.string().optional(),
        styling: z.string().optional(),
        features: z.array(z.string()).optional(),
        theme: z.enum(['light', 'dark']).optional(),
    }).optional(),
});

export type GenerateRequest = z.infer<typeof generateRequestSchema>;

/**
 * Emergent API generation response schema
 */
export const generateResponseSchema = z.object({
    success: z.boolean(),
    data: z.object({
        structure: z.record(z.string(), z.unknown()).optional(),
        files: z.record(z.string(), z.string()).optional(),
        preview: z.string().optional(),
    }).optional(),
    error: z.string().optional(),
});

export type GenerateResponse = z.infer<typeof generateResponseSchema>;

/**
 * Credits deduction request schema
 */
export const deductCreditsSchema = z.object({
    amount: z.number().positive('Valor deve ser positivo'),
    description: z.string().min(1, 'Descrição é obrigatória'),
    referenceId: z.string().optional(),
    referenceType: z.string().optional(),
});

export type DeductCreditsRequest = z.infer<typeof deductCreditsSchema>;

// =============================================================================
// ADMIN SCHEMAS
// =============================================================================

/**
 * Admin user update schema
 */
export const adminUserUpdateSchema = z.object({
    role: z.enum(['USER', 'MODERATOR', 'ADMIN']).optional(),
    credits: z.number().min(0).optional(),
    planId: z.string().optional(),
    isActive: z.boolean().optional(),
});

export type AdminUserUpdateData = z.infer<typeof adminUserUpdateSchema>;

/**
 * Admin credit adjustment schema
 */
export const creditAdjustmentSchema = z.object({
    userId: z.string().cuid(),
    amount: z.number(),
    reason: z.string().min(1, 'Motivo é obrigatório'),
});

export type CreditAdjustmentData = z.infer<typeof creditAdjustmentSchema>;

// =============================================================================
// SETTINGS SCHEMAS
// =============================================================================

/**
 * API key creation schema
 */
export const createApiKeySchema = z.object({
    name: z
        .string()
        .min(3, 'Nome deve ter pelo menos 3 caracteres')
        .max(50, 'Nome deve ter no máximo 50 caracteres'),
    scopes: z.array(z.enum(['read', 'write', 'admin'])).min(1, 'Selecione ao menos um escopo'),
    expiresAt: z.date().optional(),
});

export type CreateApiKeyFormData = z.infer<typeof createApiKeySchema>;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Safely parse data with a schema
 * Returns typed data or null if validation fails
 */
export function safeParse<T extends z.ZodSchema>(
    schema: T,
    data: unknown
): z.infer<T> | null {
    const result = schema.safeParse(data);
    return result.success ? result.data : null;
}

/**
 * Parse data with a schema, throwing on error
 * Returns typed data or throws ZodError
 */
export function parse<T extends z.ZodSchema>(
    schema: T,
    data: unknown
): z.infer<T> {
    return schema.parse(data);
}

/**
 * Get formatted validation errors from a ZodError
 */
export function formatZodErrors(error: z.ZodError): Record<string, string> {
    const errors: Record<string, string> = {};

    for (const issue of error.issues) {
        const path = issue.path.join('.');
        if (!errors[path]) {
            errors[path] = issue.message;
        }
    }

    return errors;
}
