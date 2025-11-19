'use client'

import React from 'react'
import { TimelineEvent } from '@/lib/dashboard'

interface TimelineProps {
  events: TimelineEvent[]
}

export default function Timeline({ events }: TimelineProps) {
  const getEventIcon = (type: string): string => {
    switch (type) {
      case 'PAGE_CREATED':
        return '✨'
      case 'PAGE_PUBLISHED':
        return '🚀'
      case 'PAGE_UPDATED':
        return '✏️'
      case 'PAGE_ARCHIVED':
        return '📦'
      default:
        return '📋'
    }
  }

  const getEventColor = (type: string): string => {
    switch (type) {
      case 'PAGE_CREATED':
        return 'bg-blue-500/20 text-blue-400'
      case 'PAGE_PUBLISHED':
        return 'bg-green-500/20 text-green-400'
      case 'PAGE_UPDATED':
        return 'bg-purple-500/20 text-purple-400'
      case 'PAGE_ARCHIVED':
        return 'bg-gray-500/20 text-gray-400'
      default:
        return 'bg-slate-500/20 text-slate-400'
    }
  }

  const formatDate = (date: Date): string => {
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'agora'
    if (diffMins < 60) return `${diffMins}m atrás`
    if (diffHours < 24) return `${diffHours}h atrás`
    if (diffDays < 7) return `${diffDays}d atrás`
    return d.toLocaleDateString('pt-BR')
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-700 p-6 shadow-lg">
      <h2 className="mb-6 text-xl font-bold text-white">Atividade Recente</h2>

      {events.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-slate-400">
          <p className="text-sm">Nenhuma atividade</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event, idx) => (
            <div key={event.id} className="flex gap-4">
              {/* Timeline line */}
              {idx !== events.length - 1 && (
                <div className="relative flex flex-col items-center">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${getEventColor(event.type)} text-lg`}>
                    {getEventIcon(event.type)}
                  </div>
                  <div className="mt-2 h-8 w-0.5 bg-slate-700"></div>
                </div>
              )}

              {idx === events.length - 1 && (
                <div className="flex items-center justify-center">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${getEventColor(event.type)} text-lg`}>
                    {getEventIcon(event.type)}
                  </div>
                </div>
              )}

              {/* Event content */}
              <div className="flex-1 pt-1">
                <p className="font-medium text-white">{event.title}</p>
                <p className="text-sm text-slate-400">{event.description}</p>
                <p className="mt-1 text-xs text-slate-500">{formatDate(event.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
