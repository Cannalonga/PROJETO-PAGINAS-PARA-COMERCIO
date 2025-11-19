import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema } from 'zod';

/**
 * API Response Envelope (Enterprise Pattern)
 * Todas as respostas API seguem este formato
 */
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: string;
  requestId: string;
}

/**
 * Request Context com metadata segura
 * Adicionado pelo middleware em x-* headers
 */
export interface RequestContext {
  userId?: string;
  userRole?: string;
  tenantId?: string;
  requestId: string;
  timestamp: number;
  ipAddress?: string;
}

/**
 * Helpers de Resposta
 */
export function successResponse<T>(
  data: T,
  message?: string,
  requestId?: string
): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    requestId: requestId || generateRequestId(),
  };
}

export function errorResponse(
  code: string,
  message: string,
  details?: Record<string, any>,
  requestId?: string
): ApiResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    timestamp: new Date().toISOString(),
    requestId: requestId || generateRequestId(),
  };
}

/**
 * Gera Request ID único para tracing
 */
export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Valida entrada com schema Zod
 * Retorna erro 400 se validação falhar
 */
export async function validateInput<T>(
  request: NextRequest,
  schema: ZodSchema
): Promise<{ valid: false; error: NextResponse } | { valid: true; data: T }> {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      const requestId = request.headers.get('x-request-id') || generateRequestId();
      
      return {
        valid: false,
        error: NextResponse.json(
          errorResponse(
            'VALIDATION_ERROR',
            'Input validation failed',
            {
              errors: parsed.error.flatten().fieldErrors,
            },
            requestId
          ),
          { status: 400 }
        ),
      };
    }

    return {
      valid: true,
      data: parsed.data as T,
    };
  } catch (error) {
    const requestId = request.headers.get('x-request-id') || generateRequestId();

    return {
      valid: false,
      error: NextResponse.json(
        errorResponse(
          'INVALID_JSON',
          'Request body must be valid JSON',
          undefined,
          requestId
        ),
        { status: 400 }
      ),
    };
  }
}

/**
 * Extrai contexto seguro da request
 */
export function extractContext(request: NextRequest): RequestContext {
  return {
    userId: request.headers.get('x-user-id') || undefined,
    userRole: request.headers.get('x-user-role') || undefined,
    tenantId: request.headers.get('x-tenant-id') || undefined,
    requestId: request.headers.get('x-request-id') || generateRequestId(),
    timestamp: Date.now(),
    ipAddress: getClientIp(request),
  };
}

/**
 * Extrai IP do cliente (suporta proxies)
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const direct = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (direct) {
    return direct;
  }

  // Fallback para socket IP se disponível
  return 'unknown';
}

/**
 * Handler seguro com tratamento de erro enterprise
 */
export async function safeHandler(
  handler: (req: NextRequest, ctx: RequestContext) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const requestId = generateRequestId();
    const context = extractContext(request);
    context.requestId = requestId;

    try {
      // Adiciona request ID ao header para logging
      const headers = new Headers(request.headers);
      headers.set('x-request-id', requestId);

      return await handler(
        new NextRequest(request, { headers }),
        context
      );
    } catch (error) {
      console.error(`[${requestId}] Unhandled error:`, error);

      return NextResponse.json(
        errorResponse(
          'INTERNAL_SERVER_ERROR',
          'An unexpected error occurred',
          process.env.NODE_ENV === 'development'
            ? { error: (error as any).message }
            : undefined,
          requestId
        ),
        { status: 500 }
      );
    }
  };
}

/**
 * Middleware de validação HTTP method
 */
export function allowMethods(...methods: string[]) {
  return (request: NextRequest) => {
    if (!methods.includes(request.method)) {
      const requestId = request.headers.get('x-request-id') || generateRequestId();

      return NextResponse.json(
        errorResponse(
          'METHOD_NOT_ALLOWED',
          `This endpoint only accepts: ${methods.join(', ')}`,
          undefined,
          requestId
        ),
        { status: 405, headers: { Allow: methods.join(', ') } }
      );
    }

    return undefined;
  };
}

/**
 * Middleware de autenticação obrigatória
 */
export function requireAuth(request: NextRequest): NextResponse | undefined {
  const userId = request.headers.get('x-user-id');
  
  if (!userId) {
    const requestId = request.headers.get('x-request-id') || generateRequestId();

    return NextResponse.json(
      errorResponse(
        'UNAUTHORIZED',
        'Authentication required',
        undefined,
        requestId
      ),
      { status: 401 }
    );
  }

  return undefined;
}

/**
 * Middleware de autorização por role
 */
export function requireRole(...allowedRoles: string[]) {
  return (request: NextRequest): NextResponse | undefined => {
    const userRole = request.headers.get('x-user-role');
    const requestId = request.headers.get('x-request-id') || generateRequestId();

    if (!userRole || !allowedRoles.includes(userRole)) {
      return NextResponse.json(
        errorResponse(
          'FORBIDDEN',
          `This action requires one of: ${allowedRoles.join(', ')}`,
          undefined,
          requestId
        ),
        { status: 403 }
      );
    }

    return undefined;
  };
}

/**
 * Middleware de isolamento de tenant (multi-tenancy)
 */
export function requireTenantIsolation(request: NextRequest): NextResponse | undefined {
  const tenantId = request.headers.get('x-tenant-id');
  const requestId = request.headers.get('x-request-id') || generateRequestId();

  if (!tenantId) {
    return NextResponse.json(
      errorResponse(
        'FORBIDDEN',
        'Tenant context is required',
        undefined,
        requestId
      ),
      { status: 403 }
    );
  }

  return undefined;
}
