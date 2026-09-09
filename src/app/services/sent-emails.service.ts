import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SentEmail {
  id: number;
  recipient: string;
  subject: string;
  body?: string;
  category?: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
  status: 'sent' | 'failed' | 'pending' | string;
  errorMessage?: string;
  triggeredBy?: string;
  attemptedAt: string;
}

export interface SentEmailPage {
  content: SentEmail[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface SentEmailStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
}

/** Admin-only log of every outbound email attempt. */
@Injectable({ providedIn: 'root' })
export class SentEmailsService {
  private http = inject(HttpClient);

  list(opts: { status?: string; category?: string; q?: string; page?: number; size?: number } = {}): Observable<SentEmailPage> {
    let params = new HttpParams();
    if (opts.status)   params = params.set('status',   opts.status);
    if (opts.category) params = params.set('category', opts.category);
    if (opts.q)        params = params.set('q',        opts.q);
    params = params.set('page', String(opts.page ?? 0));
    params = params.set('size', String(opts.size ?? 25));
    return this.http.get<SentEmailPage>('/api/emails', { params });
  }

  stats(): Observable<SentEmailStats> {
    return this.http.get<SentEmailStats>('/api/emails/stats');
  }

  get(id: number): Observable<SentEmail> {
    return this.http.get<SentEmail>(`/api/emails/${id}`);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/api/emails/${id}`);
  }
}
