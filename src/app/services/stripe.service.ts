import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StripeService {

  private stripePromise: Promise<Stripe | null> | null = null;

  constructor(private http: HttpClient) {}

  getStripe(): Promise<Stripe | null> {
    if (!this.stripePromise) {
      this.stripePromise = this.initStripe();
    }
    return this.stripePromise;
  }

  private async initStripe(): Promise<Stripe | null> {
    const config = await firstValueFrom(
      this.http.get<{ publishableKey: string }>('/api/payments/config')
    );
    if (!config.publishableKey) {
      console.error('Stripe publishable key not configured');
      return null;
    }
    return loadStripe(config.publishableKey);
  }
}
