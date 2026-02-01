/**
 * Pricing Page
 * Subscription plans with pricing cards
 */

import Link from 'next/link';
import { Check, X, Sparkles, Zap, Crown, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlowCard } from '@/components/ui/GlowCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { PLANS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

// =============================================================================
// METADATA
// =============================================================================

export const metadata = {
    title: 'Planos e Preços',
    description: 'Escolha o plano ideal para suas necessidades',
};

// =============================================================================
// ICONS MAP
// =============================================================================

const planIcons: Record<string, React.ElementType> = {
    FREE: Sparkles,
    BASIC: Zap,
    PRO: Crown,
    ENTERPRISE: Building2,
};

// =============================================================================
// PAGE
// =============================================================================

export default function PricingPage() {
    return (
        <main className="min-h-screen py-20 px-4">
            {/* Header */}
            <div className="max-w-4xl mx-auto text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    Escolha seu <span className="text-gradient-neon">Plano</span>
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                    Comece gratuitamente e escale conforme seu crescimento.
                    Todos os planos incluem acesso à IA.
                </p>
            </div>

            {/* Plans grid */}
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {PLANS.map((plan) => {
                    const Icon = planIcons[plan.tier] ?? Sparkles;

                    return (
                        <GlowCard
                            key={plan.id}
                            variant={plan.isPopular ? 'neon' : 'default'}
                            padding="none"
                            hover="lift"
                            className={cn(
                                'flex flex-col overflow-hidden',
                                plan.isPopular && 'ring-2 ring-neon-500/50'
                            )}
                        >
                            {/* Popular badge */}
                            {plan.isPopular && (
                                <div className="bg-gradient-to-r from-neon-500 to-neon-400 text-black text-xs font-bold text-center py-1.5 uppercase tracking-wider">
                                    Mais Popular
                                </div>
                            )}

                            <div className="flex flex-col flex-1 p-6">
                                {/* Plan header */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={cn(
                                            'w-10 h-10 rounded-xl flex items-center justify-center',
                                            plan.isPopular ? 'bg-neon-500/20' : 'bg-white/5'
                                        )}>
                                            <Icon className={cn(
                                                'w-5 h-5',
                                                plan.isPopular ? 'text-neon-400' : 'text-gray-400'
                                            )} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white">{plan.name}</h2>
                                            <p className="text-xs text-gray-500">{plan.description}</p>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="mt-4">
                                        {plan.priceMonthly === 0 ? (
                                            <div className="text-4xl font-bold text-white">Grátis</div>
                                        ) : (
                                            <div>
                                                <span className="text-4xl font-bold text-white">
                                                    {formatCurrency(plan.priceMonthly)}
                                                </span>
                                                <span className="text-gray-500">/mês</span>
                                            </div>
                                        )}
                                        {plan.priceYearly > 0 && (
                                            <p className="text-sm text-gray-500 mt-1">
                                                ou {formatCurrency(plan.priceYearly)}/ano (2 meses grátis)
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Credits info */}
                                <div className="mb-6 p-3 rounded-lg bg-white/5">
                                    <p className="text-sm text-gray-400 mb-1">Créditos mensais</p>
                                    <p className="text-2xl font-bold text-neon-400">
                                        {plan.creditsMonthly === Infinity ? '∞' : plan.creditsMonthly}
                                    </p>
                                </div>

                                {/* Features */}
                                <ul className="space-y-3 mb-6 flex-1">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            {feature.included ? (
                                                <Check className="w-5 h-5 text-neon-400 flex-shrink-0" />
                                            ) : (
                                                <X className="w-5 h-5 text-gray-600 flex-shrink-0" />
                                            )}
                                            <span className={cn(
                                                'text-sm',
                                                feature.included ? 'text-gray-300' : 'text-gray-600'
                                            )}>
                                                {feature.name}
                                                {feature.limit && (
                                                    <span className="text-gray-500 ml-1">
                                                        ({feature.limit})
                                                    </span>
                                                )}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA button */}
                                <Link href="/api/auth/login" className="mt-auto">
                                    <NeonButton
                                        variant={plan.isPopular ? 'default' : 'ghost'}
                                        className="w-full"
                                    >
                                        {plan.priceMonthly === 0 ? 'Começar Grátis' : 'Assinar Agora'}
                                    </NeonButton>
                                </Link>
                            </div>
                        </GlowCard>
                    );
                })}
            </div>

            {/* FAQ section */}
            <div className="max-w-3xl mx-auto mt-20">
                <h2 className="text-2xl font-bold text-white text-center mb-8">
                    Perguntas Frequentes
                </h2>

                <div className="space-y-4">
                    <GlowCard variant="outline" padding="default">
                        <h3 className="font-semibold text-white mb-2">
                            Como funcionam os créditos?
                        </h3>
                        <p className="text-gray-400 text-sm">
                            Créditos são usados para interações com a IA. Cada mensagem no chat
                            custa cerca de 0.30 créditos, e a criação de sites varia de 2 a 10
                            créditos dependendo da complexidade.
                        </p>
                    </GlowCard>

                    <GlowCard variant="outline" padding="default">
                        <h3 className="font-semibold text-white mb-2">
                            Posso trocar de plano?
                        </h3>
                        <p className="text-gray-400 text-sm">
                            Sim! Você pode fazer upgrade ou downgrade a qualquer momento.
                            Os créditos não utilizados são mantidos na sua conta.
                        </p>
                    </GlowCard>

                    <GlowCard variant="outline" padding="default">
                        <h3 className="font-semibold text-white mb-2">
                            Quais formas de pagamento são aceitas?
                        </h3>
                        <p className="text-gray-400 text-sm">
                            Aceitamos cartões de crédito (Visa, Mastercard, Amex),
                            Pix e boleto bancário através do Stripe.
                        </p>
                    </GlowCard>

                    <GlowCard variant="outline" padding="default">
                        <h3 className="font-semibold text-white mb-2">
                            Existe período de teste?
                        </h3>
                        <p className="text-gray-400 text-sm">
                            O plano Free é permanente e não expira. Você pode usar com 5 créditos
                            iniciais e ganhar 1 crédito extra por dia ao fazer login.
                        </p>
                    </GlowCard>
                </div>
            </div>
        </main>
    );
}
