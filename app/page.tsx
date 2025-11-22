'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* NAVBAR */}
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-sky-500 flex items-center justify-center text-white font-bold text-lg">
              V
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-sm md:text-base text-slate-50">
                VitrineFast
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:block">
                Sua vitrine online, rápida e profissional
              </span>
            </div>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-2 text-sm">
            <a href="#features" className="hidden md:inline px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-50 hover:border-slate-700 transition">
              Recursos
            </a>
            <a href="#how-it-works" className="hidden md:inline px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-50 hover:border-slate-700 transition">
              Como funciona
            </a>
            <a href="#pricing" className="hidden md:inline px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-50 hover:border-slate-700 transition">
              Planos
            </a>
            <a href="#faq" className="hidden md:inline px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-50 hover:border-slate-700 transition">
              Dúvidas
            </a>

            <Link href="/auth/login" className="text-slate-300 hover:text-slate-50 font-medium">
              Entrar
            </Link>
            <Link
              href="/auth/register"
              className="bg-sky-500 text-white font-semibold text-xs md:text-sm px-4 py-2 rounded-xl shadow-sm hover:bg-sky-400 transition"
            >
              Começar grátis
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* HERO DARK ESTILO MODERNO */}
        <section className="relative overflow-hidden bg-slate-950">
          {/* Glows */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-32 -left-40 h-72 w-72 rounded-full bg-sky-500 opacity-25 blur-3xl"></div>
            <div className="absolute -bottom-40 -right-20 h-80 w-80 rounded-full bg-orange-400 opacity-20 blur-3xl"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.15),_transparent_60%)]"></div>
          </div>

          <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-20 grid md:grid-cols-[1.1fr,0.9fr] gap-10 items-center">
            {/* Coluna esquerda: texto */}
            <div>
              {/* Badge */}
              <p className="inline-flex items-center gap-2 text-xs font-medium text-sky-300 bg-sky-950/60 px-3 py-1 rounded-full border border-sky-500/40">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                Páginas para comércios locais em minutos
              </p>

              {/* Título principal */}
              <h1 className="mt-5 text-3xl md:text-5xl font-extrabold tracking-tight text-slate-50">
                Sua <span className="text-sky-400">Vitrine Online</span>,
                <br />
                Rápida e Profissional
              </h1>

              {/* Subtítulo */}
              <p className="mt-4 text-sm md:text-base text-slate-300 max-w-xl leading-relaxed">
                Crie páginas modernas para seu comércio em minutos — sem complicação e sem precisar de código.
              </p>

              {/* CTAs */}
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-sky-400 transition"
                >
                  Criar Minha Página
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-600 px-6 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-900/70 transition"
                >
                  Ver Exemplos
                </a>
              </div>

              {/* Números */}
              <div className="mt-8 grid grid-cols-3 gap-4 max-w-md text-xs md:text-sm text-slate-300">
                <div>
                  <p className="text-lg md:text-2xl font-bold text-slate-50">10k+</p>
                  <p>Negócios criados</p>
                </div>
                <div>
                  <p className="text-lg md:text-2xl font-bold text-slate-50">50+</p>
                  <p>Templates prontos</p>
                </div>
                <div>
                  <p className="text-lg md:text-2xl font-bold text-slate-50">99%</p>
                  <p>Uptime garantido</p>
                </div>
              </div>
            </div>

            {/* Coluna direita: card de preview */}
            <div className="relative">
              <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-sky-500/20 via-slate-900 to-orange-500/10 blur-xl"></div>
              <div className="relative bg-slate-900/90 border border-slate-700/70 rounded-3xl shadow-2xl p-4 md:p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-sky-500 flex items-center justify-center text-xs font-bold text-white">
                      VF
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-50">
                        Loja Exemplo
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Comércio local
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

                <p className="mt-4 text-xs md:text-sm text-slate-300">
                  Destaque serviços, horário, endereço e WhatsApp em uma única página
                  feita para o seu comércio local.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section
          id="features"
          className="py-12 md:py-16 bg-slate-900 border-t border-slate-800"
        >
          <div className="max-w-6xl mx-auto px-4">
            {/* Cabeçalho da seção */}
            <div className="text-center max-w-2xl mx-auto mb-10">
              <p className="text-xs font-semibold text-sky-300 uppercase tracking-wide">
                Recursos poderosos
              </p>
              <h2 className="mt-2 text-2xl md:text-3xl font-bold text-slate-50">
                Tudo o que sua página precisa para parecer profissional
              </h2>
              <p className="mt-3 text-sm md:text-base text-slate-300">
                Modelos prontos, otimização para Google, integração com WhatsApp e um
                visual pensado especialmente para comércios locais.
              </p>
            </div>

            {/* Grid de features */}
            <div className="grid md:grid-cols-3 gap-4 md:gap-6">
              {/* Sem código */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-2">
                <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-300 flex items-center justify-center text-xl">
                  ⚡
                </div>
                <h3 className="text-sm md:text-base font-semibold text-slate-50">
                  Sem código
                </h3>
                <p className="text-xs md:text-sm text-slate-300">
                  Monte sua página escolhendo blocos prontos: capa, serviços,
                  depoimentos, mapa, contato e muito mais — sem precisar falar com
                  programador.
                </p>
              </div>

              {/* Templates modernos */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-2">
                <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-300 flex items-center justify-center text-xl">
                  🎨
                </div>
                <h3 className="text-sm md:text-base font-semibold text-slate-50">
                  Templates modernos
                </h3>
                <p className="text-xs md:text-sm text-slate-300">
                  Layouts pensados para salões, clínicas, restaurantes, lojas e
                  profissionais liberais — é só escolher o que mais combina com seu
                  negócio.
                </p>
              </div>

              {/* Mobile first */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-2">
                <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-300 flex items-center justify-center text-xl">
                  📱
                </div>
                <h3 className="text-sm md:text-base font-semibold text-slate-50">
                  100% mobile
                </h3>
                <p className="text-xs md:text-sm text-slate-300">
                  Sua página fica rápida e bonita no celular, onde seus clientes
                  realmente estão — perfeita para enviar por WhatsApp.
                </p>
              </div>

              {/* SEO */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-2">
                <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-300 flex items-center justify-center text-xl">
                  📈
                </div>
                <h3 className="text-sm md:text-base font-semibold text-slate-50">
                  SEO otimizado
                </h3>
                <p className="text-xs md:text-sm text-slate-300">
                  Engine de SEO integrada ajuda seu comércio a ser encontrado no
                  Google, com título, descrição e URL bem configurados.
                </p>
              </div>

              {/* Integrações */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-2">
                <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-300 flex items-center justify-center text-xl">
                  🔗
                </div>
                <h3 className="text-sm md:text-base font-semibold text-slate-50">
                  Integrações fáceis
                </h3>
                <p className="text-xs md:text-sm text-slate-300">
                  Conecte WhatsApp, Google Maps, Instagram, links de pagamento e outros
                  canais diretamente na sua página.
                </p>
              </div>

              {/* Segurança */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-2">
                <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-300 flex items-center justify-center text-xl">
                  🛡️
                </div>
                <h3 className="text-sm md:text-base font-semibold text-slate-50">
                  Segurança por padrão
                </h3>
                <p className="text-xs md:text-sm text-slate-300">
                  HTTPS, backups, multi-tenant seguro e monitoramento — toda a
                  infraestrutura preparada para você focar no seu negócio.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section
          id="how-it-works"
          className="py-12 md:py-16 bg-slate-950 border-t border-slate-800"
        >
          <div className="max-w-5xl mx-auto px-4">
            {/* Cabeçalho */}
            <div className="text-center max-w-2xl mx-auto mb-10">
              <p className="text-xs font-semibold text-sky-300 uppercase tracking-wide">
                Como funciona
              </p>
              <h2 className="mt-2 text-2xl md:text-3xl font-bold text-slate-50">
                Publique sua página em 3 passos simples
              </h2>
              <p className="mt-3 text-sm md:text-base text-slate-300">
                Pensado para quem não quer perder tempo com ferramentas complicadas.
              </p>
            </div>

            {/* Linha de progresso + 3 passos */}
            <div className="relative">
              {/* linha horizontal (desktop) */}
              <div className="hidden md:block absolute top-7 left-10 right-10 h-px bg-slate-700/70" />

              <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                {/* Passo 1 */}
                <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <span className="text-xs font-semibold text-sky-300">
                      Crie sua conta
                    </span>
                  </div>
                  <h3 className="mt-2 text-sm md:text-base font-semibold text-slate-50">
                    Informe os dados do seu comércio
                  </h3>
                  <p className="text-xs md:text-sm text-slate-300">
                    Nome da loja, email e alguns dados básicos. Em menos de um minuto
                    você já tem acesso ao painel.
                  </p>
                </div>

                {/* Passo 2 */}
                <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <span className="text-xs font-semibold text-sky-300">
                      Escolha um modelo
                    </span>
                  </div>
                  <h3 className="mt-2 text-sm md:text-base font-semibold text-slate-50">
                    Selecione o template ideal
                  </h3>
                  <p className="text-xs md:text-sm text-slate-300">
                    Escolha um template pensado para o seu tipo de negócio e ajuste
                    textos, fotos, cores e links do seu jeito.
                  </p>
                </div>

                {/* Passo 3 */}
                <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <span className="text-xs font-semibold text-sky-300">
                      Publique e compartilhe
                    </span>
                  </div>
                  <h3 className="mt-2 text-sm md:text-base font-semibold text-slate-50">
                    Gere o link da sua vitrine
                  </h3>
                  <p className="text-xs md:text-sm text-slate-300">
                    Com um clique você publica sua página e já pode compartilhar o link
                    com clientes no WhatsApp, Instagram e cartão de visita.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section
          id="pricing"
          className="py-12 md:py-16 bg-slate-950 border-t border-slate-800"
        >
          <div className="max-w-6xl mx-auto px-4">
            {/* Cabeçalho */}
            <div className="text-center max-w-2xl mx-auto mb-10">
              <p className="text-xs font-semibold text-sky-300 uppercase tracking-wide">
                Planos
              </p>
              <h2 className="mt-2 text-2xl md:text-3xl font-bold text-slate-50">
                Comece grátis e evolua conforme seu negócio cresce
              </h2>
              <p className="mt-3 text-sm md:text-base text-slate-300">
                Teste sem compromisso. Publique sua página, veja o resultado e só então
                decida se quer recursos avançados.
              </p>
            </div>

            {/* Grid de planos */}
            <div className="grid md:grid-cols-3 gap-5">
              {/* Plano Iniciante */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3">
                <h3 className="text-sm md:text-base font-semibold text-slate-50">
                  Iniciante
                </h3>
                <p className="text-lg md:text-xl font-bold text-slate-50">Grátis</p>
                <p className="text-xs md:text-sm text-slate-300">
                  Perfeito para dar os primeiros passos online.
                </p>
                <ul className="mt-2 space-y-1 text-xs md:text-sm text-slate-300">
                  <li>✓ 1 página</li>
                  <li>✓ Template básico</li>
                  <li>✓ Subdomínio incluso</li>
                  <li>✓ Suporte por email</li>
                </ul>
                <button className="mt-4 w-full text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-700 text-slate-50 hover:bg-slate-900 transition">
                  Começar grátis
                </button>
              </div>

              {/* Plano Profissional (destaque) */}
              <div className="relative bg-slate-900 border border-sky-500 rounded-2xl p-5 flex flex-col gap-3 shadow-lg scale-[1.03]">
                <span className="absolute -top-3 right-4 text-[11px] px-2 py-1 rounded-full bg-orange-400 text-white font-semibold shadow-sm">
                  Mais popular
                </span>
                <h3 className="text-sm md:text-base font-semibold text-slate-50">
                  Profissional
                </h3>
                <p className="text-lg md:text-xl font-bold text-slate-50">
                  R$ 29/mês
                </p>
                <p className="text-xs md:text-sm text-slate-300">
                  Para quem quer parecer profissional e crescer online.
                </p>
                <ul className="mt-2 space-y-1 text-xs md:text-sm text-slate-300">
                  <li>✓ Até 5 páginas</li>
                  <li>✓ Todos os templates</li>
                  <li>✓ Domínio próprio</li>
                  <li>✓ Suporte prioritário</li>
                  <li>✓ Analytics básico</li>
                </ul>
                <button className="mt-4 w-full text-sm font-semibold px-4 py-2.5 rounded-xl bg-sky-500 text-white hover:bg-sky-400 transition">
                  Escolher Profissional
                </button>
                <p className="mt-2 text-[11px] text-slate-400">
                  Recomendado para comércios que já vendem todo dia.
                </p>
              </div>

              {/* Plano Negócio */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3">
                <h3 className="text-sm md:text-base font-semibold text-slate-50">
                  Negócio
                </h3>
                <p className="text-lg md:text-xl font-bold text-slate-50">
                  R$ 99/mês
                </p>
                <p className="text-xs md:text-sm text-slate-300">
                  Para negócios que dependem da internet todos os dias.
                </p>
                <ul className="mt-2 space-y-1 text-xs md:text-sm text-slate-300">
                  <li>✓ Páginas ilimitadas</li>
                  <li>✓ Customização avançada</li>
                  <li>✓ API de acesso</li>
                  <li>✓ Suporte dedicado</li>
                  <li>✓ Integrações premium</li>
                </ul>
                <button className="mt-4 w-full text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-700 text-slate-50 hover:bg-slate-900 transition">
                  Falar com vendas
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-12 md:py-16 bg-slate-900 border-t border-slate-800">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <p className="text-xs font-semibold text-sky-300 uppercase tracking-wide">
                Dúvidas
              </p>
              <h2 className="mt-2 text-2xl md:text-3xl font-bold text-slate-50">
                Perguntas frequentes
              </h2>
              <p className="mt-3 text-sm md:text-base text-slate-300">
                Se ainda restar alguma dúvida, você pode falar com a gente a
                qualquer momento.
              </p>
            </div>

            <div className="space-y-4 text-sm text-slate-300">
              <details className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <summary className="cursor-pointer font-semibold text-slate-50">
                  Preciso saber programar?
                </summary>
                <p className="mt-2 text-sm text-slate-300">
                  Não. O VitrineFast foi feito para donos de comércio, não para
                  desenvolvedores. Você só preenche textos, escolhe imagens e
                  publica.
                </p>
              </details>

              <details className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <summary className="cursor-pointer font-semibold text-slate-50">
                  Tem plano grátis?
                </summary>
                <p className="mt-2 text-sm text-slate-300">
                  Sim. Você pode começar com o plano Iniciante, publicar sua
                  página e testar sem pagar nada.
                </p>
              </details>

              <details className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <summary className="cursor-pointer font-semibold text-slate-50">
                  Posso usar meu próprio domínio?
                </summary>
                <p className="mt-2 text-sm text-slate-300">
                  Sim. A partir do plano Profissional você pode conectar um
                  domínio próprio (como suaempresa.com.br).
                </p>
              </details>

              <details className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <summary className="cursor-pointer font-semibold text-slate-50">
                  Posso cancelar quando quiser?
                </summary>
                <p className="mt-2 text-sm text-slate-300">
                  Pode. Não há fidelidade. Você controla sua assinatura direto
                  pelo painel.
                </p>
              </details>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section id="cta" className="py-12 md:py-16 bg-slate-950/95 border-t border-slate-800">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-50">
              Pronto para criar a vitrine do seu comércio?
            </h2>
            <p className="mt-3 text-sm md:text-base text-slate-300 max-w-xl mx-auto">
              Em poucos minutos, você terá uma página profissional pronta para
              compartilhar com seus clientes no WhatsApp, Instagram e onde mais
              quiser.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/auth/register"
                className="bg-sky-500 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-sm hover:bg-sky-400 transition"
              >
                Criar conta grátis agora
              </Link>
              <a
                href="#features"
                className="border border-slate-700 text-slate-200 text-sm px-6 py-3 rounded-xl hover:bg-slate-900 transition"
              >
                Ver recursos primeiro
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-100">VitrineFast</span>
            <span>
              Transformando comércios locais em vitrines digitais profissionais.
            </span>
          </div>
          <div className="flex flex-wrap gap-4">
            <a href="#" className="hover:text-slate-100">Sobre</a>
            <a href="#" className="hover:text-slate-100">Contato</a>
            <a href="#" className="hover:text-slate-100">Privacidade</a>
            <a href="#" className="hover:text-slate-100">Termos</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
