import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ZoomLink } from '../core/models/zoom-link.model';

@Injectable({ providedIn: 'root' })
export class ZoomLinkService {
  constructor(private http: HttpClient) {}

  listActive(): Observable<ZoomLink[]> {
    return this.http.get<ZoomLink[]>('/api/zoom-links');
  }

  listAll(): Observable<ZoomLink[]> {
    return this.http.get<ZoomLink[]>('/api/zoom-links/all');
  }

  create(link: ZoomLink): Observable<ZoomLink> {
    return this.http.post<ZoomLink>('/api/zoom-links', link);
  }

  update(id: number, link: ZoomLink): Observable<ZoomLink> {
    return this.http.put<ZoomLink>(`/api/zoom-links/${id}`, link);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/api/zoom-links/${id}`);
  }
}
