import { Injectable, inject, OnDestroy } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { Observable, Subject, Subscription, share } from 'rxjs';
import { AuthService } from '../core/auth/auth.service';
import { environment } from '../../environments/environment';

/** Snapshot pushed on /topic/public/capacity -- matches the shape the home
 *  hero already renders from RegistrationService.getAvailability(). */
export interface CapacityEvent {
  capacity: number;
  totalAttendees: number;
  overnightAttendees: number;
  spacesLeft: number;
  isFull: boolean;
  retreatYear: number;
}

/** Compact activity event for the admin toast/feed. */
export interface AdminActivityEvent {
  /** Discriminator so the UI can pick icon/color per event kind. */
  type: 'registration' | 'donation' | 'payment_plan_request' | 'payment' | string;
  title: string;
  detail: string;
  /** ISO string, server-stamped. */
  at: string;
}

type TopicMap = {
  '/topic/public/capacity':  CapacityEvent;
  '/topic/admin/activity':   AdminActivityEvent;
};

/**
 * Long-lived STOMP connection to the backend.
 *
 * Design notes:
 * - **Single shared Client.** stomp.js reconnects internally, so we open
 *   once and reuse. Consumers just subscribe to `on(topic)` and get an
 *   Observable that stays live across reconnects.
 * - **Lazy activation.** The first `on()` call activates the client. We
 *   never open a socket for pages that don't listen (SEO/first-paint win).
 * - **Auth is passed via CONNECT header.** The backend interceptor pulls
 *   the JWT out and stamps a Principal. Anonymous sessions still receive
 *   /topic/public/** but any /topic/admin/** SUBSCRIBE gets rejected.
 * - **No polling fallback.** Callers can still fetch the same data via
 *   REST; STOMP is a live-update overlay, not a replacement.
 */
@Injectable({ providedIn: 'root' })
export class RealtimeService implements OnDestroy {
  private auth = inject(AuthService);

  private client: Client | null = null;
  /** Per-destination fanout Subject so many components can share one
   *  underlying STOMP subscription. Rehydrated on reconnect. */
  private streams = new Map<string, Subject<any>>();
  /** Live STOMP subscription handles keyed by destination -- used to
   *  unsubscribe on disconnect and re-subscribe on reconnect. */
  private stompSubs = new Map<string, StompSubscription>();
  /** Track the currently-connected token so we only reconnect when it
   *  actually changes (login / logout / token refresh). Prevents churn
   *  on other AuthState mutations that leave the JWT alone. */
  private connectedWithToken: string | null = null;
  private authSub: Subscription;

  constructor() {
    // Bounce the STOMP session whenever the JWT changes. Otherwise an
    // anonymous session opened on the home page would stay anonymous even
    // after the visitor logs in, blocking any /topic/admin/** subscriptions.
    this.authSub = this.auth.currentUser$.subscribe(state => {
      const newToken = state?.accessToken ?? null;
      if (this.client && newToken !== this.connectedWithToken) {
        this.connectedWithToken = newToken;
        this.refreshAuth();
      }
    });
  }

  /** Subscribe to a typed topic. Returns a shared Observable -- multiple
   *  subscribers share one underlying STOMP subscription so a topic with
   *  100 listeners still only produces one broker->frontend delivery. */
  on<K extends keyof TopicMap>(destination: K): Observable<TopicMap[K]> {
    this.ensureClient();
    let subject = this.streams.get(destination);
    if (!subject) {
      subject = new Subject<any>();
      this.streams.set(destination, subject);
      // If the client is already CONNECTED, subscribe immediately.
      // Otherwise onConnect below will pick up every entry in `streams`.
      if (this.client?.connected) this.subscribeNow(destination);
    }
    // share() lets many components subscribe without multiplying work;
    // multicast semantics are what we want (broadcasted events).
    return subject.asObservable().pipe(share());
  }

  private ensureClient(): void {
    if (this.client) return;

    // In prod the frontend lives on Hostinger (static) but the backend
    // is on Railway -- window.location.host would resolve to Hostinger
    // and no server would answer the WS handshake. Point straight at the
    // API host from environment.apiUrl and swap the scheme to ws(s).
    // In dev environment.apiUrl is empty and the Angular proxy handles
    // /ws → localhost:8080.
    let brokerURL: string;
    if (environment.production && environment.apiUrl) {
      brokerURL = environment.apiUrl.replace(/^http/i, 'ws') + '/ws';
    } else {
      const scheme = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      brokerURL = `${scheme}//${window.location.host}/ws`;
    }

    this.client = new Client({
      brokerURL,
      // Attach the JWT on connect. Anonymous is allowed -- backend just
      // won't let this session hit /topic/admin/**.
      connectHeaders: this.authHeaders(),
      // Sensible defaults: 5s between reconnect attempts, heartbeats every
      // 10s. stomp.js handles the loop internally; we don't have to.
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      // Silence library debug in prod; too chatty otherwise.
      debug: () => { /* noop */ },
      onConnect: () => {
        // Re-attach every destination we've been asked about. Handles the
        // initial connect AND any reconnect after a network blip.
        for (const dest of this.streams.keys()) this.subscribeNow(dest);
      },
      onWebSocketClose: () => {
        // Drop live handles; onConnect will remake them once the client
        // finishes reconnecting. Fanout Subjects stay -- consumers keep
        // their subscriptions and just see a gap in events during outage.
        this.stompSubs.forEach(s => { try { s.unsubscribe(); } catch { /* client already gone */ } });
        this.stompSubs.clear();
      },
      onStompError: (frame) => {
        // Server-side STOMP error frame (e.g. SUBSCRIBE rejected because
        // the session isn't admin). Log for debugging; downstream Subjects
        // just don't receive events for the disallowed topic.
        // eslint-disable-next-line no-console
        console.warn('[STOMP] server error:', frame.headers['message'], frame.body);
      },
    });
    this.connectedWithToken = this.auth.getAccessToken();
    this.client.activate();
  }

  private subscribeNow(destination: string): void {
    if (!this.client?.connected) return;
    if (this.stompSubs.has(destination)) return;
    const sub = this.client.subscribe(destination, (msg: IMessage) => {
      const stream = this.streams.get(destination);
      if (!stream) return;
      try {
        stream.next(JSON.parse(msg.body));
      } catch {
        // Server always sends JSON; if this ever fires, drop rather than
        // corrupting a typed stream with a raw string.
      }
    });
    this.stompSubs.set(destination, sub);
  }

  private authHeaders(): Record<string, string> {
    const token = this.auth.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /** Force a reconnect using fresh auth headers. Called after login /
   *  logout so a session that just gained ADMIN can subscribe to admin
   *  topics without waiting for the next reconnect. */
  refreshAuth(): void {
    if (!this.client) return;
    this.client.connectHeaders = this.authHeaders();
    this.connectedWithToken = this.auth.getAccessToken();
    // Deactivate + reactivate; the onConnect hook rewires every stream.
    this.client.deactivate().then(() => this.client?.activate());
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
    this.streams.forEach(s => s.complete());
    this.streams.clear();
    this.stompSubs.clear();
    this.client?.deactivate();
    this.client = null;
  }
}
