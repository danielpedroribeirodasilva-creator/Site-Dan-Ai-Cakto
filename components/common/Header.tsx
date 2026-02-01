/**
 * Header Component
 * Main navigation header with logo, credits display, and user menu
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles,
    Menu,
    X,
    Search,
    Bell,
    Settings,
    LogOut,
    User,
    CreditCard,
    Shield,
    ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/stores/userStore';
import { NeonButton } from '@/components/ui/NeonButton';

// =============================================================================
// TYPES
// =============================================================================

interface HeaderProps {
    className?: string;
    onMenuToggle?: () => void;
    isSidebarOpen?: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function Header({ className, onMenuToggle, isSidebarOpen }: HeaderProps) {
    const { user: auth0User, isLoading } = useUser();
    const { user: storeUser } = useUserStore();
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Combine Auth0 and store user data
    const user = storeUser ?? (auth0User ? {
        name: auth0User.name,
        email: auth0User.email,
        picture: auth0User.picture,
        isAdmin: false,
        displayCredits: '5.00',
    } : null);

    return (
        <header
            className={cn(
                'fixed top-0 left-0 right-0 z-50 h-16',
                'glass border-b border-white/5',
                className
            )}
        >
            <div className="h-full px-4 flex items-center justify-between">
                {/* Left section: Menu toggle and Logo */}
                <div className="flex items-center gap-4">
                    {/* Mobile menu toggle */}
                    <button
                        onClick={onMenuToggle}
                        className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
                        aria-label={isSidebarOpen ? 'Fechar menu' : 'Abrir menu'}
                    >
                        {isSidebarOpen ? (
                            <X className="w-5 h-5 text-gray-400" />
                        ) : (
                            <Menu className="w-5 h-5 text-gray-400" />
                        )}
                    </button>

                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-2 group">
                        <div className="relative">
                            <Sparkles className="w-8 h-8 text-neon-400 group-hover:text-neon-300 transition-colors" />
                            <div className="absolute inset-0 w-8 h-8 bg-neon-400/20 blur-xl group-hover:bg-neon-400/30 transition-colors" />
                        </div>
                        <span className="text-xl font-bold text-white hidden sm:block">
                            Plataforma<span className="text-neon-400">IA</span>
                        </span>
                    </Link>
                </div>

                {/* Center section: Search (desktop only) */}
                <div className="hidden md:flex flex-1 max-w-xl mx-8">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Buscar projetos, conversas..."
                            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 
                         text-white placeholder:text-gray-500
                         focus:outline-none focus:border-neon-500/50 focus:ring-1 focus:ring-neon-500/50
                         transition-all"
                        />
                        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex
                           px-2 py-0.5 rounded text-xs text-gray-500 bg-white/5 border border-white/10">
                            ⌘K
                        </kbd>
                    </div>
                </div>

                {/* Right section: Credits, notifications, user menu */}
                <div className="flex items-center gap-3">
                    {/* Loading state */}
                    {isLoading && (
                        <div className="w-8 h-8 rounded-full skeleton" />
                    )}

                    {/* Not authenticated */}
                    {!isLoading && !auth0User && (
                        <Link href="/api/auth/login">
                            <NeonButton size="sm">Entrar</NeonButton>
                        </Link>
                    )}

                    {/* Authenticated */}
                    {!isLoading && auth0User && user && (
                        <>
                            {/* Credits display */}
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-500/10 border border-neon-500/20">
                                <CreditCard className="w-4 h-4 text-neon-400" />
                                <span className="text-sm font-medium">
                                    {user.isAdmin ? (
                                        <span className="text-neon-400 animate-pulse">∞</span>
                                    ) : (
                                        <span className="text-neon-400">{user.displayCredits}</span>
                                    )}
                                </span>
                                {user.isAdmin && (
                                    <span className="text-xs text-neon-500 font-bold">ADMIN</span>
                                )}
                            </div>

                            {/* Notifications */}
                            <button
                                className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
                                aria-label="Notificações"
                            >
                                <Bell className="w-5 h-5 text-gray-400" />
                                {/* Notification badge */}
                                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-neon-400" />
                            </button>

                            {/* User dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                                    aria-expanded={isDropdownOpen}
                                    aria-haspopup="true"
                                >
                                    {/* Avatar */}
                                    <div className="relative">
                                        {user.picture ? (
                                            <img
                                                src={user.picture}
                                                alt={user.name ?? 'Avatar'}
                                                className="w-8 h-8 rounded-full border-2 border-neon-500/30"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-neon-500/20 flex items-center justify-center border-2 border-neon-500/30">
                                                <User className="w-4 h-4 text-neon-400" />
                                            </div>
                                        )}
                                        {/* Admin badge */}
                                        {user.isAdmin && (
                                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-neon-500 flex items-center justify-center">
                                                <Shield className="w-2.5 h-2.5 text-black" />
                                            </div>
                                        )}
                                    </div>
                                    <ChevronDown className={cn(
                                        'w-4 h-4 text-gray-400 transition-transform hidden sm:block',
                                        isDropdownOpen && 'rotate-180'
                                    )} />
                                </button>

                                {/* Dropdown menu */}
                                <AnimatePresence>
                                    {isDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 top-full mt-2 w-64 py-2 rounded-xl glass border border-white/10 shadow-glass-lg"
                                        >
                                            {/* User info */}
                                            <div className="px-4 py-3 border-b border-white/10">
                                                <p className="text-sm font-medium text-white truncate">
                                                    {user.name}
                                                </p>
                                                <p className="text-xs text-gray-400 truncate">
                                                    {user.email}
                                                </p>
                                                {user.isAdmin && (
                                                    <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-neon-500/20 text-neon-400 text-xs font-bold">
                                                        <Shield className="w-3 h-3" />
                                                        ADMIN SUPREMO
                                                    </span>
                                                )}
                                            </div>

                                            {/* Menu items */}
                                            <div className="py-2">
                                                <Link
                                                    href="/settings"
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                >
                                                    <Settings className="w-4 h-4" />
                                                    Configurações
                                                </Link>
                                                <Link
                                                    href="/pricing"
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                >
                                                    <CreditCard className="w-4 h-4" />
                                                    Gerenciar Plano
                                                </Link>
                                                {user.isAdmin && (
                                                    <Link
                                                        href="/admin"
                                                        className="flex items-center gap-3 px-4 py-2 text-sm text-neon-400 hover:bg-neon-500/10 transition-colors"
                                                        onClick={() => setIsDropdownOpen(false)}
                                                    >
                                                        <Shield className="w-4 h-4" />
                                                        Painel Admin
                                                    </Link>
                                                )}
                                            </div>

                                            {/* Logout */}
                                            <div className="border-t border-white/10 pt-2">
                                                <a
                                                    href="/api/auth/logout"
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Sair
                                                </a>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;
