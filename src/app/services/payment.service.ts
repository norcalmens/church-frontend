import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaymentRequest, PaymentResponse, StripeConfig } from '../core/models/payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {

  constructor(private http: HttpClient) {}

  getConfig(): Observable<StripeConfig> {
    return this.http.get<StripeConfig>('/api/payments/config');
  }

  createPaymentIntent(request: PaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>('/api/payments/create-payment-intent', request);
  }

  getPaymentIntent(id: string): Observable<any> {
    return this.http.get<any>(`/api/payments/payment-intent/${id}`);
  }
}
