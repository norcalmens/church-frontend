import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, shareReplay, tap } from 'rxjs';
import { ApiResponse } from '../core/auth/auth.types';

export interface SocialLinks {
  facebook: string;
  instagram: string;
  youtube: string;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private http = inject(HttpClient);

  // Cached so footer + topbar + any other consumers share a single fetch.
  // Updated in-place by setSocialLinks() so an admin save reflects everywhere
  // without a page reload.
  private socialSubject = new BehaviorSubject<SocialLinks>({ facebook: '', instagram: '', youtube: '' });
  readonly socialLinks$: Observable<SocialLinks> = this.socialSubject.asObservable();
  private socialLoaded = false;
  private socialFetch$: Observable<SocialLinks> | null = null;

  getCapacity(): Observable<number> {
    return this.http.get<ApiResponse<{ capacity: number }>>('/api/settings/public/retreat-capacity').pipe(
      map(r => r.data.capacity)
    );
  }

  setCapacity(capacity: number): Observable<number> {
    return this.http.put<ApiResponse<{ capacity: number }>>('/api/settings/retreat-capacity', { capacity }).pipe(
      map(r => r.data.capacity)
    );
  }

  /** Lazy-loaded once per session, then served from the BehaviorSubject. */
  loadSocialLinks(): Observable<SocialLinks> {
    if (this.socialLoaded) return this.socialLinks$;
    if (!this.socialFetch$) {
      this.socialFetch$ = this.http.get<ApiResponse<SocialLinks>>('/api/settings/public/social').pipe(
        map(r => r.data),
        tap(links => { this.socialSubject.next(links); this.socialLoaded = true; }),
        shareReplay(1),
      );
    }
    return this.socialFetch$;
  }

  setSocialLinks(links: Partial<SocialLinks>): Observable<SocialLinks> {
    return this.http.put<ApiResponse<SocialLinks>>('/api/settings/social', links).pipe(
      map(r => r.data),
      tap(saved => this.socialSubject.next(saved)),
    );
  }
}
