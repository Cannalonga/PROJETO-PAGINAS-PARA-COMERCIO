'use client'

import React, { useEffect, useState } from 'react'
import { DashboardStats, PageMetrics, AnalyticsPoint, TimelineEvent } from '@/lib/dashboard'
import StatsCards from './StatsCards.tsx'
import AnalyticsChart from './AnalyticsChart.tsx'
import PagesList from './PagesList.tsx'
import Timeline from './Timeline.tsx'

interface DashboardProps {
  tenantId: string
  initialStats?: DashboardStats
}

export default function Dashboard({ tenantId, initialStats }: DashboardProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Data states
  const [stats, setStats] = useState<DashboardStats | null>(initialStats || null)
  const [pages, setPages] = useState<PageMetrics[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsPoint[]>([])
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])

  // Filter states
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT' | 'ARCHIVED'>('ALL')
  const [sortBy, setSortBy] = useState<'views' | 'conversions' | 'engagement' | 'recent'>('recent')

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch stats
        const statsRes = await fetch(`/api/dashboard/stats?tenantId=${tenantId}`)
        if (!statsRes.ok) throw new Error('Failed to fetch stats')
        const statsData = await statsRes.json()
        setStats(statsData.data)

        // Fetch pages
        const pagesRes = await fetch(`/api/dashboard/pages?tenantId=${tenantId}&limit=100`)
        if (!pagesRes.ok) throw new Error('Failed to fetch pages')
        const pagesData = await pagesRes.json()
        setPages(pagesData.data)

        // Fetch analytics
        const analyticsRes = await fetch(`/api/dashboard/analytics?tenantId=${tenantId}&days=30`)
        if (!analyticsRes.ok) throw new Error('Failed to fetch analytics')
        const analyticsData = await analyticsRes.json()
        setAnalytics(analyticsData.data)

        // Fetch timeline
        const timelineRes = await fetch(`/api/dashboard/timeline?tenantId=${tenantId}&limit=10`)
        if (!timelineRes.ok) throw new Error('Failed to fetch timeline')
        const timelineData = await timelineRes.json()
        setTimeline(timelineData.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()

    // Refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [tenantId])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-blue-500"></div>
          <p className="text-lg font-medium text-slate-200">Carregando Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Dashboard</h1>
          <p className="mt-2 text-slate-400">Bem-vindo ao seu painel de controle de páginas</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            <p className="font-medium">Erro ao carregar dados: {error}</p>
          </div>
        )}

        {/* Stats Cards */}
        {stats && <StatsCards stats={stats} />}

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Analytics Chart (2 columns) */}
          <div className="lg:col-span-2">
            <AnalyticsChart data={analytics} />
          </div>

          {/* Timeline (1 column) */}
          <div>
            <Timeline events={timeline} />
          </div>
        </div>

        {/* Pages List */}
        <div className="mt-6">
          <PagesList
            pages={pages}
            statusFilter={statusFilter}
            sortBy={sortBy}
            onStatusFilterChange={setStatusFilter}
            onSortByChange={setSortBy}
          />
        </div>
      </div>
    </div>
  )
}
