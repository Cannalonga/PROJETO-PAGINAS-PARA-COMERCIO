'use client'

import Link from 'next/link'
import { Logo } from '@/components/Logo'

export default function Offline() {
  const handleRetry = () => {
    window.location.reload()
  }

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

        {/* Gradient Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500 rounded-full opacity-10 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-orange-500 rounded-full opacity-10 blur-3xl" />

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-2xl">
          {/* Error Code */}
          <div className="mb-8">
            <span className="inline-block px-6 py-3 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 font-semibold">
              📡 Sem Conexão
            </span>
          </div>

          {/* Main Message */}
          <h1 className="text-7xl md:text-8xl font-black mb-6">
            <span className="inline-block animate-pulse">📡</span>
          </h1>

          <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-yellow-400 via-orange-400 to-orange-500 bg-clip-text text-transparent">
            Servidor Offline
          </h2>

          <p className="text-xl md:text-2xl text-slate-300 mb-4">
            Parece que o servidor está temporariamente indisponível
          </p>

          <p className="text-base md:text-lg text-slate-400 mb-12 leading-relaxed">
            Pode ser que o servidor está em manutenção, ou há um problema com sua conexão. 
            Tente novamente em alguns momentos. Se o problema persistir, entre em contato com o suporte.
          </p>

          {/* Floating Icons - Disconnected */}
          <div className="mb-12 flex justify-center gap-6 text-5xl opacity-40">
            <span>📡</span>
            <span>❌</span>
            <span>🔌</span>
          </div>

          {/* Status Info */}
          <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-300 text-sm mb-2">Status do Servidor:</p>
            <p className="text-slate-300 font-mono text-sm">
              ⏳ Aguardando conexão...
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRetry}
              className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 text-white"
            >
              🔄 Tentar Novamente
            </button>
            <a
              href="https://status.vitrine.fast"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 border border-orange-400 text-orange-400 hover:bg-orange-400/10 rounded-lg font-semibold transition-all duration-300"
            >
              Ver Status →
            </a>
          </div>

          {/* Support Info */}
          <div className="mt-16 pt-12 border-t border-slate-700">
            <p className="text-slate-400 mb-4">Persistindo o problema?</p>
            <div className="space-y-2">
              <p className="text-slate-500 text-sm">
                ✉️ suporte@vitrine.fast
              </p>
              <p className="text-slate-500 text-sm">
                💬 Chat de suporte indisponível
              </p>
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
