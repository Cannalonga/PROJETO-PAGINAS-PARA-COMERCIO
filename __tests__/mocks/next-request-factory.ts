/**
 * Next Request Factory Mock
 * 
 * Factory para construir NextRequest objects de forma consistente.
 * Simula diferentes tipos de requisições HTTP sem usar localhost real.
 * 
 * @module __tests__/mocks/next-request-factory
 */

import { NextRequest } from "next/server";

/**
 * Cria NextRequest com JSON body
 * @param url - URL da requisição
 * @param method - HTTP method (GET, POST, PATCH, etc)
 * @param body - Objeto JSON a ser enviado
 * @param headers - Headers customizados
 * @returns NextRequest object
 */
export function makeJsonRequest(
  url: string,
  method: string,
  body: unknown,
  headers: Record<string, string> = {}
) {
  // Simula stream de body JSON
  const bodyString = JSON.stringify(body);
  const encoder = new TextEncoder();
  const uint8Array = encoder.encode(bodyString);

  // Cria ReadableStream com o conteúdo
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(uint8Array);
      controller.close();
    },
  });

  return new NextRequest(url, {
    method,
    headers: {
      "content-type": "application/json",
      ...headers,
    },
    body: stream as any,
  } as any);
}

/**
 * Cria NextRequest vazio (sem body)
 * Útil para GET, DELETE ou webhooks com headers only
 * @param url - URL da requisição
 * @param method - HTTP method
 * @param headers - Headers customizados
 * @returns NextRequest object
 */
export function makeEmptyRequest(
  url: string,
  method: string,
  headers: Record<string, string> = {}
) {
  return new NextRequest(url, {
    method,
    headers,
  } as any);
}

/**
 * Cria NextRequest com headers específicos para webhook Stripe
 * @param url - URL do webhook
 * @param signature - Stripe signature header
 * @param rawBody - Raw body string (não parseado)
 * @returns NextRequest object
 */
export function makeStripeWebhookRequest(
  url: string,
  signature: string,
  rawBody: string
) {
  const encoder = new TextEncoder();
  const uint8Array = encoder.encode(rawBody);

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(uint8Array);
      controller.close();
    },
  });

  return new NextRequest(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "stripe-signature": signature,
    },
    body: stream as any,
  } as any);
}

export default {
  makeJsonRequest,
  makeEmptyRequest,
  makeStripeWebhookRequest,
};
