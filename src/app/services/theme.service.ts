import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { ApiResponse } from '../core/auth/auth.types';

export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  /** Display swatch -- primary / accent / cream. Pulled straight from the
   *  SCSS palette so the admin picker can render preview chips without
   *  computing colors at runtime. */
  swatch: { primary: string; accent: string; cream: string };
}

/** Keep this list in sync with the `.theme-*` classes in src/styles.scss and
 *  the VALID_THEMES allowlist on the backend (SystemSettingController). */
export const AVAILABLE_THEMES: ThemeDefinition[] = [
  {
    id: 'sunrise', name: 'Sunrise', description: 'Deep teal + warm gold and sunset orange. The original retreat palette.',
    swatch: { primary: '#1a3a4a', accent: '#e8a832', cream: '#f0e6d0' },
  },
  {
    id: 'forest', name: 'Redwood Forest', description: 'Deep evergreens + warm brass. Matches the Alliance Redwoods venue.',
    swatch: { primary: '#1f3a25', accent: '#d4b35a', cream: '#ece4d2' },
  },
  {
    id: 'pacific', name: 'Pacific Coast', description: 'Navy + sky blue + sandy beige. Northern California coast feel.',
    swatch: { primary: '#14305a', accent: '#7ab8d4', cream: '#f0ead8' },
  },
  {
    id: 'vintage', name: 'Vintage Hymn', description: 'Burgundy + ivory + brass. Traditional church aesthetic.',
    swatch: { primary: '#4a1f24', accent: '#c89a4a', cream: '#f0e4d4' },
  },
  {
    id: 'slate', name: 'Modern Slate', description: 'Slate gray + soft indigo + warm tan. Clean, contemporary look.',
    swatch: { primary: '#2d3748', accent: '#7e9cc8', cream: '#ecedf0' },
  },
  {
    id: 'sage', name: 'Sage & Rose', description: 'Soft eucalyptus + dusty rose. Calm, reflective palette.',
    swatch: { primary: '#3a4f44', accent: '#d4a48a', cream: '#ece8da' },
  },
];

const DEFAULT_THEME = 'sunrise';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private http = inject(HttpClient);
  private themeSubject = new BehaviorSubject<string>(DEFAULT_THEME);
  readonly theme$ = this.themeSubject.asObservable();

  readonly availableThemes = AVAILABLE_THEMES;

  /** Synchronous read of the currently-applied theme id. Useful for
   *  computed properties in components that need the value mid-render. */
  get currentTheme(): string { return this.themeSubject.value; }

  /** Apply the theme to the <html> element by swapping its theme-* class.
   *  Doesn't hit the server -- used for live preview while the admin clicks
   *  through swatches; call saveTheme() to persist. */
  applyTheme(id: string): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    // Strip any prior theme-* class, then add the new one.
    const cleaned = Array.from(root.classList).filter(c => !c.startsWith('theme-'));
    root.className = [...cleaned, `theme-${id}`].join(' ').trim();
    this.themeSubject.next(id);
  }

  /** Load the persisted theme from the backend and apply it. Called once at
   *  app startup; subsequent visitors get the live admin choice without an
   *  extra fetch since the result is cached in the BehaviorSubject. */
  loadActiveTheme(): Observable<string> {
    return this.http.get<ApiResponse<{ theme: string }>>('/api/settings/public/theme').pipe(
      map(r => r.data?.theme || DEFAULT_THEME),
      tap(id => this.applyTheme(id)),
    );
  }

  /** Save the admin's chosen theme. Applies + pushes to the BehaviorSubject
   *  so every subscriber updates without a page reload. */
  saveTheme(id: string): Observable<string> {
    return this.http.put<ApiResponse<{ theme: string }>>('/api/settings/theme', { theme: id }).pipe(
      map(r => r.data?.theme || id),
      tap(saved => this.applyTheme(saved)),
    );
  }
}
