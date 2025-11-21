'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { VButton } from '@/components/ui'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App Error:', error)
  }, [error])

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
                Home
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

        {/* Gradient Glows - Red for error */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500 rounded-full opacity-10 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-red-600 rounded-full opacity-10 blur-3xl" />

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-2xl">
          {/* Error Code */}
          <div className="mb-8">
            <span className="inline-block px-6 py-3 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 font-semibold">
              ⚠️ Erro na Aplicação
            </span>
          </div>

          {/* Error Icon - Animated */}
          <div className="mb-8 relative">
            <div className="text-8xl md:text-9xl animate-bounce">💥</div>
          </div>

          {/* Main Message */}
          <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-red-400 via-orange-400 to-red-500 bg-clip-text text-transparent">
            Algo deu errado!
          </h1>

          <p className="text-xl md:text-2xl text-slate-300 mb-4">
            Encontramos um problema inesperado
          </p>

          <p className="text-base md:text-lg text-slate-400 mb-8 leading-relaxed">
            Nossa equipe foi notificada automaticamente e está investigando o problema. 
            Enquanto isso, você pode tentar recarregar a página ou voltar à página inicial.
          </p>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && error?.message && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-left max-h-40 overflow-y-auto">
              <p className="text-red-300 text-xs font-semibold mb-2">Detalhes do Erro (Dev):</p>
              <p className="text-red-200 text-xs font-mono break-words">
                {error.message}
              </p>
              {error?.digest && (
                <p className="text-red-300 text-xs mt-2">
                  ID: <span className="text-red-200">{error.digest}</span>
                </p>
              )}
            </div>
          )}

          {/* Floating Icons - Error theme */}
          <div className="mb-12 flex justify-center gap-6 text-5xl opacity-50">
            <span>⚙️</span>
            <span className="animate-spin">🔧</span>
            <span>🛠️</span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 text-white"
            >
              🔄 Tentar Novamente
            </button>
            <Link href="/">
              <button className="px-8 py-3 border border-orange-400 text-orange-400 hover:bg-orange-400/10 rounded-lg font-semibold transition-all duration-300">
                ← Voltar ao Início
              </button>
            </Link>
          </div>

          {/* Error Info Card */}
          <div className="mt-12 pt-12 border-t border-slate-700">
            <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700">
              <p className="text-sm text-slate-400 mb-3">📊 Informações do Erro:</p>
              <div className="space-y-2 text-xs font-mono text-slate-500">
                <p>Timestamp: <span className="text-slate-400">{new Date().toLocaleString('pt-BR')}</span></p>
                <p>User Agent: <span className="text-slate-400 truncate">{typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 40) + '...' : 'N/A'}</span></p>
                {error?.digest && (
                  <p>Error ID: <span className="text-slate-400">{error.digest}</span></p>
                )}
              </div>
            </div>
          </div>

          {/* Support Contact */}
          <div className="mt-8">
            <p className="text-slate-400 mb-3">Precisa de suporte?</p>
            <p className="text-sm text-slate-500">
              📧 suporte@vitrine.fast
            </p>
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
