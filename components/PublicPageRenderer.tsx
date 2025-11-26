'use client';

import Link from 'next/link';
import { Phone, MapPin, Mail, MessageCircle, ArrowRight } from 'lucide-react'; // Adicionado ArrowRight para CTAs

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
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  whatsapp?: string;
}

export default function PublicPageRenderer({ data }: { data: PublicPageData }) {
  const validPhotos = (data.photos || []).filter(photo => photo.url);

  // Mapear slots para exibir fotos maiores ou menores, com foco em uma composição visual
  const getPhotoGridClass = (slot: string) => {
    switch (slot) {
      case 'hero': return 'md:col-span-2 md:row-span-2 aspect-[3/2]'; // Destaque maior
      case 'center': return 'md:col-span-2 aspect-[3/2]'; // Outro destaque
      default: return 'aspect-video'; // Padrão
    }
  };

  const hasDetails = (photo: Photo) => photo.header || photo.description;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-sky-50 to-orange-50 text-gray-900 font-sans">
      {/* Navbar Minimalista e Funcional */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="#hero" className="text-2xl font-extrabold text-sky-700 hover:text-sky-900 transition-colors">
            {data.title || 'Vitrine do Cliente'}
          </Link>
          <div className="flex items-center space-x-4">
            {data.phone && (
              <Link href={`tel:${data.phone.replace(/\D/g, '')}`} className="flex items-center text-gray-700 hover:text-sky-700 transition-colors text-sm font-medium">
                <Phone className="w-4 h-4 mr-2" /> {data.phone}
              </Link>
            )}
            {data.whatsapp && (
              <Link href={`https://wa.me/${data.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-700 hover:text-green-600 transition-colors text-sm font-medium">
                <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section Impactante */}
      <section id="hero" className="relative h-[60vh] md:h-[70vh] flex items-center justify-center text-center overflow-hidden bg-cover bg-center" style={{ backgroundImage: validPhotos.length > 0 ? `url(${validPhotos[0].url})` : 'linear-gradient(to right bottom, var(--tw-gradient-stops))', backgroundPosition: 'center', backgroundSize: 'cover' }}>
        {/* Overlay para contraste */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-white">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 drop-shadow-lg animate-fade-in-up">
            {data.title || 'Descubra o Melhor da Cidade!'}
          </h1>
          <p className="text-lg md:text-xl font-light opacity-90 mb-8 drop-shadow-md animate-fade-in-up delay-200">
            {data.pageDescription || 'Sua descrição atraente vai aqui, destacando o que torna seu negócio único e irresistível.'}
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 animate-fade-in-up delay-400">
            {data.whatsapp && (
              <Link
                href={`https://wa.me/${data.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white text-lg font-bold rounded-full shadow-lg transition transform hover:scale-105 duration-300 group"
              >
                <MessageCircle className="w-6 h-6 mr-3 group-hover:-translate-y-0.5 transition-transform" /> Fale Conosco
                <ArrowRight className="w-5 h-5 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>
            )}
            {data.phone && (
              <Link href={`tel:${data.phone.replace(/\D/g, '')}`} className="inline-flex items-center px-8 py-4 bg-sky-600 hover:bg-sky-700 text-white text-lg font-bold rounded-full shadow-lg transition transform hover:scale-105 duration-300 group">
                <Phone className="w-6 h-6 mr-3 group-hover:-translate-y-0.5 transition-transform" /> Ligar Agora
                <ArrowRight className="w-5 h-5 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Seção de Destaques Visuais (Fotos) - Grid Aprimorado */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-extrabold text-center mb-16 text-gray-800 animate-fade-in-up">Galeria de Produtos & Serviços</h2>
        {validPhotos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {validPhotos.map((photo, index) => (
              <div
                key={photo.slot || `photo-${index}`} // Usar index como fallback para key
                className={`relative bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${getPhotoGridClass(photo.slot)}`}
              >
                {/* Imagem com zoom no hover */}
                <div className="w-full h-full bg-gray-100 relative">
                  <img
                    src={photo.url}
                    alt={photo.header || `Imagem de ${data.title}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Overlay de detalhes com fundo gradiente */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    {photo.header && (
                      <h3 className="text-2xl font-bold leading-tight mb-1">
                        {photo.header}
                      </h3>
                    )}
                    {photo.description && (
                      <p className="text-sm opacity-90">
                        {photo.description}
                      </p>
                    )}
                    {!hasDetails(photo) && (
                      <p className="text-sm opacity-70">Detalhes do item.</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-100 rounded-lg border-2 border-dashed border-gray-200 animate-fade-in">
            <p className="text-xl text-gray-500 font-semibold mb-4">Sua galeria de fotos está vazia!</p>
            <p className="text-md text-gray-400">Adicione imagens incríveis no painel de controle para encantar seus clientes.</p>
          </div>
        )}
      </section>

      {/* Seção de Contato e Informações */}
      <section className="bg-gradient-to-r from-sky-600 to-blue-700 text-white py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold mb-12 drop-shadow-lg animate-fade-in-up">Fale Conosco</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-left">
            {data.address && (
              <div className="flex items-start p-6 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 shadow-lg group">
                <MapPin className="w-8 h-8 text-white mr-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <div>
                  <h3 className="font-bold text-xl mb-2">Nosso Endereço</h3>
                  <p className="text-gray-100 leading-relaxed">{data.address}, {data.city} - {data.state}</p>
                  <p className="text-gray-200">CEP: {data.zipCode}</p>
                  <Link href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${data.address}, ${data.city}, ${data.state}`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center mt-3 text-orange-300 hover:text-orange-100 text-sm font-semibold transition-colors">
                    Ver no Mapa <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>
            )}
            {data.phone && (
              <div className="flex items-start p-6 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 shadow-lg group">
                <Phone className="w-8 h-8 text-white mr-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <div>
                  <h3 className="font-bold text-xl mb-2">Nosso Telefone</h3>
                  <p className="text-gray-100 leading-relaxed">{data.phone}</p>
                  {data.whatsapp && <p className="text-sm text-gray-200">(WhatsApp disponível)</p>}
                  <Link href={`tel:${data.phone.replace(/\D/g, '')}`} className="inline-flex items-center mt-3 text-orange-300 hover:text-orange-100 text-sm font-semibold transition-colors">
                    Ligar Agora <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>
            )}
            {data.email && (
              <div className="flex items-start p-6 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 shadow-lg group">
                <Mail className="w-8 h-8 text-white mr-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <div>
                  <h3 className="font-bold text-xl mb-2">Nosso Email</h3>
                  <p className="text-gray-100 leading-relaxed">{data.email}</p>
                  <Link href={`mailto:${data.email}`} className="inline-flex items-center mt-3 text-orange-300 hover:text-orange-100 text-sm font-semibold transition-colors">
                    Enviar Email <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>
            )}
            {/* Fallback se nenhuma informação de contato estiver disponível */}
            {!data.address && !data.phone && !data.email && (
              <div className="md:col-span-3 text-center py-10">
                <p className="text-xl text-gray-100 font-semibold mb-4">Nenhuma informação de contato disponível ainda.</p>
                <p className="text-md text-gray-200">Adicione seus detalhes no painel de controle para que os clientes possam entrar em contato!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer Profissional */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm space-y-4 md:space-y-0">
          <p className="text-gray-400">&copy; {new Date().getFullYear()} {data.title || 'Sua Loja'}. Todos os direitos reservados.</p>
          <div className="flex items-center space-x-4">
            <span className="text-gray-500">Desenvolvido com</span> 
            <span className="text-red-500">❤️</span> 
            <span className="text-sky-400 font-semibold">VitrineFast</span>
          </div>
          {/* TODO: Adicionar links sociais, política de privacidade, termos de serviço */}
        </div>
      </footer>
    </main>
  );
}
