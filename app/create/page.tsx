/**
 * Create Project Page
 * AI-powered project generation from prompts
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Sparkles,
    Wand2,
    Code2,
    Palette,
    Database,
    Lock,
    ShoppingCart,
    FileText,
    BarChart,
    Loader2,
    CheckCircle,
    AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { GlowCard } from '@/components/ui/GlowCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { CREDIT_COSTS } from '@/lib/constants';

// =============================================================================
// TYPES
// =============================================================================

type TechOption = {
    id: string;
    name: string;
    icon: React.ElementType;
};

// =============================================================================
// DATA
// =============================================================================

const frameworkOptions: TechOption[] = [
    { id: 'nextjs', name: 'Next.js', icon: Code2 },
    { id: 'react', name: 'React', icon: Code2 },
    { id: 'vue', name: 'Vue.js', icon: Code2 },
];

const stylingOptions: TechOption[] = [
    { id: 'tailwind', name: 'Tailwind CSS', icon: Palette },
    { id: 'css', name: 'CSS Modules', icon: Palette },
];

const featureOptions: TechOption[] = [
    { id: 'auth', name: 'Autenticação', icon: Lock },
    { id: 'ecommerce', name: 'E-commerce', icon: ShoppingCart },
    { id: 'cms', name: 'CMS', icon: FileText },
    { id: 'analytics', name: 'Analytics', icon: BarChart },
    { id: 'database', name: 'Database', icon: Database },
];

const promptExamples = [
    'Crie um landing page para uma startup de SaaS com hero section, features, pricing e FAQ',
    'Faça um dashboard de analytics com gráficos, tabelas e filtros',
    'Desenvolva um blog com sistema de posts, categorias e busca',
    'Crie um e-commerce simples com listagem de produtos e carrinho',
];

// =============================================================================
// COMPONENT
// =============================================================================

export default function CreatePage() {
    const router = useRouter();

    // State
    const [prompt, setPrompt] = React.useState('');
    const [selectedFramework, setSelectedFramework] = React.useState('nextjs');
    const [selectedStyling, setSelectedStyling] = React.useState('tailwind');
    const [selectedFeatures, setSelectedFeatures] = React.useState<string[]>([]);
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [progress, setProgress] = React.useState(0);

    // Toggle feature selection
    const toggleFeature = (featureId: string) => {
        setSelectedFeatures((prev) =>
            prev.includes(featureId)
                ? prev.filter((id) => id !== featureId)
                : [...prev, featureId]
        );
    };

    // Calculate estimated cost
    const estimatedCost = React.useMemo(() => {
        const baseCost = CREDIT_COSTS.siteGeneration.basic;
        const featureCost = selectedFeatures.length * 1;
        return baseCost + featureCost;
    }, [selectedFeatures]);

    // Generate project
    const handleGenerate = async () => {
        if (!prompt.trim()) {
            toast.error('Por favor, descreva o que você quer criar');
            return;
        }

        setIsGenerating(true);
        setProgress(0);

        // Simulate progress
        const progressInterval = setInterval(() => {
            setProgress((prev) => Math.min(prev + Math.random() * 10, 90));
        }, 500);

        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: prompt.trim(),
                    options: {
                        framework: selectedFramework,
                        styling: selectedStyling,
                        features: selectedFeatures,
                    },
                }),
            });

            clearInterval(progressInterval);

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error ?? 'Falha na geração');
            }

            const data = await res.json();
            setProgress(100);

            toast.success('Projeto criado com sucesso!');

            // Redirect to editor
            setTimeout(() => {
                router.push(`/editor/${data.data.projectId}`);
            }, 500);
        } catch (error) {
            clearInterval(progressInterval);
            toast.error((error as Error).message ?? 'Erro ao gerar projeto');
            setIsGenerating(false);
            setProgress(0);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-neon mb-4"
                >
                    <Sparkles className="w-4 h-4 text-neon-400" />
                    <span className="text-sm text-neon-400 font-medium">
                        Powered by AI
                    </span>
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl font-bold text-white mb-4"
                >
                    Crie seu <span className="text-gradient-neon">Site com IA</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-400 max-w-lg mx-auto"
                >
                    Descreva o que você quer criar e nossa IA vai gerar um projeto
                    completo para você em segundos.
                </motion.p>
            </div>

            {/* Main form */}
            <GlowCard variant="default" padding="lg" className="space-y-6">
                {/* Prompt input */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Descreva seu projeto
                    </label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ex: Crie um landing page moderno para uma empresa de tecnologia com seções de hero, features, preços e contato..."
                        rows={4}
                        disabled={isGenerating}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10
                     text-white placeholder:text-gray-500 resize-none
                     focus:outline-none focus:border-neon-500/50 focus:ring-1 focus:ring-neon-500/50
                     disabled:opacity-50"
                    />
                    {/* Example prompts */}
                    <div className="mt-3 flex flex-wrap gap-2">
                        {promptExamples.map((example, i) => (
                            <button
                                key={i}
                                onClick={() => setPrompt(example)}
                                disabled={isGenerating}
                                className="text-xs px-3 py-1.5 rounded-full bg-white/5 text-gray-400 
                         hover:bg-white/10 hover:text-white transition-colors
                         disabled:opacity-50"
                            >
                                {example.slice(0, 40)}...
                            </button>
                        ))}
                    </div>
                </div>

                {/* Framework selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                        Framework
                    </label>
                    <div className="flex flex-wrap gap-3">
                        {frameworkOptions.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => setSelectedFramework(option.id)}
                                disabled={isGenerating}
                                className={cn(
                                    'flex items-center gap-2 px-4 py-2 rounded-lg border transition-all',
                                    selectedFramework === option.id
                                        ? 'bg-neon-500/10 border-neon-500/50 text-neon-400'
                                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20',
                                    'disabled:opacity-50'
                                )}
                            >
                                <option.icon className="w-4 h-4" />
                                {option.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Styling selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                        Estilização
                    </label>
                    <div className="flex flex-wrap gap-3">
                        {stylingOptions.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => setSelectedStyling(option.id)}
                                disabled={isGenerating}
                                className={cn(
                                    'flex items-center gap-2 px-4 py-2 rounded-lg border transition-all',
                                    selectedStyling === option.id
                                        ? 'bg-neon-500/10 border-neon-500/50 text-neon-400'
                                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20',
                                    'disabled:opacity-50'
                                )}
                            >
                                <option.icon className="w-4 h-4" />
                                {option.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Features selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                        Funcionalidades adicionais
                    </label>
                    <div className="flex flex-wrap gap-3">
                        {featureOptions.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => toggleFeature(option.id)}
                                disabled={isGenerating}
                                className={cn(
                                    'flex items-center gap-2 px-4 py-2 rounded-lg border transition-all',
                                    selectedFeatures.includes(option.id)
                                        ? 'bg-neon-500/10 border-neon-500/50 text-neon-400'
                                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20',
                                    'disabled:opacity-50'
                                )}
                            >
                                <option.icon className="w-4 h-4" />
                                {option.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cost and generate button */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div>
                        <p className="text-sm text-gray-400">Custo estimado</p>
                        <p className="text-xl font-bold text-neon-400">
                            {estimatedCost.toFixed(2)} créditos
                        </p>
                    </div>
                    <NeonButton
                        onClick={handleGenerate}
                        disabled={!prompt.trim() || isGenerating}
                        size="lg"
                        className="gap-2"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Gerando...
                            </>
                        ) : (
                            <>
                                <Wand2 className="w-5 h-5" />
                                Gerar Projeto
                            </>
                        )}
                    </NeonButton>
                </div>

                {/* Progress bar */}
                {isGenerating && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="pt-4"
                    >
                        <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                            <span>Gerando seu projeto...</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-neon-500 to-neon-400"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ ease: 'easeOut' }}
                            />
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
                            {progress < 30 && (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin text-neon-400" />
                                    Analisando prompt...
                                </>
                            )}
                            {progress >= 30 && progress < 60 && (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin text-neon-400" />
                                    Gerando estrutura...
                                </>
                            )}
                            {progress >= 60 && progress < 90 && (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin text-neon-400" />
                                    Criando componentes...
                                </>
                            )}
                            {progress >= 90 && (
                                <>
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    Finalizando...
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </GlowCard>

            {/* Tips */}
            <GlowCard variant="outline" padding="default">
                <h3 className="text-lg font-semibold text-white mb-3">💡 Dicas</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                    <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-neon-400 mt-0.5 flex-shrink-0" />
                        Seja específico sobre o layout e funcionalidades desejadas
                    </li>
                    <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-neon-400 mt-0.5 flex-shrink-0" />
                        Mencione o estilo visual desejado (moderno, minimalista, etc.)
                    </li>
                    <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-neon-400 mt-0.5 flex-shrink-0" />
                        Liste as seções principais que você precisa
                    </li>
                </ul>
            </GlowCard>
        </div>
    );
}
