'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function SetupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [pageTitle, setPageTitle] = useState('');
  const [pageDescription, setPageDescription] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleFinish = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName: localStorage.getItem('storeName') || 'Minha Loja',
          email: localStorage.getItem('email') || '',
          businessType,
          pageTitle,
          pageDescription,
          photos: [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert('❌ Erro ao salvar página: ' + data.error);
        setLoading(false);
        return;
      }

      // Redireciona para preview com o ID da loja
      window.location.href = `/preview/${data.tenantId}`;
    } catch (error) {
      console.error('Erro:', error);
      alert('❌ Erro ao salvar página. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <nav className="bg-slate-950/95 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center text-white">▶</div>
            <span><span className="text-slate-100">Vitrine</span><span className="text-orange-400">Fast</span></span>
          </div>
          <Link href="/" className="text-slate-300 hover:text-slate-100">Home</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Crie sua Página</h1>
          <p className="text-slate-300">Customize a aparência e informações da sua loja</p>
        </div>

        {/* Progress Steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-12">
          {['Negócio', 'Info', 'Fotos', 'Revisar'].map((label, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border text-center text-sm font-semibold transition ${
                currentStep > idx
                  ? 'bg-sky-500 border-sky-500 text-white'
                  : currentStep === idx + 1
                  ? 'bg-sky-500/20 border-sky-500 text-sky-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {idx + 1}. {label}
            </div>
          ))}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Qual é o tipo do seu negócio?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: '🏪', name: 'Loja Física', id: 'loja' },
                  { icon: '🍔', name: 'Restaurante/Bar', id: 'food' },
                  { icon: '💇', name: 'Salão de Beleza', id: 'beauty' },
                  { icon: '🔧', name: 'Serviços', id: 'services' },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setBusinessType(type.id)}
                    className={`p-6 rounded-lg border-2 transition text-center ${
                      businessType === type.id
                        ? 'border-sky-500 bg-sky-500/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-4xl mb-2">{type.icon}</div>
                    <p className="font-semibold">{type.name}</p>
                  </button>
                ))}
              </div>
              <button
                onClick={handleNext}
                disabled={!businessType}
                className="w-full py-3 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition"
              >
                Próximo →
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Informações da Página</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Título da Página</label>
                  <input
                    type="text"
                    value={pageTitle}
                    onChange={(e) => setPageTitle(e.target.value)}
                    placeholder="Ex: Loja do João"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Descrição</label>
                  <textarea
                    value={pageDescription}
                    onChange={(e) => setPageDescription(e.target.value)}
                    placeholder="Conte um pouco sobre seu negócio..."
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 py-3 border border-slate-700 text-white font-bold rounded-lg hover:bg-slate-800"
                >
                  ← Voltar
                </button>
                <button
                  onClick={handleNext}
                  disabled={!pageTitle || !pageDescription}
                  className="flex-1 py-3 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 text-white font-bold rounded-lg"
                >
                  Próximo →
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Adicione Fotos</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="aspect-square bg-slate-800 border-2 border-dashed border-slate-700 rounded-lg flex items-center justify-center hover:border-sky-500 cursor-pointer transition"
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">📷</div>
                      <p className="text-xs text-slate-400">Clique para adicionar</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-400">Adicione fotos para destacar seu negócio</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex-1 py-3 border border-slate-700 text-white font-bold rounded-lg hover:bg-slate-800"
                >
                  ← Voltar
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-3 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-lg"
                >
                  Próximo →
                </button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Revisar e Publicar</h2>
              <div className="bg-slate-800/50 p-6 rounded-lg space-y-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">Tipo de Negócio</p>
                  <p className="text-lg font-semibold mt-1">
                    {businessType === 'loja' && '🏪 Loja Física'}
                    {businessType === 'food' && '🍔 Restaurante/Bar'}
                    {businessType === 'beauty' && '💇 Salão de Beleza'}
                    {businessType === 'services' && '🔧 Serviços'}
                  </p>
                </div>
                <div className="border-t border-slate-700 pt-4">
                  <p className="text-xs text-slate-400 uppercase font-semibold">Título</p>
                  <p className="text-lg font-semibold mt-1">{pageTitle}</p>
                </div>
                <div className="border-t border-slate-700 pt-4">
                  <p className="text-xs text-slate-400 uppercase font-semibold">Descrição</p>
                  <p className="text-slate-300 mt-1">{pageDescription}</p>
                </div>
                <div className="border-t border-slate-700 pt-4 bg-sky-500/10 p-4 rounded">
                  <p className="text-xs text-slate-400 uppercase font-semibold">Sua página estará em</p>
                  <p className="text-xl font-bold text-sky-400 mt-1">vitrinafast.com.br/loja</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="flex-1 py-3 border border-slate-700 text-white font-bold rounded-lg hover:bg-slate-800"
                >
                  ← Voltar
                </button>
                <button
                  onClick={handleFinish}
                  disabled={loading}
                  className="flex-1 py-3 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 text-white font-bold rounded-lg text-lg disabled:cursor-not-allowed"
                >
                  {loading ? '⏳ Salvando...' : '✅ Publicar Página'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
