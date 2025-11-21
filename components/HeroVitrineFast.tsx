'use client'

import Link from 'next/link'

export function HeroVitrineFast() {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-slate-50">
      {/* Glow / Gradientes de fundo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-40 h-72 w-72 rounded-full bg-[#2D7DF6] opacity-25 blur-3xl pulse-soft" />
        <div className="absolute -bottom-40 -right-20 h-80 w-80 rounded-full bg-[#FF8C42] opacity-20 blur-3xl pulse-soft" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.15),_transparent_60%)]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-16 md:pt-24 md:pb-20 grid md:grid-cols-[1.1fr,0.9fr] gap-10 items-center">
        {/* Coluna esquerda: texto */}
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-medium text-sky-300 bg-sky-950/60 px-3 py-1 rounded-full border border-sky-500/40">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Feito para comércios locais que querem vender mais
          </p>

          <h1 className="mt-5 text-3xl md:text-5xl font-extrabold tracking-tight text-slate-50">
            Sua{" "}
            <span className="text-sky-400">vitrine online</span> pronta em
            poucos minutos.
          </h1>

          <p className="mt-4 text-sm md:text-base text-slate-300 max-w-xl">
            O VitrineFast cria uma página profissional para o seu comércio com
            WhatsApp, mapa, horário, serviços e depoimentos — tudo em um só
            link fácil de compartilhar.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-sky-400 transition"
            >
              Criar minha página grátis
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center rounded-xl border border-slate-600 px-6 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-900/70 transition"
            >
              Ver como funciona
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 max-w-md text-xs md:text-sm text-slate-300">
            <div>
              <p className="text-lg md:text-2xl font-bold text-slate-50">
                10k+
              </p>
              <p>páginas criadas</p>
            </div>
            <div>
              <p className="text-lg md:text-2xl font-bold text-slate-50">
                50+
              </p>
              <p>templates modernos</p>
            </div>
            <div>
              <p className="text-lg md:text-2xl font-bold text-slate-50">
                99%
              </p>
              <p>uptime e estabilidade</p>
            </div>
          </div>
        </div>

        {/* Coluna direita: "card" com tokens flutuando */}
        <div className="relative">
          {/* Halo de fundo */}
          <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-sky-500/20 via-slate-900 to-orange-500/10 blur-xl" />

          {/* Card central */}
          <div className="relative bg-slate-900/90 border border-slate-700/70 rounded-3xl shadow-2xl p-4 md:p-5 backdrop-blur">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-sky-500 flex items-center justify-center text-xs font-bold">
                  VF
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-50">
                    Loja da Ana
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Salão & Estética
                  </span>
                </div>
              </div>
              <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 font-medium">
                Online
              </span>
            </div>

            <div className="h-32 md:h-40 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-[11px] text-slate-400">
              Prévia da página do seu comércio
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-xs md:text-sm text-slate-300">
                Destaque serviços, horário, localização e contato em uma única
                página elegante, feita sob medida para o seu negócio local.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 text-[11px] text-sky-300 px-2 py-1 border border-sky-500/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  WhatsApp em 1 clique
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 text-[11px] text-slate-200 px-2 py-1 border border-slate-600">
                  📍 Mapa e endereço
                </span>
              </div>
            </div>
          </div>

          {/* Tokens flutuando ao redor – inspirado na Clutch */}
          {/* WhatsApp */}
          <div className="float-slow absolute -left-6 top-6 md:-left-10 md:top-4">
            <div className="flex items-center gap-2 rounded-2xl bg-slate-900/90 border border-slate-700 px-3 py-1.5 shadow-lg">
              <span className="text-xs">💬</span>
              <span className="text-[11px] text-slate-100">WhatsApp</span>
            </div>
          </div>

          {/* Google Maps */}
          <div className="float-slow-alt absolute -right-4 top-12 md:-right-8 md:top-8">
            <div className="flex items-center gap-2 rounded-2xl bg-slate-900/90 border border-slate-700 px-3 py-1.5 shadow-lg">
              <span className="text-xs">📍</span>
              <span className="text-[11px] text-slate-100">Google Maps</span>
            </div>
          </div>

          {/* Instagram */}
          <div className="float-slow absolute -left-2 bottom-8 md:-left-6 md:bottom-6">
            <div className="flex items-center gap-2 rounded-2xl bg-slate-900/90 border border-slate-700 px-3 py-1.5 shadow-lg">
              <span className="text-xs">📸</span>
              <span className="text-[11px] text-slate-100">Instagram</span>
            </div>
          </div>

          {/* SEO */}
          <div className="float-slow-alt absolute -right-2 -bottom-2 md:-right-6 md:-bottom-4">
            <div className="flex items-center gap-2 rounded-2xl bg-slate-900/90 border border-slate-700 px-3 py-1.5 shadow-lg">
              <span className="text-xs">📈</span>
              <span className="text-[11px] text-slate-100">SEO pronto</span>
            </div>
          </div>

          {/* Templates */}
          <div className="float-slow absolute left-16 -top-6 md:left-24 md:-top-8">
            <div className="flex items-center gap-2 rounded-2xl bg-slate-900/90 border border-slate-700 px-3 py-1.5 shadow-lg">
              <span className="text-xs">🎨</span>
              <span className="text-[11px] text-slate-100">Templates</span>
            </div>
          </div>
        </div>
      </div>

      {/* Faixa "feito para" */}
      <div className="relative border-t border-slate-800/80 bg-slate-950/95">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] md:text-xs text-slate-400">
          <p className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Feito para salões, clínicas, restaurantes, lojas, autônomos e muito
            mais.
          </p>
          <p className="flex flex-wrap gap-3">
            <span>💈 Salões & Estética</span>
            <span>🍽 Restaurantes & Lanchonetes</span>
            <span>🏥 Clínicas & Consultórios</span>
            <span>🛍 Lojas & Boutiques</span>
          </p>
        </div>
      </div>
    </section>
  )
}

export default HeroVitrineFast
