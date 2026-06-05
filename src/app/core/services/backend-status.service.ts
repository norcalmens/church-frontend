import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Tracks whether the backend is reachable.
 *
 * Flow:
 *  - The backendErrorInterceptor calls markDown() whenever an /api/ request
 *    fails with a transport-level error (status 0) or a 5xx — both happen
 *    during a Railway redeploy.
 *  - While marked down, we poll /api/menu-config/hidden (unauth, cheap, hit
 *    on every page load anyway) every 10s. The first successful response
 *    flips us back to up.
 *  - The maintenance banner subscribes to isDown$ and shows/hides accordingly.
 */
@Injectable({ providedIn: 'root' })
export class BackendStatusService {
  private http = inject(HttpClient);
  private readonly isDownSubject = new BehaviorSubject<boolean>(false);
  readonly isDown$: Observable<boolean> = this.isDownSubject.asObservable();

  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private readonly POLL_MS = 10_000;

  markDown(): void {
    if (this.isDownSubject.value) return;
    this.isDownSubject.next(true);
    this.startPolling();
  }

  markUp(): void {
    if (!this.isDownSubject.value) return;
    this.isDownSubject.next(false);
    this.stopPolling();
  }

  private startPolling(): void {
    if (this.pollTimer) return;
    this.pollTimer = setInterval(() => this.checkHealth(), this.POLL_MS);
  }

  private stopPolling(): void {
    if (this.pollTimer) { clearInterval(this.pollTimer); this.pollTimer = null; }
  }

  private checkHealth(): void {
    this.http.get('/api/menu-config/hidden', { observe: 'response' }).subscribe({
      next: () => this.markUp(),
      // stay down on error — interceptor will keep marking us down on real traffic too
      error: () => {}
    });
  }
}
