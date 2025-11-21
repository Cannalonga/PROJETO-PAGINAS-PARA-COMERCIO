'use client'

import React from 'react'
import Link from 'next/link'

interface HeaderProps {
  showNav?: boolean
  title?: string
}

export default function Header({ showNav = true, title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur border-b border-slate-700/50">
      <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        <Link href="/">
          <div className="text-2xl font-bold bg-gradient-text bg-clip-text text-transparent hover:opacity-80 transition cursor-pointer">
            {title || 'PáginasComércio'}
          </div>
        </Link>
        
        {showNav && (
          <nav className="flex space-x-4 items-center">
            <Link href="/auth/login">
              <button className="px-4 py-2 text-sm font-medium text-sky-400 hover:text-sky-300 transition">
                Entrar
              </button>
            </Link>
            <Link href="/auth/register">
              <button className="px-4 py-2 text-sm font-medium bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition">
                Começar Grátis
              </button>
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}
