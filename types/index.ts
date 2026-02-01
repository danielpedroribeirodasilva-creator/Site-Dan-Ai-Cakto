/**
 * Global Type Definitions
 * Extends and augments types used throughout the application
 */

import type { User, Plan, Project, Conversation, Message } from '@prisma/client';

// =============================================================================
// USER TYPES
// =============================================================================

/**
 * User with plan relation included
 */
export interface UserWithPlan extends User {
    plan: Plan | null;
}

/**
 * User with all relations
 */
export interface UserWithRelations extends User {
    plan: Plan | null;
    projects: Project[];
    conversations: Conversation[];
}

/**
 * User session data (client-safe)
 */
export interface UserSession {
    id: string;
    email: string;
    name: string | null;
    picture: string | null;
    role: 'USER' | 'MODERATOR' | 'ADMIN';
    credits: number;
    isAdmin: boolean;
    displayCredits: string;
    planId: string;
    preferences: UserPreferences;
}

/**
 * User preferences stored as JSON
 */
export interface UserPreferences {
    theme: 'dark' | 'light' | 'system';
    language: 'pt-BR' | 'en';
    notifications: boolean;
    reducedMotion: boolean;
    emailDigest?: 'daily' | 'weekly' | 'never';
}

// =============================================================================
// PROJECT TYPES
// =============================================================================

/**
 * Project with user relation
 */
export interface ProjectWithUser extends Project {
    user: User;
}

/**
 * Project file structure
 */
export interface ProjectFile {
    path: string;
    content: string;
    type: 'file' | 'directory';
    language?: string;
    size?: number;
}

/**
 * Project files map (stored as JSON in database)
 */
export type ProjectFiles = Record<string, string>;

/**
 * Project tech stack configuration
 */
export interface ProjectTechStack {
    framework?: string;
    styling?: string;
    backend?: string;
    features?: string[];
}

// =============================================================================
// CONVERSATION TYPES
// =============================================================================

/**
 * Conversation with messages
 */
export interface ConversationWithMessages extends Conversation {
    messages: Message[];
}

/**
 * Message attachment
 */
export interface MessageAttachment {
    type: 'image' | 'pdf' | 'text' | 'code';
    name: string;
    url?: string;
    content?: string;
    size?: number;
    mimeType?: string;
}

/**
 * Chat message for display
 */
export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    attachments: MessageAttachment[];
    createdAt: Date;
    isStreaming?: boolean;
}

// =============================================================================
// API TYPES
// =============================================================================

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        pageSize: number;
        totalPages: number;
        totalItems: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

/**
 * Server action result
 */
export type ActionResult<T = void> =
    | { success: true; data: T }
    | { success: false; error: string };

// =============================================================================
// UI TYPES
// =============================================================================

/**
 * Toast notification types
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

/**
 * Toast notification data
 */
export interface ToastData {
    id?: string;
    type: ToastType;
    title: string;
    description?: string;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

/**
 * Modal state
 */
export interface ModalState {
    isOpen: boolean;
    data?: unknown;
}

/**
 * Sidebar state
 */
export interface SidebarState {
    isOpen: boolean;
    isCollapsed: boolean;
    activeItem: string | null;
}

// =============================================================================
// 3D / ANIMATION TYPES
// =============================================================================

/**
 * 3D Scene configuration
 */
export interface Scene3DConfig {
    particleCount: number;
    particleSize: number;
    particleColor: string;
    enableBloom: boolean;
    enableMouseInteraction: boolean;
    cameraPosition: [number, number, number];
}

/**
 * Animation variant configuration
 */
export interface AnimationVariants {
    hidden: Record<string, unknown>;
    visible: Record<string, unknown>;
    exit?: Record<string, unknown>;
}

// =============================================================================
// EDITOR TYPES
// =============================================================================

/**
 * Editor file tree node
 */
export interface FileTreeNode {
    id: string;
    name: string;
    path: string;
    type: 'file' | 'directory';
    children?: FileTreeNode[];
    language?: string;
    isOpen?: boolean;
}

/**
 * Editor tab
 */
export interface EditorTab {
    id: string;
    path: string;
    name: string;
    content: string;
    language: string;
    isDirty: boolean;
    isActive: boolean;
}

/**
 * Editor state
 */
export interface EditorState {
    projectId: string | null;
    files: Record<string, string>;
    openTabs: EditorTab[];
    activeTabId: string | null;
    fileTree: FileTreeNode[];
}

// =============================================================================
// ANALYTICS TYPES
// =============================================================================

/**
 * Credit transaction summary
 */
export interface CreditSummary {
    totalCredits: number;
    usedCredits: number;
    remainingCredits: number;
    transactions: {
        date: string;
        amount: number;
        type: string;
    }[];
}

/**
 * Usage statistics
 */
export interface UsageStats {
    projectsCreated: number;
    messagesExchanged: number;
    creditsUsed: number;
    sitesGenerated: number;
    period: 'day' | 'week' | 'month' | 'year';
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Extract non-nullable type
 */
export type NonNullableFields<T> = {
    [P in keyof T]: NonNullable<T[P]>;
};

/**
 * Omit with union support
 */
export type OmitStrict<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * Required fields
 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
