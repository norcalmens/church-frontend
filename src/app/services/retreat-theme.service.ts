import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, shareReplay, tap } from 'rxjs';
import { ApiResponse } from '../core/auth/auth.types';

export interface RetreatTheme {
  name: string;
  scripture: string;
}

const DEFAULTS: RetreatTheme = { name: 'Forged By Fire', scripture: '1 Peter 1:7' };

/** Single source of truth for the retreat EVENT theme (name + scripture).
 *  Separate from ThemeService (which handles the UI color palette) because
 *  these change on different cadences and for different reasons — the color
 *  theme is an admin aesthetic choice, the retreat theme is the yearly
 *  motif that drives flyer copy and page taglines. */
@Injectable({ providedIn: 'root' })
export class RetreatThemeService {
  private http = inject(HttpClient);
  private subject = new BehaviorSubject<RetreatTheme>(DEFAULTS);
  readonly theme$ = this.subject.asObservable();

  get current(): RetreatTheme { return this.subject.value; }

  /** Hits /api/settings/public/retreat-theme. Called once at app bootstrap
   *  so the hero + itinerary don't flash the fallback before the server
   *  value arrives. shareReplay(1) keeps a single in-flight request if two
   *  consumers subscribe before the response lands. */
  load(): Observable<RetreatTheme> {
    return this.http.get<ApiResponse<RetreatTheme>>('/api/settings/public/retreat-theme').pipe(
      map(r => ({
        name: r.data?.name?.trim() || DEFAULTS.name,
        scripture: r.data?.scripture?.trim() || '',
      })),
      tap(theme => this.subject.next(theme)),
      shareReplay(1),
    );
  }

  /** Admin save — PUT, then push the new value through the BehaviorSubject
   *  so every page that renders from theme$ updates without a reload. */
  save(theme: RetreatTheme): Observable<RetreatTheme> {
    return this.http.put<ApiResponse<RetreatTheme>>('/api/settings/retreat-theme', theme).pipe(
      map(r => ({
        name: r.data?.name?.trim() || theme.name,
        scripture: r.data?.scripture?.trim() || '',
      })),
      tap(saved => this.subject.next(saved)),
    );
  }
}
