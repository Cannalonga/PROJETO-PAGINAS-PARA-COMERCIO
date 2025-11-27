'use client'

import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Section from '@/components/Section'
import HeroSection from '@/components/HeroSection'
import { Card, Grid } from '@/components/ui'

export default function About() {
  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        {/* Hero */}
        <HeroSection
          badge="📖 Nossa História"
          title="Sobre PáginasComércio"
          description="Fundada em 2024, nossa missão é democratizar a presença online para pequenos negócios locais."
        />

        {/* Mission & Vision */}
        <Section py="lg">
          <div className="container mx-auto px-4 sm:px-6">
            <Grid cols={2} gap="lg">
              <Card variant="glass" className="p-8">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold mb-4 text-white">Nossa Missão</h3>
                <p className="text-slate-300 leading-relaxed">
                  Capacitar pequenos negócios locais com ferramentas modernas e acessíveis para construir sua presença online profissional, sem custos prohibitivos.
                </p>
              </Card>

              <Card variant="glass" className="p-8">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-xl font-semibold mb-4 text-white">Nossa Visão</h3>
                <p className="text-slate-300 leading-relaxed">
                  Ser a plataforma número um para criação de páginas web no Brasil, transformando como pequenos empreendedores interagem com seus clientes online.
                </p>
              </Card>
            </Grid>
          </div>
        </Section>

        {/* Values */}
        <Section variant="gradient" py="lg">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Nossos Valores</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Princípios que guiam cada decisão na construção de nossa plataforma
              </p>
            </div>

            <Grid cols={3} gap="md">
              {[
                { icon: '💜', title: 'Simplicidade', desc: 'Ferramentas intuitivas que qualquer um pode usar' },
                { icon: '🤝', title: 'Acessibilidade', desc: 'Preços justos para negócios de todos os tamanhos' },
                { icon: '⚡', title: 'Velocidade', desc: 'Performance máxima em qualquer dispositivo' },
                { icon: '🔒', title: 'Segurança', desc: 'Proteção garantida para seus dados e clientes' },
                { icon: '📈', title: 'Crescimento', desc: 'Ferramentas que escalam com seu negócio' },
                { icon: '❤️', title: 'Suporte', desc: 'Equipe dedicada ao seu sucesso' },
              ].map((value, i) => (
                <Card key={i} variant="gradient" className="p-6 text-center">
                  <div className="text-4xl mb-4">{value.icon}</div>
                  <h4 className="text-lg font-semibold mb-2 text-white">{value.title}</h4>
                  <p className="text-sm text-slate-300">{value.desc}</p>
                </Card>
              ))}
            </Grid>
          </div>
        </Section>

        {/* Team Section */}
        <Section py="lg">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Por que confiar em nós?</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Somos uma equipe apaixonada por tecnologia e por ajudar pequenos negócios a crescer
              </p>
            </div>

            <div className="space-y-6">
              <Card variant="glass" className="p-8">
                <div className="flex items-start gap-6">
                  <div className="text-4xl">💼</div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2 text-white">Experiência Comprovada</h4>
                    <p className="text-slate-300">
                      Nossa equipe tem mais de 50 anos de experiência combinada em desenvolvimento web e empreendedorismo digital.
                    </p>
                  </div>
                </div>
              </Card>

              <Card variant="glass" className="p-8">
                <div className="flex items-start gap-6">
                  <div className="text-4xl">📊</div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2 text-white">Resultados Reais</h4>
                    <p className="text-slate-300">
                      Mais de 10 mil negócios já usam nossa plataforma e relatam aumento médio de 40% em vendas após criar sua vitrine.
                    </p>
                  </div>
                </div>
              </Card>

              <Card variant="glass" className="p-8">
                <div className="flex items-start gap-6">
                  <div className="text-4xl">🌍</div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2 text-white">Suporte Global</h4>
                    <p className="text-slate-300">
                      Atendemos negócios em todo o Brasil com suporte 24/7 em português, garantindo que você nunca esteja sozinho.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Section>

        {/* CTA */}
        <Section variant="gradient" py="lg">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Comece sua jornada hoje</h2>
            <p className="text-slate-300 max-w-xl mx-auto mb-8">
              Junte-se a milhares de negócios que já transformaram sua presença online com PáginasComércio.
            </p>
            <a href="/auth/register">
              <button className="px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg transition duration-200 shadow-lg shadow-sky-500/30">
                Criar Conta Grátis
              </button>
            </a>
          </div>
        </Section>
      </main>

      <Footer />
    </>
  )
}
