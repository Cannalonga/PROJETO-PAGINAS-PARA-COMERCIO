'use client'

import React, { useMemo } from 'react'
import { PageMetrics, filterPagesByStatus, sortPagesByMetric, getStatusColor, calculateConversionRate } from '@/lib/dashboard'

interface PagesListProps {
  pages: PageMetrics[]
  statusFilter: 'ALL' | 'PUBLISHED' | 'DRAFT' | 'ARCHIVED'
  sortBy: 'views' | 'conversions' | 'engagement' | 'recent'
  onStatusFilterChange: (status: 'ALL' | 'PUBLISHED' | 'DRAFT' | 'ARCHIVED') => void
  onSortByChange: (sort: 'views' | 'conversions' | 'engagement' | 'recent') => void
}

export default function PagesList({
  pages,
  statusFilter,
  sortBy,
  onStatusFilterChange,
  onSortByChange,
}: PagesListProps) {
  // Filter and sort pages
  const filteredPages = useMemo(() => {
    const filtered = filterPagesByStatus(pages, statusFilter)
    return sortPagesByMetric(filtered, sortBy, 50)
  }, [pages, statusFilter, sortBy])

  return (
    <div className="rounded-xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-700 p-6 shadow-lg">
      {/* Header */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h2 className="text-xl font-bold text-white">Páginas</h2>

        <div className="flex gap-3">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as any)}
            className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-600"
          >
            <option value="ALL">Todos os Status</option>
            <option value="PUBLISHED">Publicadas</option>
            <option value="DRAFT">Rascunho</option>
            <option value="ARCHIVED">Arquivadas</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as any)}
            className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-600"
          >
            <option value="recent">Mais Recentes</option>
            <option value="views">Mais Visualizações</option>
            <option value="conversions">Mais Conversões</option>
            <option value="engagement">Mais Engajamento</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      {filteredPages.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-slate-400">
          <p>Nenhuma página encontrada</p>
        </div>
      ) : (
        /* Table */
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="px-4 py-3 text-left font-semibold text-slate-300">Nome</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-300">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-300">Visualizações</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-300">Conversões</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-300">Taxa</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-300">Engajamento</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-300">Atualizado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredPages.map((page) => (
                <tr
                  key={page.id}
                  className="transition-colors hover:bg-slate-700/50"
                >
                  {/* Name */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-lg">
                        📄
                      </div>
                      <div>
                        <p className="font-medium text-white">{page.name}</p>
                        <p className="text-xs text-slate-400">{page.id}</p>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(page.status)}`}>
                      {page.status === 'PUBLISHED' && '🟢 Publicada'}
                      {page.status === 'DRAFT' && '🟡 Rascunho'}
                      {page.status === 'ARCHIVED' && '⚫ Arquivada'}
                    </span>
                  </td>

                  {/* Views */}
                  <td className="px-4 py-4 text-right">
                    <p className="font-medium text-white">{page.views.toLocaleString()}</p>
                  </td>

                  {/* Conversions */}
                  <td className="px-4 py-4 text-right">
                    <p className="font-medium text-green-400">{page.conversions.toLocaleString()}</p>
                  </td>

                  {/* Conversion Rate */}
                  <td className="px-4 py-4 text-right">
                    <p className="font-medium text-blue-400">
                      {calculateConversionRate(page.views, page.conversions)}%
                    </p>
                  </td>

                  {/* Engagement */}
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-2 w-24 rounded-full bg-slate-700">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                          style={{ width: `${Math.min(page.engagement * 2, 100)}%` }}
                        ></div>
                      </div>
                      <p className="w-8 text-right font-medium text-slate-300">{page.engagement}</p>
                    </div>
                  </td>

                  {/* Updated */}
                  <td className="px-4 py-4 text-left text-slate-400">
                    {new Date(page.updatedAt).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
        <p>{filteredPages.length} de {pages.length} página(s)</p>
        <p>Última atualização: {new Date().toLocaleTimeString('pt-BR')}</p>
      </div>
    </div>
  )
}
