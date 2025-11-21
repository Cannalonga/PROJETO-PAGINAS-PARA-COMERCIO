'use client'

import React from 'react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur border-b border-slate-700/50">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-text bg-clip-text text-transparent">
            PáginasComércio
          </div>
          <div className="space-x-4">
            <Link href="/auth/login">
              <button className="px-4 py-2 text-sm font-medium text-sky-400 hover:text-sky-300 transition">
                Entrar
              </button>
            </Link>
            <Link href="/auth/register">
              <button className="px-4 py-2 text-sm font-medium bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition">
                Começar Grátis
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 py-20 sm:py-32">
        <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="space-y-4">
            <div className="inline-block px-3 py-1 bg-sky-500/10 border border-sky-500/30 rounded-full text-xs sm:text-sm font-medium text-sky-300">
              ✨ A solução moderna para seu negócio local
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-tight">
              Crie páginas
              <br />
              <span className="bg-gradient-to-r from-sky-400 via-emerald-400 to-sky-400 bg-clip-text text-transparent">
                profissionais em minutos
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto">
              Sem código. Sem complicações. Seu comércio local merece estar na internet com presença profissional.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/auth/register">
              <button className="px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg transition duration-200 shadow-lg shadow-sky-500/20">
                Começar Grátis →
              </button>
            </Link>
            <Link href="#features">
              <button className="px-8 py-3 bg-slate-700/50 hover:bg-slate-600 text-white font-semibold rounded-lg transition duration-200 border border-slate-600">
                Saiba mais
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-12 border-t border-slate-700/50">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-sky-400">10k+</div>
              <p className="text-sm text-slate-400">Negócios criados</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-emerald-400">50+</div>
              <p className="text-sm text-slate-400">Templates prontos</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-sky-400">99%</div>
              <p className="text-sm text-slate-400">Uptime garantido</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 sm:px-6 py-20">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold">Recursos poderosos</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Tudo que você precisa para ter um negócio online de sucesso</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: '⚡', title: 'Sem Código', desc: 'Editor visual intuitivo, drag-and-drop' },
            { icon: '🎨', title: 'Templates Modernos', desc: '50+ designs profissionais prontos' },
            { icon: '📱', title: 'Mobile First', desc: 'Perfeito em qualquer dispositivo' },
            { icon: '🔍', title: 'SEO Otimizado', desc: 'Rankeie no Google automaticamente' },
            { icon: '⚙️', title: 'Integrações', desc: 'WhatsApp, Google Maps, e mais' },
            { icon: '🛡️', title: 'Seguro', desc: 'SSL automático e backups diários' },
          ].map((feature, i) => (
            <div
              key={i}
              className="group p-6 rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-slate-700/50 hover:border-sky-500/50 transition duration-300 hover:shadow-lg hover:shadow-sky-500/10"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 sm:px-6 py-20">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold">Planos acessíveis</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Crescer não precisa ser caro. Escolha o plano certo para você</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Iniciante', price: 'Grátis', features: ['1 página', 'Template básico', 'Suporte por email', 'Domínio .vercel.app'] },
            { name: 'Profissional', price: 'R$ 29', features: ['Até 5 páginas', 'Todos os templates', 'Domínio próprio', 'Suporte prioritário', 'Analytics'], highlight: true },
            { name: 'Negócio', price: 'R$ 99', features: ['Páginas ilimitadas', 'Templates + customização', 'API acesso', 'Suporte 24/7', 'Integrações avançadas'] },
          ].map((plan, i) => (
            <div
              key={i}
              className={`relative p-8 rounded-lg border transition duration-300 ${
                plan.highlight
                  ? 'bg-gradient-to-br from-sky-500/10 to-emerald-500/10 border-sky-500/50 shadow-lg shadow-sky-500/20'
                  : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
              }`}
            >
              {plan.highlight && <div className="absolute top-4 right-4 text-xs font-semibold text-emerald-400">Mais Popular</div>}
              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-3xl font-bold">{plan.price}</span>
                {plan.price !== 'Grátis' && <span className="text-slate-400 text-sm">/mês</span>}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center text-sm text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center mr-3 text-xs">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-2 rounded-lg font-semibold transition ${
                plan.highlight
                  ? 'bg-sky-500 hover:bg-sky-600 text-white'
                  : 'bg-slate-700/50 hover:bg-slate-600 text-white'
              }`}>
                {plan.price === 'Grátis' ? 'Começar' : 'Upgrade'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 py-20">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-500/10 via-emerald-500/10 to-sky-500/10 border border-sky-500/30 p-12 sm:p-20 text-center">
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold">Pronto para transformar seu negócio?</h2>
            <p className="text-lg text-slate-300 max-w-xl mx-auto">
              Junte-se a milhares de pequenos negócios que já estão crescendo online.
            </p>
            <div>
              <Link href="/auth/register">
                <button className="px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg transition duration-200 shadow-lg shadow-sky-500/30">
                  Criar Conta Grátis Agora
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-lg font-bold mb-4">PáginasComércio</div>
              <p className="text-slate-400 text-sm">Transformando negócios locais em presenças online profissionais.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Templates</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Sobre</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacidade</a></li>
                <li><a href="#" className="hover:text-white transition">Termos</a></li>
                <li><a href="#" className="hover:text-white transition">Segurança</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700/50 pt-8 text-center text-slate-400 text-sm">
            <p>© 2025 PáginasComércio. Todos os direitos reservados. 🚀</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
