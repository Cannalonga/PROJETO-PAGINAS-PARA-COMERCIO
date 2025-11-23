'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

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
  const [page, setPage] = useState<any>(null);

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

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      {/* Topbar com status */}
      <div className="bg-sky-500/10 border-b border-sky-500/30 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold">Status: <span className="text-yellow-400">RASCUNHO 📋</span></h2>
            <p className="text-sm text-slate-400">Sua página não está online ainda</p>
          </div>
          <Link href="/" className="px-4 py-2 border border-sky-500 text-sky-400 hover:bg-sky-500/10 rounded">
            Voltar
          </Link>
        </div>
      </div>

      {/* Navbar da loja (preview) */}
      <nav className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{store.name}</h1>
            <p className="text-sm text-slate-400">vitrinafast.com.br/{store.slug}</p>
          </div>
          <div className="text-sm text-slate-400">
            Plano: <span className="font-semibold text-sky-400">{store.plan}</span>
          </div>
        </div>
      </nav>

      {/* Preview da página */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 mb-12">
          {/* Hero Section */}
          <div className="text-center mb-16 space-y-6">
            <div className="w-24 h-24 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl mx-auto flex items-center justify-center">
              <span className="text-5xl">🏪</span>
            </div>
            <div>
              <h1 className="text-5xl font-bold mb-4">{page?.title || store.name}</h1>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                {page?.description || 'Sua vitrine está pronta para o mundo!'}
              </p>
            </div>
          </div>

          {/* Informações da loja */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 border-t border-slate-700 pt-12">
            <div className="text-center">
              <p className="text-3xl mb-2">📧</p>
              <p className="text-slate-400">Email</p>
              <p className="font-semibold">{store.email}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl mb-2">🌐</p>
              <p className="text-slate-400">Endereço Web</p>
              <p className="font-semibold text-sky-400">vitrinafast.com.br/{store.slug}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl mb-2">📱</p>
              <p className="text-slate-400">Compartilhar</p>
              <p className="font-semibold text-slate-400">Com clientes</p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-sky-500/10 to-blue-500/10 border border-sky-500/30 rounded-xl p-8 text-center space-y-4">
            <p className="text-slate-300">Seus clientes verão uma página assim quando você publicar</p>
            <div className="flex gap-4 justify-center">
              <button className="px-6 py-2 bg-sky-500 text-white rounded-lg font-semibold hover:bg-sky-400">
                Chamar
              </button>
              <button className="px-6 py-2 border border-sky-500 text-sky-400 rounded-lg font-semibold hover:bg-sky-500/10">
                WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de ações */}
      <div className="bg-slate-900 border-t border-slate-800 sticky bottom-0">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Editar */}
            <button className="p-6 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-center transition">
              <p className="text-2xl mb-2">✏️</p>
              <p className="font-semibold">Editar Página</p>
              <p className="text-sm text-slate-400">Customize os detalhes</p>
            </button>

            {/* Publicar - Requer pagamento */}
            <div className="p-6 bg-gradient-to-br from-sky-500/20 to-blue-500/20 border border-sky-500/50 rounded-xl text-center">
              <p className="text-2xl mb-2">🚀</p>
              <p className="font-semibold mb-2">Publicar Página</p>
              <p className="text-sm text-slate-400 mb-4">R$ 9,90/mês - Comece seu período grátis</p>
              <button className="w-full px-4 py-3 bg-sky-500 hover:bg-sky-400 text-white rounded-lg font-bold transition">
                Ir para Pagamento
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
