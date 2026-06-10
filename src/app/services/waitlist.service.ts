import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../core/auth/auth.types';

export interface WaitlistEntry {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  congregation?: string;
  requestedSeats: number;
  notes?: string;
  contacted?: boolean;
  createdAt?: string;
}

export interface WaitlistCreatedResponse {
  entry: WaitlistEntry;
  position: number;
  totalOnWaitlist: number;
}

@Injectable({ providedIn: 'root' })
export class WaitlistService {
  private http = inject(HttpClient);

  create(entry: Omit<WaitlistEntry, 'id' | 'contacted' | 'createdAt'>): Observable<WaitlistCreatedResponse> {
    return this.http.post<ApiResponse<WaitlistCreatedResponse>>('/api/waitlist', entry).pipe(map(r => r.data));
  }

  list(): Observable<WaitlistEntry[]> {
    return this.http.get<ApiResponse<WaitlistEntry[]>>('/api/waitlist').pipe(map(r => r.data));
  }

  setContacted(id: number, contacted: boolean): Observable<WaitlistEntry> {
    return this.http.patch<ApiResponse<WaitlistEntry>>(`/api/waitlist/${id}/contacted`, { contacted }).pipe(map(r => r.data));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`/api/waitlist/${id}`).pipe(map(r => r.data));
  }
}
