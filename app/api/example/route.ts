/**
 * EXEMPLO INTEGRADO — app/api/example/route.ts
 *
 * Demonstra P1 completo:
 * ✅ Correlation ID
 * ✅ Logging estruturado
 * ✅ Error tracking (Sentry)
 * ✅ Rate limiting
 *
 * Stack: withCorrelationId → withLogger → withSentry → withRateLimit
 *
 * Teste:
 * ```bash
 * curl -X POST http://localhost:3000/api/example \
 *   -H "Content-Type: application/json" \
 *   -H "x-tenant-id: tenant-123" \
 *   -d '{"name": "Test"}'
 * ```
 *
 * Response:
 * ```json
 * {
 *   "success": true,
 *   "correlationId": "uuid-here",
 *   "data": { "id": "...", "name": "Test" }
 * }
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import { withCorrelationId, composeMiddleware } from '@/middleware/with-correlation-id';
import { withLogger } from '@/middleware/with-logger';
import { withSentry } from '@/middleware/with-sentry';
import { withRateLimit } from '@/middleware/with-rate-limit';
import { getRequestContext } from '@/lib/request-context';
import { createContextLogger } from '@/lib/logger';

/**
 * Handler do negócio: lógica específica da aplicação
 */
async function handler(req: NextRequest): Promise<Response> {
  const ctx = getRequestContext();
  
  // Se não houver contexto, algo deu muito errado
  if (!ctx) {
    return NextResponse.json(
      { error: 'Request context not initialized' },
      { status: 500 }
    );
  }

  const log = createContextLogger(ctx);

  // Log: handler iniciado
  log.info({ method: req.method, path: req.nextUrl.pathname }, 'Handler started');

  switch (req.method) {
    case 'GET':
      return await handleGet(req, ctx, log);
    case 'POST':
      return await handlePost(req, ctx, log);
    case 'PUT':
      return await handlePut(req, ctx, log);
    case 'DELETE':
      return await handleDelete(req, ctx, log);
    default:
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
      );
  }
}

/**
 * GET /api/example — Listar items
 */
async function handleGet(
  _req: NextRequest,
  ctx: any,
  log: any
): Promise<Response> {
  log.info({ tenantId: ctx.tenantId }, 'Fetching items');

  // Simular operação com delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  const items = [
    { id: '1', name: 'Item 1', tenantId: ctx.tenantId },
    { id: '2', name: 'Item 2', tenantId: ctx.tenantId },
  ];

  log.info({ count: items.length }, 'Items fetched');

  return NextResponse.json({
    success: true,
    correlationId: ctx.correlationId,
    data: items,
  });
}

/**
 * POST /api/example — Criar novo item
 */
async function handlePost(
  req: NextRequest,
  ctx: any,
  log: any
): Promise<Response> {
  let body: any;

  try {
    body = await req.json();
  } catch (err) {
    log.warn({ error: 'Invalid JSON' }, 'Request body parse failed');
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400 }
    );
  }

  // Validação
  if (!body.name) {
    log.warn({ body }, 'Missing required field: name');
    return NextResponse.json(
      { error: 'Missing required field: name' },
      { status: 400 }
    );
  }

  log.info(
    { name: body.name, tenantId: ctx.tenantId },
    'Creating new item'
  );

  // Simular criação
  const newItem = {
    id: Math.random().toString(36).substring(7),
    name: body.name,
    tenantId: ctx.tenantId,
    createdAt: new Date().toISOString(),
  };

  log.info(
    { itemId: newItem.id, name: newItem.name },
    'Item created successfully'
  );

  return NextResponse.json(
    {
      success: true,
      correlationId: ctx.correlationId,
      data: newItem,
    },
    { status: 201 }
  );
}

/**
 * PUT /api/example — Atualizar item
 */
async function handlePut(
  req: NextRequest,
  ctx: any,
  log: any
): Promise<Response> {
  const itemId = req.nextUrl.searchParams.get('id');

  if (!itemId) {
    log.warn({}, 'Missing item ID in query');
    return NextResponse.json(
      { error: 'Missing item ID' },
      { status: 400 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400 }
    );
  }

  log.info(
    { itemId, name: body.name },
    'Updating item'
  );

  // Simular atualização
  const updatedItem = {
    id: itemId,
    name: body.name,
    tenantId: ctx.tenantId,
    updatedAt: new Date().toISOString(),
  };

  log.info({ itemId }, 'Item updated successfully');

  return NextResponse.json({
    success: true,
    correlationId: ctx.correlationId,
    data: updatedItem,
  });
}

/**
 * DELETE /api/example — Deletar item
 */
async function handleDelete(
  req: NextRequest,
  ctx: any,
  log: any
): Promise<Response> {
  const itemId = req.nextUrl.searchParams.get('id');

  if (!itemId) {
    log.warn({}, 'Missing item ID in query');
    return NextResponse.json(
      { error: 'Missing item ID' },
      { status: 400 }
    );
  }

  log.info({ itemId }, 'Deleting item');

  // Simular deleção
  await new Promise((resolve) => setTimeout(resolve, 50));

  log.info({ itemId }, 'Item deleted successfully');

  return NextResponse.json({
    success: true,
    correlationId: ctx.correlationId,
    message: `Item ${itemId} deleted`,
  });
}

/**
 * STACK COMPLETO DE MIDDLEWARE
 *
 * Ordem (innermost first):
 * 1. withCorrelationId — Inicializa contexto
 * 2. withLogger — Loga requests/responses
 * 3. withSentry — Captura erros
 * 4. withRateLimit — Aplica rate limiting
 * 5. handler — Lógica da aplicação
 */
const stackedHandler = composeMiddleware(
  handler,
  withRateLimit,
  withSentry,
  withLogger,
  withCorrelationId
);

export const GET = stackedHandler;
export const POST = stackedHandler;
export const PUT = stackedHandler;
export const DELETE = stackedHandler;
