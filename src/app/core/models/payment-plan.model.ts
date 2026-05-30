export interface PaymentPlanPayment {
  id?: number;
  planId?: number;
  amount: number;
  method: 'cash' | 'check' | 'stripe' | string;
  status?: 'pending' | 'paid' | 'failed' | 'processing' | string;
  stripePaymentId?: string;
  reference?: string;
  notes?: string;
  paidAt?: string;
  createdAt?: string;
}

export interface PaymentPlan {
  id?: number;
  planName: string;
  retreatLabel: string;
  payerName: string;
  payerEmail: string;
  totalAmount: number;
  payerToken?: string;
  status?: 'active' | 'completed' | 'canceled' | string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;

  // Recurring (Stripe Subscription)
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  recurringAmount?: number;
  recurringStatus?: 'active' | 'past_due' | 'canceled' | 'unpaid' | 'trialing' | string;
  recurringStartedAt?: string;

  // Computed by backend
  paidAmount?: number;
  balance?: number;
  payments?: PaymentPlanPayment[];
}

export interface PaymentPlanPayResponse {
  paymentId: number;
  clientSecret: string;
}
