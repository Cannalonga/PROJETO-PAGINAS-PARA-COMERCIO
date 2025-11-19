'use client'

import React, { useMemo } from 'react'
import {
  generateMetaTags,
  generateOpenGraph,
  generateTwitterCards,
  generateJsonLd,
} from '@/lib/seo-automation'

interface SeoPreviewProps {
  title: string
  description: string
  keywords: string[]
  imageUrl: string
  pageUrl: string
  businessName: string
  businessLogo?: string
}

export default function SeoPreview({
  title,
  description,
  keywords,
  imageUrl,
  pageUrl,
  businessName,
  businessLogo,
}: SeoPreviewProps) {
  // Generate all tags
  const metaTags = useMemo(() => generateMetaTags(title, description, keywords), [title, description, keywords])

  const ogTags = useMemo(
    () => generateOpenGraph(title, description, pageUrl, imageUrl, 'website', businessName),
    [title, description, pageUrl, imageUrl, businessName]
  )

  const twitterTags = useMemo(
    () => generateTwitterCards(title, description, imageUrl),
    [title, description, imageUrl]
  )

  const jsonLd = useMemo(
    () => generateJsonLd(title, description, pageUrl, imageUrl, businessName, businessLogo),
    [title, description, pageUrl, imageUrl, businessName, businessLogo]
  )

  return (
    <div className="space-y-6">
      {/* Google Search Preview */}
      <div className="rounded-xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-700 p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-bold text-white">🔍 Google Search Preview</h3>

        <div className="rounded-lg bg-white p-4">
          <p className="text-2xl font-bold text-blue-600">{metaTags.title}</p>
          <p className="text-sm text-green-700">{pageUrl}</p>
          <p className="mt-2 line-clamp-2 text-sm text-slate-700">{metaTags.description}</p>
        </div>

        <div className="mt-4 space-y-2 text-sm text-slate-400">
          <p>
            📏 Título: <span className="font-mono text-slate-300">{metaTags.title.length} caracteres</span>
          </p>
          <p>
            📝 Descrição: <span className="font-mono text-slate-300">{metaTags.description.length} caracteres</span>
          </p>
          <p>
            🏷️ Palavras-chave: <span className="font-mono text-slate-300">{metaTags.keywords.length}</span>
          </p>
        </div>
      </div>

      {/* Social Media Preview */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Facebook/LinkedIn Preview */}
        <div className="rounded-xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-700 p-6 shadow-lg">
          <h3 className="mb-4 text-lg font-bold text-white">📘 Facebook & LinkedIn Preview</h3>

          <div className="overflow-hidden rounded-lg border border-slate-600 bg-slate-900">
            <img src={imageUrl} alt="Preview" className="h-32 w-full object-cover" />
            <div className="p-4">
              <p className="line-clamp-1 font-bold text-white">{ogTags['og:title']}</p>
              <p className="line-clamp-2 text-sm text-slate-300">{ogTags['og:description']}</p>
              <p className="mt-2 text-xs text-slate-500">{pageUrl}</p>
            </div>
          </div>

          <div className="mt-4 space-y-1 text-xs text-slate-400">
            <p>Tipo: {ogTags['og:type']}</p>
            <p>Site: {ogTags['og:site_name']}</p>
          </div>
        </div>

        {/* Twitter Preview */}
        <div className="rounded-xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-700 p-6 shadow-lg">
          <h3 className="mb-4 text-lg font-bold text-white">🐦 Twitter Preview</h3>

          <div className="overflow-hidden rounded-lg border border-slate-600 bg-slate-900">
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-4">
              <p className="line-clamp-2 font-bold text-white">{twitterTags['twitter:title']}</p>
              <p className="line-clamp-2 text-sm text-blue-100">{twitterTags['twitter:description']}</p>
            </div>
            <img src={twitterTags['twitter:image']} alt="Preview" className="h-40 w-full object-cover" />
          </div>

          <div className="mt-4 space-y-1 text-xs text-slate-400">
            <p>Tipo: {twitterTags['twitter:card']}</p>
            <p>Site: {twitterTags['twitter:site']}</p>
          </div>
        </div>
      </div>

      {/* Schema.org JSON-LD */}
      <div className="rounded-xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-700 p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-bold text-white">⚙️ Schema.org JSON-LD</h3>

        <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-300">
          {JSON.stringify(jsonLd, null, 2)}
        </pre>

        <p className="mt-4 text-xs text-slate-400">
          ℹ️ Este schema ajuda mecanismos de busca a entender melhor seu conteúdo
        </p>
      </div>

      {/* Meta Tags Reference */}
      <div className="rounded-xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-700 p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-bold text-white">📋 Meta Tags no HTML</h3>

        <div className="space-y-3 font-mono text-xs">
          <div className="rounded bg-slate-900 p-3 text-slate-300">
            &lt;meta name="description" content="{metaTags.description}" /&gt;
          </div>
          <div className="rounded bg-slate-900 p-3 text-slate-300">
            &lt;meta name="keywords" content="{metaTags.keywords.join(', ')}" /&gt;
          </div>
          <div className="rounded bg-slate-900 p-3 text-slate-300">
            &lt;meta property="og:title" content="{ogTags['og:title']}" /&gt;
          </div>
          <div className="rounded bg-slate-900 p-3 text-slate-300">
            &lt;meta name="twitter:card" content="{twitterTags['twitter:card']}" /&gt;
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-400">✅ Copie estes meta tags para o &lt;head&gt; da sua página</p>
      </div>

      {/* Best Practices */}
      <div className="rounded-xl border border-green-700 bg-green-500/10 p-6">
        <h3 className="mb-3 text-lg font-bold text-green-400">✅ Boas Práticas de SEO</h3>

        <ul className="space-y-2 text-sm text-green-200">
          <li>✓ Título entre 30-60 caracteres: {metaTags.title.length >= 30 && metaTags.title.length <= 60 ? '✅' : '❌'}</li>
          <li>
            ✓ Descrição entre 120-160 caracteres:{' '}
            {metaTags.description.length >= 120 && metaTags.description.length <= 160 ? '✅' : '❌'}
          </li>
          <li>✓ Imagem de preview presente: {imageUrl ? '✅' : '❌'}</li>
          <li>✓ Palavras-chave definidas: {metaTags.keywords.length > 0 ? '✅' : '❌'}</li>
          <li>✓ URL válida: {pageUrl.startsWith('http') ? '✅' : '❌'}</li>
        </ul>
      </div>
    </div>
  )
}
