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
      <section className="container mx-auto px-4 sm:px-6 py-20 sm:py-32 relative">
        {/* Background Elements */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl"></div>

        <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 relative z-10">
          <div className="space-y-4">
            <div className="inline-block px-4 py-2 glass rounded-full text-sm font-medium text-sky-300 backdrop-blur-xl">
              ✨ A solução moderna para seu negócio local
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
              Crie páginas
              <br />
              <span className="gradient-text">profissionais em minutos</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Sem código. Sem complicações. Seu comércio local merece estar na internet com presença profissional.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/auth/register">
              <button className="btn-shine px-8 py-4 bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white font-semibold rounded-xl transition duration-300 shadow-elevated hover:shadow-glow-sky">
                Começar Grátis →
              </button>
            </Link>
            <Link href="#features">
              <button className="px-8 py-4 glass glass-hover text-white font-semibold rounded-xl transition duration-300">
                Saiba mais
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-12 border-t border-slate-700/50">
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="text-3xl sm:text-4xl font-bold gradient-text">10k+</div>
              <p className="text-sm text-slate-400 mt-1">Negócios criados</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="text-3xl sm:text-4xl font-bold gradient-text">50+</div>
              <p className="text-sm text-slate-400 mt-1">Templates prontos</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="text-3xl sm:text-4xl font-bold gradient-text">99%</div>
              <p className="text-sm text-slate-400 mt-1">Uptime garantido</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 sm:px-6 py-20 relative">
        <div className="text-center space-y-4 mb-16">
          <h2 className="section-title">Recursos poderosos</h2>
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
              className="group glass glass-hover p-6 rounded-2xl transition-all duration-300 hover:shadow-glow-sky"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="text-4xl mb-4 group-hover:float transition-all duration-300">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2 group-hover:gradient-text">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.desc}</p>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-sky-500/0 to-emerald-500/0 group-hover:from-sky-500/5 group-hover:to-emerald-500/5 transition-all duration-300 pointer-events-none"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 sm:px-6 py-20 relative">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>

        <div className="text-center space-y-4 mb-16 relative z-10">
          <h2 className="section-title">Planos acessíveis</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Crescer não precisa ser caro. Escolha o plano certo para você</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative z-10">
          {[
            { name: 'Iniciante', price: 'Grátis', features: ['1 página', 'Template básico', 'Suporte por email', 'Domínio .vercel.app'] },
            { name: 'Profissional', price: 'R$ 29', features: ['Até 5 páginas', 'Todos os templates', 'Domínio próprio', 'Suporte prioritário', 'Analytics'], highlight: true },
            { name: 'Negócio', price: 'R$ 99', features: ['Páginas ilimitadas', 'Templates + customização', 'API acesso', 'Suporte 24/7', 'Integrações avançadas'] },
          ].map((plan, i) => (
            <div
              key={i}
              className={`relative p-8 rounded-2xl border transition-all duration-300 hover:shadow-elevated ${
                plan.highlight
                  ? 'glass glass-hover shadow-glow-sky border-sky-500/30 scale-105'
                  : 'glass border-slate-700/50'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-sky-500 to-emerald-500 text-white text-xs font-bold rounded-full">
                  Mais Popular ⭐
                </div>
              )}
              <h3 className="text-2xl font-semibold mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold gradient-text">{plan.price}</span>
                {plan.price !== 'Grátis' && <span className="text-slate-400 text-sm">/mês</span>}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center text-sm text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center mr-3 text-xs border border-emerald-500/50">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className={`w-full btn-shine py-3 rounded-xl font-semibold transition-all duration-300 ${
                plan.highlight
                  ? 'bg-gradient-to-r from-sky-500 to-emerald-500 hover:shadow-glow-sky'
                  : 'glass glass-hover hover:shadow-glow-sky'
              }`}>
                {plan.price === 'Grátis' ? 'Começar' : 'Upgrade Agora'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 py-20 relative">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-sky-500/10 via-emerald-500/10 to-sky-500/10 blur-2xl"></div>
        
        <div className="relative z-10 glass glass-hover p-12 sm:p-20 rounded-3xl text-center border-sky-500/30 shadow-glow-sky">
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold gradient-text">Pronto para transformar seu negócio?</h2>
            <p className="text-lg text-slate-300 max-w-xl mx-auto">
              Junte-se a milhares de pequenos negócios que já estão crescendo online.
            </p>
            <div>
              <Link href="/auth/register">
                <button className="btn-shine px-8 py-4 bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white font-semibold rounded-xl transition duration-300 shadow-elevated hover:shadow-glow-sky">
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
