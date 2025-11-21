/**
 * Stripe Client
 * 
 * Instância centralizada do Stripe com apiVersion 2024-06-20
 * Para usar: import { stripe } from "@/lib/stripe"
 */

import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error(
    "STRIPE_SECRET_KEY is not set in environment variables. " +
    "Please add it to .env or .env.local"
  );
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
  typescript: true,
});

export default stripe;
