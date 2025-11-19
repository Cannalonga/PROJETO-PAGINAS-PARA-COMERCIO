import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

/**
 * CSRF PROTECTION — Double Submit Cookie Pattern
 * 
 * Fluxo:
 * 1. Frontend faz GET /api/csrf-token
 * 2. Backend gera token, envia em cookie + resposta JSON
 * 3. Frontend armazena em memory + inclui em header x-csrf-token
 * 4. Backend valida: cookie === header
 * 
 * Segurança:
 * - Cookie é HttpOnly=false (frontend consegue ler)
 * - Cookie é Secure (HTTPS em prod)
 * - Cookie é SameSite=Strict (não envia em cross-site)
 * - Token é aleatório 256-bit
 */

/**
 * Gera novo token CSRF seguro
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Define cookie CSRF na resposta
 */
export function setCsrfTokenCookie(
  response: NextResponse,
  token: string,
  secure: boolean = true
): void {
  response.cookies.set("csrf_token", token, {
    httpOnly: false, // ← Frontend precisa ler para enviar no header
    secure: secure, // true em prod, false em dev local
    sameSite: "strict", // Não envia em cross-site requests
    path: "/",
    maxAge: 3600, // 1 hora
  });
}

/**
 * Extrai token do cookie
 */
export function getCsrfTokenFromCookie(request: NextRequest): string | null {
  return request.cookies.get("csrf_token")?.value || null;
}

/**
 * Extrai token do header
 */
export function getCsrfTokenFromHeader(request: NextRequest): string | null {
  return request.headers.get("x-csrf-token");
}

/**
 * Valida se tokens combinam
 */
export function validateCsrfToken(
  tokenFromCookie: string | null,
  tokenFromHeader: string | null
): boolean {
  if (!tokenFromCookie || !tokenFromHeader) {
    return false;
  }

  // Constante-time comparison para evitar timing attacks
  return (
    crypto.timingSafeEqual(
      Buffer.from(tokenFromCookie),
      Buffer.from(tokenFromHeader)
    ) || false
  );
}

/**
 * Middleware CSRF — Valida token em rotas sensíveis
 * 
 * Uso em rota:
 * ```
 * export async function POST(req: NextRequest) {
 *   const csrfError = verifyCsrfToken(req);
 *   if (csrfError) return csrfError;
 *   // lógica...
 * }
 * ```
 */
export function verifyCsrfToken(request: NextRequest): NextResponse | null {
  // Só aplica em métodos que modificam estado
  const methodsToProtect = ["POST", "PUT", "PATCH", "DELETE"];
  if (!methodsToProtect.includes(request.method)) {
    return null; // GET não precisa
  }

  const tokenFromCookie = getCsrfTokenFromCookie(request);
  const tokenFromHeader = getCsrfTokenFromHeader(request);

  if (!validateCsrfToken(tokenFromCookie, tokenFromHeader)) {
    console.warn(
      `[CSRF FAIL] Method: ${request.method}, Path: ${request.nextUrl.pathname}`
    );

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CSRF_TOKEN_INVALID",
          message: "Invalid CSRF token",
        },
      },
      { status: 403 }
    );
  }

  return null; // Validação passou
}

/**
 * Exemplo de rota que fornece CSRF token
 * 
 * GET /api/csrf-token
 * 
 * Chamada do frontend:
 * const res = await fetch('/api/csrf-token');
 * const { csrfToken } = await res.json();
 * // Store csrfToken em state/context
 */
export async function handleCsrfTokenRequest(
  _req: NextRequest
): Promise<NextResponse> {
  const token = generateCsrfToken();
  const response = NextResponse.json(
    {
      success: true,
      csrfToken: token,
    },
    { status: 200 }
  );

  // Determina se deve usar secure baseado em NODE_ENV
  const isProduction = process.env.NODE_ENV === "production";
  setCsrfTokenCookie(response, token, isProduction);

  return response;
}

/**
 * Middleware global para CSRF (aplicar em middleware.ts)
 * 
 * Valida CSRF em TODAS as rotas POST/PUT/DELETE
 * EXCETO:
 * - /api/auth/* (login não precisa ter CSRF)
 * - /api/public/* (APIs públicas opcionalmente)
 * 
 * Nota: Implementar com cuidado pois afeta toda app
 */
export function createCsrfMiddleware() {
  return (request: NextRequest) => {
    // Skip CSRF para rotas não-sensíveis
    const nonCsrfPaths = [
      "/api/auth/login",
      "/api/auth/register",
      "/api/auth/reset-password",
      "/api/health",
      "/api/csrf-token",
    ];

    const pathname = request.nextUrl.pathname;
    if (nonCsrfPaths.some((path) => pathname.startsWith(path))) {
      return null; // Pula CSRF
    }

    // Aplica CSRF validation
    return verifyCsrfToken(request);
  };
}
