import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Registration } from '../core/models/registration.model';
import { ApiResponse } from '../core/auth/auth.types';
import { PaymentResponse } from '../core/models/payment.model';

@Injectable({ providedIn: 'root' })
export class RegistrationService {

  constructor(private http: HttpClient) {}

  getMyRegistrations(): Observable<Registration[]> {
    return this.http.get<ApiResponse<Registration[]>>('/api/registrations').pipe(
      map(res => res.data)
    );
  }

  getRegistration(id: number): Observable<Registration> {
    return this.http.get<ApiResponse<Registration>>(`/api/registrations/${id}`).pipe(
      map(res => res.data)
    );
  }

  createRegistration(registration: Registration): Observable<Registration> {
    return this.http.post<ApiResponse<Registration>>('/api/registrations', registration).pipe(
      map(res => res.data)
    );
  }

  createPaymentIntent(registrationId: number): Observable<PaymentResponse> {
    return this.http.post<ApiResponse<PaymentResponse>>(`/api/registrations/${registrationId}/payment-intent`, {}).pipe(
      map(res => res.data)
    );
  }

  confirmPayment(registrationId: number): Observable<Registration> {
    return this.http.post<ApiResponse<Registration>>(`/api/registrations/${registrationId}/confirm-payment`, {}).pipe(
      map(res => res.data)
    );
  }

  updateRegistration(id: number, registration: Registration): Observable<Registration> {
    return this.http.put<ApiResponse<Registration>>(`/api/registrations/${id}`, registration).pipe(
      map(res => res.data)
    );
  }

  deleteRegistration(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`/api/registrations/${id}`).pipe(
      map(res => res.data)
    );
  }

  getAllRegistrations(): Observable<Registration[]> {
    return this.http.get<ApiResponse<Registration[]>>('/api/registrations/all').pipe(
      map(res => res.data)
    );
  }

  getStats(): Observable<any> {
    return this.http.get<ApiResponse<any>>('/api/registrations/stats').pipe(
      map(res => res.data)
    );
  }
}
