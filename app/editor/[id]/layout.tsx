/**
 * Editor Layout
 * Layout wrapper for editor pages with minimal chrome
 */

import { Sparkles, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
    title: 'Editor',
    description: 'Editor de código com IA',
};

export default function EditorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-black">
            {/* Minimal header */}
            <header className="fixed top-0 left-0 right-0 z-50 h-14 glass border-b border-white/5">
                <div className="h-full px-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard/projects"
                            className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Projetos
                        </Link>

                        <div className="h-6 w-px bg-white/10" />

                        <Link href="/dashboard" className="flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-neon-400" />
                            <span className="text-lg font-bold text-white hidden sm:block">
                                Plataforma<span className="text-neon-400">IA</span>
                            </span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="pt-14 h-screen">
                <div className="h-[calc(100vh-3.5rem)] p-4">
                    {children}
                </div>
            </main>
        </div>
    );
}
