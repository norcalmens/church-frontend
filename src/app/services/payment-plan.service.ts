import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaymentPlan, PaymentPlanPayment, PaymentPlanPayResponse } from '../core/models/payment-plan.model';

@Injectable({ providedIn: 'root' })
export class PaymentPlanService {
  constructor(private http: HttpClient) {}

  // Admin
  listAll(): Observable<PaymentPlan[]> {
    return this.http.get<PaymentPlan[]>('/api/payment-plans');
  }
  get(id: number): Observable<PaymentPlan> {
    return this.http.get<PaymentPlan>(`/api/payment-plans/${id}`);
  }
  create(plan: PaymentPlan): Observable<PaymentPlan> {
    return this.http.post<PaymentPlan>('/api/payment-plans', plan);
  }
  update(id: number, plan: PaymentPlan): Observable<PaymentPlan> {
    return this.http.put<PaymentPlan>(`/api/payment-plans/${id}`, plan);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/api/payment-plans/${id}`);
  }
  recordPayment(planId: number, payment: PaymentPlanPayment): Observable<PaymentPlanPayment> {
    return this.http.post<PaymentPlanPayment>(`/api/payment-plans/${planId}/payments`, payment);
  }
  updatePayment(paymentId: number, payment: PaymentPlanPayment): Observable<PaymentPlanPayment> {
    return this.http.put<PaymentPlanPayment>(`/api/payment-plans/payments/${paymentId}`, payment);
  }
  deletePayment(paymentId: number): Observable<void> {
    return this.http.delete<void>(`/api/payment-plans/payments/${paymentId}`);
  }

  // Public (tokenized)
  getByToken(token: string): Observable<PaymentPlan> {
    return this.http.get<PaymentPlan>(`/api/payment-plans/by-token/${token}`);
  }
  startStripePayment(token: string, amount: number): Observable<PaymentPlanPayResponse> {
    return this.http.post<PaymentPlanPayResponse>(`/api/payment-plans/by-token/${token}/pay`, { amount });
  }
  confirmStripePayment(token: string, paymentId: number): Observable<PaymentPlanPayment> {
    return this.http.post<PaymentPlanPayment>(`/api/payment-plans/by-token/${token}/payments/${paymentId}/confirm`, {});
  }
}
