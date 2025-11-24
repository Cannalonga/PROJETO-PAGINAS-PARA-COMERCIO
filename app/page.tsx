'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* NAVBAR */}
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-50">
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

            <Link href="#pricing" className="text-slate-300 hover:text-slate-50 font-medium">
              Entrar
            </Link>
            <Link
              href="/setup"
              className="bg-sky-500 text-white font-semibold text-xs md:text-sm px-4 py-2 rounded-xl shadow-sm hover:bg-sky-400 transition"
            >
              Começar grátis
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden bg-slate-950 py-16 md:py-20">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-32 -left-40 h-72 w-72 rounded-full bg-sky-500 opacity-25 blur-3xl"></div>
            <div className="absolute -bottom-40 -right-20 h-80 w-80 rounded-full bg-orange-400 opacity-20 blur-3xl"></div>
          </div>

          <div className="relative max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-medium text-sky-300 bg-sky-950/60 px-3 py-1 rounded-full border border-sky-500/40 mb-4">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                Páginas para comércios locais em minutos
              </p>

              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-50 mb-4">
                Sua <span className="text-sky-400">Vitrine Online</span>,
                <br />
                Rápida e Profissional
              </h1>

              <p className="text-sm md:text-base text-slate-300 max-w-xl mb-6">
                Crie páginas modernas para seu comércio em minutos — sem complicação e sem precisar de código.
              </p>

              <div className="flex flex-wrap gap-3 mb-8">
                <Link
                  href="/setup"
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

              <div className="grid grid-cols-3 gap-4 max-w-md text-xs md:text-sm text-slate-300">
                <div>
                  <p className="text-lg md:text-2xl font-bold text-slate-50">⚡</p>
                  <p>Sem código</p>
                </div>
                <div>
                  <p className="text-lg md:text-2xl font-bold text-slate-50">📱</p>
                  <p>100% Mobile</p>
                </div>
                <div>
                  <p className="text-lg md:text-2xl font-bold text-slate-50">🔒</p>
                  <p>Seguro & Rápido</p>
                </div>
              </div>
            </div>

            <div className="relative hidden md:block">
              <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-sky-500/20 via-slate-900 to-orange-500/10 blur-xl"></div>
              <div className="relative bg-slate-900/90 border border-slate-700/70 rounded-3xl shadow-2xl p-5">
                <div className="h-40 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400">
                  Prévia da página
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="py-12 md:py-16 bg-slate-900 border-t border-slate-800">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <p className="text-xs font-semibold text-sky-300 uppercase tracking-wide">Recursos poderosos</p>
              <h2 className="mt-2 text-2xl md:text-3xl font-bold text-slate-50">
                Tudo o que sua página precisa para parecer profissional
              </h2>
              <p className="mt-3 text-sm md:text-base text-slate-300">
                Modelos prontos, otimização para Google, integração com WhatsApp.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 md:gap-6">
              {[
                { icon: '⚡', title: 'Sem código', desc: 'Monte sua página escolhendo blocos prontos.' },
                { icon: '🎨', title: 'Templates modernos', desc: 'Layouts pensados para seu tipo de negócio.' },
                { icon: '📱', title: '100% mobile', desc: 'Sua página fica rápida e bonita no celular.' },
                { icon: '📈', title: 'SEO otimizado', desc: 'Engine de SEO integrada para ser encontrado.' },
                { icon: '🔗', title: 'Integrações fáceis', desc: 'Conecte WhatsApp, Maps, Instagram.' },
                { icon: '🛡️', title: 'Segurança', desc: 'HTTPS, backups, infraestrutura segura.' },
              ].map((f, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <div className="text-xl mb-2">{f.icon}</div>
                  <h3 className="font-semibold text-slate-50 mb-1">{f.title}</h3>
                  <p className="text-sm text-slate-300">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section id="how-it-works" className="py-12 md:py-16 bg-slate-950 border-t border-slate-800">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <p className="text-xs font-semibold text-sky-300 uppercase tracking-wide">Como funciona</p>
              <h2 className="mt-2 text-2xl md:text-3xl font-bold text-slate-50">
                Publique sua página em 3 passos simples
              </h2>
              <p className="mt-3 text-sm md:text-base text-slate-300">
                Pensado para quem não quer perder tempo com ferramentas complicadas.
              </p>
            </div>

            <div className="relative">
              <div className="hidden md:block absolute top-7 left-10 right-10 h-px bg-slate-700/70" />

              <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                {[
                  { num: 1, label: 'Crie sua conta', title: 'Informe os dados do seu comércio', desc: 'Nome da loja, email e alguns dados básicos. Em menos de um minuto você já tem acesso ao painel.' },
                  { num: 2, label: 'Escolha um modelo', title: 'Selecione o template ideal', desc: 'Escolha um template pensado para o seu tipo de negócio e ajuste textos, fotos, cores e links.' },
                  { num: 3, label: 'Publique e compartilhe', title: 'Gere o link da sua vitrine', desc: 'Com um clique você publica sua página e já pode compartilhar com clientes no WhatsApp, Instagram.' },
                ].map((step) => (
                  <div key={step.num} className="relative bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-8 w-8 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center text-sm font-bold">
                        {step.num}
                      </div>
                      <span className="text-xs font-semibold text-sky-300">{step.label}</span>
                    </div>
                    <h3 className="font-semibold text-slate-50 mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-300">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="py-12 md:py-16 bg-slate-950 border-t border-slate-800">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <p className="text-xs font-semibold text-sky-300 uppercase tracking-wide">Planos</p>
              <h2 className="mt-2 text-2xl md:text-3xl font-bold text-slate-50">
                Comece grátis e evolua conforme seu negócio cresce
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {[
                { name: 'Iniciante', price: 'Grátis', features: ['1 página', 'Template básico', 'Subdomínio', 'Email support'] },
                { name: 'Profissional', price: 'R$ 29/mês', features: ['Até 5 páginas', 'Todos templates', 'Domínio próprio', 'Suporte prioritário'], highlight: true },
                { name: 'Negócio', price: 'R$ 99/mês', features: ['Ilimitadas', 'Customização', 'API acesso', 'Suporte dedicado'] },
              ].map((plan, i) => (
                <div key={i} className={`rounded-2xl p-5 flex flex-col gap-3 ${plan.highlight ? 'bg-slate-900 border border-sky-500 scale-[1.03] shadow-lg' : 'bg-slate-900/90 border border-slate-800'}`}>
                  <h3 className="font-semibold text-slate-50">{plan.name}</h3>
                  <p className="text-xl font-bold text-slate-50">{plan.price}</p>
                  <ul className="space-y-1 text-sm text-slate-300">
                    {plan.features.map((f, j) => <li key={j}>✓ {f}</li>)}
                  </ul>
                  <Link href="/setup" className={`mt-4 px-4 py-2.5 rounded-xl font-semibold transition inline-block text-center ${plan.highlight ? 'bg-sky-500 text-white hover:bg-sky-400' : 'border border-slate-700 text-slate-50 hover:bg-slate-900'}`}>
                    {plan.highlight ? 'Escolher' : 'Começar'}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-12 md:py-16 bg-slate-900 border-t border-slate-800">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-50">Perguntas frequentes</h2>
            </div>

            <div className="space-y-4">
              {[
                { q: 'Preciso saber programar?', a: 'Não. O VitrineFast foi feito para donos de comércio, você só preenche textos e publica.' },
                { q: 'Tem plano grátis?', a: 'Sim. Você pode começar com o plano Iniciante e testar sem pagar nada.' },
                { q: 'Posso usar meu próprio domínio?', a: 'Sim. A partir do plano Profissional você pode conectar um domínio próprio.' },
                { q: 'Posso cancelar quando quiser?', a: 'Pode. Não há fidelidade. Você controla sua assinatura direto pelo painel.' },
              ].map((faq, i) => (
                <details key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <summary className="cursor-pointer font-semibold text-slate-50">{faq.q}</summary>
                  <p className="mt-2 text-sm text-slate-300">{faq.a}</p>
                </details>
              ))}
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
              Em poucos minutos, você terá uma página profissional pronta para compartilhar com seus clientes.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/setup"
                className="bg-sky-500 text-white font-semibold text-sm px-6 py-3 rounded-xl hover:bg-sky-400 transition"
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
      <footer className="border-t border-slate-800 bg-slate-950 py-6">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-100">VitrineFast</span>
            <span>Transformando comércios locais em vitrines digitais.</span>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-100">Sobre</a>
            <a href="#" className="hover:text-slate-100">Contato</a>
            <a href="#" className="hover:text-slate-100">Privacidade</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
