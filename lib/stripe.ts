/**
 * Stripe Client
 * 
 * Instância centralizada do Stripe com apiVersion 2024-06-20
 * Para usar: import { stripe, getStripe } from "@/lib/stripe"
 * 
 * NOTA: Use getStripe() para inicialização lazy (evita erro no build)
 */

import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

/**
 * Get Stripe instance (lazy initialization)
 * Use this instead of direct stripe export when STRIPE_SECRET_KEY might not be set
 */
export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set in environment variables. " +
      "Please add it to .env or .env.local"
    );
  }
  
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
      typescript: true,
    });
  }
  
  return stripeInstance;
}

// For backwards compatibility - but may fail at build if env not set
export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
      typescript: true,
    })
  : (null as unknown as Stripe);

export default stripe;
