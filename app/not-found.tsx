'use client'

import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { VButton } from '@/components/ui'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 border-b border-slate-800 backdrop-blur">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <Link href="/">
            <div className="w-32 cursor-pointer hover:opacity-80 transition">
              <Logo className="h-12 w-auto" />
            </div>
          </Link>
          <div className="space-x-4">
            <Link href="/">
              <VButton variant="ghost" size="md">
                Voltar
              </VButton>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-5">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(0deg, transparent 24%, rgba(45, 125, 246, 0.05) 25%, rgba(45, 125, 246, 0.05) 26%, transparent 27%, transparent 74%, rgba(45, 125, 246, 0.05) 75%, rgba(45, 125, 246, 0.05) 76%, transparent 77%, transparent),
                linear-gradient(90deg, transparent 24%, rgba(45, 125, 246, 0.05) 25%, rgba(45, 125, 246, 0.05) 26%, transparent 27%, transparent 74%, rgba(45, 125, 246, 0.05) 75%, rgba(45, 125, 246, 0.05) 76%, transparent 77%, transparent)
              `,
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        {/* Gradient Glows - Purple/Blue for 404 */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full opacity-10 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full opacity-10 blur-3xl" />

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-2xl">
          {/* Error Code */}
          <div className="mb-8">
            <span className="inline-block px-6 py-3 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-semibold">
              404 - Página não encontrada
            </span>
          </div>

          {/* Large 404 Number */}
          <div className="mb-8 relative">
            <div className="text-9xl md:text-[120px] font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent opacity-80">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center text-6xl md:text-7xl opacity-0 hover:opacity-100 transition-opacity duration-300">
              🔍
            </div>
          </div>

          {/* Main Message */}
          <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-purple-400 via-white to-blue-400 bg-clip-text text-transparent">
            Página Perdida!
          </h1>

          <p className="text-xl md:text-2xl text-slate-300 mb-4">
            Parece que essa página viajou para uma dimensão desconhecida
          </p>

          <p className="text-base md:text-lg text-slate-400 mb-12 leading-relaxed">
            O URL que você tentou acessar não existe em nosso servidor. 
            Pode ser que o link esteja quebrado ou a página tenha sido movida.
            Mas não se preocupe — sua vitrine ainda está funcionando perfeitamente! 🚀
          </p>

          {/* Floating Icons - Lost theme */}
          <div className="mb-12 flex justify-center gap-6 text-5xl">
            <span className="float-slow opacity-60">🗺️</span>
            <span className="float-slow-alt opacity-60">❓</span>
            <span className="pulse-soft opacity-60">🧭</span>
          </div>

          {/* Helpful Links */}
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link href="/" className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg hover:bg-purple-500/20 transition">
              <p className="text-sm text-purple-300 font-semibold">🏠 Home</p>
              <p className="text-xs text-slate-400 mt-1">Voltar ao início</p>
            </Link>
            <Link href="/store" className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 transition">
              <p className="text-sm text-blue-300 font-semibold">🎨 Template</p>
              <p className="text-xs text-slate-400 mt-1">Ver exemplo</p>
            </Link>
            <a href="mailto:suporte@vitrine.fast" className="p-4 bg-slate-500/10 border border-slate-500/30 rounded-lg hover:bg-slate-500/20 transition">
              <p className="text-sm text-slate-300 font-semibold">📧 Suporte</p>
              <p className="text-xs text-slate-400 mt-1">Entrar em contato</p>
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <button className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 text-white w-full">
                ← Voltar ao Início
              </button>
            </Link>
            <Link href="/store">
              <button className="px-8 py-3 border border-purple-400 text-purple-400 hover:bg-purple-400/10 rounded-lg font-semibold transition-all duration-300 w-full">
                Ver Templates →
              </button>
            </Link>
          </div>

          {/* Did You Mean - Suggestions */}
          <div className="mt-16 pt-12 border-t border-slate-700">
            <p className="text-slate-400 mb-6 font-semibold">Você quis dizer?</p>
            <div className="space-y-2">
              <Link href="/templates" className="block text-purple-400 hover:text-purple-300 transition">
                → /templates
              </Link>
              <Link href="/pricing" className="block text-blue-400 hover:text-blue-300 transition">
                → /pricing
              </Link>
              <Link href="/docs" className="block text-slate-400 hover:text-slate-300 transition">
                → /docs
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/50 backdrop-blur py-8">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© 2025 VitrineFast - Transformando negócios locais em vitrines profissionais</p>
        </div>
      </footer>
    </div>
  )
}
