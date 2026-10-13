import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProspectiveSpeaker } from '../core/models/prospective-speaker.model';

@Injectable({ providedIn: 'root' })
export class ProspectiveSpeakerService {
  private http = inject(HttpClient);
  private base = '/api/speakers';

  list(): Observable<ProspectiveSpeaker[]> { return this.http.get<ProspectiveSpeaker[]>(this.base); }
  create(s: ProspectiveSpeaker): Observable<ProspectiveSpeaker> { return this.http.post<ProspectiveSpeaker>(this.base, s); }
  update(id: number, s: ProspectiveSpeaker): Observable<ProspectiveSpeaker> { return this.http.put<ProspectiveSpeaker>(`${this.base}/${id}`, s); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }
}
