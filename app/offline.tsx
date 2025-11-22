'use client'

import Link from 'next/link'
import { Logo } from '@/components/Logo'

export default function Offline() {
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/">
            <div className="w-32 cursor-pointer hover:opacity-75 transition">
              <Logo className="h-10 w-auto" />
            </div>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-2xl">
          {/* Icon */}
          <div className="mb-8 text-8xl md:text-9xl animate-bounce">
            📡
          </div>

          {/* Error Badge */}
          <div className="mb-6 inline-block px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-full">
            <span className="text-yellow-700 font-semibold text-sm">Sem Conexão com o Servidor</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Servidor Offline
          </h1>

          {/* Description */}
          <p className="text-xl text-slate-600 mb-8">
            Parece que o servidor está temporariamente indisponível no momento.
          </p>

          {/* Info Box */}
          <div className="mb-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-slate-700 text-sm leading-relaxed">
              Pode ser que o servidor está em manutenção, ou há um problema temporário com a conexão. 
              Tente recarregar a página em alguns momentos. Se o problema persistir, entre em contato com o suporte.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRetry}
              className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors"
            >
              🔄 Tentar Novamente
            </button>
            <Link href="/">
              <button className="px-8 py-3 border border-gray-300 text-slate-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                ← Voltar ao Início
              </button>
            </Link>
          </div>

          {/* Support */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-slate-600 text-sm mb-3">Precisa de ajuda?</p>
            <a 
              href="mailto:suporte@vitrine.fast"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              ✉️ Contate o Suporte
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-600 text-sm">
          <p>© 2025 VitrineFast. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
