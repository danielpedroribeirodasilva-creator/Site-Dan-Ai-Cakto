/**
 * Not Found Page
 * Custom 404 error page
 */

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import { NeonButton } from '@/components/ui/NeonButton';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            {/* Background glow */}
            <div className="fixed inset-0 flex items-center justify-center">
                <div className="w-[500px] h-[500px] bg-neon-500/5 rounded-full blur-[150px]" />
            </div>

            <div className="relative text-center max-w-lg">
                {/* 404 text */}
                <h1 className="text-[150px] md:text-[200px] font-bold text-gradient-neon leading-none mb-4">
                    404
                </h1>

                {/* Message */}
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    Página não encontrada
                </h2>
                <p className="text-gray-400 mb-8">
                    Oops! Parece que você se perdeu no espaço digital.
                    A página que você procura não existe ou foi movida.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/">
                        <NeonButton className="gap-2">
                            <Home className="w-5 h-5" />
                            Ir para Início
                        </NeonButton>
                    </Link>
                    <Link href="/dashboard">
                        <NeonButton variant="ghost" className="gap-2">
                            <ArrowLeft className="w-5 h-5" />
                            Voltar ao Dashboard
                        </NeonButton>
                    </Link>
                </div>
            </div>
        </div>
    );
}
