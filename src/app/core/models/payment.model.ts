export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  donorName: string;
  donorEmail: string;
}

export interface PaymentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export interface StripeConfig {
  publishableKey: string;
}
