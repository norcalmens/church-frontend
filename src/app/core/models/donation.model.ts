export interface Donation {
  id?: number;
  donorName: string;
  donorEmail: string;
  amount: number;
  currency?: string;
  message?: string;
  /** Admin-only internal notes — never shown to the donor. */
  adminNotes?: string;
  stripePaymentId?: string;
  paymentStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DonationCreateResponse {
  donation: Donation;
  clientSecret: string;
}
