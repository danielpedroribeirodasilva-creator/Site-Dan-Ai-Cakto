/**
 * Emergent AI API Client
 * Handles all interactions with the Emergent API for AI generation
 */

import { EMERGENT_CONFIG, CREDIT_COSTS } from './constants';
import { generateRequestSchema, type GenerateRequest, type GenerateResponse } from './schemas';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Emergent API error response
 */
export interface EmergentError {
    code: string;
    message: string;
    details?: unknown;
}

/**
 * Generated file structure
 */
export interface GeneratedFile {
    path: string;
    content: string;
    type: 'file' | 'directory';
    language?: string;
}

/**
 * Generation result
 */
export interface GenerationResult {
    success: boolean;
    files: GeneratedFile[];
    preview?: string;
    estimatedCost: number;
    error?: string;
}

/**
 * Chat completion request
 */
export interface ChatCompletionRequest {
    messages: Array<{
        role: 'user' | 'assistant' | 'system';
        content: string;
    }>;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
}

/**
 * Chat completion response (non-streaming)
 */
export interface ChatCompletionResponse {
    id: string;
    choices: Array<{
        index: number;
        message: {
            role: 'assistant';
            content: string;
        };
        finishReason: string;
    }>;
    usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

// =============================================================================
// API CLIENT
// =============================================================================

/**
 * Emergent API Client class
 * Provides methods for all Emergent API operations
 */
class EmergentClient {
    private readonly apiKey: string;
    private readonly baseUrl: string;
    private readonly timeout: number;

    constructor() {
        this.apiKey = process.env.EMERGENT_API_KEY ?? '';
        this.baseUrl = EMERGENT_CONFIG.baseUrl;
        this.timeout = EMERGENT_CONFIG.timeout;

        if (!this.apiKey && process.env.NODE_ENV === 'production') {
            console.warn('[Emergent] API key not configured');
        }
    }

    /**
     * Make an API request with retry logic
     */
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const url = `${this.baseUrl}${endpoint}`;

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'X-Client': 'plataforma-ia-saas',
            'X-Client-Version': '1.0.0',
            ...((options.headers as Record<string, string>) ?? {}),
        };

        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= EMERGENT_CONFIG.maxRetries; attempt++) {
            try {
                const response = await fetch(url, {
                    ...options,
                    headers,
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new EmergentApiError(
                        errorData.message ?? `HTTP ${response.status}`,
                        response.status,
                        errorData
                    );
                }

                return await response.json() as T;
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));

                // Don't retry on certain errors
                if (error instanceof EmergentApiError) {
                    if (error.status >= 400 && error.status < 500 && error.status !== 429) {
                        throw error;
                    }
                }

                // Wait before retrying (exponential backoff)
                if (attempt < EMERGENT_CONFIG.maxRetries) {
                    const delay = EMERGENT_CONFIG.retryDelay * Math.pow(2, attempt);
                    await new Promise((resolve) => setTimeout(resolve, delay));
                }
            }
        }

        clearTimeout(timeoutId);
        throw lastError ?? new Error('Request failed');
    }

    /**
     * Generate code/site from prompt
     */
    async generate(request: GenerateRequest): Promise<GenerationResult> {
        // Validate request
        const validated = generateRequestSchema.parse(request);

        try {
            // In development without API key, return mock data
            if (!this.apiKey || process.env.NODE_ENV === 'development') {
                return this.getMockGenerationResult(validated.prompt);
            }

            const response = await this.request<{
                success: boolean;
                data?: {
                    files?: Record<string, string>;
                    structure?: Record<string, unknown>;
                    preview?: string;
                };
                error?: string;
            }>('/generate', {
                method: 'POST',
                body: JSON.stringify({
                    prompt: validated.prompt,
                    options: validated.options ?? {},
                }),
            });

            if (!response.success || !response.data?.files) {
                return {
                    success: false,
                    files: [],
                    estimatedCost: 0,
                    error: response.error ?? 'Generation failed',
                };
            }

            // Convert files object to array
            const files: GeneratedFile[] = Object.entries(response.data.files).map(
                ([path, content]) => ({
                    path,
                    content,
                    type: 'file' as const,
                    language: this.detectLanguage(path),
                })
            );

            // Calculate cost based on complexity
            const estimatedCost = this.calculateGenerationCost(validated.prompt, files);

            return {
                success: true,
                files,
                preview: response.data.preview,
                estimatedCost,
            };
        } catch (error) {
            console.error('[Emergent] Generation error:', error);
            return {
                success: false,
                files: [],
                estimatedCost: 0,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Chat completion (non-streaming)
     */
    async chatComplete(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
        try {
            // In development without API key, return mock data
            if (!this.apiKey || process.env.NODE_ENV === 'development') {
                return this.getMockChatResponse(request);
            }

            return await this.request<ChatCompletionResponse>('/chat/completions', {
                method: 'POST',
                body: JSON.stringify({
                    messages: request.messages,
                    model: request.model ?? 'emergent-1',
                    temperature: request.temperature ?? 0.7,
                    max_tokens: request.maxTokens ?? 2048,
                }),
            });
        } catch (error) {
            console.error('[Emergent] Chat completion error:', error);
            throw error;
        }
    }

    /**
     * Chat completion with streaming
     */
    async *chatStream(
        request: ChatCompletionRequest
    ): AsyncGenerator<string, void, undefined> {
        try {
            // In development without API key, yield mock stream
            if (!this.apiKey || process.env.NODE_ENV === 'development') {
                yield* this.getMockChatStream(request);
                return;
            }

            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
                    messages: request.messages,
                    model: request.model ?? 'emergent-1',
                    temperature: request.temperature ?? 0.7,
                    max_tokens: request.maxTokens ?? 2048,
                    stream: true,
                }),
            });

            if (!response.ok) {
                throw new EmergentApiError(
                    `HTTP ${response.status}`,
                    response.status,
                    null
                );
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('No response body');
            }

            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() ?? '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') return;

                        try {
                            const parsed = JSON.parse(data) as {
                                choices?: Array<{
                                    delta?: { content?: string };
                                }>;
                            };
                            const content = parsed.choices?.[0]?.delta?.content;
                            if (content) {
                                yield content;
                            }
                        } catch {
                            // Ignore parse errors in stream
                        }
                    }
                }
            }
        } catch (error) {
            console.error('[Emergent] Chat stream error:', error);
            throw error;
        }
    }

    // =============================================================================
    // HELPER METHODS
    // =============================================================================

    /**
     * Detect programming language from file path
     */
    private detectLanguage(path: string): string {
        const ext = path.split('.').pop()?.toLowerCase() ?? '';
        const languageMap: Record<string, string> = {
            ts: 'typescript',
            tsx: 'typescript',
            js: 'javascript',
            jsx: 'javascript',
            css: 'css',
            scss: 'scss',
            html: 'html',
            json: 'json',
            md: 'markdown',
            sql: 'sql',
            py: 'python',
            prisma: 'prisma',
        };
        return languageMap[ext] ?? 'plaintext';
    }

    /**
     * Calculate generation cost based on prompt and output
     */
    private calculateGenerationCost(prompt: string, files: GeneratedFile[]): number {
        const promptLength = prompt.length;
        const totalContentLength = files.reduce(
            (sum, file) => sum + file.content.length,
            0
        );

        // Base cost
        let cost = CREDIT_COSTS.siteGeneration.basic;

        // Add based on complexity
        if (promptLength > 500 || totalContentLength > 50000) {
            cost = CREDIT_COSTS.siteGeneration.standard;
        }
        if (promptLength > 1000 || totalContentLength > 100000 || files.length > 20) {
            cost = CREDIT_COSTS.siteGeneration.advanced;
        }

        return cost;
    }

    /**
     * Get mock generation result for development
     */
    private getMockGenerationResult(prompt: string): GenerationResult {
        const mockFiles: GeneratedFile[] = [
            {
                path: 'app/page.tsx',
                content: `// Generated from prompt: ${prompt.slice(0, 50)}...
'use client';

import { useState } from 'react';

export default function HomePage() {
  const [count, setCount] = useState(0);
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-center text-white mb-8">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
            Seu Site Gerado por IA
          </span>
        </h1>
        <p className="text-xl text-gray-400 text-center max-w-2xl mx-auto">
          Este site foi gerado automaticamente baseado no seu prompt.
        </p>
        <div className="mt-12 text-center">
          <button 
            onClick={() => setCount(c => c + 1)}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:scale-105 transition-transform"
          >
            Cliques: {count}
          </button>
        </div>
      </div>
    </main>
  );
}`,
                type: 'file',
                language: 'typescript',
            },
            {
                path: 'app/layout.tsx',
                content: `import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Site Gerado por IA',
  description: 'Criado com PlataformaIA',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  );
}`,
                type: 'file',
                language: 'typescript',
            },
            {
                path: 'app/globals.css',
                content: `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 255, 255, 255;
  --background-rgb: 0, 0, 0;
}

body {
  color: rgb(var(--foreground-rgb));
  background: rgb(var(--background-rgb));
}`,
                type: 'file',
                language: 'css',
            },
            {
                path: 'package.json',
                content: JSON.stringify({
                    name: 'generated-site',
                    version: '1.0.0',
                    private: true,
                    scripts: {
                        dev: 'next dev',
                        build: 'next build',
                        start: 'next start',
                    },
                    dependencies: {
                        next: '^15.0.0',
                        react: '^19.0.0',
                        'react-dom': '^19.0.0',
                    },
                    devDependencies: {
                        typescript: '^5.0.0',
                        '@types/react': '^19.0.0',
                        tailwindcss: '^3.4.0',
                        autoprefixer: '^10.4.0',
                        postcss: '^8.4.0',
                    },
                }, null, 2),
                type: 'file',
                language: 'json',
            },
        ];

        return {
            success: true,
            files: mockFiles,
            preview: '<html><body>Preview placeholder</body></html>',
            estimatedCost: CREDIT_COSTS.siteGeneration.basic,
        };
    }

    /**
     * Get mock chat response for development
     */
    private getMockChatResponse(
        request: ChatCompletionRequest
    ): ChatCompletionResponse {
        const lastMessage = request.messages[request.messages.length - 1];
        return {
            id: `mock-${Date.now()}`,
            choices: [
                {
                    index: 0,
                    message: {
                        role: 'assistant',
                        content: `Esta é uma resposta de desenvolvimento para: "${lastMessage?.content?.slice(0, 50) ?? 'sua mensagem'}..."

Em produção, esta resposta viria da API Emergent com IA avançada para ajudar você a:
- Criar sites e aplicações
- Escrever e refatorar código
- Responder perguntas técnicas
- E muito mais!`,
                    },
                    finishReason: 'stop',
                },
            ],
            usage: {
                promptTokens: 100,
                completionTokens: 50,
                totalTokens: 150,
            },
        };
    }

    /**
     * Get mock chat stream for development
     */
    private async *getMockChatStream(
        request: ChatCompletionRequest
    ): AsyncGenerator<string, void, undefined> {
        const lastMessage = request.messages[request.messages.length - 1];
        const response = `Olá! Estou processando sua mensagem: "${lastMessage?.content?.slice(0, 30) ?? ''}..."

Esta é uma resposta de **desenvolvimento** simulando o streaming.

Em produção, você veria a resposta da IA aparecer palavra por palavra, criando uma experiência mais dinâmica e responsiva.

Posso ajudar você a:
- 🚀 Criar sites completos
- 💻 Escrever código
- 🔧 Debugar problemas
- 📚 Explicar conceitos

O que você gostaria de fazer?`;

        // Simulate streaming by yielding word by word
        const words = response.split(' ');
        for (const word of words) {
            yield word + ' ';
            await new Promise((resolve) => setTimeout(resolve, 30));
        }
    }
}

// =============================================================================
// CUSTOM ERROR CLASS
// =============================================================================

/**
 * Custom error class for Emergent API errors
 */
export class EmergentApiError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly details: unknown
    ) {
        super(message);
        this.name = 'EmergentApiError';
    }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

/**
 * Singleton instance of the Emergent client
 */
export const emergent = new EmergentClient();

export default emergent;
