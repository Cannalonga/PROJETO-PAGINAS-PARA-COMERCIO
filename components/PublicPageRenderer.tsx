'use client';

import Link from 'next/link';
import { Phone, MapPin, Mail, MessageCircle, Clock, Star, ChevronRight, Instagram, Facebook, ExternalLink, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

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
  instagram?: string;
  facebook?: string;
  businessHours?: string;
}

export default function PublicPageRenderer({ data }: { data: PublicPageData }) {
  const validPhotos = (data.photos || []).filter(photo => photo.url);
  const heroPhoto = validPhotos.find(p => p.slot === 'hero') || validPhotos[0];
  const galleryPhotos = validPhotos.filter(p => p !== heroPhoto);

  const whatsappLink = data.whatsapp 
    ? `https://wa.me/55${data.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá! Vi a vitrine de ${data.title} e gostaria de mais informações.`)}`
    : null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* ═══════════════════════════════════════════════════════════════
          CSS ANIMATIONS
      ═══════════════════════════════════════════════════════════════ */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-glow { animation: glow 3s ease-in-out infinite; }
        .animate-slideUp { animation: slideUp 0.8s ease-out forwards; }
        .animate-slideIn { animation: slideIn 0.8s ease-out forwards; }
        .animate-scaleIn { animation: scaleIn 0.6s ease-out forwards; }
        .animate-gradient { 
          background-size: 200% 200%;
          animation: gradient 8s ease infinite; 
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .glass {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .glow-emerald {
          box-shadow: 0 0 60px rgba(16, 185, 129, 0.3);
        }
        .glow-purple {
          box-shadow: 0 0 60px rgba(168, 85, 247, 0.3);
        }
        .text-gradient {
          background: linear-gradient(135deg, #10b981, #06b6d4, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* ═══════════════════════════════════════════════════════════════
          HEADER GLASSMORPHISM
      ═══════════════════════════════════════════════════════════════ */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="glass mx-4 mt-4 rounded-2xl">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl blur-lg opacity-50"></div>
                  <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                    <span className="text-white font-black text-lg">
                      {(data.title || 'V')[0].toUpperCase()}
                    </span>
                  </div>
                </div>
                <span className="font-bold text-white text-lg hidden sm:block">{data.title || 'Vitrine'}</span>
              </div>

              {/* CTA */}
              <div className="flex items-center gap-3">
                {data.phone && (
                  <Link href={`tel:${data.phone.replace(/\D/g, '')}`} className="hidden md:flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
                    <Phone className="w-4 h-4" />
                    {data.phone}
                  </Link>
                )}
                {whatsappLink && (
                  <Link
                    href={whatsappLink}
                    target="_blank"
                    className="group relative px-5 py-2.5 rounded-xl overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 transition-transform group-hover:scale-105"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="relative flex items-center gap-2 text-white font-semibold text-sm">
                      <MessageCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION - LANDING PAGE STYLE
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-20 px-4">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Gradient Orbs */}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/30 rounded-full blur-[120px] animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px] animate-float delay-200"></div>
          <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-cyan-500/20 rounded-full blur-[80px] animate-float delay-400"></div>
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
          
          {/* Radial Gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0a0a0a_70%)]"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-slideUp">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-gray-300">Vitrine Digital Premium</span>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight animate-slideUp delay-100">
            <span className="text-white">{(data.title || 'Sua Vitrine').split(' ')[0]}</span>
            <br />
            <span className="text-gradient">{(data.title || 'Digital').split(' ').slice(1).join(' ') || 'Premium'}</span>
          </h1>

          {/* Description */}
          <p className="text-xl sm:text-2xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed animate-slideUp delay-200">
            {data.pageDescription || 'Descubra produtos e serviços exclusivos. Qualidade e atendimento que você merece.'}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slideUp delay-300">
            {whatsappLink && (
              <Link
                href={whatsappLink}
                target="_blank"
                className="group relative px-8 py-4 rounded-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-500 animate-gradient"></div>
                <div className="absolute inset-[2px] bg-[#0a0a0a] rounded-2xl group-hover:bg-transparent transition-colors duration-300"></div>
                <span className="relative flex items-center gap-3 text-white font-bold text-lg">
                  <MessageCircle className="w-5 h-5" />
                  Fazer Pedido
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            )}
            {data.phone && (
              <Link
                href={`tel:${data.phone.replace(/\D/g, '')}`}
                className="group flex items-center gap-3 px-8 py-4 rounded-2xl glass hover:bg-white/10 transition-colors"
              >
                <Phone className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                <span className="text-gray-300 group-hover:text-white font-semibold transition-colors">Ligar Agora</span>
              </Link>
            )}
          </div>

          {/* Hero Image */}
          {heroPhoto && (
            <div className="relative mt-16 animate-scaleIn delay-400">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-purple-500 rounded-3xl blur-2xl opacity-30 animate-glow"></div>
              <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <img
                  src={heroPhoto.url}
                  alt={heroPhoto.header || data.title || 'Hero'}
                  className="w-full h-[300px] sm:h-[400px] md:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
                
                {/* Floating Card */}
                {heroPhoto.header && (
                  <div className="absolute bottom-6 left-6 right-6 glass rounded-2xl p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{heroPhoto.header}</h3>
                        {heroPhoto.description && (
                          <p className="text-gray-400 text-sm">{heroPhoto.description}</p>
                        )}
                      </div>
                      {whatsappLink && (
                        <Link href={whatsappLink} target="_blank" className="p-3 bg-emerald-500 rounded-xl hover:bg-emerald-400 transition-colors">
                          <MessageCircle className="w-5 h-5 text-white" />
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-gray-500 text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-6 h-10 rounded-full border-2 border-gray-700 flex items-start justify-center p-2">
            <div className="w-1.5 h-2.5 bg-emerald-500 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          GALERIA - BENTO GRID PREMIUM
      ═══════════════════════════════════════════════════════════════ */}
      {galleryPhotos.length > 0 && (
        <section className="relative py-24 px-4">
          {/* Section Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent"></div>
          
          <div className="relative max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-sm text-gray-300">Destaques</span>
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4">
                Nossos <span className="text-gradient">Produtos</span>
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Explore nossa seleção especial de produtos e serviços
              </p>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[200px] md:auto-rows-[250px]">
              {galleryPhotos.map((photo, index) => {
                const isLarge = index === 0 || index === 3;
                const gridClass = isLarge ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1';
                
                return (
                  <div
                    key={photo.slot || `photo-${index}`}
                    className={`group relative rounded-3xl overflow-hidden cursor-pointer ${gridClass}`}
                  >
                    {/* Image */}
                    <img
                      src={photo.url}
                      alt={photo.header || `Produto ${index + 1}`}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Glow Effect on Hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 to-transparent"></div>
                    </div>
                    
                    {/* Content */}
                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                      <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        {photo.header && (
                          <h3 className={`font-bold text-white mb-2 ${isLarge ? 'text-2xl md:text-3xl' : 'text-lg'}`}>
                            {photo.header}
                          </h3>
                        )}
                        {photo.description && (
                          <p className={`text-gray-300 mb-4 line-clamp-2 ${isLarge ? 'text-base' : 'text-sm'}`}>
                            {photo.description}
                          </p>
                        )}
                        {whatsappLink && (
                          <Link
                            href={`${whatsappLink}&text=${encodeURIComponent(`Olá! Tenho interesse: ${photo.header || 'produto'}`)}`}
                            target="_blank"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-semibold rounded-xl hover:bg-emerald-400 transition-colors opacity-0 group-hover:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MessageCircle className="w-4 h-4" />
                            Quero Este
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Badge */}
                    {isLarge && (
                      <div className="absolute top-4 left-4 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3 fill-white" />
                        Destaque
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          FEATURES/DIFERENCIAIS
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: CheckCircle2, title: 'Qualidade Garantida', desc: 'Produtos selecionados com excelência', color: 'emerald' },
              { icon: MessageCircle, title: 'Atendimento Rápido', desc: 'Resposta imediata pelo WhatsApp', color: 'cyan' },
              { icon: Star, title: 'Satisfação Total', desc: 'Clientes satisfeitos em primeiro lugar', color: 'purple' },
            ].map((feature, index) => (
              <div key={index} className="group relative p-8 rounded-3xl glass hover:bg-white/10 transition-all duration-300">
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br from-${feature.color}-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                <div className="relative">
                  <div className={`w-14 h-14 rounded-2xl bg-${feature.color}-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-7 h-7 text-${feature.color}-400`} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CONTATO - CARDS PREMIUM
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
              Entre em <span className="text-gradient">Contato</span>
            </h2>
            <p className="text-gray-400 text-lg">Estamos prontos para atender você</p>
          </div>

          {/* Contact Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* WhatsApp - Destaque */}
            {whatsappLink && (
              <Link
                href={whatsappLink}
                target="_blank"
                className="group relative p-8 rounded-3xl overflow-hidden sm:col-span-2 lg:col-span-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-600"></div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-emerald-400 to-green-500"></div>
                
                {/* Decorative */}
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full"></div>
                <div className="absolute -left-5 -bottom-5 w-32 h-32 bg-white/10 rounded-full"></div>
                
                <div className="relative">
                  <MessageCircle className="w-12 h-12 text-white mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-2">WhatsApp</h3>
                  <p className="text-white/80 mb-6">Resposta rápida garantida</p>
                  <div className="flex items-center gap-2 text-white font-semibold">
                    Iniciar conversa
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Link>
            )}

            {/* Phone */}
            {data.phone && (
              <Link href={`tel:${data.phone.replace(/\D/g, '')}`} className="group p-8 rounded-3xl glass hover:bg-white/10 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Phone className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Telefone</h3>
                <p className="text-gray-400 mb-4">{data.phone}</p>
                <span className="text-blue-400 font-semibold flex items-center gap-1">
                  Ligar <ChevronRight className="w-4 h-4" />
                </span>
              </Link>
            )}

            {/* Email */}
            {data.email && (
              <Link href={`mailto:${data.email}`} className="group p-8 rounded-3xl glass hover:bg-white/10 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Email</h3>
                <p className="text-gray-400 mb-4 truncate">{data.email}</p>
                <span className="text-purple-400 font-semibold flex items-center gap-1">
                  Enviar <ChevronRight className="w-4 h-4" />
                </span>
              </Link>
            )}

            {/* Address */}
            {data.address && (
              <Link
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${data.address}, ${data.city}, ${data.state}`)}`}
                target="_blank"
                className="group p-8 rounded-3xl glass hover:bg-white/10 transition-all sm:col-span-2 lg:col-span-2"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6 text-rose-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Localização</h3>
                <p className="text-gray-400">{data.address}</p>
                <p className="text-gray-500 text-sm mb-4">{data.city} - {data.state}, {data.zipCode}</p>
                <span className="text-rose-400 font-semibold flex items-center gap-1">
                  Ver no mapa <ExternalLink className="w-4 h-4" />
                </span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          GOOGLE MAPS - LOCALIZAÇÃO
      ═══════════════════════════════════════════════════════════════ */}
      {data.address && data.city && data.state && (
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
                Nossa <span className="text-gradient">Localização</span>
              </h2>
              <p className="text-gray-400 text-lg">Venha nos visitar</p>
            </div>

            {/* Map Container */}
            <div className="relative rounded-3xl overflow-hidden glass p-2">
              <iframe
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(`${data.address}, ${data.city}, ${data.state}, Brazil`)}&zoom=15`}
                width="100%"
                height="450"
                style={{ border: 0, borderRadius: '1.25rem' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              />
              
              {/* Info Overlay */}
              <div className="absolute bottom-6 left-6 right-6 sm:right-auto">
                <div className="glass rounded-2xl p-4 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-rose-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold mb-1">{data.title}</h3>
                      <p className="text-gray-400 text-sm">{data.address}</p>
                      <p className="text-gray-500 text-sm">{data.city} - {data.state}</p>
                      {data.businessHours && (
                        <p className="text-emerald-400 text-sm mt-2 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {data.businessHours}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          COMPARTILHAR - REDES SOCIAIS
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Compartilhe com <span className="text-gradient">Amigos</span>
            </h2>
            <p className="text-gray-400">Ajude a divulgar este negócio</p>
          </div>

          {/* Share Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* WhatsApp Share */}
            <button
              onClick={() => {
                const text = `Olha só essa vitrine incrível: ${data.title}! 🏪✨`;
                const url = typeof window !== 'undefined' ? window.location.href : '';
                window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
              }}
              className="group p-6 rounded-2xl glass hover:bg-green-500/20 transition-all flex flex-col items-center gap-3"
            >
              <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageCircle className="w-7 h-7 text-green-400" />
              </div>
              <span className="text-gray-400 group-hover:text-green-400 font-medium transition-colors">WhatsApp</span>
            </button>

            {/* Facebook Share */}
            <button
              onClick={() => {
                const url = typeof window !== 'undefined' ? window.location.href : '';
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
              }}
              className="group p-6 rounded-2xl glass hover:bg-blue-500/20 transition-all flex flex-col items-center gap-3"
            >
              <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Facebook className="w-7 h-7 text-blue-400" />
              </div>
              <span className="text-gray-400 group-hover:text-blue-400 font-medium transition-colors">Facebook</span>
            </button>

            {/* Twitter/X Share */}
            <button
              onClick={() => {
                const text = `Olha só essa vitrine incrível: ${data.title}! 🏪✨`;
                const url = typeof window !== 'undefined' ? window.location.href : '';
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
              }}
              className="group p-6 rounded-2xl glass hover:bg-gray-500/20 transition-all flex flex-col items-center gap-3"
            >
              <div className="w-14 h-14 rounded-xl bg-gray-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
              <span className="text-gray-400 group-hover:text-white font-medium transition-colors">Twitter/X</span>
            </button>

            {/* Copy Link */}
            <button
              onClick={() => {
                const url = typeof window !== 'undefined' ? window.location.href : '';
                navigator.clipboard.writeText(url).then(() => {
                  alert('✅ Link copiado para a área de transferência!');
                });
              }}
              className="group p-6 rounded-2xl glass hover:bg-purple-500/20 transition-all flex flex-col items-center gap-3"
            >
              <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ExternalLink className="w-7 h-7 text-purple-400" />
              </div>
              <span className="text-gray-400 group-hover:text-purple-400 font-medium transition-colors">Copiar Link</span>
            </button>
          </div>

          {/* Google Maps Link */}
          {data.address && (
            <div className="mt-8 text-center">
              <Link
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${data.address}, ${data.city}, ${data.state}`)}`}
                target="_blank"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-rose-400 transition-colors"
              >
                <MapPin className="w-5 h-5" />
                Ver no Google Maps
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CTA FINAL
      ═══════════════════════════════════════════════════════════════ */}
      {whatsappLink && (
        <section className="py-24 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-[3rem] overflow-hidden">
              {/* Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500 animate-gradient"></div>
              
              {/* Content */}
              <div className="relative px-8 py-16 sm:px-16 sm:py-20 text-center">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6">
                  Pronto para começar?
                </h2>
                <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                  Entre em contato agora e descubra como podemos ajudar você
                </p>
                <Link
                  href={whatsappLink}
                  target="_blank"
                  className="inline-flex items-center gap-3 px-10 py-5 bg-white text-gray-900 text-lg font-bold rounded-2xl shadow-2xl hover:shadow-white/25 transition-all hover:scale-105"
                >
                  <MessageCircle className="w-6 h-6" />
                  Falar no WhatsApp
                  <ArrowRight className="w-6 h-6" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/10 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-bold">{(data.title || 'V')[0].toUpperCase()}</span>
              </div>
              <div>
                <p className="text-white font-semibold">{data.title || 'Vitrine'}</p>
                <p className="text-gray-500 text-sm">Vitrine Digital</p>
              </div>
            </div>

            {/* Social */}
            <div className="flex items-center gap-3">
              {data.instagram && (
                <Link href={`https://instagram.com/${data.instagram.replace('@', '')}`} target="_blank" className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-white/10 transition-colors">
                  <Instagram className="w-5 h-5 text-gray-400" />
                </Link>
              )}
              {data.facebook && (
                <Link href={`https://facebook.com/${data.facebook}`} target="_blank" className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-white/10 transition-colors">
                  <Facebook className="w-5 h-5 text-gray-400" />
                </Link>
              )}
              {whatsappLink && (
                <Link href={whatsappLink} target="_blank" className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-white/10 transition-colors">
                  <MessageCircle className="w-5 h-5 text-gray-400" />
                </Link>
              )}
            </div>

            {/* Copyright */}
            <div className="text-center md:text-right">
              <p className="text-gray-500 text-sm">© {new Date().getFullYear()} {data.title}. Todos os direitos reservados.</p>
              <p className="text-gray-600 text-xs mt-1">
                Feito com 💚 por <span className="text-emerald-500 font-semibold">VitrineFast</span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
