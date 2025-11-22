'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <h1>Como funciona - TESTE</h1>
      <div className="grid grid-cols-3 gap-6">
        <div className="h-8 w-8 rounded-full bg-sky-500">1</div>
        <div className="h-8 w-8 rounded-full bg-sky-500">2</div>
        <div className="h-8 w-8 rounded-full bg-sky-500">3</div>
      </div>
    </div>
  )
}
