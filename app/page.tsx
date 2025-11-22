'use client'

import Link from 'next/link'
import { Logo, LogoSmall } from '@/components/Logo'
import { VButton } from '@/components/ui'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="w-32">
            <Logo className="h-10 w-auto" />
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
      <section className="py-20 md:py-32 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            Sua Vitrine Digital
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            Crie uma página profissional para seu negócio local em minutos. Sem código, sem complicação.
          </p>
          <div className="flex justify-center gap-4 mb-12">
            <Link href="/auth/register">
              <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition">
                Criar Página Agora
              </button>
            </Link>
            <button className="px-8 py-3 border border-gray-300 text-slate-700 font-semibold rounded-lg hover:bg-gray-50 transition">
              Ver Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-16">
            Tudo que você precisa
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Sem Código</h3>
              <p className="text-slate-600">
                Editor visual intuitivo. Arraste, solte e publique sua página em minutos.
              </p>
            </div>
            <div className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Templates Modernos</h3>
              <p className="text-slate-600">
                Designs profissionais para salões, clínicas, restaurantes e lojas.
              </p>
            </div>
            <div className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Mobile First</h3>
              <p className="text-slate-600">
                Sua página perfeita no celular, onde seus clientes realmente estão.
              </p>
            </div>
            <div className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">SEO Otimizado</h3>
              <p className="text-slate-600">
                Apareça no Google e seja encontrado pelos seus clientes locais.
              </p>
            </div>
            <div className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Integrações</h3>
              <p className="text-slate-600">
                WhatsApp, Google Maps, Instagram, pagamento e mais em poucos cliques.
              </p>
            </div>
            <div className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Seguro</h3>
              <p className="text-slate-600">
                HTTPS, backups automáticos e proteção de dados inclusos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-16">
            Planos Simples e Diretos
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Free */}
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Grátis</h3>
              <p className="text-slate-600 mb-6">Perfeito para começar</p>
              <ul className="space-y-3 mb-8 text-slate-700">
                <li className="flex items-center gap-2">✓ 1 página</li>
                <li className="flex items-center gap-2">✓ Template básico</li>
                <li className="flex items-center gap-2">✓ Suporte por email</li>
              </ul>
              <button className="w-full px-6 py-2 border border-gray-300 text-slate-700 font-semibold rounded-lg hover:bg-gray-50 transition">
                Começar Grátis
              </button>
            </div>

            {/* Pro */}
            <div className="bg-white p-8 rounded-xl border-2 border-blue-600 transform scale-105 shadow-lg">
              <div className="inline-block px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full mb-4">
                Mais Popular
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Profissional</h3>
              <p className="text-slate-600 mb-2">
                <span className="text-4xl font-bold text-slate-900">R$ 29</span>/mês
              </p>
              <p className="text-slate-600 mb-6 text-sm">Billed monthly</p>
              <ul className="space-y-3 mb-8 text-slate-700">
                <li className="flex items-center gap-2">✓ Até 5 páginas</li>
                <li className="flex items-center gap-2">✓ Todos os templates</li>
                <li className="flex items-center gap-2">✓ Domínio próprio</li>
                <li className="flex items-center gap-2">✓ Suporte prioritário</li>
                <li className="flex items-center gap-2">✓ Analytics</li>
              </ul>
              <button className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition">
                Upgrade Agora
              </button>
            </div>

            {/* Business */}
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Negócio</h3>
              <p className="text-slate-600 mb-2">
                <span className="text-4xl font-bold text-slate-900">R$ 99</span>/mês
              </p>
              <p className="text-slate-600 mb-6 text-sm">Billed monthly</p>
              <ul className="space-y-3 mb-8 text-slate-700">
                <li className="flex items-center gap-2">✓ Páginas ilimitadas</li>
                <li className="flex items-center gap-2">✓ Customização completa</li>
                <li className="flex items-center gap-2">✓ API de acesso</li>
                <li className="flex items-center gap-2">✓ Suporte 24/7</li>
                <li className="flex items-center gap-2">✓ Integrações avançadas</li>
              </ul>
              <button className="w-full px-6 py-2 border border-gray-300 text-slate-700 font-semibold rounded-lg hover:bg-gray-50 transition">
                Falar com Vendedor
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Pronto para começar?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Crie sua primeira página agora e atraia mais clientes.
          </p>
          <Link href="/auth/register">
            <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition">
              Criar Página Agora
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="w-32 mb-4">
                <LogoSmall className="h-10 w-auto" />
              </div>
              <p className="text-slate-400">
                Transformando negócios locais em vitrines profissionais.
              </p>
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
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
            <p>© 2025 VitrineFast. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
  )
}
