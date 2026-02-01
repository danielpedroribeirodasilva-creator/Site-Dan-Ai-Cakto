/**
 * Dashboard Layout
 * Layout wrapper for authenticated dashboard pages
 */

'use client';

import * as React from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { redirect } from 'next/navigation';
import { Header } from '@/components/common/Header';
import { Sidebar } from '@/components/common/Sidebar';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

interface DashboardLayoutProps {
    children: React.ReactNode;
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const { user, isLoading } = useUser();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

    // Redirect if not authenticated
    React.useEffect(() => {
        if (!isLoading && !user) {
            redirect('/api/auth/login');
        }
    }, [isLoading, user]);

    // Handle window resize
    React.useEffect(() => {
        const handleResize = () => {
            // Auto-close mobile sidebar on desktop
            if (window.innerWidth >= 1024) {
                setIsSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close sidebar when pressing Escape
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isSidebarOpen) {
                setIsSidebarOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isSidebarOpen]);

    // Loading state
    if (isLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black">
                <div className="flex flex-col items-center gap-4">
                    {/* Loading spinner */}
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-4 border-neon-500/20" />
                        <div className="absolute inset-0 rounded-full border-4 border-neon-500 border-t-transparent animate-spin" />
                    </div>
                    <p className="text-gray-400 text-sm">Carregando...</p>
                </div>
            </div>
        );
    }

    // Not authenticated
    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-black">
            {/* Header */}
            <Header
                onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                isSidebarOpen={isSidebarOpen}
            />

            {/* Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main content */}
            <main
                className={cn(
                    'pt-16 min-h-screen transition-[padding] duration-300',
                    // Desktop: adjust padding based on sidebar state
                    'lg:pl-64',
                    isSidebarCollapsed && 'lg:pl-[72px]'
                )}
            >
                <div className="p-4 md:p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
