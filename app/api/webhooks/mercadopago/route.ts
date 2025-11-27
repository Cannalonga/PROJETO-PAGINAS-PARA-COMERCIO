import { NextRequest, NextResponse } from 'next/server';
import { getPaymentInfo } from '@/lib/mercadopago';
import { updateStore, getStoreById } from '@/lib/store-db';
import crypto from 'crypto';

// ============================================================
// 🔐 SEGURANÇA: Validação de assinatura do webhook
// ============================================================

function validateWebhookSignature(
  requestId: string | null,
  timestamp: string | null,
  signature: string | null,
  rawBody: string
): boolean {
  const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  
  // Em desenvolvimento, permitir sem validação se não tiver secret
  if (!webhookSecret) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[SECURITY] ⚠️ MERCADOPAGO_WEBHOOK_SECRET não configurado - ignorando validação em dev');
      return true;
    }
    console.error('[SECURITY] ❌ MERCADOPAGO_WEBHOOK_SECRET não configurado em produção!');
    return false;
  }

  if (!requestId || !timestamp || !signature) {
    console.error('[SECURITY] ❌ Headers de assinatura faltando');
    return false;
  }

  try {
    // Extrair ts e v1 da assinatura (formato: ts=xxx,v1=yyy)
    const signatureParts = signature.split(',').reduce((acc, part) => {
      const [key, value] = part.split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    const ts = signatureParts['ts'];
    const v1 = signatureParts['v1'];

    if (!ts || !v1) {
      console.error('[SECURITY] ❌ Formato de assinatura inválido');
      return false;
    }

    // Construir payload assinado
    const signedPayload = `id:${requestId};request-id:${requestId};ts:${ts};${rawBody}`;
    
    // Calcular HMAC SHA256
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(signedPayload)
      .digest('hex');

    // Comparar assinaturas de forma segura (timing-safe)
    const isValid = crypto.timingSafeEqual(
      Buffer.from(v1),
      Buffer.from(expectedSignature)
    );

    if (!isValid) {
      console.error('[SECURITY] ❌ Assinatura do webhook inválida');
    }

    return isValid;
  } catch (error) {
    console.error('[SECURITY] ❌ Erro ao validar assinatura:', error);
    return false;
  }
}

// ============================================================
// 🔐 SEGURANÇA: Verificação de idempotência
// ============================================================

// Cache de webhooks processados (em produção usar Redis)
const processedWebhooks = new Map<string, number>();
const WEBHOOK_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas

function isWebhookAlreadyProcessed(webhookId: string): boolean {
  const processedAt = processedWebhooks.get(webhookId);
  if (processedAt) {
    // Limpar entradas antigas
    if (Date.now() - processedAt > WEBHOOK_CACHE_TTL) {
      processedWebhooks.delete(webhookId);
      return false;
    }
    return true;
  }
  return false;
}

function markWebhookAsProcessed(webhookId: string): void {
  processedWebhooks.set(webhookId, Date.now());
  
  // Limpar cache antigo periodicamente
  if (processedWebhooks.size > 10000) {
    const now = Date.now();
    for (const [id, timestamp] of processedWebhooks.entries()) {
      if (now - timestamp > WEBHOOK_CACHE_TTL) {
        processedWebhooks.delete(id);
      }
    }
  }
}

// ============================================================
// Webhook para receber notificações do Mercado Pago
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // 🔐 Extrair headers de segurança
    const signature = request.headers.get('x-signature');
    const requestId = request.headers.get('x-request-id');
    const timestamp = request.headers.get('x-signature-timestamp');

    // Ler body como texto para validação de assinatura
    const rawBody = await request.text();
    
    // 🔐 Validar assinatura do webhook
    if (!validateWebhookSignature(requestId, timestamp, signature, rawBody)) {
      console.error('[SECURITY] Webhook com assinatura inválida rejeitado');
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    // 🔐 Verificar idempotência (evitar processamento duplicado)
    const webhookId = requestId || `mp_${Date.now()}`;
    if (isWebhookAlreadyProcessed(webhookId)) {
      console.log(`[WEBHOOK] Webhook ${webhookId} já processado, ignorando`);
      return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
    }

    // Parse do body
    const body = JSON.parse(rawBody);
    
    // Log seguro (sem dados sensíveis)
    console.log('[WEBHOOK] Mercado Pago recebido:', {
      type: body.type,
      action: body.action,
      dataId: body.data?.id,
      timestamp: new Date().toISOString(),
    });

    // O Mercado Pago envia diferentes tipos de notificação
    const { type, data } = body;

    // Processar apenas notificações de pagamento
    if (type === 'payment' && data?.id) {
      const paymentId = data.id.toString();
      
      // Buscar informações completas do pagamento
      const payment = await getPaymentInfo(paymentId);
      
      // Log seguro (sem metadata ou dados sensíveis)
      console.log('[WEBHOOK] Pagamento processado:', {
        paymentId: payment.id,
        status: payment.status,
        tenantRef: payment.external_reference,
      });

      // Verificar se o pagamento foi aprovado
      if (payment.status === 'approved') {
        const storeId = payment.external_reference;
        
        if (storeId) {
          // Marcar webhook como processado ANTES de atualizar
          markWebhookAsProcessed(webhookId);
          
          // Verificar se a loja existe
          const store = await getStoreById(storeId);
          
          if (store) {
            // Atualizar status da loja para ACTIVE usando store-db
            await updateStore(storeId, {
              status: 'ACTIVE',
              plan: 'PREMIUM',
            });

            console.log(`[WEBHOOK] ✅ Loja ${storeId} ativada com sucesso!`);
          } else {
            console.error(`[WEBHOOK] ❌ Loja ${storeId} não encontrada`);
          }
        }
      } else if (payment.status === 'pending') {
        console.log(`[WEBHOOK] ⏳ Pagamento pendente: ${payment.external_reference}`);
      } else if (payment.status === 'rejected') {
        console.log(`[WEBHOOK] ❌ Pagamento rejeitado: ${payment.external_reference}`);
      }
    }

    // Responder 200 OK para o Mercado Pago
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('[WEBHOOK] Erro ao processar:', error instanceof Error ? error.message : 'Unknown error');
    // Retornar 200 mesmo com erro para evitar retentativas infinitas
    return NextResponse.json({ received: true, error: true }, { status: 200 });
  }
}

// GET para verificar se o webhook está funcionando
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Webhook do Mercado Pago está ativo',
    timestamp: new Date().toISOString(),
  });
}
