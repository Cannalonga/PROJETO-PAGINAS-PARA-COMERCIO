'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import ImageCropper from '@/components/ImageCropper';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';


const PHOTO_SLOTS = [
  { id: 'hero', label: 'Hero (Destaque Principal)', description: 'A primeira imagem que os clientes veem', emoji: '🎯', width: 'md:col-span-2' },
  { id: 'left-top', label: 'Canto Superior Esquerdo', description: 'Destaque à esquerda', emoji: '↖️', width: 'md:col-span-1' },
  { id: 'right-top', label: 'Canto Superior Direito', description: 'Destaque à direita', emoji: '↗️', width: 'md:col-span-1' },
  { id: 'center', label: 'Centro', description: 'Imagem central da página', emoji: '📍', width: 'md:col-span-2' },
  { id: 'left-bottom', label: 'Canto Inferior Esquerdo', description: 'Rodapé esquerda', emoji: '↙️', width: 'md:col-span-1' },
  { id: 'right-bottom', label: 'Canto Inferior Direito', description: 'Rodapé direita', emoji: '↘️', width: 'md:col-span-1' },
];

const STORAGE_KEY = 'vitrinafast_setup_draft';

interface PhotoData {
  url: string;
  uploading: boolean;
  error?: string;
  header?: string;
  description?: string;
}

interface SavedDraft {
  currentStep: number;
  pageTitle: string;
  pageDescription: string;
  businessType: string;
  storeType: 'physical' | 'online' | '';
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  instagram: string;
  facebook: string;
  businessHours: string;
  photos: Record<string, PhotoData>;
  acceptedTerms: boolean;
  savedAt: number;
}

export default function SetupPage() {
  const { status } = useSession();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [pageTitle, setPageTitle] = useState('');
  const [pageDescription, setPageDescription] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<Record<string, PhotoData>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentSlotRef = useRef<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [croppingSlot, setCroppingSlot] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [showRecoveryBanner, setShowRecoveryBanner] = useState(false);

  // Contact fields
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [businessHours, setBusinessHours] = useState('');
  const [storeType, setStoreType] = useState<'physical' | 'online' | ''>('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [contentError, setContentError] = useState('');

  // Authentication check
  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/setup');
    }
  }, [status, router]);

  // Load draft
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const draft: SavedDraft = JSON.parse(saved);
        const hoursOld = (Date.now() - draft.savedAt) / (1000 * 60 * 60);
        if (hoursOld < 24) {
          setCurrentStep(draft.currentStep);
          setPageTitle(draft.pageTitle);
          setPageDescription(draft.pageDescription);
          setBusinessType(draft.businessType);
          setStoreType(draft.storeType);
          setPhone(draft.phone);
          setWhatsapp(draft.whatsapp);
          setEmail(draft.email);
          setAddress(draft.address);
          setCity(draft.city);
          setState(draft.state);
          setZipCode(draft.zipCode);
          setInstagram(draft.instagram);
          setFacebook(draft.facebook);
          setBusinessHours(draft.businessHours);
          setAcceptedTerms(draft.acceptedTerms);
          const restoredPhotos: Record<string, PhotoData> = {};
          Object.entries(draft.photos).forEach(([key, photo]) => {
            if (photo.url && !photo.uploading) {
              restoredPhotos[key] = { ...photo, uploading: false };
            }
          });
          setPhotos(restoredPhotos);
          setShowRecoveryBanner(true);
        }
      }
    } catch (e) {
      console.error('Erro ao carregar rascunho:', e);
    }
    setIsHydrated(true);
  }, []);

  // Auto‑save draft
  useEffect(() => {
    if (!isHydrated) return;
    const draft: SavedDraft = {
      currentStep,
      pageTitle,
      pageDescription,
      businessType,
      storeType,
      phone,
      whatsapp,
      email,
      address,
      city,
      state,
      zipCode,
      instagram,
      facebook,
      businessHours,
      photos,
      acceptedTerms,
      savedAt: Date.now(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch (e) {
      console.error('Erro ao salvar rascunho:', e);
    }
  }, [
    isHydrated,
    currentStep,
    pageTitle,
    pageDescription,
    businessType,
    storeType,
    phone,
    whatsapp,
    email,
    address,
    city,
    state,
    zipCode,
    instagram,
    facebook,
    businessHours,
    photos,
    acceptedTerms,
  ]);

  const clearDraft = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Erro ao limpar rascunho:', e);
    }
  };

  const FORBIDDEN_WORDS = [
    'porn', 'xxx', 'sex', 'nude', 'naked', 'adult', 'escort',
    'drogas', 'maconha', 'cocaina', 'crack', 'armas', 'pistola',
    'golpe', 'fraude', 'pirataria', 'hack', 'roubo',
  ];

  const validateContent = (text: string): boolean => {
    const lower = text.toLowerCase();
    for (const w of FORBIDDEN_WORDS) {
      if (lower.includes(w)) {
        setContentError('Conteúdo não permitido detectado. Por favor, revise suas informações.');
        return false;
      }
    }
    setContentError('');
    return true;
  };

  const handleNext = () => {
    const allText = `${pageTitle} ${pageDescription} ${address}`.toLowerCase();
    if (!validateContent(allText)) return;
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleHeaderChange = (slotId: string, header: string) => {
    setPhotos(prev => ({ ...prev, [slotId]: { ...prev[slotId], header } }));
  };

  const handleDescriptionChange = (slotId: string, description: string) => {
    setPhotos(prev => ({ ...prev, [slotId]: { ...prev[slotId], description } }));
  };

  const handleRemovePhoto = (slotId: string) => {
    setPhotos(prev => {
      const copy = { ...prev };
      delete copy[slotId];
      return copy;
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, slotId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setCroppingSlot(slotId);
    }
    e.target.value = '';
  };

  const handleCropSave = async (croppedBlob: Blob) => {
    if (!croppingSlot) return;
    const fileName = selectedFile?.name || 'cropped.png';
    const file = new File([croppedBlob], fileName, { type: croppedBlob.type });
    const url = URL.createObjectURL(file);
    setPhotos(prev => ({
      ...prev,
      [croppingSlot]: { url, uploading: false },
    }));
    setSelectedFile(null);
    setCroppingSlot(null);
  };

  const handleFinish = async () => {
    try {
      setLoading(true);
      const photosArray = Object.entries(photos)
        .filter(([_, p]) => p.url && !p.uploading)
        .map(([slot, p]) => ({
          slot,
          url: p.url,
          header: p.header || '',
          description: p.description || '',
        }));
      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName: pageTitle,
          email: email || 'contato@vitrinafast.com',
          businessType,
          storeType,
          pageTitle,
          pageDescription,
          phone,
          whatsapp,
          contactEmail: email,
          address: address || null,
          city: city || null,
          state: state || null,
          zipCode: zipCode || null,
          instagram,
          facebook,
          businessHours,
          photos: photosArray,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert('❌ Erro ao salvar página: ' + data.error);
        setLoading(false);
        return;
      }
      clearDraft();
      window.location.href = `/preview/${data.tenantId}`;
    } catch (err) {
      console.error('Erro:', err);
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
        {showRecoveryBanner && (
          <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💾</span>
              <div>
                <p className="font-semibold text-green-400">Rascunho recuperado!</p>
                <p className="text-sm text-slate-400">Encontramos seu progresso anterior. Continue de onde parou.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowRecoveryBanner(false)} className="px-3 py-1 text-sm bg-green-500/20 text-green-400 rounded hover:bg-green-500/30">✓ OK</button>
              <button onClick={() => { clearDraft(); setCurrentStep(1); setPageTitle(''); setPageDescription(''); setBusinessType(''); setStoreType(''); setPhone(''); setWhatsapp(''); setEmail(''); setAddress(''); setCity(''); setState(''); setZipCode(''); setInstagram(''); setFacebook(''); setBusinessHours(''); setPhotos({}); setAcceptedTerms(false); setShowRecoveryBanner(false); }} className="px-3 py-1 text-sm bg-slate-700 text-slate-300 rounded hover:bg-slate-600">Recomeçar</button>
            </div>
          </div>
        )}
        <div className="mb-6 flex items-center gap-2 text-xs text-slate-500">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Salvamento automático ativado
        </div>
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Crie sua Vitrine Digital</h1>
          <p className="text-slate-300">Customize a aparência e informações da sua loja</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-12">
          {['Negócio', 'Info', 'Fotos', 'Revisar'].map((label, idx) => (
            <div key={idx} className={`p-3 rounded-lg border text-center text-sm font-semibold transition ${currentStep > idx ? 'bg-sky-500 border-sky-500 text-white' : currentStep === idx + 1 ? 'bg-sky-500/20 border-sky-500 text-sky-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
              {idx + 1}. {label}
            </div>
          ))}
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          {/* Step 1 */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Qual é o tipo do seu negócio?</h2>
              <div className="bg-slate-800/50 p-4 rounded-lg space-y-4">
                <h3 className="font-semibold text-purple-400 flex items-center gap-2"><span>🌐</span> Como seu negócio funciona?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button onClick={() => setStoreType('physical')} className={`p-4 rounded-lg border-2 transition text-left ${storeType === 'physical' ? 'border-purple-500 bg-purple-500/10' : 'border-slate-700 hover:border-slate-600'}`}>
                    <div className="text-2xl mb-2">🏪</div>
                    <p className="font-semibold">Loja Física</p>
                    <p className="text-sm text-slate-400">Tenho um endereço físico onde atendo clientes</p>
                  </button>
                  <button onClick={() => setStoreType('online')} className={`p-4 rounded-lg border-2 transition text-left ${storeType === 'online' ? 'border-purple-500 bg-purple-500/10' : 'border-slate-700 hover:border-slate-600'}`}>
                    <div className="text-2xl mb-2">💻</div>
                    <p className="font-semibold">Loja Online</p>
                    <p className="text-sm text-slate-400">Vendo pela internet, delivery ou redes sociais</p>
                  </button>
                </div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-lg space-y-4">
                <h3 className="font-semibold text-sky-400 flex items-center gap-2"><span>📂</span> Categoria do Negócio</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[{ icon: '🛍️', name: 'Loja/Comércio', id: 'loja' }, { icon: '🍔', name: 'Alimentação', id: 'food' }, { icon: '💇', name: 'Beleza', id: 'beauty' }, { icon: '🔧', name: 'Serviços', id: 'services' }, { icon: '👗', name: 'Moda', id: 'fashion' }, { icon: '📱', name: 'Tecnologia', id: 'tech' }, { icon: '🏠', name: 'Casa/Decoração', id: 'home' }, { icon: '✨', name: 'Outro', id: 'other' }].map(type => (
                    <button key={type.id} onClick={() => setBusinessType(type.id)} className={`p-3 rounded-lg border-2 transition text-center ${businessType === type.id ? 'border-sky-500 bg-sky-500/10' : 'border-slate-700 hover:border-slate-600'}`}>
                      <div className="text-2xl mb-1">{type.icon}</div>
                      <p className="text-sm font-medium">{type.name}</p>
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleNext} disabled={!businessType || !storeType} className="w-full py-3 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition">Próximo →</button>
            </div>
          )}
          {/* Step 2 */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Informações do Negócio</h2>
              <p className="text-slate-400">Preencha os dados que aparecerão na sua vitrine</p>
              {contentError && <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-300">⚠️ {contentError}</div>}
              <div className="bg-slate-800/50 p-4 rounded-lg space-y-4">
                <h3 className="font-semibold text-sky-400 flex items-center gap-2"><span>📝</span> Informações Básicas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Nome do Negócio *</label>
                    <input type="text" value={pageTitle} onChange={e => setPageTitle(e.target.value)} placeholder="Ex: Loja do João, Padaria Central" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500 focus:border-sky-500 focus:outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Descrição *</label>
                    <textarea value={pageDescription} onChange={e => setPageDescription(e.target.value)} placeholder="Conte um pouco sobre seu negócio, produtos e serviços..." rows={3} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500 focus:border-sky-500 focus:outline-none" />
                  </div>
                </div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-lg space-y-4">
                <h3 className="font-semibold text-green-400 flex items-center gap-2"><span>📱</span> Contato (WhatsApp/Telefone)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">WhatsApp *</label>
                    <input type="tel" value={whatsapp} onChange={e => { const v = e.target.value.replace(/[^0-9\s()\-]/g, ''); setWhatsapp(v); }} placeholder="(11) 99999-9999" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500 focus:border-sky-500 focus:outline-none" />
                    <p className="text-xs text-slate-500 mt-1">Clientes vão te chamar por aqui</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Telefone Fixo (opcional)</label>
                    <input type="tel" value={phone} onChange={e => { const v = e.target.value.replace(/[^0-9\s()\-]/g, ''); setPhone(v); }} placeholder="(11) 3333-3333" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500 focus:border-sky-500 focus:outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Email (opcional)</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} onBlur={e => { const v = e.target.value.trim(); if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { e.target.setCustomValidity('Por favor, insira um email válido'); } else { e.target.setCustomValidity(''); } }} placeholder="contato@seucomercio.com" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500 focus:border-sky-500 focus:outline-none" />
                  </div>
                </div>
              </div>
              {storeType === 'physical' && (
                <div className="bg-slate-800/50 p-4 rounded-lg space-y-4">
                  <h3 className="font-semibold text-rose-400 flex items-center gap-2"><span>📍</span> Endereço (aparece no Google Maps)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Endereço Completo *</label>
                      <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Rua das Flores, 123 - Centro" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500 focus:border-sky-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Cidade *</label>
                      <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="São Paulo" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500 focus:border-sky-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Estado *</label>
                      <select value={state} onChange={e => setState(e.target.value)} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 focus:border-sky-500 focus:outline-none"><option value="">Selecione...</option><option value="AC">Acre</option><option value="AL">Alagoas</option><option value="AP">Amapá</option><option value="AM">Amazonas</option><option value="BA">Bahia</option><option value="CE">Ceará</option><option value="DF">Distrito Federal</option><option value="ES">Espírito Santo</option><option value="GO">Goiás</option><option value="MA">Maranhão</option><option value="MT">Mato Grosso</option><option value="MS">Mato Grosso do Sul</option><option value="MG">Minas Gerais</option><option value="PA">Pará</option><option value="PB">Paraíba</option><option value="PR">Paraná</option><option value="PE">Pernambuco</option><option value="PI">Piauí</option><option value="RJ">Rio de Janeiro</option><option value="RN">Rio Grande do Norte</option><option value="RS">Rio Grande do Sul</option><option value="RO">Rondônia</option><option value="RR">Roraima</option><option value="SC">Santa Catarina</option><option value="SP">São Paulo</option><option value="SE">Sergipe</option><option value="TO">Tocantins</option></select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">CEP</label>
                      <input type="text" value={zipCode} onChange={e => setZipCode(e.target.value)} placeholder="00000-000" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500 focus:border-sky-500 focus:outline-none" />
                    </div>
                  </div>
                </div>
              )}
              {storeType === 'online' && (
                <div className="bg-slate-800/50 p-4 rounded-lg space-y-4">
                  <h3 className="font-semibold text-rose-400 flex items-center gap-2"><span>🚀</span> Área de Atuação</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Cidade/Região (opcional)</label>
                      <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="Ex: São Paulo e região, Todo Brasil" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500 focus:border-sky-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Horário de Atendimento</label>
                      <input type="text" value={businessHours} onChange={e => setBusinessHours(e.target.value)} placeholder="Seg-Sex: 9h às 18h" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500 focus:border-sky-500 focus:outline-none" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">💡 Como loja online, você não precisa informar endereço físico.</p>
                </div>
              )}
              <div className="bg-slate-800/50 p-4 rounded-lg space-y-4">
                <h3 className="font-semibold text-purple-400 flex items-center gap-2"><span>🌐</span> Redes Sociais (opcional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Instagram</label>
                    <div className="flex">
                      <span className="px-3 py-3 bg-slate-700 border border-slate-600 border-r-0 rounded-l-lg text-slate-400">@</span>
                      <input type="text" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="seucomercio" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-r-lg text-slate-50 placeholder-slate-500 focus:border-sky-500 focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Facebook</label>
                    <div className="flex">
                      <span className="px-3 py-3 bg-slate-700 border border-slate-600 border-r-0 rounded-l-lg text-slate-400 text-sm">facebook.com/</span>
                      <input type="text" value={facebook} onChange={e => setFacebook(e.target.value)} placeholder="seucomercio" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-r-lg text-slate-50 placeholder-slate-500 focus:border-sky-500 focus:outline-none" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-amber-400 flex items-center gap-2"><span>⚖️</span> Termos de Uso e Responsabilidade</h4>
                <div className="text-sm text-slate-300 space-y-2">
                  <p>A <strong>VitrinaFast</strong> é uma plataforma de criação e divulgação de vitrines digitais.</p>
                  <ul className="list-disc list-inside text-slate-400 space-y-1">
                    <li>Todas as informações fornecidas são verdadeiras</li>
                    <li>Você é responsável pelo conteúdo publicado</li>
                    <li>Não publicará conteúdo ilegal, impróprio ou que viole direitos de terceiros</li>
                    <li>A VitrinaFast não tem vínculo com os produtos/serviços anunciados</li>
                  </ul>
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} className="mt-1 w-5 h-5 rounded border-slate-600 bg-slate-800 text-sky-500 focus:ring-sky-500" />
                  <span className="text-sm text-slate-300">Li e concordo com os <span className="text-sky-400 hover:underline">Termos de Uso</span> e <span className="text-sky-400 hover:underline">Política de Privacidade</span></span>
                </label>
              </div>
              {(!pageTitle || !pageDescription || !whatsapp || !acceptedTerms || (storeType === 'physical' && (!address || !city || !state))) && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                  <p className="text-sm text-slate-400 mb-2">📋 Para continuar, preencha:</p>
                  <ul className="text-sm text-red-400 space-y-1">
                    {!pageTitle && <li>• Nome da Página/Loja</li>}
                    {!pageDescription && <li>• Descrição</li>}
                    {!whatsapp && <li>• WhatsApp</li>}
                    {storeType === 'physical' && !address && <li>• Endereço</li>}
                    {storeType === 'physical' && !city && <li>• Cidade</li>}
                    {storeType === 'physical' && !state && <li>• Estado</li>}
                    {!acceptedTerms && <li>• Aceite dos Termos de Uso ☝️</li>}
                  </ul>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => setCurrentStep(1)} className="flex-1 py-3 border border-slate-700 text-white font-bold rounded-lg hover:bg-slate-800">← Voltar</button>
                <button onClick={handleNext} disabled={
                  !pageTitle || !pageDescription || !whatsapp || !acceptedTerms || (storeType === 'physical' && (!address || !city || !state))
                } className="flex-1 py-3 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors">Próximo →</button>
              </div>
            </div>
          )}
          {/* Step 3 */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Adicione Fotos</h2>
              <p className="text-slate-400">Escolha as posições das imagens na sua vitrine. Clique para adicionar fotos.</p>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => {
                if (currentSlotRef.current) {
                  handleFileSelect(e, currentSlotRef.current);
                }
              }} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PHOTO_SLOTS.map(slot => (
                  <div key={slot.id} className={slot.width}>
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
                          <img src={photos[slot.id].url} alt={slot.label} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition flex items-center justify-center">
                            <div className="space-x-2 opacity-0 hover:opacity-100 transition">
                              <button onClick={() => { currentSlotRef.current = slot.id; fileInputRef.current?.click(); }} className="px-3 py-1 bg-sky-500 text-white text-xs rounded hover:bg-sky-400">✏️ Trocar</button>
                              <button onClick={() => handleRemovePhoto(slot.id)} className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-400">🗑️ Remover</button>
                            </div>
                          </div>
                          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">✓ Pronto</div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">📋 Cabeçalho (ex: PROMOÇÃO, NOVIDADE)</label>
                          <input type="text" value={photos[slot.id].header || ''} onChange={e => handleHeaderChange(slot.id, e.target.value)} placeholder="Ex: PROMOÇÃO, NOVO, DESTAQUE" maxLength={50} className="w-full px-2 py-2 bg-slate-800 border border-slate-700 rounded text-xs text-slate-50 placeholder-slate-500 focus:border-sky-500 focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">📝 Descrição (opcional - aparecerá se preenchido)</label>
                          <textarea value={photos[slot.id].description || ''} onChange={e => handleDescriptionChange(slot.id, e.target.value)} placeholder="Descreva o que aparece na imagem..." rows={2} maxLength={200} className="w-full px-2 py-2 bg-slate-800 border border-slate-700 rounded text-xs text-slate-50 placeholder-slate-500 focus:border-sky-500 focus:outline-none" />
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
                      <div onClick={() => { currentSlotRef.current = slot.id; fileInputRef.current?.click(); }} className="aspect-video bg-slate-800 border-2 border-dashed border-slate-700 rounded-lg flex items-center justify-center hover:border-sky-500 cursor-pointer transition">
                        <div className="text-center">
                          <div className="text-3xl mb-2">📷</div>
                          <p className="text-xs text-slate-400">Clique para adicionar</p>
                          {photos[slot.id]?.error && <p className="text-xs text-red-400 mt-2">{photos[slot.id].error}</p>}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500">💡 Dica: Imagens de alta qualidade (máximo 5MB cada) funcionam melhor. Formatos suportados: JPG, PNG, WebP</p>
              <div className="flex gap-3">
                <button onClick={() => setCurrentStep(2)} className="flex-1 py-3 border border-slate-700 text-white font-bold rounded-lg hover:bg-slate-800">← Voltar</button>
                <button onClick={handleNext} className="flex-1 py-3 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-lg">Próximo →</button>
              </div>
            </div>
          )}
          {/* Step 4 */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Revisar e Publicar</h2>
              {/* Summary of data could be displayed here */}
              <div className="flex gap-3">
                <button onClick={() => setCurrentStep(3)} className="flex-1 py-3 border border-slate-700 text-white font-bold rounded-lg hover:bg-slate-800">← Voltar</button>
                <button onClick={handleFinish} disabled={loading} className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg disabled:opacity-50">Publicar</button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* ImageCropper modal */}
      {selectedFile && croppingSlot && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-4 rounded-lg max-w-xl w-full">
            <ImageCropper file={selectedFile} onCancel={() => { setSelectedFile(null); setCroppingSlot(null); }} onComplete={handleCropSave} />
          </div>
        </div>
      )}
    </main>
  );
}
