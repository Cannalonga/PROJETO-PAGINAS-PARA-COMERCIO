/**
 * useSeoScoreColors - Map SEO score to appropriate colors
 */

'use client';

import { useMemo } from 'react';
import { useTheme } from 'next-themes';

interface ScoreColorPalette {
  background: string;
  text: string;
  badge: string;
  progress: string;
  gradient: string;
  icon: string;
  status: string;
}

export function useSeoScoreColors(score: number): ScoreColorPalette {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return useMemo(() => {
    if (score >= 80) {
      // Excellent - Green
      return {
        background: isDark ? 'bg-emerald-950' : 'bg-emerald-50',
        text: isDark ? 'text-emerald-100' : 'text-emerald-900',
        badge: isDark ? 'bg-emerald-900 text-emerald-200' : 'bg-emerald-100 text-emerald-700',
        progress: 'from-green-500 to-green-600',
        gradient: isDark ? 'from-green-500 to-green-400' : 'from-green-600 to-green-500',
        icon: '🟢',
        status: 'Excelente',
      };
    } else if (score >= 60) {
      // Good - Yellow
      return {
        background: isDark ? 'bg-yellow-950' : 'bg-yellow-50',
        text: isDark ? 'text-yellow-100' : 'text-yellow-900',
        badge: isDark ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-700',
        progress: 'from-yellow-500 to-yellow-600',
        gradient: isDark ? 'from-yellow-500 to-yellow-400' : 'from-yellow-600 to-yellow-500',
        icon: '🟡',
        status: 'Bom',
      };
    } else if (score >= 40) {
      // Medium - Orange
      return {
        background: isDark ? 'bg-orange-950' : 'bg-orange-50',
        text: isDark ? 'text-orange-100' : 'text-orange-900',
        badge: isDark ? 'bg-orange-900 text-orange-200' : 'bg-orange-100 text-orange-700',
        progress: 'from-orange-500 to-orange-600',
        gradient: isDark ? 'from-orange-500 to-orange-400' : 'from-orange-600 to-orange-500',
        icon: '🟠',
        status: 'Médio',
      };
    } else {
      // Poor - Red
      return {
        background: isDark ? 'bg-red-950' : 'bg-red-50',
        text: isDark ? 'text-red-100' : 'text-red-900',
        badge: isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700',
        progress: 'from-red-500 to-red-600',
        gradient: isDark ? 'from-red-500 to-red-400' : 'from-red-600 to-red-500',
        icon: '🔴',
        status: 'Precisa Melhorar',
      };
    }
  }, [score, isDark]);
}

/**
 * Get individual color for a metric based on target range
 */
export function useMetricColor(
  value: number,
  minIdeal: number,
  maxIdeal: number,
): { status: 'good' | 'warning' | 'error'; color: string; icon: string } {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return useMemo(() => {
    if (value >= minIdeal && value <= maxIdeal) {
      return {
        status: 'good',
        color: isDark ? 'text-green-400' : 'text-green-600',
        icon: '✅',
      };
    } else if (value > maxIdeal) {
      return {
        status: 'warning',
        color: isDark ? 'text-yellow-400' : 'text-yellow-600',
        icon: '⚠️',
      };
    } else {
      return {
        status: 'error',
        color: isDark ? 'text-red-400' : 'text-red-600',
        icon: '❌',
      };
    }
  }, [value, minIdeal, maxIdeal, isDark]);
}

/**
 * Get progress bar color based on percentage
 */
export function useProgressBarColor(
  percentage: number,
): { bgColor: string; fillColor: string } {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return useMemo(() => {
    if (percentage >= 80) {
      return {
        bgColor: isDark ? 'bg-slate-700' : 'bg-slate-200',
        fillColor: 'bg-gradient-to-r from-green-500 to-green-600',
      };
    } else if (percentage >= 60) {
      return {
        bgColor: isDark ? 'bg-slate-700' : 'bg-slate-200',
        fillColor: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
      };
    } else if (percentage >= 40) {
      return {
        bgColor: isDark ? 'bg-slate-700' : 'bg-slate-200',
        fillColor: 'bg-gradient-to-r from-orange-500 to-orange-600',
      };
    } else {
      return {
        bgColor: isDark ? 'bg-slate-700' : 'bg-slate-200',
        fillColor: 'bg-gradient-to-r from-red-500 to-red-600',
      };
    }
  }, [percentage, isDark]);
}
