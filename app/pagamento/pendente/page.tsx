'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function PendingContent() {
  const searchParams = useSearchParams();
  const tenantId = searchParams.get('tenant');
  const paymentId = searchParams.get('payment_id');

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Card de Pendente */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-yellow-500/30 rounded-3xl p-8 text-center shadow-2xl">
          {/* Ícone animado */}
          <div className="relative mb-6">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
            Pagamento Pendente ⏳
          </h1>

          {/* Descrição */}
          <p className="text-slate-300 mb-6">
            Seu pagamento está sendo processado. Assim que for confirmado, sua vitrine será ativada automaticamente.
          </p>

          {/* Informações */}
          <div className="bg-slate-800/50 rounded-xl p-4 mb-6 text-left space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💳</span>
              <div>
                <p className="text-slate-200 font-semibold">Cartão de Crédito</p>
                <p className="text-slate-400 text-sm">Pode levar até 2 dias úteis</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📄</span>
              <div>
                <p className="text-slate-200 font-semibold">Boleto Bancário</p>
                <p className="text-slate-400 text-sm">Pode levar até 3 dias úteis após pagamento</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <p className="text-slate-200 font-semibold">PIX</p>
                <p className="text-slate-400 text-sm">Confirmação em até 30 minutos</p>
              </div>
            </div>
          </div>

          {/* ID do pagamento */}
          {paymentId && (
            <div className="bg-slate-800/30 rounded-lg p-3 mb-6">
              <p className="text-slate-400 text-xs mb-1">ID do Pagamento</p>
              <p className="text-slate-200 font-mono text-sm">{paymentId}</p>
            </div>
          )}

          {/* Botões */}
          <div className="space-y-3">
            {tenantId && (
              <Link
                href={`/preview/${tenantId}`}
                className="block w-full py-3 px-6 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-yellow-500/25"
              >
                Ver Status da Vitrine
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
          Você receberá um email assim que o pagamento for confirmado.
        </p>
      </div>
    </main>
  );
}

export default function PagamentoPendentePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">⏳</div>
          <p className="text-xl text-slate-300">Carregando...</p>
        </div>
      </main>
    }>
      <PendingContent />
    </Suspense>
  );
}
