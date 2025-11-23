'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function CreatePage() {
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!storeName || !email) return;
    
    setLoading(true);
    setTimeout(() => {
      console.log('Store created:', { storeName, email });
      // Redireciona para página de customização da loja
      window.location.href = '/setup';
    }, 800);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <nav className="bg-slate-950/95 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
          <span className="font-bold text-lg">VitrineFast</span>
          <Link href="/" className="text-slate-300 hover:text-slate-100">Voltar</Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
            Criar Sua Vitrine
          </h1>
          <p className="text-xl text-slate-300">Em minutos você terá uma página profissional</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Nome da Loja</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Ex: Loja do João"
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <p className="font-semibold mb-2">Plano Iniciante - Grátis</p>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>✓ Sem limite de posts</li>
                <li>✓ Galeria de fotos</li>
                <li>✓ Suporte por email</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading || !storeName || !email}
              className="w-full py-3 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 text-white font-bold rounded-lg transition"
            >
              {loading ? 'Criando...' : 'Criar Vitrine'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
