'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';
import PageRenderer from '@/components/PageRenderer';

const PHOTO_SLOTS = [
  { id: 'hero', label: 'Hero (Destaque Principal)', description: 'A primeira imagem que os clientes veem', emoji: '🎯', width: 'md:col-span-2' },
  { id: 'left-top', label: 'Canto Superior Esquerdo', description: 'Destaque à esquerda', emoji: '↖️', width: 'md:col-span-1' },
  { id: 'right-top', label: 'Canto Superior Direito', description: 'Destaque à direita', emoji: '↗️', width: 'md:col-span-1' },
  { id: 'center', label: 'Centro', description: 'Imagem central da página', emoji: '📍', width: 'md:col-span-2' },
  { id: 'left-bottom', label: 'Canto Inferior Esquerdo', description: 'Rodapé esquerda', emoji: '↙️', width: 'md:col-span-1' },
  { id: 'right-bottom', label: 'Canto Inferior Direito', description: 'Rodapé direita', emoji: '↘️', width: 'md:col-span-1' },
];

interface PhotoData {
  url: string;
  uploading: boolean;
  error?: string;
  header?: string;
  description?: string;
}

export default function SetupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [pageTitle, setPageTitle] = useState('');
  const [pageDescription, setPageDescription] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<Record<string, PhotoData>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentSlotRef = useRef<string | null>(null);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, slotId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Atualizar estado para mostrar carregamento
    setPhotos((prev) => ({
      ...prev,
      [slotId]: { url: '', uploading: true },
    }));

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('slot', slotId);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro no upload');
      }

      // Atualizar com sucesso
      setPhotos((prev) => ({
        ...prev,
        [slotId]: { url: data.url, uploading: false, header: '', description: '' },
      }));
    } catch (error) {
      console.error('Erro:', error);
      setPhotos((prev) => ({
        ...prev,
        [slotId]: { url: '', uploading: false, error: error instanceof Error ? error.message : 'Erro desconhecido' },
      }));
    }
  };

  const handleRemovePhoto = (slotId: string) => {
    setPhotos((prev) => {
      const newPhotos = { ...prev };
      delete newPhotos[slotId];
      return newPhotos;
    });
  };

  const handleHeaderChange = (slotId: string, header: string) => {
    setPhotos((prev) => ({
      ...prev,
      [slotId]: { ...prev[slotId], header },
    }));
  };

  const handleDescriptionChange = (slotId: string, description: string) => {
    setPhotos((prev) => ({
      ...prev,
      [slotId]: { ...prev[slotId], description },
    }));
  };

  const handleFinish = async () => {
    try {
      setLoading(true);
      
      // Converter fotos para array de objetos com slot, URL, header e description
      const photosArray = Object.entries(photos)
        .filter(([_, photo]) => photo.url && !photo.uploading)
        .map(([slot, photo]) => ({
          slot,
          url: photo.url,
          header: photo.header || '',
          description: photo.description || '',
        }));

      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName: localStorage.getItem('storeName') || 'Minha Loja',
          email: localStorage.getItem('email') || '',
          businessType,
          pageTitle,
          pageDescription,
          photos: photosArray,
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
              <p className="text-slate-400">Escolha as posições das imagens na sua página. Clique para adicionar fotos.</p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (currentSlotRef.current) {
                    handleFileSelect(e, currentSlotRef.current);
                  }
                }}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PHOTO_SLOTS.map((slot) => (
                  <div key={slot.id} className={`${slot.width}`}>
                    <div className="space-y-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{slot.emoji}</span>
                        <div>
                          <p className="font-semibold text-sm">{slot.label}</p>
                          <p className="text-xs text-slate-500">{slot.description}</p>
                        </div>
                      </div>
                    </div>

                    {photos[slot.id]?.url ? (
                      <div className="relative space-y-3">
                        <div className="relative aspect-video bg-slate-800 rounded-lg overflow-hidden border-2 border-sky-500">
                          <img
                            src={photos[slot.id].url}
                            alt={slot.label}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition flex items-center justify-center">
                            <div className="space-x-2 opacity-0 hover:opacity-100 transition">
                              <button
                                onClick={() => {
                                  currentSlotRef.current = slot.id;
                                  fileInputRef.current?.click();
                                }}
                                className="px-3 py-1 bg-sky-500 text-white text-xs rounded hover:bg-sky-400"
                              >
                                ✏️ Trocar
                              </button>
                              <button
                                onClick={() => handleRemovePhoto(slot.id)}
                                className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-400"
                              >
                                🗑️ Remover
                              </button>
                            </div>
                          </div>
                          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                            ✓ Pronto
                          </div>
                        </div>

                        {/* Header Field (ABOVE IMAGE) */}
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            📋 Cabeçalho (ex: PROMOÇÃO, NOVIDADE)
                          </label>
                          <input
                            type="text"
                            value={photos[slot.id].header || ''}
                            onChange={(e) => handleHeaderChange(slot.id, e.target.value)}
                            placeholder="Ex: PROMOÇÃO, NOVO, DESTAQUE"
                            maxLength={50}
                            className="w-full px-2 py-2 bg-slate-800 border border-slate-700 rounded text-xs text-slate-50 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
                          />
                        </div>

                        {/* Description Field (BELOW IMAGE) */}
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            📝 Descrição (opcional - aparecerá se preenchido)
                          </label>
                          <textarea
                            value={photos[slot.id].description || ''}
                            onChange={(e) => handleDescriptionChange(slot.id, e.target.value)}
                            placeholder="Descreva o que aparece na imagem..."
                            rows={2}
                            maxLength={200}
                            className="w-full px-2 py-2 bg-slate-800 border border-slate-700 rounded text-xs text-slate-50 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    ) : photos[slot.id]?.uploading ? (
                      <div className="aspect-video bg-slate-800 border-2 border-dashed border-slate-700 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl animate-spin mb-2">⏳</div>
                          <p className="text-xs text-slate-400">Carregando...</p>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          currentSlotRef.current = slot.id;
                          fileInputRef.current?.click();
                        }}
                        className="aspect-video bg-slate-800 border-2 border-dashed border-slate-700 rounded-lg flex items-center justify-center hover:border-sky-500 cursor-pointer transition"
                      >
                        <div className="text-center">
                          <div className="text-3xl mb-2">📷</div>
                          <p className="text-xs text-slate-400">Clique para adicionar</p>
                          {photos[slot.id]?.error && (
                            <p className="text-xs text-red-400 mt-2">{photos[slot.id].error}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <p className="text-xs text-slate-500">
                💡 Dica: Imagens de alta qualidade (máximo 5MB cada) funcionam melhor. Formatos suportados: JPG, PNG, WebP
              </p>

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
              <div className="bg-sky-500/10 border border-sky-500/30 p-4 rounded-lg">
                <h2 className="text-2xl font-bold text-sky-400">✨ PRÉVIA FINAL - Exatamente como ficará</h2>
                <p className="text-slate-300 mt-2">Esta é a prévia FINAL. Se quiser trocar algo, clique em "Voltar". Não deixe de revisar bem antes de publicar!</p>
              </div>

              {/* PREVIEW IDÊNTICA AO QUE SERÁ PUBLICADO */}
              <div className="border-2 border-slate-700 rounded-xl overflow-hidden">
                <PageRenderer
                  data={{
                    title: pageTitle || 'Sua Loja',
                    description: pageDescription || 'Descrição do seu negócio',
                    businessType,
                    photos: Object.entries(photos)
                      .filter(([_, photo]) => photo.url && !photo.uploading)
                      .map(([slot, photo]) => ({
                        slot,
                        url: photo.url,
                        header: photo.header,
                        description: photo.description,
                      })),
                  }}
                />
              </div>

              {/* Info sobre plano grátis */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 p-6 rounded-lg">
                <h3 className="font-bold text-yellow-400 mb-3">🎁 Próximo Passo: Publicar & Pagar</h3>
                <ul className="text-slate-300 space-y-2 text-sm">
                  <li>✅ Você vê a prévia EXATAMENTE como ficará publicada</li>
                  <li>✅ Campos vazios (fotos) não aparecem</li>
                  <li>✅ Headers e descrições aparecem somente se preenchidos</li>
                  <li className="text-yellow-400 font-semibold pt-2 border-t border-yellow-500/30">💰 Para publicar: R$ 29/mês (Plano Profissional com renovação automática)</li>
                </ul>
              </div>

              {/* Botões de ação */}
              <div className="flex gap-3 sticky bottom-4">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="flex-1 py-4 border-2 border-slate-600 text-white font-bold rounded-lg hover:bg-slate-800 transition text-lg"
                >
                  ← Voltar e Editar
                </button>
                <button
                  onClick={handleFinish}
                  disabled={loading}
                  className="flex-1 py-4 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 disabled:opacity-50 text-white font-bold rounded-lg transition text-lg disabled:cursor-not-allowed"
                >
                  {loading ? '⏳ Processando...' : '🚀 Publicar (R$ 29/mês)'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
