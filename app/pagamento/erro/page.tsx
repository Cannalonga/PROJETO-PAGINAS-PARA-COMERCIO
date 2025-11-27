'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const tenantId = searchParams.get('tenant');

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Card de Erro */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-red-500/30 rounded-3xl p-8 text-center shadow-2xl">
          {/* Ícone */}
          <div className="relative mb-6">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
            Pagamento não Aprovado
          </h1>

          {/* Descrição */}
          <p className="text-slate-300 mb-6">
            Infelizmente o pagamento não foi processado. Isso pode acontecer por diversos motivos como cartão recusado, limite insuficiente ou dados incorretos.
          </p>

          {/* Sugestões */}
          <div className="bg-slate-800/50 rounded-xl p-4 mb-6 text-left">
            <p className="text-slate-400 mb-3 font-semibold">💡 O que fazer:</p>
            <ul className="space-y-2 text-slate-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-sky-400">•</span>
                Verifique os dados do cartão
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-400">•</span>
                Tente outro método de pagamento (PIX, boleto)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-400">•</span>
                Entre em contato com seu banco
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-400">•</span>
                Tente novamente em alguns minutos
              </li>
            </ul>
          </div>

          {/* Botões */}
          <div className="space-y-3">
            {tenantId && (
              <Link
                href={`/preview/${tenantId}`}
                className="block w-full py-3 px-6 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-sky-500/25"
              >
                Tentar Novamente 🔄
              </Link>
            )}
            <Link
              href="/"
              className="block w-full py-3 px-6 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white rounded-xl transition-all"
            >
              Voltar ao Início
            </Link>
          </div>
        </div>

        {/* Nota */}
        <p className="text-center text-slate-500 text-sm mt-6">
          Precisa de ajuda? suporte@vitrinafast.com.br
        </p>
      </div>
    </main>
  );
}

export default function PagamentoErroPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-xl text-slate-300">Carregando...</p>
        </div>
      </main>
    }>
      <ErrorContent />
    </Suspense>
  );
}
