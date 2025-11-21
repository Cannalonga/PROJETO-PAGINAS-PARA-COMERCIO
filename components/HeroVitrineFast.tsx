'use client'

export function HeroVitrineFast() {
  return (
    <section className="w-full bg-slate-950 text-white py-24 relative overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(0deg, transparent 24%, rgba(45, 125, 246, 0.05) 25%, rgba(45, 125, 246, 0.05) 26%, transparent 27%, transparent 74%, rgba(45, 125, 246, 0.05) 75%, rgba(45, 125, 246, 0.05) 76%, transparent 77%, transparent),
              linear-gradient(90deg, transparent 24%, rgba(45, 125, 246, 0.05) 25%, rgba(45, 125, 246, 0.05) 26%, transparent 27%, transparent 74%, rgba(45, 125, 246, 0.05) 75%, rgba(45, 125, 246, 0.05) 76%, transparent 77%, transparent)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Gradient Glows */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500 rounded-full opacity-10 blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-orange-500 rounded-full opacity-10 blur-3xl" />

      {/* Floating Elements - Left Side */}
      <div className="absolute left-8 top-1/3 opacity-20 float-slow">
        <div className="text-5xl">💬</div>
      </div>
      <div className="absolute left-12 bottom-1/3 opacity-30 float-slow-alt">
        <div className="text-4xl">📍</div>
      </div>
      <div className="absolute left-1/4 top-1/4 opacity-15 float-slow">
        <div className="text-4xl">📸</div>
      </div>

      {/* Floating Elements - Right Side */}
      <div className="absolute right-8 top-1/4 opacity-25 float-slow-alt">
        <div className="text-5xl">📈</div>
      </div>
      <div className="absolute right-16 bottom-1/4 opacity-20 float-slow">
        <div className="text-4xl">🎨</div>
      </div>
      <div className="absolute right-1/4 top-1/3 opacity-30 pulse-soft">
        <div className="text-5xl">🛍️</div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 relative z-10 flex flex-col items-center justify-center text-center">
        {/* Central Card with Glow */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-orange-500 rounded-2xl blur opacity-20" />
          <div className="relative bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 max-w-2xl">
            <p className="text-sm font-semibold tracking-widest text-blue-400 mb-2 uppercase">Sua Loja Online</p>
            <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-blue-400 via-white to-orange-400 bg-clip-text text-transparent">
              Vitrine Digital
            </h1>
            <p className="text-xl text-slate-300 mb-6">
              Conecte seu negócio local com clientes em toda região
            </p>
            
            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 justify-center mb-6">
              <div className="px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-sm text-blue-300 flex items-center gap-2">
                <span>💬</span> WhatsApp
              </div>
              <div className="px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/30 text-sm text-orange-300 flex items-center gap-2">
                <span>📍</span> Google Maps
              </div>
              <div className="px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-sm text-purple-300 flex items-center gap-2">
                <span>📸</span> Instagram
              </div>
            </div>

            <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105">
              Comece Agora →
            </button>
          </div>
        </div>

        {/* Bottom Integration Icons */}
        <div className="mt-16 flex justify-center gap-8 flex-wrap">
          <div className="text-center opacity-60 hover:opacity-100 transition-opacity">
            <div className="text-3xl mb-2">📱</div>
            <p className="text-sm text-slate-400">Responsivo</p>
          </div>
          <div className="text-center opacity-60 hover:opacity-100 transition-opacity">
            <div className="text-3xl mb-2">⚡</div>
            <p className="text-sm text-slate-400">Rápido</p>
          </div>
          <div className="text-center opacity-60 hover:opacity-100 transition-opacity">
            <div className="text-3xl mb-2">🔒</div>
            <p className="text-sm text-slate-400">Seguro</p>
          </div>
          <div className="text-center opacity-60 hover:opacity-100 transition-opacity">
            <div className="text-3xl mb-2">🎯</div>
            <p className="text-sm text-slate-400">Efetivo</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroVitrineFast
