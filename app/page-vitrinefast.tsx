'use client'

import React from 'react'
import Link from 'next/link'
import { Logo, LogoSmall } from '@/components/Logo'
import { VButton, VCard } from '@/components/ui'

export default function Home() {
  return (
    <div className="min-h-screen bg-bgLight text-textDark">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-borderLight backdrop-blur">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="w-32">
            <Logo className="h-12 w-auto" />
          </div>
          <div className="space-x-4">
            <Link href="/auth/login">
              <VButton variant="ghost" size="md">
                Entrar
              </VButton>
            </Link>
            <Link href="/auth/register">
              <VButton variant="primary" size="md">
                Começar Grátis
              </VButton>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 sm:py-32">
        <div className="max-w-5xl mx-auto text-center px-6">
          <h1 className="text-4xl md:text-6xl font-extrabold text-secondary leading-tight">
            Sua Vitrine Online,
            <br />
            <span className="text-primary">Rápida</span> e
            <span className="block text-fast mt-2">Profissional</span>
          </h1>

          <p className="mt-6 text-lg text-textLight max-w-2xl mx-auto leading-relaxed">
            Crie páginas modernas para seu comércio em minutos — sem complicação e sem precisar de código.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/auth/register">
              <VButton variant="primary" size="lg" className="w-full sm:w-auto">
                Criar Minha Página
              </VButton>
            </Link>
            <Link href="#features">
              <VButton variant="outline" size="lg" className="w-full sm:w-auto">
                Ver Exemplos
              </VButton>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-borderLight">
            <div>
              <div className="text-4xl font-bold text-primary">10k+</div>
              <p className="text-sm text-textLight mt-2">Negócios criados</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary">50+</div>
              <p className="text-sm text-textLight mt-2">Templates prontos</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary">99%</div>
              <p className="text-sm text-textLight mt-2">Uptime garantido</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white border-t border-borderLight">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-secondary mb-4">
              Tudo que você precisa
            </h2>
            <p className="text-lg text-textLight max-w-2xl mx-auto">
              Recursos poderosos para transformar seu comércio local em presença online profissional.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '⚡',
                title: 'Sem Código',
                desc: 'Editor visual intuitivo com drag-and-drop. Qualquer pessoa consegue usar.',
              },
              {
                icon: '🎨',
                title: 'Templates em Breve',
                desc: 'Novos designs profissionais chegando em breve. Customize conforme quiser.',
              },
              {
                icon: '📱',
                title: 'Mobile First',
                desc: 'Perfeito em qualquer dispositivo. Responsivo e otimizado.',
              },
              {
                icon: '🔍',
                title: 'SEO Otimizado',
                desc: 'Rankeie no Google automaticamente. Ferramentas built-in.',
              },
              {
                icon: '⚙️',
                title: 'Integrações',
                desc: 'Conecte com WhatsApp, Google Maps, Calendly e mais.',
              },
              {
                icon: '🛡️',
                title: 'Seguro & Confiável',
                desc: 'SSL automático, backups diários e suporte 24/7.',
              },
            ].map((feature, i) => (
              <VCard key={i} variant="light">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-secondary mb-2">
                  {feature.title}
                </h3>
                <p className="text-textLight">{feature.desc}</p>
              </VCard>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-secondary mb-4">
              Planos Acessíveis
            </h2>
            <p className="text-lg text-textLight max-w-2xl mx-auto">
              Crescer não precisa ser caro. Escolha o plano certo para seu negócio.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Iniciante',
                price: 'Grátis',
                desc: 'Perfeito para começar',
                features: ['1 página', 'Template básico', 'Domínio grátis', 'Suporte por email'],
                cta: 'Começar Agora',
              },
              {
                name: 'Profissional',
                price: 'R$ 29',
                desc: 'Mais popular para negócios',
                period: '/mês',
                features: [
                  'Até 5 páginas',
                  'Todos os templates',
                  'Domínio próprio',
                  'Suporte prioritário',
                  'Analytics básico',
                ],
                cta: 'Upgrade Agora',
                highlight: true,
              },
              {
                name: 'Empresa',
                price: 'R$ 99',
                desc: 'Para negócios em crescimento',
                period: '/mês',
                features: [
                  'Páginas ilimitadas',
                  'Customização total',
                  'API acesso',
                  'Suporte 24/7',
                  'Analytics avançado',
                  'Integrações premium',
                ],
                cta: 'Começar Agora',
              },
            ].map((plan, i) => (
              <VCard
                key={i}
                variant={plan.highlight ? 'premium' : 'light'}
                className={plan.highlight ? 'md:scale-105' : ''}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-fast text-white text-xs font-bold rounded-full">
                    Mais Popular ⭐
                  </div>
                )}
                <h3 className="text-2xl font-bold text-secondary mb-1">{plan.name}</h3>
                <p className="text-textLight text-sm mb-4">{plan.desc}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-primary">{plan.price}</span>
                  {plan.period && <span className="text-textLight text-sm ml-1">{plan.period}</span>}
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-center text-sm text-textDark">
                      <span className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center mr-3 text-xs text-success">
                        ✓
                      </span>
                      {feat}
                    </li>
                  ))}
                </ul>
                <VButton
                  variant={plan.highlight ? 'primary' : 'outline'}
                  size="md"
                  className="w-full"
                >
                  {plan.cta}
                </VButton>
              </VCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Pronto para crescer?
          </h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
            Junte-se a milhares de comerciantes que já transformaram seus negócios com VitrineFast.
          </p>
          <Link href="/auth/register">
            <VButton
              variant="secondary"
              size="lg"
              className="bg-secondary hover:bg-[#051a2e]"
            >
              Criar Minha Página Agora
            </VButton>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="w-32 mb-4">
                <LogoSmall className="h-10 w-auto" />
              </div>
              <p className="text-sm text-white/70">
                Transformando negócios locais em vitrines profissionais online.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Templates
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Sobre
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Contato
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Privacidade
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Termos
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Segurança
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 text-center text-sm text-white/70">
            <p>© 2025 VitrineFast. Todos os direitos reservados. 🚀</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
