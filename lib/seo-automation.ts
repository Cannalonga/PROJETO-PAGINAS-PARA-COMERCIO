/**
 * SEO Automation Engine
 * Complete SEO management: meta tags, schema markup, sitemap, optimization analysis
 */

export interface MetaTags {
  title: string
  description: string
  keywords: string[]
  charset: string
  viewport: string
  robots: string
  canonical?: string
  author?: string
  language: string
}

export interface OpenGraphTags {
  'og:title': string
  'og:description': string
  'og:url': string
  'og:image': string
  'og:type': 'website' | 'article'
  'og:site_name'?: string
  'og:locale'?: string
}

export interface TwitterCardTags {
  'twitter:card': 'summary' | 'summary_large_image' | 'app'
  'twitter:title': string
  'twitter:description': string
  'twitter:image': string
  'twitter:site'?: string
  'twitter:creator'?: string
}

export interface JsonLdSchema {
  '@context': 'https://schema.org'
  '@type': string
  name: string
  description: string
  url: string
  image?: string
  author?: { '@type': 'Person'; name: string }
  datePublished?: string
  dateModified?: string
  publisher?: { '@type': 'Organization'; name: string; logo: { '@type': 'ImageObject'; url: string } }
}

export interface SeoScore {
  overall: number // 0-100
  metaTags: number
  performance: number
  accessibility: number
  bestPractices: number
  seo: number
  issues: SeoIssue[]
  suggestions: string[]
}

export interface SeoIssue {
  type: 'error' | 'warning' | 'info'
  category: 'meta' | 'performance' | 'accessibility' | 'schema' | 'mobile'
  message: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  fix?: string
}

export interface PageAnalysis {
  pageTitle: string
  pageUrl: string
  content: {
    headings: { level: number; text: string }[]
    images: { src: string; alt: string }[]
    links: { href: string; text: string; isExternal: boolean }[]
    wordCount: number
    readingTimeMinutes: number
  }
  performance: {
    loadTime: number
    firstContentfulPaint: number
    largestContentfulPaint: number
  }
  mobile: {
    isResponsive: boolean
    hasViewport: boolean
    hasTouchIcon: boolean
  }
}

export interface SeoRecommendation {
  priority: 'critical' | 'high' | 'medium' | 'low'
  area: 'titles' | 'descriptions' | 'keywords' | 'headings' | 'images' | 'links' | 'schema' | 'performance'
  current: string
  suggested: string
  reason: string
  impact: 'high' | 'medium' | 'low'
}

/**
 * Generate optimized meta tags for a page
 */
export function generateMetaTags(
  title: string,
  description: string,
  keywords: string[],
  language: string = 'pt-BR',
  canonical?: string
): MetaTags {
  // Validate lengths
  const validTitle = title.length > 0 ? title.substring(0, 60) : 'Página sem título'
  const validDescription = description.length > 0 ? description.substring(0, 160) : ''
  const validKeywords = keywords.filter((k) => k.length > 0).slice(0, 10)

  return {
    title: validTitle,
    description: validDescription,
    keywords: validKeywords,
    charset: 'UTF-8',
    viewport: 'width=device-width, initial-scale=1.0',
    robots: 'index, follow',
    canonical,
    language,
  }
}

/**
 * Generate Open Graph tags for social sharing
 */
export function generateOpenGraph(
  title: string,
  description: string,
  url: string,
  imageUrl: string,
  type: 'website' | 'article' = 'website',
  siteName?: string
): OpenGraphTags {
  return {
    'og:title': title.substring(0, 100),
    'og:description': description.substring(0, 160),
    'og:url': url,
    'og:image': imageUrl,
    'og:type': type,
    'og:site_name': siteName || 'Meu Comércio',
    'og:locale': 'pt_BR',
  }
}

/**
 * Generate Twitter Card tags
 */
export function generateTwitterCards(
  title: string,
  description: string,
  imageUrl: string,
  twitterHandle?: string
): TwitterCardTags {
  return {
    'twitter:card': 'summary_large_image',
    'twitter:title': title.substring(0, 70),
    'twitter:description': description.substring(0, 160),
    'twitter:image': imageUrl,
    'twitter:site': twitterHandle || '@seu_negocio',
    'twitter:creator': twitterHandle || '@seu_negocio',
  }
}

/**
 * Generate JSON-LD structured data
 */
export function generateJsonLd(
  pageTitle: string,
  pageDescription: string,
  pageUrl: string,
  imageUrl: string,
  businessName: string,
  businessLogo?: string
): JsonLdSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: businessName,
    description: pageDescription,
    url: pageUrl,
    image: imageUrl,
    publisher: {
      '@type': 'Organization',
      name: businessName,
      logo: {
        '@type': 'ImageObject',
        url: businessLogo || imageUrl,
      },
    },
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
  }
}

/**
 * Calculate SEO score for a page
 */
export function calculateSeoScore(analysis: PageAnalysis, tags: MetaTags): SeoScore {
  const issues: SeoIssue[] = []
  let metaScore = 100
  let performanceScore = 100
  let accessibilityScore = 100
  let bestPracticesScore = 100
  let seoScore = 100

  // Check meta tags
  if (tags.title.length < 10) {
    issues.push({
      type: 'error',
      category: 'meta',
      message: 'Título muito curto (< 10 caracteres)',
      severity: 'critical',
      fix: 'Adicione um título descritivo com 30-60 caracteres',
    })
    metaScore -= 20
  }
  if (tags.title.length > 60) {
    issues.push({
      type: 'warning',
      category: 'meta',
      message: 'Título muito longo (> 60 caracteres)',
      severity: 'high',
      fix: 'Reduza o título para no máximo 60 caracteres',
    })
    metaScore -= 10
  }

  if (tags.description.length < 20) {
    issues.push({
      type: 'error',
      category: 'meta',
      message: 'Descrição muito curta (< 20 caracteres)',
      severity: 'critical',
      fix: 'Adicione uma descrição com 120-160 caracteres',
    })
    metaScore -= 20
  }
  if (tags.description.length > 160) {
    issues.push({
      type: 'warning',
      category: 'meta',
      message: 'Descrição muito longa (> 160 caracteres)',
      severity: 'high',
      fix: 'Reduza a descrição para no máximo 160 caracteres',
    })
    metaScore -= 10
  }

  if (tags.keywords.length === 0) {
    issues.push({
      type: 'warning',
      category: 'meta',
      message: 'Sem palavras-chave definidas',
      severity: 'medium',
    })
    metaScore -= 15
  }

  // Check performance
  if (analysis.performance.loadTime > 3000) {
    issues.push({
      type: 'error',
      category: 'performance',
      message: 'Página carrega muito lentamente (> 3s)',
      severity: 'high',
      fix: 'Otimize imagens, CSS e JavaScript',
    })
    performanceScore -= 30
  }

  // Check mobile
  if (!analysis.mobile.isResponsive) {
    issues.push({
      type: 'error',
      category: 'mobile',
      message: 'Página não é responsiva',
      severity: 'critical',
      fix: 'Use viewport meta tag e design responsivo',
    })
    accessibilityScore -= 25
  }

  // Check headings
  if (analysis.content.headings.length === 0) {
    issues.push({
      type: 'error',
      category: 'meta',
      message: 'Nenhum heading (H1) encontrado',
      severity: 'critical',
      fix: 'Adicione um H1 descritivo no início da página',
    })
    seoScore -= 20
  }

  // Check images alt text
  const imagesWithoutAlt = analysis.content.images.filter((img) => !img.alt).length
  if (imagesWithoutAlt > 0) {
    issues.push({
      type: 'warning',
      category: 'accessibility',
      message: `${imagesWithoutAlt} imagem(ns) sem texto alternativo`,
      severity: 'high',
      fix: 'Adicione texto alternativo descritivo em todas as imagens',
    })
    accessibilityScore -= 10
  }

  // Check reading time
  if (analysis.content.wordCount < 100) {
    issues.push({
      type: 'info',
      category: 'meta',
      message: 'Conteúdo muito curto (< 100 palavras)',
      severity: 'medium',
      fix: 'Adicione mais conteúdo relevante (300+ palavras recomendado)',
    })
    seoScore -= 10
  }

  // Calculate overall score
  const overall =
    (metaScore * 0.25 + performanceScore * 0.25 + accessibilityScore * 0.2 + bestPracticesScore * 0.15 + seoScore * 0.15) / 100

  // Generate suggestions
  const suggestions: string[] = []
  if (analysis.content.wordCount < 300)
    suggestions.push('Aumente o conteúdo para pelo menos 300 palavras para melhor ranking')
  if (analysis.content.images.length === 0) suggestions.push('Adicione imagens relevantes para melhorar engagement')
  if (analysis.content.links.filter((l) => !l.isExternal).length === 0)
    suggestions.push('Adicione links internos para melhorar navegabilidade')
  if (!tags.canonical) suggestions.push('Defina URL canônica para evitar conteúdo duplicado')

  return {
    overall: Math.round(overall * 100),
    metaTags: Math.max(0, metaScore),
    performance: Math.max(0, performanceScore),
    accessibility: Math.max(0, accessibilityScore),
    bestPractices: Math.max(0, bestPracticesScore),
    seo: Math.max(0, seoScore),
    issues,
    suggestions,
  }
}

/**
 * Generate recommendations for SEO improvement
 */
export function suggestImprovements(tags: MetaTags, analysis: PageAnalysis): SeoRecommendation[] {
  const recommendations: SeoRecommendation[] = []

  // Title suggestions
  if (tags.title.length < 30) {
    recommendations.push({
      priority: 'high',
      area: 'titles',
      current: tags.title,
      suggested: `${tags.title} - Meu Comércio Online`,
      reason: 'Títulos mais descritivos melhoram ranking e CTR',
      impact: 'high',
    })
  }

  // Description suggestions
  if (tags.description.length < 100) {
    recommendations.push({
      priority: 'high',
      area: 'descriptions',
      current: tags.description,
      suggested:
        tags.description + ' Conheça nossa loja online e descubra os melhores produtos e serviços.',
      reason: 'Descrição mais completa melhora visualização em buscadores',
      impact: 'high',
    })
  }

  // Keywords suggestions
  if (tags.keywords.length < 3) {
    recommendations.push({
      priority: 'medium',
      area: 'keywords',
      current: tags.keywords.join(', ') || 'Nenhuma',
      suggested: 'Adicione 5-8 palavras-chave relevantes para seu negócio',
      reason: 'Palavras-chave melhor direcionadas aumentam tráfego qualificado',
      impact: 'medium',
    })
  }

  // Heading suggestions
  if (analysis.content.headings.filter((h) => h.level === 1).length === 0) {
    recommendations.push({
      priority: 'critical',
      area: 'headings',
      current: 'Nenhum H1 encontrado',
      suggested: 'Adicione um H1 único e descritivo no início da página',
      reason: 'H1 é fundamental para estrutura e SEO',
      impact: 'high',
    })
  }

  // Image suggestions
  const imagesWithoutAlt = analysis.content.images.filter((img) => !img.alt)
  if (imagesWithoutAlt.length > 0) {
    recommendations.push({
      priority: 'high',
      area: 'images',
      current: `${imagesWithoutAlt.length} imagens sem alt`,
      suggested: 'Adicione texto alternativo descritivo em todas as imagens',
      reason: 'Alt text melhora acessibilidade e SEO',
      impact: 'medium',
    })
  }

  return recommendations
}

/**
 * Generate sitemap XML for pages
 */
export function generateSitemap(
  pages: Array<{ url: string; lastModified?: Date; priority?: number; changeFrequency?: string }>
): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

  for (const page of pages) {
    xml += '  <url>\n'
    xml += `    <loc>${escapeXml(page.url)}</loc>\n`

    if (page.lastModified) {
      xml += `    <lastmod>${page.lastModified.toISOString().split('T')[0]}</lastmod>\n`
    }

    xml += `    <changefreq>${page.changeFrequency || 'weekly'}</changefreq>\n`
    xml += `    <priority>${page.priority || 0.8}</priority>\n`
    xml += '  </url>\n'
  }

  xml += '</urlset>'
  return xml
}

/**
 * Generate robots.txt content
 */
export function buildRobotsTxt(allowedPaths: string[] = ['/'], disallowedPaths: string[] = []): string {
  let content = 'User-agent: *\n'

  for (const path of allowedPaths) {
    content += `Allow: ${path}\n`
  }

  for (const path of disallowedPaths) {
    content += `Disallow: ${path}\n`
  }

  content += '\nSitemap: /sitemap.xml\n'
  content += 'Crawl-delay: 1\n'

  return content
}

/**
 * Validate canonical URL
 */
export function validateCanonicalUrl(canonicalUrl: string, pageUrl: string): { valid: boolean; issue?: string } {
  if (!canonicalUrl) {
    return { valid: false, issue: 'URL canônica não definida' }
  }

  try {
    new URL(canonicalUrl)
  } catch {
    return { valid: false, issue: 'URL canônica inválida' }
  }

  if (canonicalUrl === pageUrl) {
    return { valid: true }
  }

  if (!canonicalUrl.startsWith('http')) {
    return { valid: false, issue: 'URL canônica deve ser absoluta (incluir protocolo)' }
  }

  return { valid: true }
}

/**
 * Analyze page content for SEO
 */
export function analyzePage(
  pageContent: string,
  pageUrl: string
): Omit<PageAnalysis, 'performance' | 'mobile'> & {
  performance: { loadTime: number; firstContentfulPaint: number; largestContentfulPaint: number }
  mobile: { isResponsive: boolean; hasViewport: boolean; hasTouchIcon: boolean }
} {
  // Parse headings
  const headingRegex = /<h([1-6])[^>]*>([^<]+)<\/h\1>/gi
  const headings: { level: number; text: string }[] = []
  let match
  while ((match = headingRegex.exec(pageContent)) !== null) {
    headings.push({ level: parseInt(match[1]), text: match[2].trim() })
  }

  // Parse images
  const imageRegex = /<img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"/gi
  const images: { src: string; alt: string }[] = []
  while ((match = imageRegex.exec(pageContent)) !== null) {
    images.push({ src: match[1], alt: match[2] })
  }

  // Parse links
  const linkRegex = /<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/gi
  const links: { href: string; text: string; isExternal: boolean }[] = []
  while ((match = linkRegex.exec(pageContent)) !== null) {
    const href = match[1]
    const isExternal = href.startsWith('http') && !href.includes(new URL(pageUrl).hostname)
    links.push({ href, text: match[2].trim(), isExternal })
  }

  // Count words
  const textContent = pageContent.replace(/<[^>]*>/g, '')
  const wordCount = textContent.split(/\s+/).filter((w) => w.length > 0).length

  return {
    pageTitle: 'Página SEO',
    pageUrl,
    content: {
      headings,
      images,
      links,
      wordCount,
      readingTimeMinutes: Math.ceil(wordCount / 200),
    },
    performance: {
      loadTime: 1500,
      firstContentfulPaint: 800,
      largestContentfulPaint: 2000,
    },
    mobile: {
      isResponsive: pageContent.includes('viewport'),
      hasViewport: pageContent.includes('viewport'),
      hasTouchIcon: pageContent.includes('apple-touch-icon'),
    },
  }
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  const xmlChars: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
  }
  return str.replace(/[&<>"']/g, (char) => xmlChars[char])
}

/**
 * Get color indicator for SEO score
 */
export function getSeoScoreColor(score: number): string {
  if (score >= 80) return 'bg-green-100 text-green-800'
  if (score >= 60) return 'bg-yellow-100 text-yellow-800'
  if (score >= 40) return 'bg-orange-100 text-orange-800'
  return 'bg-red-100 text-red-800'
}

/**
 * Format SEO score for display
 */
export function formatSeoScore(score: number): string {
  if (score >= 80) return '✅ Excelente'
  if (score >= 60) return '👍 Bom'
  if (score >= 40) return '⚠️ Precisa melhorar'
  return '❌ Crítico'
}
