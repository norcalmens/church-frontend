import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Donation, DonationCreateResponse } from '../core/models/donation.model';

@Injectable({ providedIn: 'root' })
export class DonationService {
  constructor(private http: HttpClient) {}

  create(donation: Donation): Observable<DonationCreateResponse> {
    return this.http.post<DonationCreateResponse>('/api/donations', donation);
  }

  confirm(id: number): Observable<Donation> {
    return this.http.post<Donation>(`/api/donations/${id}/confirm`, {});
  }

  listAll(): Observable<Donation[]> {
    return this.http.get<Donation[]>('/api/donations');
  }

  /** Admin-only: record a donation that was processed outside this app (past Stripe charge, cash, check). */
  createManual(donation: Donation): Observable<Donation> {
    return this.http.post<Donation>('/api/donations/manual', donation);
  }

  /** Admin-only: edit an existing donation (fix typo, change status, etc.). */
  update(id: number, donation: Donation): Observable<Donation> {
    return this.http.put<Donation>(`/api/donations/${id}`, donation);
  }

  /** Admin-only: delete a donation record. Used for cleaning up pending entries
   *  (abandoned card flows) or duplicate manual records. Does not touch Stripe. */
  delete(id: number): Observable<unknown> {
    return this.http.delete(`/api/donations/${id}`);
  }
}
