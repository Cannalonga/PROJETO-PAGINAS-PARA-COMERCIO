'use client';

/**
 * SeoGooglePreview - Como aparece no Google Search
 */

import React from 'react';
import { useTheme } from 'next-themes';

interface SeoGooglePreviewProps {
  data: any;
}

export default function SeoGooglePreview({ data }: SeoGooglePreviewProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const title = data.title || 'Título não informado';
  const description = data.description || 'Descrição não informada';
  const canonicalUrl = data.canonicalUrl || 'https://site.com/pagina';
  // const _slug = data.slug || 'pagina';

  // Truncar em limites recomendados
  const displayTitle = title.length > 60 ? `${title.substring(0, 57)}...` : title;
  const displayDescription = description.length > 155 ? `${description.substring(0, 152)}...` : description;

  // URL formatada
  const urlParts = canonicalUrl.split('/');
  const displayUrl = `${urlParts[0]}//${urlParts[2]}`;

  // Métricas de qualidade
  const metrics = {
    titleLength: { value: title.length, ideal: [30, 60], label: 'Título' },
    descriptionLength: {
      value: description.length,
      ideal: [120, 155],
      label: 'Descrição',
    },
  };

  const getMetricStatus = (value: number, ideal: [number, number]) => {
    if (value >= ideal[0] && value <= ideal[1]) return { status: '✅', color: 'text-green-600 dark:text-green-400' };
    if (value < ideal[0] || value > ideal[1]) return { status: '⚠️', color: 'text-yellow-600 dark:text-yellow-400' };
    return { status: '❌', color: 'text-red-600 dark:text-red-400' };
  };

  return (
    <div className="space-y-6">
      {/* SERP Preview */}
      <div
        className={`rounded-lg p-8 ${isDark ? 'bg-white text-black' : 'bg-white text-black'} border ${isDark ? 'border-slate-300' : 'border-slate-300'}`}
      >
        <p className="text-xs text-gray-600 mb-4 font-medium">SIMULAÇÃO DE BUSCA DO GOOGLE</p>

        <div className="space-y-2">
          {/* Title */}
          <a href="#" className="text-blue-600 hover:underline cursor-pointer text-xl">
            {displayTitle}
          </a>

          {/* URL */}
          <div className="text-green-700 text-sm">{displayUrl}</div>

          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed">{displayDescription}</p>
        </div>
      </div>

      {/* Metrics */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4`}>
        {Object.entries(metrics).map(([key, metric]) => {
          const status = getMetricStatus(
            (metric as any).value,
            (metric as any).ideal
          );
          const percentUsed = (
            ((metric as any).value / (metric as any).ideal[1]) *
            100
          ).toFixed(0);

          return (
            <div
              key={key}
              className={`rounded-lg p-4 ${isDark ? 'bg-slate-900' : 'bg-slate-50'} border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span
                  className={`font-medium ${isDark ? 'text-slate-100' : 'text-slate-900'}`}
                >
                  {(metric as any).label}
                </span>
                <span className={`font-bold ${status.color}`}>{status.status}</span>
              </div>

              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">
                  {(metric as any).value} caracteres
                </span>
                <span className="text-gray-500 dark:text-gray-500">
                  Ideal: {(metric as any).ideal[0]}-{(metric as any).ideal[1]}
                </span>
              </div>

              <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    (metric as any).value >= (metric as any).ideal[0] &&
                    (metric as any).value <= (metric as any).ideal[1]
                      ? 'bg-green-500'
                      : (metric as any).value < (metric as any).ideal[0]
                        ? 'bg-red-500'
                        : 'bg-yellow-500'
                  }`}
                  style={{
                    width: `${Math.min(parseInt(percentUsed), 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tips */}
      <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-950' : 'bg-blue-50'} border ${isDark ? 'border-blue-800' : 'border-blue-200'}`}>
        <p className={`text-sm font-medium ${isDark ? 'text-blue-200' : 'text-blue-800'} mb-2`}>
          💡 Dicas para melhorar:
        </p>
        <ul className={`text-sm space-y-1 ${isDark ? 'text-blue-100' : 'text-blue-700'}`}>
          <li>
            ✓ Títulos entre 30-60 caracteres aparecem completos no Google
          </li>
          <li>
            ✓ Descrições entre 120-155 caracteres têm melhor CTR
          </li>
          <li>
            ✓ Inclua palavras-chave principais em ambos
          </li>
          <li>
            ✓ Seja claro e específico, não genérico
          </li>
        </ul>
      </div>
    </div>
  );
}
