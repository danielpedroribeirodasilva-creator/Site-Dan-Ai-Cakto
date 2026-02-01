/**
 * Admin Panel Page
 * Dashboard for super admins with stats and management tools
 */

import { Shield, Users, CreditCard, BarChart3, FileText, TrendingUp, AlertTriangle } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { GlowCard, CardHeader, CardTitle, CardContent } from '@/components/ui/GlowCard';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

// =============================================================================
// METADATA
// =============================================================================

export const metadata = {
    title: 'Painel Admin',
    description: 'Painel de administração',
};

// =============================================================================
// DATA FETCHING
// =============================================================================

async function getAdminStats() {
    const [
        totalUsers,
        newUsersToday,
        totalProjects,
        totalConversations,
        totalCreditsUsed,
        recentTransactions,
        recentLogs,
    ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({
            where: {
                createdAt: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                },
            },
        }),
        prisma.project.count({ where: { deletedAt: null } }),
        prisma.conversation.count(),
        prisma.creditTransaction.aggregate({
            where: { amount: { lt: 0 } },
            _sum: { amount: true },
        }),
        prisma.creditTransaction.findMany({
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
                user: { select: { email: true, name: true } },
            },
        }),
        prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
                user: { select: { email: true, name: true } },
            },
        }),
    ]);

    return {
        totalUsers,
        newUsersToday,
        totalProjects,
        totalConversations,
        totalCreditsUsed: Math.abs(totalCreditsUsed._sum.amount ?? 0),
        recentTransactions,
        recentLogs,
    };
}

// =============================================================================
// COMPONENTS
// =============================================================================

function StatCard({
    icon: Icon,
    label,
    value,
    subValue,
    color = 'neon',
}: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    subValue?: string;
    color?: 'neon' | 'blue' | 'purple' | 'yellow';
}) {
    const colors = {
        neon: 'text-neon-400 bg-neon-500/10',
        blue: 'text-blue-400 bg-blue-500/10',
        purple: 'text-purple-400 bg-purple-500/10',
        yellow: 'text-yellow-400 bg-yellow-500/10',
    };

    return (
        <GlowCard variant="default" padding="default" hover="lift">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-400 mb-1">{label}</p>
                    <p className="text-3xl font-bold text-white">{value}</p>
                    {subValue && (
                        <p className={`text-xs mt-1 ${colors[color].split(' ')[0]}`}>{subValue}</p>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${colors[color].split(' ')[1]}`}>
                    <Icon className={`w-6 h-6 ${colors[color].split(' ')[0]}`} />
                </div>
            </div>
        </GlowCard>
    );
}

// =============================================================================
// PAGE
// =============================================================================

export default async function AdminPage() {
    const user = await getCurrentUser();

    // Check admin access
    if (!user?.isAdmin) {
        redirect('/dashboard');
    }

    const stats = await getAdminStats();

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-neon-500/20 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-neon-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">Painel Admin</h1>
                    <p className="text-gray-400">
                        Bem-vindo, Administrador Supremo
                    </p>
                </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Users}
                    label="Total de Usuários"
                    value={stats.totalUsers}
                    subValue={`+${stats.newUsersToday} hoje`}
                />
                <StatCard
                    icon={BarChart3}
                    label="Projetos Criados"
                    value={stats.totalProjects}
                    color="blue"
                />
                <StatCard
                    icon={CreditCard}
                    label="Créditos Usados"
                    value={stats.totalCreditsUsed.toFixed(2)}
                    color="purple"
                />
                <StatCard
                    icon={FileText}
                    label="Conversas"
                    value={stats.totalConversations}
                    color="yellow"
                />
            </div>

            {/* Quick actions */}
            <div className="grid md:grid-cols-3 gap-4">
                <Link href="/admin/users">
                    <GlowCard variant="outline" padding="default" hover="all" className="cursor-pointer">
                        <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-neon-400" />
                            <span className="font-medium text-white">Gerenciar Usuários</span>
                        </div>
                    </GlowCard>
                </Link>
                <Link href="/admin/analytics">
                    <GlowCard variant="outline" padding="default" hover="all" className="cursor-pointer">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="w-5 h-5 text-neon-400" />
                            <span className="font-medium text-white">Ver Analytics</span>
                        </div>
                    </GlowCard>
                </Link>
                <Link href="/admin/logs">
                    <GlowCard variant="outline" padding="default" hover="all" className="cursor-pointer">
                        <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-neon-400" />
                            <span className="font-medium text-white">Logs do Sistema</span>
                        </div>
                    </GlowCard>
                </Link>
            </div>

            {/* Recent activity */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent transactions */}
                <GlowCard variant="default" padding="default">
                    <CardHeader>
                        <CardTitle>Transações Recentes</CardTitle>
                    </CardHeader>
                    <CardContent className="mt-4">
                        <div className="space-y-3">
                            {stats.recentTransactions.map((tx) => (
                                <div
                                    key={tx.id}
                                    className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                                >
                                    <div>
                                        <p className="text-sm text-white">
                                            {tx.user.name ?? tx.user.email}
                                        </p>
                                        <p className="text-xs text-gray-500">{tx.description}</p>
                                    </div>
                                    <span
                                        className={`text-sm font-medium ${tx.amount < 0 ? 'text-red-400' : 'text-green-400'
                                            }`}
                                    >
                                        {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </GlowCard>

                {/* Audit logs */}
                <GlowCard variant="default" padding="default">
                    <CardHeader>
                        <CardTitle>Logs de Auditoria</CardTitle>
                    </CardHeader>
                    <CardContent className="mt-4">
                        <div className="space-y-3">
                            {stats.recentLogs.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">
                                    Nenhum log ainda
                                </p>
                            ) : (
                                stats.recentLogs.map((log) => (
                                    <div
                                        key={log.id}
                                        className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0"
                                    >
                                        <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white truncate">{log.action}</p>
                                            <p className="text-xs text-gray-500">
                                                {log.user.email} • {new Date(log.createdAt).toLocaleString('pt-BR')}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </GlowCard>
            </div>
        </div>
    );
}
