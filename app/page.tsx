'use client'

import React from 'react'
import Link from 'next/link'
import { Logo, LogoSmall } from '@/components/Logo'
import { VButton } from '@/components/ui'
import { AdSpace } from '@/components/AdSpace'
import { HeroVitrineFast } from '@/components/HeroVitrineFast'

export default function Home() {
  return (
    <div className="bg-slate-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-950 border-b border-slate-800 backdrop-blur">
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

      {/* Hero Section - New Dark Hero */}
      <HeroVitrineFast />

      {/* Rest of page with white background */}
      <div className="min-h-screen text-textDark bg-white">
        {/* Ad Space - Top */}
        <div className="border-b border-borderLight">
          <div className="container mx-auto px-6 py-2">
            <AdSpace position="top" />
          </div>
        </div>

      {/* Features Section */}
      <section id="features" className="py-12 md:py-16 bg-white border-t border-[#E3E8EF]">
        <div className="max-w-6xl mx-auto px-4">
          {/* Título da seção */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs font-semibold text-[#2D7DF6] uppercase tracking-wide">
              Recursos poderosos
            </p>
            <h2 className="mt-2 text-2xl md:text-3xl font-bold text-[#0A2540]">
              Tudo que você precisa para ter um negócio online de sucesso
            </h2>
            <p className="mt-3 text-sm md:text-base text-[#64748B]">
              Monte sua vitrine digital com blocos prontos: capa, serviços,
              depoimentos, mapa, WhatsApp e muito mais — sem depender de agência.
            </p>
          </div>

          {/* Grid de features */}
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {/* Feature 1 */}
            <div className="bg-[#F7F9FC] border border-[#E3E8EF] rounded-2xl p-5 flex flex-col gap-2">
              <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center text-lg">
                ⚡
              </div>
              <h3 className="text-sm md:text-base font-semibold text-[#0A2540]">
                Sem código
              </h3>
              <p className="text-xs md:text-sm text-[#64748B]">
                Editor visual intuitivo: arraste blocos, troque textos e publique
                sua página em poucos cliques.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#F7F9FC] border border-[#E3E8EF] rounded-2xl p-5 flex flex-col gap-2">
              <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center text-lg">
                🎨
              </div>
              <h3 className="text-sm md:text-base font-semibold text-[#0A2540]">
                Templates modernos
              </h3>
              <p className="text-xs md:text-sm text-[#64748B]">
                Layouts pensados para salões, clínicas, restaurantes, lojas e
                profissionais liberais.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#F7F9FC] border border-[#E3E8EF] rounded-2xl p-5 flex flex-col gap-2">
              <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center text-lg">
                📱
              </div>
              <h3 className="text-sm md:text-base font-semibold text-[#0A2540]">
                Mobile first
              </h3>
              <p className="text-xs md:text-sm text-[#64748B]">
                Sua página linda e rápida no celular, onde seus clientes realmente
                estão.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#F7F9FC] border border-[#E3E8EF] rounded-2xl p-5 flex flex-col gap-2">
              <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center text-lg">
                📈
              </div>
              <h3 className="text-sm md:text-base font-semibold text-[#0A2540]">
                SEO otimizado
              </h3>
              <p className="text-xs md:text-sm text-[#64748B]">
                Engine de SEO integrada para ajudar seu comércio a ser encontrado
                no Google.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-[#F7F9FC] border border-[#E3E8EF] rounded-2xl p-5 flex flex-col gap-2">
              <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center text-lg">
                🔗
              </div>
              <h3 className="text-sm md:text-base font-semibold text-[#0A2540]">
                Integrações prontas
              </h3>
              <p className="text-xs md:text-sm text-[#64748B]">
                WhatsApp, Google Maps, Instagram, links de pagamento e mais em
                poucos cliques.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-[#F7F9FC] border border-[#E3E8EF] rounded-2xl p-5 flex flex-col gap-2">
              <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center text-lg">
                🛡️
              </div>
              <h3 className="text-sm md:text-base font-semibold text-[#0A2540]">
                Segurança por padrão
              </h3>
              <p className="text-xs md:text-sm text-[#64748B]">
                HTTPS, backups, multi-tenant seguro e monitoramento para proteger
                seus dados e dos seus clientes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ad Space - Middle */}
      <div className="bg-white border-y border-borderLight">
        <div className="container mx-auto px-6 py-4">
          <AdSpace position="middle" />
        </div>
      </div>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 md:py-16 bg-[#F7F9FC] border-t border-[#E3E8EF]">
        <div className="max-w-6xl mx-auto px-4">
          {/* Título */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs font-semibold text-[#2D7DF6] uppercase tracking-wide">
              Planos acessíveis
            </p>
            <h2 className="mt-2 text-2xl md:text-3xl font-bold text-[#0A2540]">
              Comece grátis e evolua no seu tempo
            </h2>
            <p className="mt-3 text-sm md:text-base text-[#64748B]">
              Teste o VitrineFast sem compromisso. Publique sua página, veja o
              resultado e só então decida se quer recursos avançados.
            </p>
          </div>

          {/* Cards de planos */}
          <div className="grid md:grid-cols-3 gap-5">
            {/* Iniciante */}
            <div className="bg-white border border-[#E3E8EF] rounded-2xl p-5 flex flex-col gap-3">
              <h3 className="text-sm md:text-base font-semibold text-[#0A2540]">
                Iniciante
              </h3>
              <p className="text-lg md:text-xl font-bold text-[#0A2540]">Grátis</p>
              <p className="text-xs md:text-sm text-[#64748B]">
                Ideal para dar os primeiros passos online.
              </p>
              <ul className="mt-2 space-y-1 text-xs md:text-sm text-[#475569]">
                <li>✓ 1 página</li>
                <li>✓ Template básico</li>
                <li>✓ Suporte por email</li>
                <li>✓ Subdomínio .vercel.app</li>
              </ul>
              <button className="mt-4 w-full text-sm font-semibold px-4 py-2.5 rounded-xl border border-[#E3E8EF] text-[#0A2540] hover:bg-[#F7F9FC] transition">
                Começar
              </button>
            </div>

            {/* Profissional – destaque */}
            <div className="relative bg-white border border-[#2D7DF6] rounded-2xl p-5 flex flex-col gap-3 shadow-md scale-[1.02]">
              <span className="absolute -top-3 right-4 text-[11px] px-2 py-1 rounded-full bg-[#FF8C42] text-white font-semibold shadow-sm">
                Mais popular
              </span>
              <h3 className="text-sm md:text-base font-semibold text-[#0A2540]">
                Profissional
              </h3>
              <p className="text-lg md:text-xl font-bold text-[#0A2540]">
                R$ 29/mês
              </p>
              <p className="text-xs md:text-sm text-[#64748B]">
                Para quem quer parecer profissional e crescer online.
              </p>
              <ul className="mt-2 space-y-1 text-xs md:text-sm text-[#475569]">
                <li>✓ Até 5 páginas</li>
                <li>✓ Todos os templates</li>
                <li>✓ Domínio próprio</li>
                <li>✓ Suporte prioritário</li>
                <li>✓ Analytics básico</li>
              </ul>
              <button className="mt-4 w-full text-sm font-semibold px-4 py-2.5 rounded-xl bg-[#2D7DF6] text-white hover:bg-[#1B64D3] transition">
                Upgrade agora
              </button>
            </div>

            {/* Negócio */}
            <div className="bg-white border border-[#E3E8EF] rounded-2xl p-5 flex flex-col gap-3">
              <h3 className="text-sm md:text-base font-semibold text-[#0A2540]">
                Negócio
              </h3>
              <p className="text-lg md:text-xl font-bold text-[#0A2540]">
                R$ 99/mês
              </p>
              <p className="text-xs md:text-sm text-[#64748B]">
                Para negócios que dependem da internet todo dia.
              </p>
              <ul className="mt-2 space-y-1 text-xs md:text-sm text-[#475569]">
                <li>✓ Páginas ilimitadas</li>
                <li>✓ Templates + customização avançada</li>
                <li>✓ API de acesso</li>
                <li>✓ Suporte 24/7</li>
                <li>✓ Integrações avançadas</li>
              </ul>
              <button className="mt-4 w-full text-sm font-semibold px-4 py-2.5 rounded-xl border border-[#E3E8EF] text-[#0A2540] hover:bg-[#F7F9FC] transition">
                Falar com vendas
              </button>
            </div>
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

      {/* Ad Space - Footer (Sticky) */}
      <AdSpace position="footer" />
    </div>
    </div>
  )
}
