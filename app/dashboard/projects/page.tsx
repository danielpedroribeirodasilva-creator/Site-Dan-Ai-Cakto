/**
 * Projects List Page
 * View and manage all user projects
 */

import Link from 'next/link';
import {
    FolderOpen,
    Plus,
    Clock,
    ExternalLink,
    MoreVertical,
    Trash2,
    Edit2,
    Copy,
} from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GlowCard } from '@/components/ui/GlowCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { formatRelativeTime } from '@/lib/utils';

// =============================================================================
// METADATA
// =============================================================================

export const metadata = {
    title: 'Meus Projetos',
    description: 'Gerencie seus projetos criados com IA',
};

// =============================================================================
// DATA FETCHING
// =============================================================================

async function getProjects(userId: string) {
    return prisma.project.findMany({
        where: { userId, deletedAt: null },
        orderBy: { updatedAt: 'desc' },
        select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            status: true,
            previewUrl: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}

// =============================================================================
// STATUS BADGE
// =============================================================================

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { bg: string; text: string; label: string }> = {
        READY: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Pronto' },
        GENERATING: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Gerando' },
        ERROR: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Erro' },
        DRAFT: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'Rascunho' },
    };

    const { bg, text, label } = config[status] ?? config.DRAFT;

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
            {label}
        </span>
    );
}

// =============================================================================
// PAGE
// =============================================================================

export default async function ProjectsPage() {
    const user = await getCurrentUser();

    if (!user) {
        return null;
    }

    const projects = await getProjects(user.id);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Meus Projetos</h1>
                    <p className="text-gray-400">
                        {projects.length} projeto{projects.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <Link href="/create">
                    <NeonButton className="gap-2">
                        <Plus className="w-5 h-5" />
                        Novo Projeto
                    </NeonButton>
                </Link>
            </div>

            {/* Empty state */}
            {projects.length === 0 && (
                <GlowCard variant="outline" padding="lg" className="text-center">
                    <FolderOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-white mb-2">
                        Nenhum projeto ainda
                    </h2>
                    <p className="text-gray-400 mb-6">
                        Crie seu primeiro projeto com IA em segundos
                    </p>
                    <Link href="/create">
                        <NeonButton className="gap-2">
                            <Plus className="w-5 h-5" />
                            Criar Primeiro Projeto
                        </NeonButton>
                    </Link>
                </GlowCard>
            )}

            {/* Projects grid */}
            {projects.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map((project) => (
                        <GlowCard
                            key={project.id}
                            variant="default"
                            padding="none"
                            hover="lift"
                            className="group overflow-hidden"
                        >
                            {/* Thumbnail */}
                            <div className="h-40 bg-gradient-to-br from-neon-500/10 to-purple-500/10 relative">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <FolderOpen className="w-12 h-12 text-neon-400/50" />
                                </div>
                                {/* Actions overlay */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Link href={`/editor/${project.id}`}>
                                        <NeonButton size="sm" variant="ghost">
                                            <Edit2 className="w-4 h-4 mr-1" />
                                            Editar
                                        </NeonButton>
                                    </Link>
                                    {project.previewUrl && (
                                        <a
                                            href={project.previewUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <NeonButton size="sm" variant="ghost">
                                                <ExternalLink className="w-4 h-4 mr-1" />
                                                Ver
                                            </NeonButton>
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <h3 className="text-lg font-semibold text-white truncate flex-1">
                                        {project.name}
                                    </h3>
                                    <StatusBadge status={project.status} />
                                </div>

                                {project.description && (
                                    <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                                        {project.description}
                                    </p>
                                )}

                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatRelativeTime(project.updatedAt)}
                                    </span>
                                    <Link
                                        href={`/editor/${project.id}`}
                                        className="text-neon-400 hover:text-neon-300 transition-colors"
                                    >
                                        Abrir →
                                    </Link>
                                </div>
                            </div>
                        </GlowCard>
                    ))}
                </div>
            )}
        </div>
    );
}
