import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EventRsvp {
  id?: number;
  eventKey?: string;
  name: string;
  email?: string;
  phone?: string;
  congregation?: string;
  guestCount?: number;
  notes?: string;
  createdAt?: string;
}

/** Small events (breakfast, meet-and-greet, etc.) with a public RSVP
 *  form. Admin sees who's coming via the /admin/rsvps page. */
@Injectable({ providedIn: 'root' })
export class EventRsvpService {
  private http = inject(HttpClient);

  /** 404 = unknown event key. Used by the public form to render a clean
   *  "Event not found" state instead of a broken form. */
  exists(eventKey: string): Observable<{ eventKey: string }> {
    return this.http.get<{ eventKey: string }>(`/api/rsvp/public/${encodeURIComponent(eventKey)}`);
  }

  submit(eventKey: string, payload: EventRsvp): Observable<EventRsvp> {
    return this.http.post<EventRsvp>(`/api/rsvp/public/${encodeURIComponent(eventKey)}`, payload);
  }

  // Admin
  listAll(): Observable<EventRsvp[]> {
    return this.http.get<EventRsvp[]>('/api/rsvp');
  }
  listForEvent(eventKey: string): Observable<EventRsvp[]> {
    return this.http.get<EventRsvp[]>(`/api/rsvp/${encodeURIComponent(eventKey)}`);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/api/rsvp/${id}`);
  }
}
