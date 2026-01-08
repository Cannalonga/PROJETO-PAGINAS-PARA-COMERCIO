'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

interface Store {
  id: string
  slug: string
  name: string
  email: string
  status: string
  plan: string
  createdAt: string
  pageTitle?: string
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ total: 0, active: 0, draft: 0, vip: 0 })

  useEffect(() => {
    loadStores()
  }, [])

  const loadStores = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/stores')

      if (response.ok) {
        const data = await response.json()
        setStores(data.stores || [])
        setStats(data.stats || { total: 0, active: 0, draft: 0, vip: 0 })
      }
    } catch (err) {
      console.error('Erro ao carregar lojas:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-sky-500 rounded-xl flex items-center justify-center text-xl">
              ⚙️
            </div>
            <div>
              <h1 className="font-bold text-lg">Admin Dashboard</h1>
              <p className="text-xs text-slate-400">VitrineFast - Painel de Controle</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/change-password"
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition text-sm"
            >
              Alterar Senha
            </Link>
            <button
              onClick={loadStores}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition text-sm"
            >
              Atualizar
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition text-sm"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
          <p className="text-sm text-slate-400">Usuário autenticado:</p>
          <p className="text-lg font-bold text-sky-400">{session?.user?.email}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-3xl font-bold text-slate-50">{stats.total}</p>
            <p className="text-sm text-slate-400">Total de Lojas</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <p className="text-3xl font-bold text-emerald-400">{stats.active}</p>
            <p className="text-sm text-slate-400">Ativas</p>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <p className="text-3xl font-bold text-yellow-400">{stats.draft}</p>
            <p className="text-sm text-slate-400">Rascunhos</p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <p className="text-3xl font-bold text-purple-400">{stats.vip}</p>
            <p className="text-sm text-slate-400">VIP</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h2 className="font-bold text-lg">Todas as Lojas</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400">
              <div className="text-4xl mb-4">⏳</div>
              <p>Carregando lojas...</p>
            </div>
          ) : stores.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <div className="text-4xl mb-4">📭</div>
              <p>Nenhuma loja cadastrada ainda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Loja</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">URL</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Plano</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Criada em</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {stores.map((store) => (
                    <tr key={store.id} className="hover:bg-slate-800/50 transition">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-slate-50">{store.name}</p>
                          <p className="text-xs text-slate-400">{store.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <code className="text-xs text-sky-400 bg-sky-500/10 px-2 py-1 rounded">
                          /loja/{store.slug}
                        </code>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            store.status === 'ACTIVE'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : store.status === 'SUSPENDED'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}
                        >
                          {store.status === 'ACTIVE'
                            ? 'Ativa'
                            : store.status === 'SUSPENDED'
                            ? 'Suspensa'
                            : 'Rascunho'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`text-xs font-medium ${
                            store.plan === 'VIP' || store.plan === 'PREMIUM' ? 'text-purple-400' : 'text-slate-400'
                          }`}
                        >
                          {store.plan === 'VIP' ? 'VIP' : store.plan}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-400">
                        {formatDate(store.createdAt)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <a
                            href={`/loja/${store.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-sky-500/20 text-sky-400 rounded text-xs hover:bg-sky-500/30 transition"
                          >
                            Ver
                          </a>
                          <a
                            href={`/preview/${store.id}`}
                            className="px-3 py-1 bg-slate-700 text-slate-300 rounded text-xs hover:bg-slate-600 transition"
                          >
                            Editar
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-slate-500 space-y-3">
          <p>Dashboard seguro - Acesso restrito a administradores</p>

          <div className="pt-4 border-t border-slate-800 space-y-2">
            <p className="font-medium text-slate-400">Contato</p>
            <div className="flex items-center justify-center gap-2">
              <a href="mailto:canna.vendasonline@gmail.com" className="text-sky-400 hover:text-sky-300">
                canna.vendasonline@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
