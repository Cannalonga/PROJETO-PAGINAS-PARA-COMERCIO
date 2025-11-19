'use client';

/**
 * SeoSocialPreview - Como aparece em redes sociais
 */

import React, { useState } from 'react';
import { useTheme } from 'next-themes';

interface SeoSocialPreviewProps {
  data: any;
}

export default function SeoSocialPreview({ data }: SeoSocialPreviewProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activePlatform, setActivePlatform] = useState<'whatsapp' | 'instagram' | 'facebook' | 'twitter'>('whatsapp');

  const ogTitle = data.openGraphTitle || data.title || 'Título';
  const ogDescription = data.openGraphDescription || data.description || 'Descrição';
  const ogImage = data.openGraphImage || data.image || '/placeholder-og.png';

  const platforms = {
    whatsapp: {
      label: '💬 WhatsApp',
      width: 'w-80',
      preview: (
        <div className="bg-gray-900 rounded-lg p-4 space-y-3">
          <div className="bg-gray-800 rounded p-3 space-y-2 max-w-xs">
            <img
              src={ogImage}
              alt="Preview"
              className="w-full rounded h-32 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-og.png';
              }}
            />
            <p className="text-white text-sm font-semibold line-clamp-2">{ogTitle}</p>
            <p className="text-gray-300 text-xs line-clamp-2">{ogDescription}</p>
          </div>
        </div>
      ),
    },
    instagram: {
      label: '📷 Instagram',
      width: 'w-80',
      preview: (
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <img
            src={ogImage}
            alt="Preview"
            className="w-full h-80 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-og.png';
            }}
          />
          <div className="p-4 space-y-2">
            <p className="text-white font-semibold text-sm">{ogTitle}</p>
            <p className="text-gray-300 text-xs">{ogDescription}</p>
            <div className="flex gap-2 text-gray-400 text-xs">
              <span>❤️ 1.2K</span>
              <span>💬 45</span>
            </div>
          </div>
        </div>
      ),
    },
    facebook: {
      label: '👍 Facebook',
      width: 'w-96',
      preview: (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="p-3 border-b border-gray-700">
            <p className="text-white text-xs font-semibold">Seu Negócio</p>
            <p className="text-gray-400 text-xs">5 min atrás</p>
          </div>
          <img
            src={ogImage}
            alt="Preview"
            className="w-full h-40 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-og.png';
            }}
          />
          <div className="p-3 space-y-2">
            <a href="#" className="text-blue-400 text-sm font-semibold hover:underline line-clamp-2">
              {ogTitle}
            </a>
            <p className="text-gray-300 text-xs line-clamp-2">{ogDescription}</p>
          </div>
          <div className="px-3 py-2 border-t border-gray-700 flex gap-4 text-xs text-gray-400">
            <span>👍 Like</span>
            <span>💬 Comment</span>
            <span>↗️ Share</span>
          </div>
        </div>
      ),
    },
    twitter: {
      label: '𝕏 Twitter/X',
      width: 'w-96',
      preview: (
        <div className="bg-black rounded-lg border border-gray-700 p-4 space-y-3">
          <div className="flex gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-500"></div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Seu Negócio</p>
              <p className="text-gray-500 text-xs">@seunegocio • now</p>
            </div>
          </div>

          <div className="border border-gray-700 rounded-lg overflow-hidden">
            <img
              src={ogImage}
              alt="Preview"
              className="w-full h-40 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-og.png';
              }}
            />
            <div className="p-3 bg-gray-950 space-y-1">
              <p className="text-gray-500 text-xs font-semibold">{data.domain || 'site.com'}</p>
              <p className="text-white font-semibold text-sm line-clamp-2">{ogTitle}</p>
              <p className="text-gray-400 text-xs line-clamp-2">{ogDescription}</p>
            </div>
          </div>

          <div className="flex gap-8 text-gray-500 text-sm">
            <span>♥️ 234</span>
            <span>🔁 567</span>
            <span>💬 89</span>
          </div>
        </div>
      ),
    },
  };

  const currentPlatform = platforms[activePlatform];

  return (
    <div className="space-y-6">
      {/* Platform Selector */}
      <div className="flex gap-2 flex-wrap">
        {(Object.keys(platforms) as Array<keyof typeof platforms>).map((key) => (
          <button
            key={key}
            onClick={() => setActivePlatform(key)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activePlatform === key
                ? `bg-blue-600 text-white`
                : `${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'} hover:${isDark ? 'bg-slate-700' : 'bg-slate-300'}`
            }`}
          >
            {platforms[key].label}
          </button>
        ))}
      </div>

      {/* Preview */}
      <div className={`rounded-lg p-8 ${isDark ? 'bg-slate-900' : 'bg-slate-50'} flex justify-center`}>
        {currentPlatform.preview}
      </div>

      {/* OG Tags Info */}
      <div className={`rounded-lg p-6 space-y-4 ${isDark ? 'bg-slate-900' : 'bg-slate-50'} border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
        <h3 className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
          📋 Tags de Redes Sociais
        </h3>

        <div className="space-y-3">
          <div className="p-3 bg-gray-800 rounded font-mono text-xs text-gray-200 overflow-x-auto">
            &lt;meta property="og:title" content="{ogTitle}" /&gt;
          </div>
          <div className="p-3 bg-gray-800 rounded font-mono text-xs text-gray-200 overflow-x-auto">
            &lt;meta property="og:description" content="{ogDescription}" /&gt;
          </div>
          <div className="p-3 bg-gray-800 rounded font-mono text-xs text-gray-200 overflow-x-auto">
            &lt;meta property="og:image" content="{ogImage}" /&gt;
          </div>
        </div>

        <div className={`p-3 rounded ${isDark ? 'bg-green-950 border border-green-800' : 'bg-green-50 border border-green-200'}`}>
          <p className={`text-sm ${isDark ? 'text-green-200' : 'text-green-700'}`}>
            ✅ Tags Open Graph estão configuradas. Redes sociais renderizarão corretamente.
          </p>
        </div>
      </div>

      {/* Tips */}
      <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-950' : 'bg-blue-50'} border ${isDark ? 'border-blue-800' : 'border-blue-200'}`}>
        <p className={`text-sm font-medium ${isDark ? 'text-blue-200' : 'text-blue-800'} mb-2`}>
          💡 Dicas para melhor compartilhamento:
        </p>
        <ul className={`text-sm space-y-1 ${isDark ? 'text-blue-100' : 'text-blue-700'}`}>
          <li>✓ Use imagem 1200x630px para máxima qualidade</li>
          <li>✓ Mantenha título e descrição concisos</li>
          <li>✓ Teste com o compartilhador de cada rede social</li>
          <li>✓ Imagens com pessoas aumentam engajamento</li>
        </ul>
      </div>
    </div>
  );
}
