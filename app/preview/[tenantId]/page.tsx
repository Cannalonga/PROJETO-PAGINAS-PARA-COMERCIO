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

  // Extrair dados de contato do content da página
  const content = page?.content || {};

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
