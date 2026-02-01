/**
 * Settings Page
 * User preferences and account settings
 */

'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Bell,
    Shield,
    Palette,
    Globe,
    Key,
    CreditCard,
    LogOut,
    Check,
    ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { GlowCard, CardHeader, CardTitle, CardContent } from '@/components/ui/GlowCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { useUser } from '@/hooks/useUser';
import { useUserStore } from '@/stores/userStore';

// =============================================================================
// TYPES
// =============================================================================

type SettingsTab = 'profile' | 'appearance' | 'notifications' | 'security' | 'billing';

interface TabItem {
    id: SettingsTab;
    name: string;
    icon: React.ElementType;
}

// =============================================================================
// DATA
// =============================================================================

const tabs: TabItem[] = [
    { id: 'profile', name: 'Perfil', icon: User },
    { id: 'appearance', name: 'Aparência', icon: Palette },
    { id: 'notifications', name: 'Notificações', icon: Bell },
    { id: 'security', name: 'Segurança', icon: Shield },
    { id: 'billing', name: 'Cobrança', icon: CreditCard },
];

// =============================================================================
// COMPONENT
// =============================================================================

export default function SettingsPage() {
    const { user } = useUser();
    const { preferences, updatePreferences } = useUserStore();
    const [activeTab, setActiveTab] = React.useState<SettingsTab>('profile');
    const [isSaving, setIsSaving] = React.useState(false);

    // Save preferences
    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 500));
            toast.success('Configurações salvas!');
        } catch {
            toast.error('Erro ao salvar configurações');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">Configurações</h1>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar */}
                <GlowCard variant="default" padding="sm" className="lg:w-64 flex-shrink-0">
                    <nav className="space-y-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                                        isActive
                                            ? 'bg-neon-500/10 text-neon-400'
                                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    )}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="text-sm font-medium">{tab.name}</span>
                                    {isActive && (
                                        <ChevronRight className="w-4 h-4 ml-auto" />
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    <div className="mt-6 pt-6 border-t border-white/10">
                        <a
                            href="/api/auth/logout"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="text-sm font-medium">Sair</span>
                        </a>
                    </div>
                </GlowCard>

                {/* Content */}
                <div className="flex-1 space-y-6">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <GlowCard variant="default" padding="default">
                                <CardHeader>
                                    <CardTitle>Informações do Perfil</CardTitle>
                                </CardHeader>
                                <CardContent className="mt-6 space-y-6">
                                    {/* Avatar */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 rounded-full bg-neon-500/20 flex items-center justify-center overflow-hidden">
                                            {user?.picture ? (
                                                <img
                                                    src={user.picture}
                                                    alt={user.name ?? 'Avatar'}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <User className="w-8 h-8 text-neon-400" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-lg font-semibold text-white">{user?.name ?? 'Usuário'}</p>
                                            <p className="text-sm text-gray-400">{user?.email}</p>
                                            {user?.isAdmin && (
                                                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-neon-500/20 text-neon-400 text-xs font-bold">
                                                    <Shield className="w-3 h-3" />
                                                    ADMIN
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Form fields */}
                                    <div className="grid gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Nome
                                            </label>
                                            <input
                                                type="text"
                                                defaultValue={user?.name ?? ''}
                                                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10
                                 text-white placeholder:text-gray-500
                                 focus:outline-none focus:border-neon-500/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                defaultValue={user?.email ?? ''}
                                                disabled
                                                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10
                                 text-gray-500 cursor-not-allowed"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Email não pode ser alterado
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </GlowCard>
                        </motion.div>
                    )}

                    {/* Appearance Tab */}
                    {activeTab === 'appearance' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <GlowCard variant="default" padding="default">
                                <CardHeader>
                                    <CardTitle>Aparência</CardTitle>
                                </CardHeader>
                                <CardContent className="mt-6 space-y-6">
                                    {/* Theme */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-3">
                                            Tema
                                        </label>
                                        <div className="flex gap-3">
                                            {['dark', 'light', 'system'].map((theme) => (
                                                <button
                                                    key={theme}
                                                    onClick={() => updatePreferences({ theme: theme as 'dark' | 'light' })}
                                                    className={cn(
                                                        'flex-1 px-4 py-3 rounded-lg border transition-colors',
                                                        preferences.theme === theme
                                                            ? 'bg-neon-500/10 border-neon-500/50 text-neon-400'
                                                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                                    )}
                                                >
                                                    {theme === 'dark' && '🌙 Escuro'}
                                                    {theme === 'light' && '☀️ Claro'}
                                                    {theme === 'system' && '💻 Sistema'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Language */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-3">
                                            Idioma
                                        </label>
                                        <div className="flex gap-3">
                                            {[
                                                { id: 'pt-BR', name: '🇧🇷 Português' },
                                                { id: 'en', name: '🇺🇸 English' },
                                            ].map((lang) => (
                                                <button
                                                    key={lang.id}
                                                    onClick={() => updatePreferences({ language: lang.id })}
                                                    className={cn(
                                                        'flex-1 px-4 py-3 rounded-lg border transition-colors',
                                                        preferences.language === lang.id
                                                            ? 'bg-neon-500/10 border-neon-500/50 text-neon-400'
                                                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                                    )}
                                                >
                                                    {lang.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Reduced motion */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-white">Reduzir animações</p>
                                            <p className="text-xs text-gray-500">Diminui efeitos visuais</p>
                                        </div>
                                        <button
                                            onClick={() => updatePreferences({ reducedMotion: !preferences.reducedMotion })}
                                            className={cn(
                                                'w-12 h-6 rounded-full transition-colors relative',
                                                preferences.reducedMotion ? 'bg-neon-500' : 'bg-white/10'
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                                                    preferences.reducedMotion ? 'translate-x-7' : 'translate-x-1'
                                                )}
                                            />
                                        </button>
                                    </div>
                                </CardContent>
                            </GlowCard>
                        </motion.div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <GlowCard variant="default" padding="default">
                                <CardHeader>
                                    <CardTitle>Notificações</CardTitle>
                                </CardHeader>
                                <CardContent className="mt-6 space-y-4">
                                    {[
                                        { id: 'email', label: 'Notificações por email', desc: 'Receba atualizações importantes' },
                                        { id: 'push', label: 'Notificações push', desc: 'No navegador e dispositivos' },
                                        { id: 'credits', label: 'Alertas de créditos', desc: 'Quando créditos estiverem baixos' },
                                        { id: 'marketing', label: 'Novidades e promoções', desc: 'Ofertas especiais' },
                                    ].map((item) => (
                                        <div key={item.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                                            <div>
                                                <p className="text-sm font-medium text-white">{item.label}</p>
                                                <p className="text-xs text-gray-500">{item.desc}</p>
                                            </div>
                                            <button
                                                className="w-12 h-6 rounded-full bg-neon-500 relative"
                                            >
                                                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white" />
                                            </button>
                                        </div>
                                    ))}
                                </CardContent>
                            </GlowCard>
                        </motion.div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <GlowCard variant="default" padding="default">
                                <CardHeader>
                                    <CardTitle>Segurança</CardTitle>
                                </CardHeader>
                                <CardContent className="mt-6 space-y-6">
                                    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                                        <div className="flex items-center gap-3">
                                            <Key className="w-5 h-5 text-neon-400" />
                                            <div>
                                                <p className="text-sm font-medium text-white">Autenticação</p>
                                                <p className="text-xs text-gray-500">Conectado via Auth0</p>
                                            </div>
                                        </div>
                                        <span className="flex items-center gap-1 text-xs text-green-400">
                                            <Check className="w-3 h-3" />
                                            Ativo
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                                        <div className="flex items-center gap-3">
                                            <Shield className="w-5 h-5 text-neon-400" />
                                            <div>
                                                <p className="text-sm font-medium text-white">MFA (2FA)</p>
                                                <p className="text-xs text-gray-500">Autenticação de dois fatores</p>
                                            </div>
                                        </div>
                                        <NeonButton variant="ghost" size="sm">
                                            Configurar
                                        </NeonButton>
                                    </div>
                                </CardContent>
                            </GlowCard>
                        </motion.div>
                    )}

                    {/* Billing Tab */}
                    {activeTab === 'billing' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <GlowCard variant="default" padding="default">
                                <CardHeader>
                                    <CardTitle>Plano e Cobrança</CardTitle>
                                </CardHeader>
                                <CardContent className="mt-6 space-y-6">
                                    {/* Current plan */}
                                    <div className="p-4 rounded-lg bg-neon-500/10 border border-neon-500/30">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-400">Plano atual</p>
                                                <p className="text-xl font-bold text-white">
                                                    {user?.isAdmin ? 'Admin (Ilimitado)' : 'Free'}
                                                </p>
                                            </div>
                                            <NeonButton size="sm" asChild>
                                                <a href="/pricing">Fazer Upgrade</a>
                                            </NeonButton>
                                        </div>
                                    </div>

                                    {/* Credits */}
                                    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                                        <div>
                                            <p className="text-sm text-gray-400">Créditos disponíveis</p>
                                            <p className="text-2xl font-bold text-neon-400">
                                                {user?.isAdmin ? '∞' : user?.displayCredits ?? '0.00'}
                                            </p>
                                        </div>
                                        <NeonButton variant="ghost" size="sm" asChild>
                                            <a href="/pricing">Comprar Créditos</a>
                                        </NeonButton>
                                    </div>
                                </CardContent>
                            </GlowCard>
                        </motion.div>
                    )}

                    {/* Save button */}
                    <div className="flex justify-end">
                        <NeonButton onClick={handleSave} loading={isSaving}>
                            Salvar Alterações
                        </NeonButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
