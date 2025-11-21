/**
 * Design System - Color Palette
 * Inspired by modern SaaS apps (Vercel, Stripe, Linear)
 */

export const colors = {
  // Primary - Modern Blue (Premium & Trust)
  primary: {
    50: '#f0f7ff',
    100: '#e0efff',
    200: '#bae6ff',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Primary
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c3d66',
  },

  // Accent - Vibrant Green (Action & Success)
  accent: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Accent
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#145231',
  },

  // Neutral - Modern Gray Scale
  neutral: {
    0: '#ffffff',
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Semantic Colors
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#0ea5e9',

  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
    accent: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
    dark: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
  },
}

export type ColorKey = keyof typeof colors
