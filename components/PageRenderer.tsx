'use client';

interface Photo {
  slot: string;
  url: string;
  header?: string;
  description?: string;
}

interface PageData {
  title: string;
  description: string;
  businessType?: string;
  photos?: Photo[];
}

const PHOTO_SLOTS = [
  { id: 'hero', label: 'Hero (Destaque Principal)', emoji: '🎯', width: 'md:col-span-2' },
  { id: 'left-top', label: 'Canto Superior Esquerdo', emoji: '↖️', width: 'md:col-span-1' },
  { id: 'right-top', label: 'Canto Superior Direito', emoji: '↗️', width: 'md:col-span-1' },
  { id: 'center', label: 'Centro', emoji: '📍', width: 'md:col-span-2' },
  { id: 'left-bottom', label: 'Canto Inferior Esquerdo', emoji: '↙️', width: 'md:col-span-1' },
  { id: 'right-bottom', label: 'Canto Inferior Direito', emoji: '↘️', width: 'md:col-span-1' },
];

export default function PageRenderer({ data }: { data: PageData }) {
  const photosMap = (data.photos || []).reduce((acc, photo) => {
    acc[photo.slot] = photo;
    return acc;
  }, {} as Record<string, Photo>);

  return (
    <div className="bg-slate-950 text-slate-50 min-h-screen">
      {/* Header da página */}
      <div className="bg-gradient-to-r from-sky-600 to-sky-500 px-6 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold">{data.title}</h1>
          <p className="text-sky-100 mt-3 text-lg max-w-2xl">{data.description}</p>
        </div>
      </div>

      {/* Grid de fotos */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PHOTO_SLOTS.map((slot) => {
            const photo = photosMap[slot.id];

            // Se não há foto, não renderiza nada
            if (!photo?.url) {
              return null;
            }

            return (
              <div
                key={slot.id}
                className={`${
                  slot.id === 'hero' ? 'md:col-span-3' : slot.id === 'center' ? 'md:col-span-3' : ''
                } bg-slate-800 rounded-lg overflow-hidden border border-slate-700 shadow-lg`}
              >
                <div className="space-y-0">
                  {/* Cabeçalho (header) da foto - SÓ APARECE SE PREENCHIDO */}
                  {photo.header && (
                    <div className="bg-orange-500 px-4 py-3 text-white font-bold text-center text-lg">
                      {photo.header}
                    </div>
                  )}

                  {/* Imagem */}
                  <div className={`relative overflow-hidden bg-slate-900 ${photo.header ? '' : 'rounded-t-lg'}`}>
                    <img
                      src={photo.url}
                      alt={slot.label}
                      className="w-full h-auto object-cover"
                      style={{ aspectRatio: '16 / 9' }}
                    />
                  </div>

                  {/* Descrição da foto - SÓ APARECE SE PREENCHIDA */}
                  {photo.description && (
                    <div className="px-4 py-4 bg-slate-700/50 border-t border-slate-600">
                      <p className="text-slate-200 text-base leading-relaxed">{photo.description}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer da página */}
      <div className="border-t border-slate-700 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <p className="text-slate-400 text-sm">
            Desenvolvido com ❤️ por <span className="font-bold text-sky-400">VitrineFast</span>
          </p>
          <p className="text-slate-500 text-xs mt-2">
            © 2024 VitrineFast. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
