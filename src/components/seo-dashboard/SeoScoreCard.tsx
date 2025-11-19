'use client';

/**
 * SeoScoreCard - Exibe score visual com gauge
 */

import React from 'react';
import { useTheme } from 'next-themes';

interface SeoScoreCardProps {
  data: any;
}

export default function SeoScoreCard({ data }: SeoScoreCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const score = data.score || 0;
  const schemaScore = data.schemaScore || 0;

  // Cor baseada no score
  const getScoreColor = (value: number) => {
    if (value >= 80) return 'from-green-500 to-green-600';
    if (value >= 50) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  // Badge de status
  const getScoreLabel = (value: number) => {
    if (value >= 90) return { label: '🟢 Excelente', color: 'text-green-600 dark:text-green-400' };
    if (value >= 75) return { label: '🟡 Bom', color: 'text-yellow-600 dark:text-yellow-400' };
    if (value >= 50) return { label: '🟠 Médio', color: 'text-orange-600 dark:text-orange-400' };
    return { label: '🔴 Precisa Melhorar', color: 'text-red-600 dark:text-red-400' };
  };

  const scoreLabel = getScoreLabel(score);
  const schemaLabel = getScoreLabel(schemaScore);

  return (
    <div className={`rounded-lg p-8 ${isDark ? 'bg-slate-900' : 'bg-slate-50'} space-y-6`}>
      {/* Score Principal */}
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative w-48 h-48">
          {/* Gauge Background */}
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={isDark ? '#334155' : '#e2e8f0'}
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#scoreGradient)"
              strokeWidth="8"
              strokeDasharray={`${(score / 100) * 283} 283`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={getScoreColor(score).split(' ')[0].replace('from-', '')} />
                <stop offset="100%" stopColor={getScoreColor(score).split(' ')[1].replace('to-', '')} />
              </linearGradient>
            </defs>
          </svg>

          {/* Score Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-5xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {score}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">/ 100</span>
          </div>
        </div>

        <div className={`text-center ${scoreLabel.color} font-semibold text-lg`}>
          {scoreLabel.label}
        </div>
      </div>

      {/* Schema Score */}
      <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-white'} border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
        <div className="flex justify-between items-center mb-2">
          <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Schema (JSON-LD)
          </h4>
          <span className={schemaLabel.color}>{schemaLabel.label}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-300 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 bg-gradient-to-r ${getScoreColor(schemaScore)}`}
              style={{ width: `${schemaScore}%` }}
            ></div>
          </div>
          <span className="font-bold text-lg w-12 text-right">{schemaScore}%</span>
        </div>
      </div>

      {/* Summary */}
      <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-950' : 'bg-blue-50'} border ${isDark ? 'border-blue-800' : 'border-blue-200'}`}>
        <p className={`text-sm ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
          💡 Seu conteúdo está <strong>
            {score >= 80 ? 'pronto para Google Rich Results!' : 'precisando de ajustes. Veja as recomendações abaixo.'}
          </strong>
        </p>
      </div>
    </div>
  );
}
