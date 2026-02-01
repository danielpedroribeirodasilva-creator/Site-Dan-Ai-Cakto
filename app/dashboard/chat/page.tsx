/**
 * Chat Page
 * AI chat interface with conversation history and streaming responses
 */

'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    Plus,
    Paperclip,
    Trash2,
    MessageSquare,
    Bot,
    User,
    Loader2,
    X,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { GlowCard } from '@/components/ui/GlowCard';
import { NeonButton } from '@/components/ui/NeonButton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// =============================================================================
// TYPES
// =============================================================================

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: Date;
    isStreaming?: boolean;
}

interface Conversation {
    id: string;
    title: string;
    messageCount: number;
    updatedAt: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function ChatPage() {
    const searchParams = useSearchParams();
    const initialConversationId = searchParams.get('id');

    // State
    const [conversations, setConversations] = React.useState<Conversation[]>([]);
    const [currentConversationId, setCurrentConversationId] = React.useState<string | null>(initialConversationId);
    const [messages, setMessages] = React.useState<Message[]>([]);
    const [input, setInput] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [isSending, setIsSending] = React.useState(false);

    // Refs
    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLTextAreaElement>(null);
    const abortControllerRef = React.useRef<AbortController | null>(null);

    // Scroll to bottom
    const scrollToBottom = React.useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    // Load conversations
    React.useEffect(() => {
        async function loadConversations() {
            try {
                const res = await fetch('/api/chat');
                if (res.ok) {
                    const data = await res.json();
                    setConversations(data.conversations ?? []);
                }
            } catch (error) {
                console.error('Failed to load conversations:', error);
            }
        }
        loadConversations();
    }, []);

    // Load messages when conversation changes
    React.useEffect(() => {
        async function loadMessages() {
            if (!currentConversationId) {
                setMessages([]);
                return;
            }

            setIsLoading(true);
            try {
                const res = await fetch(`/api/chat?conversationId=${currentConversationId}`);
                if (res.ok) {
                    const data = await res.json();
                    const loadedMessages = (data.conversation?.messages ?? []).map((msg: Record<string, unknown>) => ({
                        id: msg.id as string,
                        role: (msg.role as string).toLowerCase() as 'user' | 'assistant',
                        content: msg.content as string,
                        createdAt: new Date(msg.createdAt as string),
                    }));
                    setMessages(loadedMessages);
                }
            } catch (error) {
                console.error('Failed to load messages:', error);
            } finally {
                setIsLoading(false);
            }
        }
        loadMessages();
    }, [currentConversationId]);

    // Scroll to bottom when messages change
    React.useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Send message
    const sendMessage = async () => {
        if (!input.trim() || isSending) return;

        const userMessage: Message = {
            id: `temp-${Date.now()}`,
            role: 'user',
            content: input.trim(),
            createdAt: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsSending(true);

        // Create assistant message placeholder
        const assistantMessage: Message = {
            id: `temp-assistant-${Date.now()}`,
            role: 'assistant',
            content: '',
            createdAt: new Date(),
            isStreaming: true,
        };
        setMessages((prev) => [...prev, assistantMessage]);

        try {
            abortControllerRef.current = new AbortController();

            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationId: currentConversationId,
                    message: userMessage.content,
                }),
                signal: abortControllerRef.current.signal,
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error ?? 'Failed to send message');
            }

            // Get conversation ID from header
            const newConversationId = res.headers.get('X-Conversation-Id');
            if (newConversationId && !currentConversationId) {
                setCurrentConversationId(newConversationId);
            }

            // Stream response
            const reader = res.body?.getReader();
            if (!reader) throw new Error('No reader');

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
                        if (data === '[DONE]') {
                            setMessages((prev) =>
                                prev.map((msg) =>
                                    msg.id === assistantMessage.id
                                        ? { ...msg, isStreaming: false }
                                        : msg
                                )
                            );
                            continue;
                        }

                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.content) {
                                setMessages((prev) =>
                                    prev.map((msg) =>
                                        msg.id === assistantMessage.id
                                            ? { ...msg, content: msg.content + parsed.content }
                                            : msg
                                    )
                                );
                            }
                        } catch {
                            // Ignore parse errors
                        }
                    }
                }
            }

            // Refresh conversations list
            const convRes = await fetch('/api/chat');
            if (convRes.ok) {
                const data = await convRes.json();
                setConversations(data.conversations ?? []);
            }
        } catch (error) {
            if ((error as Error).name === 'AbortError') return;

            toast.error((error as Error).message ?? 'Erro ao enviar mensagem');
            setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessage.id));
        } finally {
            setIsSending(false);
            abortControllerRef.current = null;
        }
    };

    // New conversation
    const startNewConversation = () => {
        setCurrentConversationId(null);
        setMessages([]);
        inputRef.current?.focus();
    };

    // Handle key down
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex gap-4">
            {/* Conversations sidebar */}
            <GlowCard
                variant="default"
                padding="sm"
                className="w-80 hidden lg:flex flex-col"
            >
                <div className="p-2 border-b border-white/10">
                    <NeonButton
                        onClick={startNewConversation}
                        className="w-full gap-2"
                        size="sm"
                    >
                        <Plus className="w-4 h-4" />
                        Nova Conversa
                    </NeonButton>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {conversations.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                            Nenhuma conversa ainda
                        </p>
                    ) : (
                        conversations.map((conv) => (
                            <button
                                key={conv.id}
                                onClick={() => setCurrentConversationId(conv.id)}
                                className={cn(
                                    'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
                                    currentConversationId === conv.id
                                        ? 'bg-neon-500/10 text-neon-400'
                                        : 'hover:bg-white/5 text-gray-400'
                                )}
                            >
                                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                                <span className="text-sm truncate flex-1">{conv.title}</span>
                            </button>
                        ))
                    )}
                </div>
            </GlowCard>

            {/* Chat area */}
            <GlowCard
                variant="default"
                padding="none"
                className="flex-1 flex flex-col overflow-hidden"
            >
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-8 h-8 text-neon-400 animate-spin" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <Bot className="w-16 h-16 text-neon-400/50 mb-4" />
                            <h2 className="text-xl font-semibold text-white mb-2">
                                Olá! Como posso ajudar?
                            </h2>
                            <p className="text-gray-400 max-w-md">
                                Pergunte qualquer coisa sobre desenvolvimento, peça para criar
                                código, ou solicite ajuda com seus projetos.
                            </p>
                        </div>
                    ) : (
                        <>
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                        'flex gap-3',
                                        message.role === 'user' ? 'justify-end' : 'justify-start'
                                    )}
                                >
                                    {message.role === 'assistant' && (
                                        <div className="w-8 h-8 rounded-full bg-neon-500/20 flex items-center justify-center flex-shrink-0">
                                            <Bot className="w-4 h-4 text-neon-400" />
                                        </div>
                                    )}

                                    <div
                                        className={cn(
                                            'max-w-[80%] rounded-2xl px-4 py-3',
                                            message.role === 'user'
                                                ? 'bg-neon-500/20 text-white'
                                                : 'bg-white/5 text-gray-200'
                                        )}
                                    >
                                        {message.role === 'assistant' ? (
                                            <div className="prose prose-invert prose-sm max-w-none">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {message.content || (message.isStreaming ? '...' : '')}
                                                </ReactMarkdown>
                                                {message.isStreaming && (
                                                    <span className="inline-block w-2 h-4 bg-neon-400 animate-blink ml-1" />
                                                )}
                                            </div>
                                        ) : (
                                            <p className="whitespace-pre-wrap">{message.content}</p>
                                        )}
                                    </div>

                                    {message.role === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                            <User className="w-4 h-4 text-blue-400" />
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Input area */}
                <div className="p-4 border-t border-white/10">
                    <div className="flex gap-2">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Digite sua mensagem..."
                            rows={1}
                            className="flex-1 min-h-[44px] max-h-32 px-4 py-3 rounded-xl bg-white/5 border border-white/10
                       text-white placeholder:text-gray-500 resize-none
                       focus:outline-none focus:border-neon-500/50 focus:ring-1 focus:ring-neon-500/50"
                        />
                        <NeonButton
                            onClick={sendMessage}
                            disabled={!input.trim() || isSending}
                            size="icon"
                            className="h-[44px] w-[44px]"
                        >
                            {isSending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                        </NeonButton>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                        Pressione Enter para enviar, Shift+Enter para nova linha
                    </p>
                </div>
            </GlowCard>
        </div>
    );
}
