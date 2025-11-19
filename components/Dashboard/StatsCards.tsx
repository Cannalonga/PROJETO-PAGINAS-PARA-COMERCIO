'use client'

import React from 'react'
import { DashboardStats, formatNumber, getGrowthIndicator } from '@/lib/dashboard'

interface StatsCardsProps {
  stats: DashboardStats
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const growthIndicator = getGrowthIndicator(stats.monthlyGrowth)

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Pages Card */}
      <div className="rounded-xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-700 p-6 shadow-lg transition-all hover:shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">Total de Páginas</p>
            <p className="mt-2 text-3xl font-bold text-white">{stats.totalPages}</p>
          </div>
          <div className="rounded-lg bg-blue-500/20 p-3 text-2xl">📄</div>
        </div>
      </div>

      {/* Total Views Card */}
      <div className="rounded-xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-700 p-6 shadow-lg transition-all hover:shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">Visualizações</p>
            <p className="mt-2 text-3xl font-bold text-white">{formatNumber(stats.totalViews)}</p>
          </div>
          <div className="rounded-lg bg-purple-500/20 p-3 text-2xl">👁️</div>
        </div>
      </div>

      {/* Total Conversions Card */}
      <div className="rounded-xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-700 p-6 shadow-lg transition-all hover:shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">Conversões</p>
            <p className="mt-2 text-3xl font-bold text-white">{formatNumber(stats.totalConversions)}</p>
          </div>
          <div className="rounded-lg bg-green-500/20 p-3 text-2xl">✅</div>
        </div>
      </div>

      {/* Monthly Growth Card */}
      <div className="rounded-xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-700 p-6 shadow-lg transition-all hover:shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">Crescimento Mensal</p>
            <p className={`mt-2 text-3xl font-bold ${growthIndicator.color}`}>
              {stats.monthlyGrowth > 0 ? '+' : ''}
              {stats.monthlyGrowth}%
            </p>
          </div>
          <div className="rounded-lg bg-orange-500/20 p-3 text-2xl">
            {growthIndicator.direction === 'UP' ? '📈' : growthIndicator.direction === 'DOWN' ? '📉' : '→'}
          </div>
        </div>
      </div>
    </div>
  )
}
