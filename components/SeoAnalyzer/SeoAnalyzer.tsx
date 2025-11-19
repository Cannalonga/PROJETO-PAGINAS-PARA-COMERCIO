'use client'

import React, { useState } from 'react'
import {
  SeoScore,
  SeoIssue,
  generateMetaTags,
  calculateSeoScore,
  suggestImprovements,
  formatSeoScore,
  getSeoScoreColor,
  PageAnalysis,
  SeoRecommendation,
  analyzePage,
} from '@/lib/seo-automation'

interface SeoAnalyzerProps {
  pageTitle: string
  pageDescription: string
  keywords: string[]
  pageContent: string
  pageUrl: string
  onAnalysisComplete?: (score: SeoScore) => void
}

export default function SeoAnalyzer({
  pageTitle,
  pageDescription,
  keywords,
  pageContent,
  pageUrl,
  onAnalysisComplete,
}: SeoAnalyzerProps) {
  const [loading, setLoading] = useState(false)
  const [score, setScore] = useState<SeoScore | null>(null)
  const [recommendations, setRecommendations] = useState<SeoRecommendation[]>([])
  const [activeTab, setActiveTab] = useState<'issues' | 'suggestions' | 'recommendations'>('issues')

  const handleAnalyze = async () => {
    try {
      setLoading(true)

      // Generate meta tags
      const metaTags = generateMetaTags(pageTitle, pageDescription, keywords)

      // Analyze page
      const analysis = analyzePage(pageContent, pageUrl)

      // Calculate score
      const seoScore = calculateSeoScore(analysis as PageAnalysis, metaTags)
      setScore(seoScore)

      // Get recommendations
      const recs = suggestImprovements(metaTags, analysis as PageAnalysis)
      setRecommendations(recs)

      onAnalysisComplete?.(seoScore)
    } catch (error) {
      console.error('Error analyzing SEO:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-700 p-6 shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Análise SEO</h2>
        <p className="mt-2 text-slate-400">Analise e otimize a página para mecanismos de busca</p>
      </div>

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="mb-6 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-3 font-medium text-white transition-all hover:from-blue-700 hover:to-blue-600 disabled:opacity-50"
      >
        {loading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            Analisando...
          </>
        ) : (
          <>🔍 Analisar Página</>
        )}
      </button>

      {/* Score Display */}
      {score && (
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="rounded-lg bg-slate-700/50 p-6">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Pontuação Geral</p>
                <p className={`mt-2 text-4xl font-bold ${getSeoScoreColor(score.overall).split(' ')[1]}`}>
                  {score.overall}
                </p>
              </div>
              <p className={`rounded-full px-4 py-2 font-medium ${getSeoScoreColor(score.overall)}`}>
                {formatSeoScore(score.overall)}
              </p>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              <div className="text-center">
                <p className="text-sm text-slate-400">Meta Tags</p>
                <p className="mt-1 text-lg font-bold text-white">{score.metaTags}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-400">Performance</p>
                <p className="mt-1 text-lg font-bold text-white">{score.performance}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-400">Acessibilidade</p>
                <p className="mt-1 text-lg font-bold text-white">{score.accessibility}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-400">Boas Práticas</p>
                <p className="mt-1 text-lg font-bold text-white">{score.bestPractices}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-400">SEO</p>
                <p className="mt-1 text-lg font-bold text-white">{score.seo}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-600">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('issues')}
                className={`px-4 py-3 font-medium transition-colors ${
                  activeTab === 'issues'
                    ? 'border-b-2 border-blue-500 text-blue-400'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                ⚠️ Problemas ({score.issues.length})
              </button>
              <button
                onClick={() => setActiveTab('suggestions')}
                className={`px-4 py-3 font-medium transition-colors ${
                  activeTab === 'suggestions'
                    ? 'border-b-2 border-blue-500 text-blue-400'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                💡 Sugestões ({score.suggestions.length})
              </button>
              <button
                onClick={() => setActiveTab('recommendations')}
                className={`px-4 py-3 font-medium transition-colors ${
                  activeTab === 'recommendations'
                    ? 'border-b-2 border-blue-500 text-blue-400'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                📋 Recomendações ({recommendations.length})
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-3">
            {activeTab === 'issues' && (
              <>
                {score.issues.length === 0 ? (
                  <p className="text-center text-slate-400">✅ Nenhum problema encontrado!</p>
                ) : (
                  score.issues.map((issue, idx) => (
                    <IssueCard key={idx} issue={issue} />
                  ))
                )}
              </>
            )}

            {activeTab === 'suggestions' && (
              <>
                {score.suggestions.length === 0 ? (
                  <p className="text-center text-slate-400">✅ Sem sugestões adicionais</p>
                ) : (
                  score.suggestions.map((suggestion, idx) => (
                    <div key={idx} className="rounded-lg border border-yellow-700 bg-yellow-500/10 p-4">
                      <p className="text-sm text-yellow-200">💡 {suggestion}</p>
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'recommendations' && (
              <>
                {recommendations.length === 0 ? (
                  <p className="text-center text-slate-400">✅ Sem recomendações</p>
                ) : (
                  recommendations.map((rec, idx) => (
                    <RecommendationCard key={idx} recommendation={rec} />
                  ))
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Issue Card Component
 */
function IssueCard({ issue }: { issue: SeoIssue }) {
  const colors = {
    error: 'border-red-700 bg-red-500/10',
    warning: 'border-yellow-700 bg-yellow-500/10',
    info: 'border-blue-700 bg-blue-500/10',
  }

  const icons = {
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  }

  return (
    <div className={`rounded-lg border p-4 ${colors[issue.type]}`}>
      <div className="flex gap-3">
        <div className="text-xl">{icons[issue.type]}</div>
        <div className="flex-1">
          <p className="font-medium text-white">{issue.message}</p>
          <p className="mt-1 text-xs text-slate-300">Categoria: {issue.category}</p>
          {issue.fix && <p className="mt-2 text-sm text-slate-200">💡 {issue.fix}</p>}
        </div>
      </div>
    </div>
  )
}

/**
 * Recommendation Card Component
 */
function RecommendationCard({ recommendation }: { recommendation: SeoRecommendation }) {
  const priorityColors = {
    critical: 'border-red-700 bg-red-500/10',
    high: 'border-orange-700 bg-orange-500/10',
    medium: 'border-yellow-700 bg-yellow-500/10',
    low: 'border-blue-700 bg-blue-500/10',
  }

  return (
    <div className={`rounded-lg border p-4 ${priorityColors[recommendation.priority]}`}>
      <div className="mb-3 flex items-center justify-between">
        <p className="font-medium text-white">{recommendation.area}</p>
        <span className="text-xs font-bold text-slate-300">{recommendation.priority.toUpperCase()}</span>
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <p className="text-slate-400">Atual:</p>
          <p className="mt-1 font-mono text-slate-200">{recommendation.current}</p>
        </div>
        <div>
          <p className="text-slate-400">Sugerido:</p>
          <p className="mt-1 font-mono text-slate-200">{recommendation.suggested}</p>
        </div>
        <p className="mt-2 italic text-slate-300">💭 {recommendation.reason}</p>
      </div>
    </div>
  )
}
