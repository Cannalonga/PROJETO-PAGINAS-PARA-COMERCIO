import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Next.js Middleware para enforçar headers de segurança e isolamento multi-tenant
 * Executa antes de qualquer rota, adiciona headers HTTP e valida tenant context
 * 
 * ✅ PATCH: Dynamic nonce support para permitir scripts inline do Next.js
 * CSP usa nonce em vez de 'unsafe-inline' para máxima segurança
 */
export function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // ============================================================================
  // NONCE GENERATION - Unique nonce for each request (for script-src)
  // ============================================================================
  // Gera um nonce aleatório (64 caracteres base64) para uso em CSP
  // Permite que Next.js injete scripts inline com segurança
  const nonce = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64')

  // ============================================================================
  // 1. HSTS - Force HTTPS
  // ============================================================================
  res.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  )

  // ============================================================================
  // 2. Clickjacking Protection
  // ============================================================================
  res.headers.set('X-Frame-Options', 'DENY')

  // ============================================================================
  // 3. MIME-Type Sniffing Protection
  // ============================================================================
  res.headers.set('X-Content-Type-Options', 'nosniff')

  // ============================================================================
  // 4. Referrer Policy (privacy)
  // ============================================================================
  res.headers.set('Referrer-Policy', 'no-referrer')

  // ============================================================================
  // 5. CSP - Content Security Policy (stricto)
  // ✅ PATCH #6: Removed 'unsafe-inline' and 'unsafe-eval' for XSS protection
  // ✅ PATCH: Dynamic nonce permite scripts inline do Next.js com segurança
  // Ajuste conforme domínios reais: Stripe, Cloudinary, analytics, etc
  // ============================================================================
  const cspHeader = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://js.stripe.com https://cdn.jsdelivr.net`,
    "style-src 'self' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https:",
    "frame-src https://js.stripe.com",
    "object-src 'none'",
    "frame-ancestors 'none'",
  ].join('; ')

  res.headers.set('Content-Security-Policy', cspHeader)
  
  // ✅ Para Next.js ler o nonce: armazenar em custom header
  res.headers.set('X-Nonce', nonce)

  // ============================================================================
  // 6. Permissions Policy (Feature-Policy)
  // ============================================================================
  res.headers.set(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  )

  // ============================================================================
  // 7. X-Permitted-Cross-Domain-Policies (Adobe Flash protection)
  // ============================================================================
  res.headers.set('X-Permitted-Cross-Domain-Policies', 'none')

  // ============================================================================
  // 8. Multi-tenant: validar tenantId em rotas sensíveis
  // ============================================================================
  const pathname = req.nextUrl.pathname

  // Rotas que EXIGEM tenant context
  const tenantRequiredPaths = [
    '/api/pages',
    '/api/stores',
    '/api/templates',
    '/api/tenants',
    '/preview/',
    '/store/',
  ]

  const requiresTenant = tenantRequiredPaths.some(path =>
    pathname.startsWith(path)
  )

  if (requiresTenant) {
    // Verifica se tenantId está presente em header ou cookie
    const tenantId = req.headers.get('x-tenant-id') || 
                      req.cookies.get('tenantId')?.value

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant context required', code: 'TENANT_MISSING' },
        { status: 403 }
      )
    }

    // Valida formato (UUID v4)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(tenantId)) {
      return NextResponse.json(
        { error: 'Invalid tenant ID format', code: 'TENANT_INVALID' },
        { status: 400 }
      )
    }
  }

  return res
}

/**
 * Configurar quais rotas executam o middleware
 * matcher: aplica middleware apenas a essas rotas
 */
export const config = {
  matcher: [
    /*
     * Excluir:
     * - _next/static
     * - _next/image
     * - favicon.ico
     * - public files
     * - health checks
     */
    '/((?!_next/static|_next/image|favicon.ico|public|health).*)',
  ],
}
