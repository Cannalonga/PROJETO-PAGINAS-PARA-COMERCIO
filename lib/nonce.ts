/**
 * Nonce Utility - Permite que Next.js execute scripts inline com CSP dinâmico
 * 
 * O nonce é gerado no middleware.ts e armazenado em X-Nonce header
 * Este arquivo fornece hooks para ler o nonce em Client/Server Components
 */

import { headers } from 'next/headers'

/**
 * Obter o nonce gerado pelo middleware para este request
 * Use em Server Components para passar para scripts inline
 */
export function getNonce(): string {
  const headersList = headers()
  return headersList.get('x-nonce') || ''
}
