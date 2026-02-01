/**
 * Sidebar Component
 * Collapsible navigation sidebar with menu items and icons
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    MessageSquare,
    Sparkles,
    FolderOpen,
    Code2,
    CreditCard,
    Settings,
    Shield,
    Users,
    BarChart3,
    FileText,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/stores/userStore';

// =============================================================================
// TYPES
// =============================================================================

interface NavItem {
    name: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
    adminOnly?: boolean;
}

interface SidebarProps {
    isOpen: boolean;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    onClose: () => void;
    className?: string;
}

// =============================================================================
// NAVIGATION DATA
// =============================================================================

const mainNavItems: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Chat IA', href: '/dashboard/chat', icon: MessageSquare },
    { name: 'Criar Site', href: '/create', icon: Sparkles, badge: 'Novo' },
    { name: 'Meus Projetos', href: '/dashboard/projects', icon: FolderOpen },
    { name: 'Editor', href: '/editor', icon: Code2 },
    { name: 'Planos', href: '/pricing', icon: CreditCard },
    { name: 'Configurações', href: '/settings', icon: Settings },
];

const adminNavItems: NavItem[] = [
    { name: 'Painel Admin', href: '/admin', icon: Shield, adminOnly: true },
    { name: 'Usuários', href: '/admin/users', icon: Users, adminOnly: true },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, adminOnly: true },
    { name: 'Logs', href: '/admin/logs', icon: FileText, adminOnly: true },
];

// =============================================================================
// COMPONENT
// =============================================================================

export function Sidebar({
    isOpen,
    isCollapsed,
    onToggleCollapse,
    onClose,
    className,
}: SidebarProps) {
    const pathname = usePathname();
    const { user } = useUserStore();
    const isAdmin = user?.isAdmin ?? false;

    // Animation variants
    const sidebarVariants = {
        open: { x: 0 },
        closed: { x: '-100%' },
    };

    const NavLink = ({ item }: { item: NavItem }) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        const Icon = item.icon;

        return (
            <Link
                href={item.href}
                onClick={() => {
                    // Close sidebar on mobile after navigation
                    if (window.innerWidth < 1024) {
                        onClose();
                    }
                }}
                className={cn(
                    'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl',
                    'transition-all duration-200 ease-out',
                    isActive
                        ? 'bg-neon-500/10 text-neon-400'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white',
                    isCollapsed && 'justify-center px-2'
                )}
            >
                {/* Active indicator */}
                {isActive && (
                    <motion.div
                        layoutId="activeTab"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-neon-400"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                )}

                {/* Icon */}
                <Icon
                    className={cn(
                        'w-5 h-5 flex-shrink-0 transition-colors',
                        isActive ? 'text-neon-400' : 'text-gray-500 group-hover:text-gray-300'
                    )}
                />

                {/* Label (hidden when collapsed) */}
                {!isCollapsed && (
                    <span className="text-sm font-medium truncate">{item.name}</span>
                )}

                {/* Badge */}
                {!isCollapsed && item.badge && (
                    <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold bg-neon-500/20 text-neon-400">
                        {item.badge}
                    </span>
                )}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 rounded-md bg-black/90 text-white text-sm whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                        {item.name}
                    </div>
                )}
            </Link>
        );
    };

    return (
        <>
            {/* Mobile overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                        onClick={onClose}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={isOpen ? 'open' : 'closed'}
                variants={sidebarVariants}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className={cn(
                    'fixed left-0 top-16 bottom-0 z-40',
                    'glass border-r border-white/5',
                    'flex flex-col',
                    'lg:translate-x-0',
                    isCollapsed ? 'w-[72px]' : 'w-64',
                    'transition-[width] duration-300 ease-out',
                    className
                )}
            >
                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {/* Main nav items */}
                    {mainNavItems.map((item) => (
                        <NavLink key={item.href} item={item} />
                    ))}

                    {/* Admin section (conditional) */}
                    {isAdmin && (
                        <>
                            <div className={cn(
                                'my-4 border-t border-white/10',
                                isCollapsed && 'mx-2'
                            )} />

                            {!isCollapsed && (
                                <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Administração
                                </p>
                            )}

                            {adminNavItems.map((item) => (
                                <NavLink key={item.href} item={item} />
                            ))}
                        </>
                    )}
                </nav>

                {/* Collapse toggle (desktop only) */}
                <div className="hidden lg:block p-3 border-t border-white/5">
                    <button
                        onClick={onToggleCollapse}
                        className={cn(
                            'w-full flex items-center justify-center gap-2 py-2 rounded-lg',
                            'text-gray-400 hover:bg-white/5 hover:text-white transition-colors'
                        )}
                        aria-label={isCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
                    >
                        {isCollapsed ? (
                            <ChevronRight className="w-5 h-5" />
                        ) : (
                            <>
                                <ChevronLeft className="w-5 h-5" />
                                <span className="text-sm">Recolher</span>
                            </>
                        )}
                    </button>
                </div>
            </motion.aside>
        </>
    );
}

export default Sidebar;
