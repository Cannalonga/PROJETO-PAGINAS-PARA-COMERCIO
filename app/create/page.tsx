'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function CreatePage() {
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Aqui você pode adicionar a lógica de criar a loja
      console.log('Criando loja:', { storeName, email });
      
      // Por enquanto, apenas simula um sucesso
      alert(`✅ Parabéns! Sua loja "${storeName}" foi criada com sucesso!\n\nEm breve você receberá um email em ${email} com seu link.`);
      setStoreName('');
      setEmail('');
    } catch (error) {
      console.error('Erro ao criar loja:', error);
      alert('❌ Erro ao criar loja. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-slate-950/95 border-b border-slate-800 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center text-white">
              ▶
            </div>
            <span>
              <span className="text-slate-100">Vitrine</span>
              <span className="text-orange-400">Fast</span>
            </span>
          </Link>
          <Link href="/" className="text-slate-300 hover:text-slate-50">
            Voltar
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
              Criar Sua Vitrine
            </h1>
            <p className="text-xl text-slate-300">
              Em minutos, você terá uma página profissional para seu comércio
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Store Name */}
              <div className="space-y-2">
                <label htmlFor="storeName" className="block text-sm font-medium text-slate-200">
                  Nome da sua loja
                </label>
                <input
                  id="storeName"
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Ex: Loja do João"
                  required
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-50 placeholder-slate-500 focus:border-sky-500 focus:outline-none transition"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-slate-200">
                  Seu email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-50 placeholder-slate-500 focus:border-sky-500 focus:outline-none transition"
                />
              </div>

              {/* Plan Info */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-2">
                <p className="text-sm font-medium text-slate-200">Plano Iniciante (Grátis)</p>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>✓ Sem limite de posts</li>
                  <li>✓ Sem limite de categorias</li>
                  <li>✓ Galeria de fotos</li>
                  <li>✓ Suporte por email</li>
                </ul>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !storeName || !email}
                className="w-full bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition"
              >
                {loading ? 'Criando sua vitrine...' : 'Criar Vitrine Agora'}
              </button>

              <p className="text-xs text-slate-400 text-center">
                Ao clicar, você concorda com nossos Termos de Serviço
              </p>
            </form>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
              <div className="text-2xl">⚡</div>
              <h3 className="font-semibold text-slate-50">Rápido</h3>
              <p className="text-sm text-slate-400">Sua loja ativa em minutos</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
              <div className="text-2xl">🎨</div>
              <h3 className="font-semibold text-slate-50">Profissional</h3>
              <p className="text-sm text-slate-400">Design moderno pronto para uso</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
              <div className="text-2xl">📱</div>
              <h3 className="font-semibold text-slate-50">Responsivo</h3>
              <p className="text-sm text-slate-400">Perfeito em todos os dispositivos</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
