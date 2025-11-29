'use client';

import { PublicPageData } from './public-page/types';
import { HeaderRenderer } from './public-page/HeaderRenderer';
import { HeroRenderer } from './public-page/HeroRenderer';
import { ProductGridRenderer } from './public-page/ProductGridRenderer';
import { FeaturesRenderer } from './public-page/FeaturesRenderer';
import { ContactRenderer } from './public-page/ContactRenderer';
import { LocationRenderer } from './public-page/LocationRenderer';
import { ShareRenderer } from './public-page/ShareRenderer';
import { CTARenderer } from './public-page/CTARenderer';
import { FooterRenderer } from './public-page/FooterRenderer';

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

      <HeaderRenderer data={data} whatsappLink={whatsappLink} />

      <HeroRenderer
        data={data}
        whatsappLink={whatsappLink}
        heroPhoto={heroPhoto}
      />

      <ProductGridRenderer
        galleryPhotos={galleryPhotos}
        whatsappLink={whatsappLink}
      />

      <FeaturesRenderer />

      <ContactRenderer
        data={data}
        whatsappLink={whatsappLink}
      />

      <LocationRenderer data={data} />

      <ShareRenderer data={data} />

      <CTARenderer whatsappLink={whatsappLink} />

      <FooterRenderer
        data={data}
        whatsappLink={whatsappLink}
      />
    </div>
  );
}
