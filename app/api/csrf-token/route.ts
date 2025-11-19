import { NextRequest, NextResponse } from "next/server";
import { handleCsrfTokenRequest } from "@/lib/csrf";

/**
 * GET /api/csrf-token
 * 
 * Frontend deve chamar isso na inicialização:
 * 
 * ```typescript
 * // hooks/useCsrfToken.ts
 * export function useCsrfToken() {
 *   const [token, setToken] = useState<string | null>(null);
 * 
 *   useEffect(() => {
 *     fetch('/api/csrf-token')
 *       .then(r => r.json())
 *       .then(data => setToken(data.csrfToken));
 *   }, []);
 * 
 *   return token;
 * }
 * ```
 * 
 * Ao fazer POST/PUT/DELETE:
 * 
 * ```typescript
 * const headers = {
 *   'Content-Type': 'application/json',
 *   'x-csrf-token': csrfToken, // Inclui token no header
 * };
 * 
 * fetch('/api/tenants', {
 *   method: 'POST',
 *   headers,
 *   body: JSON.stringify(data),
 * });
 * ```
 */

export async function GET(request: NextRequest) {
  try {
    return await handleCsrfTokenRequest(request);
  } catch (error) {
    console.error("[CSRF-TOKEN-ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CSRF_TOKEN_GENERATION_FAILED",
          message: "Failed to generate CSRF token",
        },
      },
      { status: 500 }
    );
  }
}
