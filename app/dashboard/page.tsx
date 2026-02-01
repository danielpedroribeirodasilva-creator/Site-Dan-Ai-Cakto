/**
 * Dashboard Page
 * Main dashboard with stats, recent projects, and quick actions
 */

import { Suspense } from 'react';
import Link from 'next/link';
import {
    Sparkles,
    MessageSquare,
    FolderOpen,
    TrendingUp,
    Clock,
    ArrowRight,
    Plus,
    Zap,
} from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GlowCard, CardHeader, CardTitle, CardContent } from '@/components/ui/GlowCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { formatRelativeTime } from '@/lib/utils';

// =============================================================================
// METADATA
// =============================================================================

export const metadata = {
    title: 'Dashboard',
    description: 'Gerencie seus projetos e conversas com IA',
};

// =============================================================================
// DATA FETCHING
// =============================================================================

async function getDashboardData(userId: string) {
    const [projects, conversations, recentTransactions] = await Promise.all([
        prisma.project.findMany({
            where: { userId, deletedAt: null },
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
                id: true,
                name: true,
                slug: true,
                status: true,
                createdAt: true,
            },
        }),
        prisma.conversation.findMany({
            where: { userId, status: 'ACTIVE' },
            orderBy: { updatedAt: 'desc' },
            take: 5,
            select: {
                id: true,
                title: true,
                messageCount: true,
                updatedAt: true,
            },
        }),
        prisma.creditTransaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 10,
            select: {
                id: true,
                type: true,
                amount: true,
                description: true,
                createdAt: true,
            },
        }),
    ]);

    // Calculate stats
    const [projectCount, conversationCount, totalCreditsUsed] = await Promise.all([
        prisma.project.count({ where: { userId, deletedAt: null } }),
        prisma.conversation.count({ where: { userId } }),
        prisma.creditTransaction.aggregate({
            where: { userId, amount: { lt: 0 } },
            _sum: { amount: true },
        }),
    ]);

    return {
        projects,
        conversations,
        recentTransactions,
        stats: {
            projectCount,
            conversationCount,
            creditsUsed: Math.abs(totalCreditsUsed._sum.amount ?? 0),
        },
    };
}

// =============================================================================
// COMPONENTS
// =============================================================================

function StatCard({
    icon: Icon,
    label,
    value,
    trend,
}: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    trend?: string;
}) {
    return (
        <GlowCard variant="default" padding="default" hover="lift">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-400 mb-1">{label}</p>
                    <p className="text-3xl font-bold text-white">{value}</p>
                    {trend && (
                        <p className="text-xs text-neon-400 mt-1 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {trend}
                        </p>
                    )}
                </div>
                <div className="p-3 rounded-xl bg-neon-500/10">
                    <Icon className="w-6 h-6 text-neon-400" />
                </div>
            </div>
        </GlowCard>
    );
}

function QuickActionCard({
    icon: Icon,
    title,
    description,
    href,
}: {
    icon: React.ElementType;
    title: string;
    description: string;
    href: string;
}) {
    return (
        <Link href={href}>
            <GlowCard
                variant="outline"
                padding="default"
                hover="all"
                className="group cursor-pointer h-full"
            >
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-neon-500/10 group-hover:bg-neon-500/20 transition-colors">
                        <Icon className="w-6 h-6 text-neon-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-neon-400 transition-colors">
                            {title}
                        </h3>
                        <p className="text-sm text-gray-400">{description}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-neon-400 group-hover:translate-x-1 transition-all" />
                </div>
            </GlowCard>
        </Link>
    );
}

// =============================================================================
// PAGE
// =============================================================================

export default async function DashboardPage() {
    const user = await getCurrentUser();

    if (!user) {
        return null;
    }

    const data = await getDashboardData(user.id);

    return (
        <div className="space-y-8">
            {/* Welcome section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Olá, {user.name?.split(' ')[0] ?? 'Usuário'}! 👋
                    </h1>
                    <p className="text-gray-400">
                        {user.isAdmin ? (
                            <span className="text-neon-400">
                                Bem-vindo de volta, Administrador Supremo!
                            </span>
                        ) : (
                            'Aqui está um resumo da sua conta e projetos.'
                        )}
                    </p>
                </div>
                <Link href="/create">
                    <NeonButton size="lg" className="gap-2">
                        <Plus className="w-5 h-5" />
                        Criar Novo Projeto
                    </NeonButton>
                </Link>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Zap}
                    label="Créditos"
                    value={user.displayCredits}
                    trend={user.isAdmin ? 'Ilimitado' : undefined}
                />
                <StatCard
                    icon={FolderOpen}
                    label="Projetos"
                    value={data.stats.projectCount}
                />
                <StatCard
                    icon={MessageSquare}
                    label="Conversas"
                    value={data.stats.conversationCount}
                />
                <StatCard
                    icon={TrendingUp}
                    label="Créditos Usados"
                    value={data.stats.creditsUsed.toFixed(2)}
                />
            </div>

            {/* Quick actions */}
            <div>
                <h2 className="text-xl font-semibold text-white mb-4">Ações Rápidas</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <QuickActionCard
                        icon={Sparkles}
                        title="Criar Site com IA"
                        description="Gere um site completo a partir de um prompt"
                        href="/create"
                    />
                    <QuickActionCard
                        icon={MessageSquare}
                        title="Iniciar Chat"
                        description="Converse com a IA para tirar dúvidas"
                        href="/dashboard/chat"
                    />
                    <QuickActionCard
                        icon={FolderOpen}
                        title="Ver Projetos"
                        description="Gerencie seus projetos existentes"
                        href="/dashboard/projects"
                    />
                </div>
            </div>

            {/* Recent activity */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent projects */}
                <GlowCard variant="default" padding="default">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Projetos Recentes</CardTitle>
                            <Link
                                href="/dashboard/projects"
                                className="text-sm text-neon-400 hover:text-neon-300 transition-colors"
                            >
                                Ver todos
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent className="mt-4">
                        {data.projects.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">
                                Nenhum projeto ainda. Crie seu primeiro!
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {data.projects.map((project) => (
                                    <Link
                                        key={project.id}
                                        href={`/editor/${project.id}`}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-neon-500/10 flex items-center justify-center">
                                                <FolderOpen className="w-5 h-5 text-neon-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white group-hover:text-neon-400 transition-colors">
                                                    {project.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {formatRelativeTime(project.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${project.status === 'READY'
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : project.status === 'GENERATING'
                                                        ? 'bg-yellow-500/20 text-yellow-400'
                                                        : 'bg-gray-500/20 text-gray-400'
                                                }`}
                                        >
                                            {project.status}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </GlowCard>

                {/* Recent conversations */}
                <GlowCard variant="default" padding="default">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Conversas Recentes</CardTitle>
                            <Link
                                href="/dashboard/chat"
                                className="text-sm text-neon-400 hover:text-neon-300 transition-colors"
                            >
                                Ver todas
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent className="mt-4">
                        {data.conversations.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">
                                Nenhuma conversa ainda. Inicie um chat!
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {data.conversations.map((conversation) => (
                                    <Link
                                        key={conversation.id}
                                        href={`/dashboard/chat?id=${conversation.id}`}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-neon-500/10 flex items-center justify-center">
                                                <MessageSquare className="w-5 h-5 text-neon-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white group-hover:text-neon-400 transition-colors truncate max-w-[200px]">
                                                    {conversation.title}
                                                </p>
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatRelativeTime(conversation.updatedAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {conversation.messageCount} msgs
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </GlowCard>
            </div>
        </div>
    );
}
