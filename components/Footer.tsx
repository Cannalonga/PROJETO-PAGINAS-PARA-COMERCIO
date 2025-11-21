'use client'

import React from 'react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-slate-700/50 py-12 bg-slate-900/50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="text-lg font-bold mb-4 bg-gradient-text bg-clip-text text-transparent">
              PáginasComércio
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Transformando negócios locais em presenças online profissionais.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-white">Produto</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><Link href="#features" className="hover:text-white transition">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-white transition">Pricing</Link></li>
              <li><Link href="#" className="hover:text-white transition">Templates</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-white">Empresa</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><Link href="#" className="hover:text-white transition">Sobre</Link></li>
              <li><Link href="#" className="hover:text-white transition">Blog</Link></li>
              <li><Link href="#" className="hover:text-white transition">Contato</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-white">Legal</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><Link href="#" className="hover:text-white transition">Privacidade</Link></li>
              <li><Link href="#" className="hover:text-white transition">Termos</Link></li>
              <li><Link href="#" className="hover:text-white transition">Segurança</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-700/50 pt-8 text-center text-slate-400 text-sm">
          <p>© 2025 PáginasComércio. Todos os direitos reservados. 🚀</p>
        </div>
      </div>
    </footer>
  )
}
