'use client';

import { useState } from 'react';

interface BetaBadgeProps {
  variant?: 'banner' | 'floating' | 'inline';
  onClose?: () => void;
}

/**
 * Beta/Testing Badge Component
 * 
 * Mostra que a plataforma está em fase de teste
 * e convida usuários a reportar problemas
 * 
 * Variantes:
 * - banner: Topo da página (recomendado para landing)
 * - floating: Flutuante no canto (recomendado para app)
 * - inline: Inline com resto do conteúdo
 */
export function BetaBadge({ variant = 'banner', onClose }: BetaBadgeProps) {
  const [closed, setClosed] = useState(false);

  const handleClose = () => {
    setClosed(true);
    onClose?.();
  };

  if (closed) return null;

  // Banner no topo
  if (variant === 'banner') {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-50 to-orange-50 border-b-2 border-amber-200 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-semibold">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                BETA
              </span>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Estamos testando a plataforma
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Sua opinião importa! Encontrou algo estranho?{' '}
                  <a
                    href="mailto:feedback@paginasparaocomercio.com?subject=Feedback%20Beta"
                    className="font-semibold text-amber-700 hover:text-amber-900 underline"
                  >
                    Nos conte
                  </a>
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="ml-auto flex-shrink-0 text-gray-400 hover:text-gray-600 transition"
              aria-label="Fechar"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Floating no canto direito
  if (variant === 'floating') {
    return (
      <div className="fixed bottom-6 right-6 z-40 max-w-sm">
        <div className="bg-white rounded-lg shadow-lg border-l-4 border-amber-400 p-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                BETA
              </span>
            </div>
            <button
              onClick={handleClose}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-700">
            <strong>Plataforma em fase de teste!</strong>
          </p>
          <p className="mt-1 text-xs text-gray-600">
            Encontrou algum problema? Nos ajude a melhorar!
          </p>
          <a
            href="mailto:feedback@paginasparaocomercio.com?subject=Problema%20Encontrado"
            className="mt-3 inline-block text-sm font-semibold text-amber-700 hover:text-amber-900 underline"
          >
            Reportar Problema →
          </a>
        </div>
      </div>
    );
  }

  // Inline (no meio do conteúdo)
  if (variant === 'inline') {
    return (
      <div className="my-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 pt-0.5">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-semibold">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              BETA
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900">
              Estamos em fase de testes!
            </h3>
            <p className="mt-1 text-sm text-gray-700">
              A plataforma está sendo constantemente melhorada. Se encontrar algum
              problema ou tiver sugestões, nos conte por favor. Sua opinião é fundamental
              para tornarmos a Páginas para o Comércio cada vez melhor.
            </p>
            <a
              href="mailto:feedback@paginasparaocomercio.com?subject=Feedback%20Beta"
              className="mt-2 inline-block text-sm font-semibold text-amber-700 hover:text-amber-900 underline"
            >
              Enviar Feedback →
            </a>
          </div>
          {onClose && (
            <button
              onClick={handleClose}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}

/**
 * Versão simplificada apenas do badge/tag
 * Para usar junto com outro texto
 */
export function BetaTag() {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-semibold">
      <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
      BETA
    </span>
  );
}
