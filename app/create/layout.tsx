/**
 * Create Layout
 * Simple layout for create pages
 */

import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
    title: 'Criar Projeto',
    description: 'Crie seu projeto com IA',
};

export default function CreateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-black">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 h-16 glass border-b border-white/5">
                <div className="h-full px-4 flex items-center justify-between max-w-7xl mx-auto">
                    <Link href="/dashboard" className="flex items-center gap-2 group">
                        <Sparkles className="w-7 h-7 text-neon-400" />
                        <span className="text-xl font-bold text-white">
                            Plataforma<span className="text-neon-400">IA</span>
                        </span>
                    </Link>

                    <Link
                        href="/dashboard"
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        ← Voltar ao Dashboard
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main className="pt-24 pb-16 px-4">
                {children}
            </main>
        </div>
    );
}
