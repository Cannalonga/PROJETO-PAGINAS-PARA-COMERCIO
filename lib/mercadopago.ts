import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

// Configuração do cliente Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
});

// Instâncias dos serviços
export const preferenceClient = new Preference(client);
export const paymentClient = new Payment(client);

// Tipos para preferência de pagamento
export interface CreatePreferenceData {
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  planType: 'monthly' | 'yearly';
}

// Preços dos planos
export const PLAN_PRICES = {
  monthly: {
    amount: 9.90,
    title: 'VitrinaFast - Plano Mensal',
    description: 'Assinatura mensal para sua vitrine online',
  },
  yearly: {
    amount: 99.00,
    title: 'VitrinaFast - Plano Anual',
    description: 'Assinatura anual com 2 meses grátis',
  },
};

// Criar preferência de pagamento (Checkout Pro)
export async function createPaymentPreference(data: CreatePreferenceData) {
  const plan = PLAN_PRICES[data.planType];
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const preference = await preferenceClient.create({
    body: {
      items: [
        {
          id: `vitrinafast-${data.planType}`,
          title: plan.title,
          description: plan.description,
          quantity: 1,
          unit_price: plan.amount,
          currency_id: 'BRL',
        },
      ],
      payer: {
        email: data.tenantEmail,
      },
      // Dados extras para identificar o pagamento no webhook
      external_reference: data.tenantId,
      metadata: {
        tenant_id: data.tenantId,
        tenant_name: data.tenantName,
        plan_type: data.planType,
      },
      // URLs de retorno
      back_urls: {
        success: `${baseUrl}/pagamento/sucesso?tenant=${data.tenantId}`,
        failure: `${baseUrl}/pagamento/erro?tenant=${data.tenantId}`,
        pending: `${baseUrl}/pagamento/pendente?tenant=${data.tenantId}`,
      },
      auto_return: 'approved',
      // Configurações de pagamento
      payment_methods: {
        excluded_payment_types: [],
        excluded_payment_methods: [],
        installments: 12, // Máximo de parcelas
      },
      // Notificação de pagamento
      notification_url: `${baseUrl}/api/webhooks/mercadopago`,
      // Expiração da preferência (24 horas)
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  });

  return preference;
}

// Buscar informações de um pagamento
export async function getPaymentInfo(paymentId: string) {
  const payment = await paymentClient.get({ id: paymentId });
  return payment;
}
