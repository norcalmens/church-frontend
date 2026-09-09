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
  /** requested = submitted via public form, awaiting admin approve;
   *  active = pay link is live; completed = fully paid; canceled = shut off. */
  status?: 'requested' | 'active' | 'completed' | 'canceled' | string;
  notes?: string;
  /** Which season this plan is for. Active/completed plans in the
   *  current retreat.active.year count against the overnight bed cap. */
  retreatYear?: number;
  /** How many overnight beds this plan reserves (defaults to 1). Only
   *  counts while the plan is active or completed. */
  overnightAttendees?: number;
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
