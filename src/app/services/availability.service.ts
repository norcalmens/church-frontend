import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map, distinctUntilChanged } from 'rxjs';
import { RegistrationService, Availability } from './registration.service';
import { RealtimeService } from './realtime.service';

/**
 * Shared, live-updating overnight availability. Fetches once on first
 * subscription and stays in sync via the /topic/public/capacity STOMP
 * stream so multiple consumers (topbar, sidebar, home hero, etc.) share
 * a single fetch + single WebSocket subscription instead of each
 * component polling independently.
 *
 * Exposes:
 *   availability$ -- the current snapshot (or null before first load)
 *   isFull$       -- boolean derived stream; useful for gating UI like
 *                    the Waitlist nav link, which we only want to show
 *                    once overnight capacity actually fills.
 */
@Injectable({ providedIn: 'root' })
export class AvailabilityService {
  private registrationService = inject(RegistrationService);
  private realtime = inject(RealtimeService);

  private subject = new BehaviorSubject<Availability | null>(null);
  readonly availability$: Observable<Availability | null> = this.subject.asObservable();
  readonly isFull$: Observable<boolean> = this.availability$.pipe(
    map(a => !!a && a.isFull),
    distinctUntilChanged(),
  );

  private started = false;

  constructor() {
    // Wire up on first construction (providedIn: 'root' -> singleton).
    // Lazy-fetch initial snapshot; STOMP updates keep it fresh forever.
    this.start();
  }

  private start(): void {
    if (this.started) return;
    this.started = true;
    // Initial snapshot -- gives consumers a value on first paint before
    // any STOMP events arrive. Failure is silent; the counter just stays
    // null until either the fetch retries or a STOMP event lands.
    this.registrationService.getAvailability().subscribe({
      next: (a) => this.subject.next(a),
      error: () => { /* leave null, counter hidden */ },
    });
    // Live updates: same payload shape as the HTTP response, so we can
    // just push each event into the subject and consumers see it.
    this.realtime.on('/topic/public/capacity').subscribe(evt => this.subject.next(evt));
  }

  /** Latest snapshot (synchronous). Useful for one-shot checks; prefer
   *  the observable for template bindings so re-renders happen live. */
  snapshot(): Availability | null {
    return this.subject.value;
  }
}
