'use client';

interface Photo {
  slot: string;
  url: string;
  header?: string;
  description?: string;
}

interface PublicPageData {
  title: string;
  pageDescription: string;
  photos?: Photo[];
}

export default function PublicPageRenderer({ data }: { data: PublicPageData }) {
  // Filtrar apenas fotos com URL
  const validPhotos = (data.photos || []).filter(photo => photo.url);

  return (
    <main className="min-h-screen bg-white text-slate-800">
      {/* Header */}
      <header className="w-full py-6 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">
            {data.title}
          </h1>
          <span className="text-sm text-slate-500">vitrine</span>
        </div>
      </header>

      {/* Intro */}
      <section className="max-w-5xl mx-auto px-4 mt-10 mb-8">
        <h2 className="text-xl font-semibold">Bem-vindo!</h2>
        <p className="mt-2 text-slate-600 text-sm">
          {data.pageDescription}
        </p>
      </section>

      {/* Grid de Imagens */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        {validPhotos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {validPhotos.map((photo) => (
              <div
                key={photo.slot}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Imagem */}
                <div className="aspect-square bg-slate-100 overflow-hidden">
                  <img
                    src={photo.url}
                    alt={photo.header || 'Produto'}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Conteúdo */}
                <div className="p-4">
                  {photo.header && (
                    <h3 className="font-semibold text-slate-800">
                      {photo.header}
                    </h3>
                  )}
                  {photo.description && (
                    <p className="mt-1 text-sm text-slate-600">
                      {photo.description}
                    </p>
                  )}
                  {!photo.header && !photo.description && (
                    <p className="text-sm text-slate-500">Produto</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-500">Nenhuma imagem adicionada ainda.</p>
          </div>
        )}
      </section>
    </main>
  );
}
