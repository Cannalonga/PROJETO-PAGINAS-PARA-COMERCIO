'use client'

import React from 'react'
import { AdSpace } from '@/components/AdSpace'

type Service = {
  name: string
  description: string
  price?: string
}

type Testimonial = {
  name: string
  text: string
}

type StoreData = {
  name: string
  tagline: string
  description: string
  logoUrl?: string
  coverImageUrl?: string
  whatsappNumber?: string
  address: string
  city: string
  neighborhood?: string
  phone?: string
  services: Service[]
  highlights: string[]
  testimonials: Testimonial[]
  openingHours: string
  mapEmbedUrl?: string
}

const mockStore: StoreData = {
  name: 'VitrineFast Moda & Estilo',
  tagline: 'Moda feminina moderna para o seu dia a dia.',
  description:
    'Roupas, acessórios e looks completos para você se sentir incrível em qualquer ocasião. Atendimento personalizado e novidades toda semana.',
  logoUrl: '',
  coverImageUrl: '',
  whatsappNumber: '5511999999999',
  address: 'Rua das Flores, 123',
  city: 'São Paulo - SP',
  neighborhood: 'Centro',
  phone: '(11) 99999-9999',
  services: [
    {
      name: 'Consultoria de Estilo',
      description: 'Ajuda para montar looks completos para eventos e dia a dia.',
      price: 'A partir de R$ 149',
    },
    {
      name: 'Looks Prontos',
      description: 'Combos com peças combinando para facilitar a sua escolha.',
      price: 'A partir de R$ 99',
    },
    {
      name: 'Entrega na Região',
      description: 'Receba em casa com rapidez na região do centro.',
      price: 'Consulte taxas',
    },
  ],
  highlights: ['Mais de 5 anos no mercado', 'Novidades toda semana', 'Atendimento pelo WhatsApp'],
  testimonials: [
    {
      name: 'Ana Paula',
      text: 'Adoro as peças da loja! Sempre encontro algo que combina comigo e o atendimento é maravilhoso.',
    },
    {
      name: 'Juliana Gomes',
      text: 'Comprei um look completo para um evento e foi um sucesso. Recomendo demais!',
    },
  ],
  openingHours: 'Seg a Sex: 9h às 19h · Sáb: 9h às 14h',
  mapEmbedUrl: '',
}

function buildWhatsAppLink(phone?: string) {
  if (!phone) return '#'
  return `https://wa.me/${phone}`
}

export default function StorePublicPage() {
  const store = mockStore

  return (
    <div className="min-h-screen bg-bgLight text-textDark">
      {/* Ad Space - Top */}
      <div className="bg-white border-b border-borderLight">
        <div className="max-w-5xl mx-auto px-4 py-2">
          <AdSpace position="top" />
        </div>
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-borderLight">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3 md:py-4">
          <div className="flex items-center gap-3">
            {store.logoUrl ? (
              <img
                src={store.logoUrl}
                alt={store.name}
                className="h-10 w-10 rounded-xl object-cover border border-borderLight"
              />
            ) : (
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold">
                {store.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="font-semibold text-sm md:text-base text-secondary">{store.name}</h1>
              <p className="text-xs md:text-sm text-textLight">
                {store.neighborhood ? `${store.neighborhood} · ` : ''}
                {store.city}
              </p>
            </div>
          </div>

          {store.whatsappNumber && (
            <a
              href={buildWhatsAppLink(store.whatsappNumber)}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-2 bg-fast text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm hover:bg-[#e6762e] transition"
            >
              <span>Falar no WhatsApp</span>
            </a>
          )}
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-10 md:space-y-14">
        {/* HERO */}
        <section className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-blue-50 px-3 py-1 rounded-full mb-3">
              <span className="h-2 w-2 rounded-full bg-success" />
              Aberto · {store.openingHours}
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-secondary leading-tight">
              {store.tagline}
            </h2>
            <p className="mt-4 text-sm md:text-base text-textDark/70">{store.description}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              {store.whatsappNumber && (
                <a
                  href={buildWhatsAppLink(store.whatsappNumber)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm hover:bg-[#1B64D3] transition"
                >
                  Falar no WhatsApp
                </a>
              )}
              {store.phone && (
                <a
                  href={`tel:${store.phone}`}
                  className="inline-flex items-center justify-center border border-primary text-primary text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition"
                >
                  Ligar para a loja
                </a>
              )}
            </div>

            {/* Destaques */}
            {store.highlights.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {store.highlights.map((h, i) => (
                  <span
                    key={i}
                    className="text-xs md:text-xs bg-white border border-borderLight text-textLight px-3 py-1 rounded-full"
                  >
                    {h}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Imagem / Card da loja */}
          <div className="md:justify-self-end">
            <div className="bg-white border border-borderLight rounded-2xl shadow-sm overflow-hidden">
              {store.coverImageUrl ? (
                <img
                  src={store.coverImageUrl}
                  alt={`Foto de ${store.name}`}
                  className="w-full h-52 md:h-64 object-cover"
                />
              ) : (
                <div className="w-full h-52 md:h-64 bg-bgLight flex items-center justify-center text-textLight text-sm">
                  Foto da fachada / produtos
                </div>
              )}
              <div className="p-4 space-y-1">
                <p className="text-sm font-semibold text-secondary">{store.address}</p>
                <p className="text-xs text-textLight">{store.city}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Ad Space - Middle */}
        <div className="bg-white border border-borderLight rounded-2xl p-4 my-8">
          <AdSpace position="middle" />
        </div>

        {/* SERVIÇOS / PRODUTOS */}
        {store.services.length > 0 && (
          <section>
            <h3 className="text-xl md:text-2xl font-bold text-secondary mb-4">
              O que você encontra aqui
            </h3>
            <div className="grid md:grid-cols-3 gap-4 md:gap-5">
              {store.services.map((service, i) => (
                <div
                  key={i}
                  className="bg-white border border-borderLight rounded-2xl p-4 flex flex-col gap-2 hover:shadow-md transition-shadow"
                >
                  <h4 className="text-sm md:text-base font-semibold text-secondary">
                    {service.name}
                  </h4>
                  <p className="text-xs md:text-sm text-textLight">{service.description}</p>
                  {service.price && (
                    <p className="text-xs md:text-sm font-semibold text-primary mt-auto">
                      {service.price}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* DEPOIMENTOS */}
        {store.testimonials.length > 0 && (
          <section>
            <h3 className="text-xl md:text-2xl font-bold text-secondary mb-4">
              O que nossos clientes dizem
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {store.testimonials.map((t, i) => (
                <div
                  key={i}
                  className="bg-white border border-borderLight rounded-2xl p-4 hover:shadow-md transition-shadow"
                >
                  <p className="text-sm text-textDark/70 italic">"{t.text}"</p>
                  <p className="mt-3 text-xs font-semibold text-secondary">{t.name}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* LOCALIZAÇÃO & HORÁRIO */}
        <section className="grid md:grid-cols-[1.3fr,1fr] gap-6 items-start">
          <div className="bg-white border border-borderLight rounded-2xl p-4 md:p-5">
            <h3 className="text-lg md:text-xl font-bold text-secondary mb-2">Como chegar</h3>
            <p className="text-sm text-textDark/70 mb-1">{store.address}</p>
            <p className="text-xs text-textLight mb-3">{store.city}</p>
            {store.mapEmbedUrl ? (
              <div className="mt-3 h-60 rounded-xl overflow-hidden border border-borderLight">
                <iframe
                  src={store.mapEmbedUrl}
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            ) : (
              <div className="mt-3 h-40 rounded-xl bg-bgLight flex items-center justify-center text-xs text-textLight">
                Área do mapa — insira o embed do Google Maps aqui.
              </div>
            )}
          </div>

          <div className="bg-white border border-borderLight rounded-2xl p-4 md:p-5 space-y-3">
            <h3 className="text-lg md:text-xl font-bold text-secondary">Horário & Contato</h3>
            <p className="text-sm text-textDark/70">{store.openingHours}</p>

            {store.phone && (
              <p className="text-sm text-textDark/70">
                Telefone:{' '}
                <a href={`tel:${store.phone}`} className="text-primary font-semibold">
                  {store.phone}
                </a>
              </p>
            )}

            {store.whatsappNumber && (
              <p className="text-sm text-textDark/70">
                WhatsApp:{' '}
                <a
                  href={buildWhatsAppLink(store.whatsappNumber)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary font-semibold"
                >
                  Enviar mensagem
                </a>
              </p>
            )}
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="bg-white border border-borderLight rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-secondary">Gostou? A gente te espera!</h3>
            <p className="text-sm text-textLight mt-1">
              Entre em contato pelo WhatsApp ou faça uma visita na loja.
            </p>
          </div>
          {store.whatsappNumber && (
            <a
              href={buildWhatsAppLink(store.whatsappNumber)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center bg-fast text-white text-sm font-semibold px-6 py-3 rounded-xl shadow-sm hover:bg-[#e6762e] transition"
            >
              Falar no WhatsApp agora
            </a>
          )}
        </section>
      </main>

      {/* FOOTER */}
      <footer className="mt-8 border-t border-borderLight bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-textLight">
            © {new Date().getFullYear()} {store.name}. Todos os direitos reservados.
          </p>
          <p className="text-xs text-textLight">
            Página criada com <span className="font-semibold text-primary">VitrineFast</span>
          </p>
        </div>
      </footer>

      {/* Ad Space - Footer (Sticky) */}
      <AdSpace position="footer" />
    </div>
  )
}
