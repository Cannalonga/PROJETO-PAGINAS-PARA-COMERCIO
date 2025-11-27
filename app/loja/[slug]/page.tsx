'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import PublicPageRenderer from '@/components/PublicPageRenderer';
import Link from 'next/link';

interface PageData {
  title: string;
  pageDescription: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  instagram?: string;
  facebook?: string;
  businessHours?: string;
  photos?: any[];
  storeName?: string;
  slug?: string;
}

export default function PublicStorePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const response = await fetch(`/api/public/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Página não encontrada');
          } else if (response.status === 403) {
            setError('Esta página ainda não foi publicada');
          } else {
            setError('Erro ao carregar página');
          }
          return;
        }

        const data = await response.json();
        setPageData(data);
      } catch (err) {
        console.error('Erro:', err);
        setError('Erro ao carregar página');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPage();
    }
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xl text-slate-300">Carregando...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">😕</div>
          <h1 className="text-3xl font-bold mb-4">{error}</h1>
          <p className="text-slate-400 mb-8">
            {error === 'Página não encontrada' 
              ? 'O endereço que você acessou não existe ou foi removido.'
              : 'A página que você está tentando acessar ainda não está disponível.'}
          </p>
          <Link 
            href="/"
            className="inline-block px-6 py-3 bg-sky-500 hover:bg-sky-400 text-white rounded-lg font-semibold transition"
          >
            Voltar ao Início
          </Link>
        </div>
      </main>
    );
  }

  if (!pageData) {
    return null;
  }

  return <PublicPageRenderer data={pageData} />;
}
