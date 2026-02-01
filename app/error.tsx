/**
 * Error Page
 * Global error boundary component
 */

'use client';

import * as React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { NeonButton } from '@/components/ui/NeonButton';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    React.useEffect(() => {
        // Log error to console (in production, send to Sentry)
        console.error('[App Error]:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            {/* Background glow */}
            <div className="fixed inset-0 flex items-center justify-center">
                <div className="w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[150px]" />
            </div>

            <div className="relative text-center max-w-lg">
                {/* Icon */}
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-10 h-10 text-red-400" />
                </div>

                {/* Message */}
                <h1 className="text-3xl font-bold text-white mb-4">
                    Algo deu errado
                </h1>
                <p className="text-gray-400 mb-6">
                    Ocorreu um erro inesperado. Por favor, tente novamente ou
                    volte para a página inicial.
                </p>

                {/* Error details (dev only) */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-left">
                        <p className="text-sm font-mono text-red-400 break-all">
                            {error.message}
                        </p>
                        {error.digest && (
                            <p className="text-xs text-gray-500 mt-2">
                                Digest: {error.digest}
                            </p>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <NeonButton onClick={reset} className="gap-2">
                        <RefreshCw className="w-5 h-5" />
                        Tentar Novamente
                    </NeonButton>
                    <a href="/">
                        <NeonButton variant="ghost" className="gap-2">
                            <Home className="w-5 h-5" />
                            Ir para Início
                        </NeonButton>
                    </a>
                </div>
            </div>
        </div>
    );
}
