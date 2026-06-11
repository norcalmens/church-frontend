import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FeedbackEntry {
  id?: number;
  name?: string;
  email?: string;
  rating?: number | null;
  worked?: string;
  improve?: string;
  other?: string;
  submittedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private http = inject(HttpClient);

  list(): Observable<FeedbackEntry[]> {
    return this.http.get<FeedbackEntry[]>('/api/feedback');
  }

  delete(id: number): Observable<unknown> {
    return this.http.delete(`/api/feedback/${id}`);
  }
}
