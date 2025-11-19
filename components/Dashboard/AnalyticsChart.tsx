'use client'

import React from 'react'
import { AnalyticsPoint } from '@/lib/dashboard'

interface AnalyticsChartProps {
  data: AnalyticsPoint[]
}

export default function AnalyticsChart({ data }: AnalyticsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-700 p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-white">Análise de Tráfego (30 dias)</h2>
        <div className="flex h-64 items-center justify-center text-slate-400">
          <p>Nenhum dado disponível</p>
        </div>
      </div>
    )
  }

  // Find max values for scaling
  const maxViews = Math.max(...data.map((d) => d.views), 1)
  const maxConversions = Math.max(...data.map((d) => d.conversions), 1)

  return (
    <div className="rounded-xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-700 p-6 shadow-lg">
      <h2 className="mb-6 text-xl font-bold text-white">Análise de Tráfego (30 dias)</h2>

      {/* Chart Container */}
      <div className="space-y-6">
        {/* Views Chart */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Visualizações</span>
            <span className="text-sm font-bold text-purple-400">
              {Math.round(data.reduce((sum, d) => sum + d.views, 0) / data.length)} média
            </span>
          </div>
          <div className="flex h-12 items-end gap-0.5">
            {data.map((point, idx) => (
              <div
                key={idx}
                className="group relative flex-1 rounded-t bg-purple-500/30 hover:bg-purple-500/50"
                style={{
                  height: `${(point.views / maxViews) * 100}%`,
                  minHeight: '2px',
                }}
                title={`${point.date}: ${point.views} views`}
              >
                <div className="invisible absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transform whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-xs text-white group-hover:visible">
                  {point.views}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversions Chart */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Conversões</span>
            <span className="text-sm font-bold text-green-400">
              {Math.round(data.reduce((sum, d) => sum + d.conversions, 0) / data.length)} média
            </span>
          </div>
          <div className="flex h-12 items-end gap-0.5">
            {data.map((point, idx) => (
              <div
                key={idx}
                className="group relative flex-1 rounded-t bg-green-500/30 hover:bg-green-500/50"
                style={{
                  height: `${(point.conversions / maxConversions) * 100 + 5}%`,
                  minHeight: '2px',
                }}
                title={`${point.date}: ${point.conversions} conversions`}
              >
                <div className="invisible absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transform whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-xs text-white group-hover:visible">
                  {point.conversions}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Engagement Chart */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Engajamento</span>
            <span className="text-sm font-bold text-blue-400">
              {(data.reduce((sum, d) => sum + d.engagement, 0) / data.length).toFixed(2)} média
            </span>
          </div>
          <div className="flex h-12 items-end gap-0.5">
            {data.map((point, idx) => (
              <div
                key={idx}
                className="group relative flex-1 rounded-t bg-blue-500/30 hover:bg-blue-500/50"
                style={{
                  height: `${(point.engagement / 100) * 100}%`,
                  minHeight: '2px',
                }}
                title={`${point.date}: ${point.engagement.toFixed(2)} engagement`}
              >
                <div className="invisible absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transform whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-xs text-white group-hover:visible">
                  {point.engagement.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Date Range */}
      <div className="mt-6 flex items-center justify-between">
        <span className="text-xs text-slate-500">{data[0]?.date}</span>
        <span className="text-xs text-slate-400">Últimos 30 dias</span>
        <span className="text-xs text-slate-500">{data[data.length - 1]?.date}</span>
      </div>
    </div>
  )
}
