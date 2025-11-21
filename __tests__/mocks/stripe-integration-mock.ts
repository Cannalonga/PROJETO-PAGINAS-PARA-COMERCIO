/**
 * Stripe Integration Mock
 * 
 * Mock completo do SDK Stripe para testes de integração.
 * Simula operações de checkout, webhooks, e billing sem chamar API real.
 * 
 * @module __tests__/mocks/stripe-integration-mock
 */

const customersCreate = jest.fn();
const checkoutSessionsCreate = jest.fn();
const billingPortalSessionsCreate = jest.fn();
const webhooksConstructEvent = jest.fn();

jest.mock("@/lib/stripe", () => ({
  stripe: {
    customers: {
      create: customersCreate,
    },
    checkout: {
      sessions: {
        create: checkoutSessionsCreate,
      },
    },
    billingPortal: {
      sessions: {
        create: billingPortalSessionsCreate,
      },
    },
    webhooks: {
      constructEvent: webhooksConstructEvent,
    },
  },
}));

export const stripeMock = {
  customersCreate,
  checkoutSessionsCreate,
  billingPortalSessionsCreate,
  webhooksConstructEvent,
};

export default stripeMock;
