import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { errorResponse } from '@/utils/helpers';

/**
 * Rate Limiting Store (in-memory)
 * In production, use Redis
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Middleware: Authentication
 * Validates JWT token and attaches user to request
 */
export async function withAuth(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        errorResponse('Não autenticado'),
        { status: 401 }
      );
    }

    // Store session in request headers for downstream access
    const headers = new Headers(request.headers);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session.user as any;
    headers.set('x-user-id', user.id || '');
    headers.set('x-user-role', user.role || '');
    headers.set('x-tenant-id', user.tenantId || '');

    return NextResponse.next({
      request: { headers },
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      errorResponse('Erro ao validar autenticação'),
      { status: 500 }
    );
  }
}

/**
 * Middleware: Role-Based Access Control
 * Validates user role matches allowed roles
 */
export function withRole(allowedRoles: string[]) {
  return async (request: NextRequest) => {
    try {
      const userRole = request.headers.get('x-user-role');
      
      if (!userRole || !allowedRoles.includes(userRole)) {
        return NextResponse.json(
          errorResponse('Acesso não autorizado'),
          { status: 403 }
        );
      }

      return NextResponse.next();
    } catch (error) {
      console.error('RBAC middleware error:', error);
      return NextResponse.json(
        errorResponse('Erro ao validar permissões'),
        { status: 500 }
      );
    }
  };
}

/**
 * Middleware: IDOR Prevention + Tenant Scoping
 * CRITICAL: Validates user can only access their tenant's data
 * Never trust client-provided tenantId - use session tenantId only
 */
export function withTenantIsolation(request: NextRequest) {
  try {
    const userTenantId = request.headers.get('x-tenant-id');
    const userRole = request.headers.get('x-user-role');
    
    // Must have tenant context
    if (!userTenantId || userTenantId === 'null' || userTenantId === 'undefined') {
      return NextResponse.json(
        errorResponse('Tenant context missing - IDOR violation detected'),
        { status: 403 }
      );
    }
    
    // SUPERADMIN can access all tenants
    if (userRole === 'SUPERADMIN') {
      return NextResponse.next();
    }

    // Extract tenantId from request (URL param or body)
    const { searchParams } = new URL(request.url);
    const urlTenantId = searchParams.get('tenantId');
    
    // CRITICAL: If client explicitly provides different tenantId, REJECT (IDOR)
    if (urlTenantId && urlTenantId !== userTenantId) {
      console.warn(`[SECURITY] IDOR attempt detected: user=${request.headers.get('x-user-id')} tried to access tenantId=${urlTenantId} but owns=${userTenantId}`);
      return NextResponse.json(
        errorResponse('Access denied - tenant mismatch'),
        { status: 403 }
      );
    }

    // Force tenantId in headers for downstream use
    const headers = new Headers(request.headers);
    headers.set('x-tenant-id-validated', 'true');

    return NextResponse.next({
      request: { headers },
    });
  } catch (error) {
    console.error('Tenant isolation middleware error:', error);
    return NextResponse.json(
      errorResponse('Tenant validation failed'),
      { status: 500 }
    );
  }
}

/**
 * Helper: Enforce strict tenant-scoping in endpoint handlers
 * Use this pattern in EVERY endpoint to ensure IDOR prevention
 */
export function getTenantIdFromSession(request: NextRequest): string {
  const tenantId = request.headers.get('x-tenant-id');
  const validated = request.headers.get('x-tenant-id-validated');
  
  if (!tenantId || !validated) {
    throw new Error('Tenant not properly validated - middleware must run first');
  }
  
  return tenantId;
}

/**
 * Middleware: Rate Limiting
 * Simple in-memory rate limiter (5 attempts per 15 minutes)
 * For production, use Redis
 */
export function withRateLimit(
  maxRequests: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
) {
  return (request: NextRequest) => {
    try {
      const identifier = request.headers.get('x-forwarded-for') || 'unknown';
      const now = Date.now();
      
      const record = rateLimitStore.get(identifier);
      
      // Initialize or reset if window expired
      if (!record || now > record.resetTime) {
        rateLimitStore.set(identifier, {
          count: 1,
          resetTime: now + windowMs,
        });
        return NextResponse.next();
      }
      
      // Increment counter
      if (record.count >= maxRequests) {
        return NextResponse.json(
          errorResponse('Muitas tentativas. Tente novamente mais tarde.', 'RATE_LIMIT_EXCEEDED'),
          { 
            status: 429,
            headers: {
              'Retry-After': String(Math.ceil((record.resetTime - now) / 1000)),
            },
          }
        );
      }
      
      record.count++;
      return NextResponse.next();
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      return NextResponse.next(); // Don't block on errors
    }
  };
}

/**
 * Middleware: Input Sanitization
 * Validates and sanitizes request data
 */
export async function withValidation<T>(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: any
): Promise<{ valid: boolean; data?: T; response?: NextResponse }> {
  try {
    let data;
    
    if (request.method === 'GET') {
      data = Object.fromEntries(new URL(request.url).searchParams);
    } else {
      data = await request.json();
    }
    
    const parsed = schema.safeParse(data);
    
    if (!parsed.success) {
      return {
        valid: false,
        response: NextResponse.json(
          errorResponse('Validação falhou'),
          { status: 400 }
        ),
      };
    }
    
    return {
      valid: true,
      data: parsed.data,
    };
  } catch (error) {
    console.error('Validation middleware error:', error);
    return {
      valid: false,
      response: NextResponse.json(
        errorResponse('Erro ao processar requisição'),
        { status: 400 }
      ),
    };
  }
}

/**
 * Helper: Compose multiple middlewares
 */
export function compose(...middlewares: Array<(req: NextRequest) => NextResponse | Promise<NextResponse>>) {
  return async (request: NextRequest) => {
    for (const middleware of middlewares) {
      const response = await middleware(request);
      if (response.status !== 200) {
        return response;
      }
    }
    return NextResponse.next();
  };
}
