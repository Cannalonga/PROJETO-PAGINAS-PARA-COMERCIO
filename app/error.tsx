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

        {/* Gradient Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full opacity-10 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-red-500 rounded-full opacity-10 blur-3xl" />

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-2xl">
          {/* Error Code */}
          <div className="mb-8">
            <span className="inline-block px-6 py-3 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 font-semibold">
              ⚠️ Algo deu errado
            </span>
          </div>

          {/* Main Message */}
          <h1 className="text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-red-400 via-white to-orange-400 bg-clip-text text-transparent">
            Erro!
          </h1>

          <p className="text-xl md:text-2xl text-slate-300 mb-4">
            Encontramos um problema
          </p>

          <p className="text-base md:text-lg text-slate-400 mb-8 leading-relaxed">
            Algo inesperado aconteceu. Nossa equipe foi notificada e está investigando o problema.
            Enquanto isso, você pode tentar novamente ou voltar à página inicial.
          </p>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && error?.message && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-left">
              <p className="text-red-300 text-sm font-mono break-words">
                {error.message}
              </p>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 text-white"
            >
              🔄 Tentar Novamente
            </button>
            <Link href="/">
              <button className="px-8 py-3 border border-orange-400 text-orange-400 hover:bg-orange-400/10 rounded-lg font-semibold transition-all duration-300">
                ← Voltar ao Início
              </button>
            </Link>
          </div>

          {/* Support Info */}
          <div className="mt-16 pt-12 border-t border-slate-700">
            <p className="text-slate-400 mb-4">Precisa de suporte?</p>
            <p className="text-slate-500 text-sm">
              Erro ID: <span className="text-slate-400 font-mono">{error?.digest || 'N/A'}</span>
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
