/**
 * Landing Page
 * Futuristic homepage with 3D elements, hero section, and CTAs
 */

import Link from 'next/link';
import { ArrowRight, Sparkles, Code2, MessageSquare, Zap, Shield, Globe } from 'lucide-react';

// =============================================================================
// METADATA
// =============================================================================

export const metadata = {
    title: 'PlataformaIA - Crie Apps e Sites com Inteligência Artificial',
    description:
        'Plataforma revolucionária de IA para criar aplicações e sites completos com apenas um prompt. Chat avançado, editor profissional e muito mais.',
};

// =============================================================================
// COMPONENTS
// =============================================================================

function FeatureCard({
    icon: Icon,
    title,
    description,
}: {
    icon: React.ElementType;
    title: string;
    description: string;
}) {
    return (
        <div className="group relative glass-card card-hover">
            {/* Glow effect on hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-neon-500/0 via-neon-500/10 to-neon-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-neon-500/10 flex items-center justify-center mb-4 group-hover:bg-neon-500/20 transition-colors">
                    <Icon className="w-6 h-6 text-neon-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-400 leading-relaxed">{description}</p>
            </div>
        </div>
    );
}

function StatCard({ value, label }: { value: string; label: string }) {
    return (
        <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-neon-glow text-neon-400 mb-2">
                {value}
            </div>
            <div className="text-gray-400">{label}</div>
        </div>
    );
}

// =============================================================================
// PAGE
// =============================================================================

export default function HomePage() {
    return (
        <main className="relative min-h-screen overflow-hidden">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
                {/* Animated gradient orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-500/20 rounded-full blur-[100px] animate-float" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-400/10 rounded-full blur-[120px] animate-float animation-delay-500" />

                <div className="relative z-10 max-w-6xl mx-auto text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-neon mb-8 animate-fade-in-down">
                        <Sparkles className="w-4 h-4 text-neon-400" />
                        <span className="text-sm text-neon-400 font-medium">
                            Powered by AI • Versão 1.0
                        </span>
                    </div>

                    {/* Main heading */}
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 animate-fade-in-up">
                        <span className="text-white">Crie </span>
                        <span className="text-gradient-neon">Apps & Sites</span>
                        <br />
                        <span className="text-white">com </span>
                        <span className="text-gradient-neon">IA</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 animate-fade-in-up animation-delay-200">
                        Transforme suas ideias em aplicações completas com apenas um prompt.
                        Chat avançado, editor profissional e deploy instantâneo.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-300">
                        <Link href="/api/auth/login" className="btn-neon group text-lg px-8 py-4">
                            Começar Grátis
                            <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/pricing"
                            className="btn-ghost-neon text-lg px-8 py-4"
                        >
                            Ver Planos
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 animate-fade-in-up animation-delay-500">
                        <StatCard value="10k+" label="Usuários Ativos" />
                        <StatCard value="50k+" label="Sites Criados" />
                        <StatCard value="99.9%" label="Uptime" />
                        <StatCard value="< 1s" label="Tempo de Resposta" />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative py-32 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Section heading */}
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Funcionalidades <span className="text-gradient-neon">Revolucionárias</span>
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Tudo o que você precisa para criar aplicações incríveis em minutos
                        </p>
                    </div>

                    {/* Features grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FeatureCard
                            icon={MessageSquare}
                            title="Chat IA Avançado"
                            description="Converse com nossa IA para criar, debugar e melhorar seu código. Suporte a imagens, PDFs e código."
                        />
                        <FeatureCard
                            icon={Code2}
                            title="Editor Profissional"
                            description="IDE completa no navegador com IntelliSense, syntax highlighting e preview em tempo real."
                        />
                        <FeatureCard
                            icon={Zap}
                            title="Geração Instantânea"
                            description="Transforme prompts em código funcional. Next.js, React, Tailwind e mais."
                        />
                        <FeatureCard
                            icon={Globe}
                            title="Deploy com 1 Clique"
                            description="Publique seu projeto na web instantaneamente. Sem configuração necessária."
                        />
                        <FeatureCard
                            icon={Shield}
                            title="Segurança Total"
                            description="Autenticação Auth0, criptografia end-to-end e conformidade com LGPD."
                        />
                        <FeatureCard
                            icon={Sparkles}
                            title="IA Personalizada"
                            description="Modelos treinados para entender suas necessidades e estilo de código."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-32 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Glow background */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-[600px] h-[600px] bg-neon-500/5 rounded-full blur-[100px]" />
                    </div>

                    <div className="relative">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Pronto para <span className="text-gradient-neon">Revolucionar</span>
                            <br />
                            seu Desenvolvimento?
                        </h2>
                        <p className="text-xl text-gray-400 mb-8">
                            Comece gratuitamente com 5 créditos. Sem cartão de crédito.
                        </p>
                        <Link href="/api/auth/login" className="btn-neon text-lg px-10 py-5">
                            Criar Conta Grátis
                            <ArrowRight className="inline-block ml-2 w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative py-12 px-4 border-t border-white/5">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-neon-400" />
                        <span className="text-xl font-bold text-white">PlataformaIA</span>
                    </div>
                    <div className="flex items-center gap-6 text-gray-400">
                        <Link href="/pricing" className="hover:text-neon-400 transition-colors">
                            Preços
                        </Link>
                        <Link href="/docs" className="hover:text-neon-400 transition-colors">
                            Documentação
                        </Link>
                        <Link href="/terms" className="hover:text-neon-400 transition-colors">
                            Termos
                        </Link>
                        <Link href="/privacy" className="hover:text-neon-400 transition-colors">
                            Privacidade
                        </Link>
                    </div>
                    <p className="text-gray-500 text-sm">
                        © 2026 PlataformaIA. Todos os direitos reservados.
                    </p>
                </div>
            </footer>
        </main>
    );
}
