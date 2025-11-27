'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import PublicPageRenderer from '@/components/PublicPageRenderer';

interface Store {
  id: string;
  name: string;
  email: string;
  slug: string;
  status: string;
  plan: string;
  pages: any[];
}

export default function PreviewPage() {
  const params = useParams();
  const tenantId = params?.tenantId as string;
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [page, setPage] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const response = await fetch(`/api/tenants/${tenantId}`);
        if (!response.ok) throw new Error('Loja não encontrada');
        const data = await response.json();
        setStore(data);
        setPage(data.pages?.[0]);
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    };

    if (tenantId) {
      fetchStore();
    }
  }, [tenantId]);

  // Função para iniciar o checkout do Mercado Pago
  const handleCheckout = async () => {
    try {
      setCheckoutLoading(true);
      
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: store?.id,
          planType: selectedPlan,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert('Erro ao iniciar pagamento: ' + data.error);
        return;
      }

      // Redirecionar para o checkout do Mercado Pago
      // Em produção, usa checkoutUrl. Em teste, usa sandboxUrl
      const checkoutUrl = data.sandboxUrl || data.checkoutUrl;
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Erro no checkout:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-xl text-slate-300">Carregando sua página...</p>
        </div>
      </main>
    );
  }

  if (!store) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-xl text-slate-300">Loja não encontrada</p>
          <Link href="/" className="mt-6 inline-block px-6 py-2 bg-sky-500 text-white rounded-lg">
            Voltar para Home
          </Link>
        </div>
      </main>
    );
  }

  // Verificar se a loja já está ativa
  const isActive = store.status === 'ACTIVE';

  // Extrair dados de contato do content da página
  const content = page?.content || {};

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      {/* Topbar com status */}
      <div className={`${isActive ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-sky-500/10 border-sky-500/30'} border-b sticky top-0 z-50`}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            {isActive ? (
              <>
                <h2 className="text-lg font-bold">Status: <span className="text-emerald-400">ONLINE ✓</span></h2>
                <p className="text-sm text-slate-400">Sua página está publicada!</p>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold">Status: <span className="text-yellow-400">RASCUNHO 📋</span></h2>
                <p className="text-sm text-slate-400">Sua página não está online ainda</p>
              </>
            )}
          </div>
          <Link href="/" className="px-4 py-2 border border-sky-500 text-sky-400 hover:bg-sky-500/10 rounded">
            Voltar
          </Link>
        </div>
      </div>

      {/* Preview usando PublicPageRenderer */}
      <div className="border-4 border-dashed border-sky-500/30 m-4 rounded-2xl overflow-hidden">
        <div className="bg-sky-500/5 text-center py-2 text-sm text-sky-400">
          👆 Prévia da sua página - Assim ela ficará quando estiver online
        </div>
        <PublicPageRenderer
          data={{
            title: page?.title || store.name,
            pageDescription: page?.description || 'Sua vitrine está pronta para o mundo!',
            phone: content.phone,
            whatsapp: content.whatsapp,
            email: content.contactEmail || store.email,
            address: content.address,
            city: content.city,
            state: content.state,
            zipCode: content.zipCode,
            instagram: content.instagram,
            facebook: content.facebook,
            businessHours: content.businessHours,
            photos: content.photos || [],
          }}
        />
      </div>

      {/* Seção de ações */}
      <div className="bg-slate-900 border-t border-slate-800 sticky bottom-0">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {isActive ? (
            // Já está ativa - mostrar opções de gerenciamento
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-6 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-center transition">
                <p className="text-2xl mb-2">✏️</p>
                <p className="font-semibold">Editar Página</p>
                <p className="text-sm text-slate-400">Alterar informações</p>
              </button>
              <button className="p-6 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-center transition">
                <p className="text-2xl mb-2">📊</p>
                <p className="font-semibold">Ver Estatísticas</p>
                <p className="text-sm text-slate-400">Visitas e cliques</p>
              </button>
              <button className="p-6 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-center transition">
                <p className="text-2xl mb-2">🔗</p>
                <p className="font-semibold">Compartilhar</p>
                <p className="text-sm text-slate-400">Enviar link</p>
              </button>
            </div>
          ) : (
            // Não está ativa - mostrar opções de pagamento
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Editar */}
              <button className="p-6 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-center transition">
                <p className="text-2xl mb-2">✏️</p>
                <p className="font-semibold">Editar Página</p>
                <p className="text-sm text-slate-400">Customize os detalhes</p>
              </button>

              {/* Publicar - Com seleção de plano */}
              <div className="p-6 bg-gradient-to-br from-sky-500/20 to-blue-500/20 border border-sky-500/50 rounded-xl text-center">
                <p className="text-2xl mb-2">🚀</p>
                <p className="font-semibold mb-4">Publicar Página</p>
                
                {/* Seletor de plano */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setSelectedPlan('monthly')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                      selectedPlan === 'monthly'
                        ? 'bg-sky-500 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    Mensal<br />
                    <span className="text-lg font-bold">R$ 9,90</span>
                  </button>
                  <button
                    onClick={() => setSelectedPlan('yearly')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition relative ${
                      selectedPlan === 'yearly'
                        ? 'bg-sky-500 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">
                      -17%
                    </span>
                    Anual<br />
                    <span className="text-lg font-bold">R$ 99</span>
                  </button>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="w-full px-4 py-3 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-bold transition flex items-center justify-center gap-2"
                >
                  {checkoutLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processando...
                    </>
                  ) : (
                    <>
                      💳 Ir para Pagamento
                    </>
                  )}
                </button>
                
                <p className="text-xs text-slate-400 mt-3">
                  Pagamento seguro via Mercado Pago
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
