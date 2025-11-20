'use client';

/**
 * FEATURE 7 — SEO AUTOMATION
 * BLOCO 4 — SEO DASHBOARD UI
 *
 * Componente principal do dashboard SEO
 * Exibe score, warnings, preview do Google e redes sociais
 *
 * @file src/components/seo-dashboard/SeoDashboard.tsx
 * @since 2025-11-19
 */

import React, { useState, useCallback } from 'react';
import { useTheme } from 'next-themes';
import SeoScoreCard from './SeoScoreCard';
import SeoWarnings from './SeoWarnings';
import SeoGooglePreview from './SeoGooglePreview';
import SeoSocialPreview from './SeoSocialPreview';
import { useSeoData } from '../hooks/useSeoData';
import { ChevronDown, RefreshCw, Sun, Moon } from 'lucide-react';

export interface SeoDashboardProps {
  pageId: string;
  onUpdate?: () => void;
  autoRefresh?: boolean;
  autoRefreshInterval?: number;
}

export default function SeoDashboard({
  pageId,
  onUpdate,
  autoRefresh = true,
  autoRefreshInterval = 30000, // 30s padrão
}: SeoDashboardProps) {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'score' | 'warnings' | 'google' | 'social' | 'jsonld'>('score');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Buscar dados SEO
  const { data, isLoading, error, refetch } = useSeoData(pageId, {
    autoRefresh,
    autoRefreshInterval,
  });

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      onUpdate?.();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, onUpdate]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Dark/Light paleta
  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-slate-950' : 'bg-white';
  const textColor = isDark ? 'text-slate-100' : 'text-slate-900';
  const borderColor = isDark ? 'border-slate-700' : 'border-slate-200';
  const cardBg = isDark ? 'bg-slate-900' : 'bg-slate-50';
  const tabActiveBg = isDark ? 'bg-blue-600' : 'bg-blue-500';
  const tabInactiveBg = isDark ? 'bg-slate-800' : 'bg-slate-200';

  if (isLoading && !data) {
    return (
      <div className={`w-full p-8 ${bgColor}`}>
        <div className="animate-pulse space-y-4">
          <div className={`h-12 ${cardBg} rounded-lg`}></div>
          <div className={`h-64 ${cardBg} rounded-lg`}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-full p-8 ${bgColor}`}>
        <div className={`p-4 rounded-lg border ${borderColor} bg-red-50 dark:bg-red-950`}>
          <p className="text-red-700 dark:text-red-200">
            Erro ao carregar dados SEO: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${bgColor} transition-colors duration-200`}>
      {/* Header */}
      <div className={`border-b ${borderColor} p-6`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className={`text-3xl font-bold ${textColor}`}>SEO Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Otimize seu conteúdo para Google
            </p>
          </div>

          <div className="flex gap-2">
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`p-2 rounded-lg transition-colors ${
                isRefreshing
                  ? 'opacity-50 cursor-not-allowed'
                  : isDark
                    ? 'hover:bg-slate-800'
                    : 'hover:bg-slate-100'
              }`}
              title="Atualizar dados"
            >
              <RefreshCw
                className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
              />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
              }`}
              title={`Mudar para ${theme === 'dark' ? 'claro' : 'escuro'}`}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
          {(['score', 'warnings', 'google', 'social', 'jsonld'] as const).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                  activeTab === tab
                    ? `border-blue-500 text-blue-600 dark:text-blue-400`
                    : `border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300`
                }`}
              >
                {tab === 'score' && '📊 Score'}
                {tab === 'warnings' && '⚠️ Recomendações'}
                {tab === 'google' && '🔍 Google Preview'}
                {tab === 'social' && '📱 Redes Sociais'}
                {tab === 'jsonld' && '📋 JSON-LD'}
              </button>
            )
          )}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'score' && data && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SeoScoreCard data={data} />
              <div className={`${cardBg} rounded-lg p-6 space-y-4`}>
                <h3 className={`font-semibold text-lg ${textColor}`}>
                  📈 Subscores
                </h3>
                <div className="space-y-3">
                  {data.subscores && Object.entries(data.subscores).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400 capitalize">
                        {key}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-300 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              (value as number) >= 80
                                ? 'bg-green-500'
                                : (value as number) >= 50
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                            }`}
                            style={{ width: `${value as number}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-8 text-right">
                          {value as number}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'warnings' && data && <SeoWarnings data={data} />}

          {activeTab === 'google' && data && <SeoGooglePreview data={data} />}

          {activeTab === 'social' && data && <SeoSocialPreview data={data} />}

          {activeTab === 'jsonld' && data && (
            <div className={`${cardBg} rounded-lg p-6`}>
              <h3 className={`font-semibold text-lg ${textColor} mb-4`}>
                Structured Data (JSON-LD)
              </h3>
              <pre className="bg-slate-800 text-slate-100 p-4 rounded overflow-x-auto text-sm">
                {JSON.stringify(data.jsonLd, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
