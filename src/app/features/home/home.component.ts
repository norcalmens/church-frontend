import { Component, HostListener, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Subscription } from 'rxjs';
import { RegistrationService, Availability } from '../../services/registration.service';
import { RealtimeService } from '../../services/realtime.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, ButtonModule],
  template: `
    <div class="home-container">
      <div class="hero-section">
        <div class="hero-content">
          <div class="hero-text">
            <h1>NorCal Men's Retreat</h1>
            <p class="hero-details"><i class="pi pi-calendar"></i> April 15&ndash;17, 2027</p>
            <p class="hero-details"><i class="pi pi-map-marker"></i> Alliance Redwoods, Occidental, CA</p>
            <p class="hero-details"><i class="pi pi-dollar"></i> Full retreat $280 &middot; Single day $90</p>
            <!-- "Registration is open" status pill. Green (open-now) once
                 reservations go live. Hidden once lodging fills (the red
                 capacity chip tells the whole story at that point). -->
            <p *ngIf="!availability?.isFull" class="hero-status hero-status-open">
              <i class="pi pi-check-circle"></i>
              <span>Registration is <strong>open</strong></span>
            </p>
            <!-- Live counter -- reflects overnight registrations only; day
                 attendees never take a bed so they don't decrement this. -->
            <p *ngIf="availability" class="hero-details hero-counter"
               [class.hero-counter-low]="availability.spacesLeft <= 5 && !availability.isFull"
               [class.hero-counter-full]="availability.isFull">
              <i class="pi pi-users"></i>
              <ng-container *ngIf="availability.isFull; else spotsLeft">
                Overnight lodging is full &mdash; single-day registrations still open.
              </ng-container>
              <ng-template #spotsLeft>
                <strong>{{ availability.totalAttendees }} of {{ availability.capacity }}</strong>
                overnight spots filled &mdash; <strong>{{ availability.spacesLeft }} left</strong>
              </ng-template>
            </p>
            <div class="hero-actions">
              <!-- Register Now is live once showRegisterCta is true. Flip
                   back to false during any future pre-open period. -->
              <a *ngIf="showRegisterCta" routerLink="/registration">
                <button pButton label="Register Now" icon="pi pi-pencil" size="large"></button>
              </a>
              <a routerLink="/venue">
                <button pButton label="View Venue" icon="pi pi-map" size="large"
                        class="p-button-outlined" style="border-color: var(--retreat-cream); color: var(--retreat-cream);"></button>
              </a>
              <a routerLink="/donations">
                <button pButton label="Donate" icon="pi pi-heart" size="large" class="donate-hero-btn"></button>
              </a>
            </div>
          </div>
          <!-- 2027 flyer: JPG + PDF pair, both with Register + Donate QRs
               baked into a dedicated bottom strip (matches last year's
               treatment). Offer both formats so people can pick JPG for
               web/social forwarding or PDF for clean printing. -->
          <div class="hero-flyer" *ngIf="showFlyer">
            <button type="button" class="flyer-thumb" (click)="lightboxOpen = true" aria-label="Enlarge flyer">
              <img src="assets/images/retreat-flyer-2027.jpg" alt="NorCal Men's Retreat 2027 Flyer" />
              <span class="flyer-zoom-hint"><i class="pi pi-search-plus"></i> Click to enlarge</span>
            </button>
            <a class="flyer-download" href="assets/retreat-flyer-2027.pdf" target="_blank" rel="noopener">
              <i class="pi pi-file-pdf"></i> Download PDF
            </a>
          </div>
        </div>
      </div>

      <!-- Upcoming Event callout: sits between the retreat hero and the
           "Fellowship / Teaching / Renewal" info cards so anyone landing
           on the home page sees it before scrolling. Flyer thumbnail on
           the left, event details + primary "RSVP" + secondary "View
           Flyer" on the right. Hide the whole block by flipping
           showUpcomingEvent when the event has passed. -->
      <section *ngIf="showUpcomingEvent" class="upcoming-event" aria-label="Upcoming event">
        <!-- Click thumbnail to enlarge (same UX as the retreat flyer above).
             RSVP + download actions live in the buttons on the right so this
             thumbnail's job is purely "see the flyer bigger". -->
        <button type="button" class="event-thumb-btn" (click)="breakfastLightboxOpen = true"
                aria-label="Enlarge breakfast flyer">
          <img src="assets/images/breakfast-flyer-oct-2026.jpg" alt="Retreat Info Breakfast Flyer — Saturday, October 3, 2026 at Golden Corral, Concord CA" />
          <span class="thumb-hint"><i class="pi pi-search-plus"></i> Click to enlarge</span>
        </button>
        <div class="event-body">
          <span class="event-tag">Upcoming Event</span>
          <h3>Retreat Info Breakfast</h3>
          <p class="event-meta"><i class="pi pi-calendar"></i> Saturday, October 3, 2026 &middot; 8:00 AM</p>
          <p class="event-meta"><i class="pi pi-map-marker"></i> Golden Corral #2697 &middot; Concord, CA</p>
          <p class="event-blurb">Join us for breakfast &mdash; a great chance to meet the retreat team and sign up for 2027.</p>
          <div class="event-actions">
            <a routerLink="/rsvp/breakfast-oct-2026">
              <button pButton label="RSVP for Breakfast" icon="pi pi-check"></button>
            </a>
            <a href="assets/breakfast-flyer-oct-2026.pdf" target="_blank" rel="noopener" class="ghost">
              <button pButton label="View Flyer" icon="pi pi-file-pdf" class="p-button-outlined"></button>
            </a>
          </div>
        </div>
      </section>

      <div class="info-grid">
        <p-card>
          <div class="info-card">
            <i class="pi pi-users"></i>
            <h3>Fellowship</h3>
            <p>Connect with brothers in Christ from churches across Northern California</p>
          </div>
        </p-card>
        <p-card>
          <div class="info-card">
            <i class="pi pi-book"></i>
            <h3>Teaching</h3>
            <p>Hear from inspiring speakers including a young adult speaker and two main speakers</p>
          </div>
        </p-card>
        <p-card>
          <div class="info-card">
            <i class="pi pi-heart"></i>
            <h3>Renewal</h3>
            <p>Step away from daily life to focus on spiritual growth among the redwoods</p>
          </div>
        </p-card>
      </div>

      <div class="what-to-expect">
        <h2>What to Expect</h2>
        <div class="expect-grid">
          <div class="expect-card">
            <i class="pi pi-users"></i>
            <h3>Fellowship & Brotherhood</h3>
            <p>Connect with men from across Northern California in a relaxed, welcoming environment.</p>
          </div>
          <div class="expect-card">
            <i class="pi pi-book"></i>
            <h3>Inspiring Sessions</h3>
            <p>Engaging speakers and breakout sessions designed to challenge and encourage you.</p>
          </div>
          <div class="expect-card">
            <i class="pi pi-sun"></i>
            <h3>Outdoor Activities</h3>
            <p>Hiking trails, campfire gatherings, and time to enjoy the beauty of Alliance Redwoods.</p>
          </div>
          <div class="expect-card">
            <i class="pi pi-heart"></i>
            <h3>Worship & Reflection</h3>
            <p>Dedicated times of worship, prayer, and personal reflection throughout the weekend.</p>
          </div>
          <div class="expect-card">
            <i class="pi pi-building"></i>
            <h3>Comfortable Lodging</h3>
            <p>Cabin-style accommodations with meals included for the full 3-day stay. Linens &amp; towels are a separate $25 package (or $5/item).</p>
          </div>
          <div class="expect-card">
            <i class="pi pi-calendar-plus"></i>
            <h3>Single-Day Option</h3>
            <p>Can't stay overnight? Attend any day for $90, with optional half-day meals ($50, 2 meals) or full-day meals ($65, 3 meals).</p>
          </div>
          <div class="expect-card">
            <i class="pi pi-map"></i>
            <h3>Redwood Setting</h3>
            <p>Experience God's creation at Alliance Redwoods, nestled among towering coastal redwoods.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="flyer-lightbox" *ngIf="showFlyer && lightboxOpen" (click)="lightboxOpen = false">
      <button type="button" class="lightbox-close" (click)="lightboxOpen = false" aria-label="Close"><i class="pi pi-times"></i></button>
      <img src="assets/images/retreat-flyer-2027.jpg" alt="NorCal Men's Retreat 2027 Flyer" (click)="$event.stopPropagation()" />
      <a class="lightbox-download" href="assets/retreat-flyer.pdf" target="_blank" rel="noopener" (click)="$event.stopPropagation()">
        <i class="pi pi-download"></i> Download PDF
      </a>
    </div>

    <!-- Breakfast flyer lightbox: same treatment as the retreat flyer,
         separate open-state so the two thumbnails don't conflict. -->
    <div class="flyer-lightbox" *ngIf="breakfastLightboxOpen" (click)="breakfastLightboxOpen = false">
      <button type="button" class="lightbox-close" (click)="breakfastLightboxOpen = false" aria-label="Close"><i class="pi pi-times"></i></button>
      <img src="assets/images/breakfast-flyer-oct-2026.jpg" alt="Retreat Info Breakfast Flyer" (click)="$event.stopPropagation()" />
      <a class="lightbox-download" href="assets/breakfast-flyer-oct-2026.pdf" target="_blank" rel="noopener" (click)="$event.stopPropagation()">
        <i class="pi pi-download"></i> Download PDF
      </a>
    </div>
  `,
  styles: [`
    .home-container { max-width: 1200px; margin: 0 auto; }
    .hero-section {
      background: var(--retreat-grad-nav);
      border-radius: 16px; padding: 3rem;
      margin-bottom: 3rem; overflow: hidden;
    }
    .hero-content {
      display: flex; align-items: center; gap: 3rem;
    }
    .hero-text {
      flex: 1; color: var(--retreat-cream);
      h1 { font-size: 2.8rem; font-weight: 800; margin: 0 0 0.5rem 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
    }
    .hero-subtitle { font-size: 1.3rem; font-style: italic; margin: 0 0 1.5rem 0; opacity: 0.9; }
    .hero-details { font-size: 1.1rem; margin: 0.5rem 0; display: flex; align-items: center; gap: 0.5rem; i { color: var(--retreat-gold); } }
    .hero-details-sub { font-size: 0.95rem; opacity: 0.85; }
    /* "Registration is open" status pill. Emerald tint so it reads as a
       green go-signal separate from the gold capacity chip that follows. */
    .hero-status {
      margin-top: 0.75rem; padding: 0.35rem 0.85rem;
      border-radius: 999px; width: fit-content;
      display: inline-flex; align-items: center; gap: 0.5rem;
      font-size: 0.95rem; font-weight: 600;
    }
    .hero-status-soon {
      background: rgba(232, 168, 50, 0.20);
      border: 1px solid rgba(232, 168, 50, 0.55);
      color: #fff2d0;
      i { color: var(--retreat-gold); }
      strong { color: var(--retreat-gold); text-transform: uppercase; letter-spacing: 0.05em; }
    }
    /* Green go-signal for the "Registration is open" state -- separate
       from the amber "coming soon" pill above so they read differently
       at a glance without needing to read the copy. */
    .hero-status-open {
      background: rgba(46, 158, 91, 0.18);
      border: 1px solid rgba(46, 158, 91, 0.55);
      color: #d7ffe4;
      i { color: #7be0a0; }
      strong { color: #b4f2c8; text-transform: uppercase; letter-spacing: 0.06em; }
    }
    /* Live overnight-capacity pill in the hero. Rounded, cream text on a
       gold-tinted chip so it reads as an at-a-glance urgency signal, not
       another line of copy. */
    .hero-counter {
      margin-top: 0.75rem; padding: 0.4rem 0.85rem;
      background: rgba(232, 168, 50, 0.18);
      border: 1px solid rgba(232, 168, 50, 0.4);
      border-radius: 999px; width: fit-content;
      font-size: 1rem;
      strong { color: var(--retreat-gold); font-weight: 800; }
    }
    .hero-counter.hero-counter-low {
      background: rgba(212, 120, 47, 0.25);
      border-color: var(--retreat-sunset);
      strong { color: #ffe0b0; }
    }
    .hero-counter.hero-counter-full {
      background: rgba(192, 57, 43, 0.28);
      border-color: #c0392b;
      color: #ffcfc9;
    }
    .hero-flyer {
      flex-shrink: 0;
      display: flex; flex-direction: column; align-items: center; gap: 0.85rem;
    }
    .flyer-thumb {
      position: relative; display: block; line-height: 0; cursor: pointer;
      padding: 9px; border: none; background: var(--retreat-cream);
      border-radius: 14px; box-shadow: 0 10px 34px rgba(0, 0, 0, 0.45);
      img { display: block; width: 300px; border-radius: 7px; }
    }
    .flyer-zoom-hint {
      position: absolute; inset: 9px; border-radius: 7px;
      display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      background: rgba(26, 58, 74, 0.55); color: var(--retreat-cream); font-weight: 600; font-size: 0.95rem;
      opacity: 0; transition: opacity 0.2s; line-height: 1;
      i { font-size: 1.15rem; }
    }
    .flyer-thumb:hover .flyer-zoom-hint, .flyer-thumb:focus-visible .flyer-zoom-hint { opacity: 1; }
    .flyer-download {
      display: inline-flex; align-items: center; gap: 0.5rem;
      color: var(--retreat-cream); text-decoration: none; font-weight: 600; font-size: 0.9rem;
      padding: 0.5rem 1rem; border: 1px solid rgba(240, 230, 208, 0.4); border-radius: 8px;
      transition: all 0.2s;
      i { color: var(--retreat-gold); }
      &:hover { background: rgba(240, 230, 208, 0.12); border-color: var(--retreat-gold); color: var(--retreat-gold); }
    }
    .flyer-lightbox {
      position: fixed; inset: 0; z-index: 2000;
      background: rgba(0, 0, 0, 0.85);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 1rem; padding: 2rem; animation: lbFade 0.15s ease;
      img { max-height: 86vh; max-width: 92vw; border-radius: 8px; box-shadow: 0 12px 48px rgba(0, 0, 0, 0.6); }
    }
    .lightbox-close {
      position: absolute; top: 1.25rem; right: 1.5rem;
      width: 44px; height: 44px; border-radius: 50%; border: none; cursor: pointer;
      background: rgba(255, 255, 255, 0.12); color: #fff; font-size: 1.2rem;
      display: flex; align-items: center; justify-content: center;
      &:hover { background: rgba(255, 255, 255, 0.25); }
    }
    .lightbox-download {
      display: inline-flex; align-items: center; gap: 0.5rem;
      background: var(--retreat-gold); color: var(--retreat-teal-dark); text-decoration: none; font-weight: 700;
      padding: 0.6rem 1.25rem; border-radius: 8px; transition: background 0.2s;
      &:hover { background: var(--retreat-cream); }
    }
    @keyframes lbFade { from { opacity: 0; } to { opacity: 1; } }
    .hero-actions { display: flex; gap: 1rem; margin-top: 2rem; flex-wrap: wrap; }
    .hero-actions a { text-decoration: none; }
    ::ng-deep .donate-hero-btn.p-button {
      background: var(--retreat-gold); border-color: var(--retreat-gold); color: var(--retreat-teal-dark); font-weight: 700;
    }
    ::ng-deep .donate-hero-btn.p-button:hover { background: var(--retreat-sunset); border-color: var(--retreat-sunset); color: #fff; }
    /* Upcoming Event callout -- flyer thumb on the left, details + CTAs
       on the right. Stacks vertically on narrow screens. Kept visually
       distinct from the info cards below (border-left gold accent) so
       it reads as "actionable event", not "general info". */
    .upcoming-event {
      display: flex; gap: 1.5rem; align-items: stretch;
      background: #fff; border-radius: 14px;
      border: 1px solid #e6dcc4; border-left: 5px solid var(--retreat-gold);
      box-shadow: 0 6px 20px rgba(0,0,0,0.08);
      padding: 1.25rem; margin-bottom: 2rem;
      overflow: hidden;
    }
    /* Click-to-enlarge thumbnail button. Overlaid "Click to enlarge"
       hint fades in on hover / keyboard focus so mobile users still
       see it (via focus) and desktop users get the affordance. */
    .event-thumb-btn {
      flex-shrink: 0; position: relative; display: block;
      padding: 0; border: none; background: transparent; cursor: pointer;
      line-height: 0; border-radius: 8px; overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: transform 0.15s;
      img { display: block; width: 200px; height: auto; }
      &:hover, &:focus-visible { transform: scale(1.02); }
      &:focus-visible { outline: 3px solid var(--retreat-gold); outline-offset: 2px; }
    }
    .thumb-hint {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      background: rgba(26, 58, 74, 0.55);
      color: var(--retreat-cream); font-weight: 600; font-size: 0.9rem;
      line-height: 1;
      opacity: 0; transition: opacity 0.15s;
      i { font-size: 1.05rem; color: var(--retreat-gold); }
    }
    .event-thumb-btn:hover .thumb-hint,
    .event-thumb-btn:focus-visible .thumb-hint { opacity: 1; }
    .event-body { flex: 1; display: flex; flex-direction: column; gap: 0.35rem; min-width: 0; }
    .event-tag {
      display: inline-block; align-self: flex-start;
      background: var(--retreat-gold); color: var(--retreat-teal-dark);
      font-weight: 800; font-size: 0.7rem; letter-spacing: 0.08em; text-transform: uppercase;
      padding: 0.2rem 0.65rem; border-radius: 999px;
    }
    .event-body h3 { color: var(--retreat-teal-dark); font-size: 1.5rem; font-weight: 700; margin: 0.25rem 0 0.35rem; }
    .event-meta {
      color: #495057; margin: 0; font-size: 0.95rem;
      display: flex; align-items: center; gap: 0.5rem;
      i { color: var(--retreat-sunset); font-size: 0.9rem; }
    }
    .event-blurb { color: #495057; margin: 0.5rem 0 0.85rem; line-height: 1.5; font-size: 0.95rem; }
    .event-actions { display: flex; gap: 0.6rem; flex-wrap: wrap; margin-top: auto;
      a { text-decoration: none; }
    }
    @media (max-width: 640px) {
      .upcoming-event { flex-direction: column; align-items: center; text-align: center; }
      .event-thumb-btn img { width: 240px; }
      .event-tag { align-self: center; }
      .event-actions { justify-content: center; }
    }

    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
    .info-card {
      text-align: center; padding: 1rem;
      i { font-size: 2.5rem; color: var(--retreat-sunset); margin-bottom: 1rem; }
      h3 { color: var(--retreat-teal-dark); font-size: 1.3rem; margin: 0 0 0.75rem 0; }
      p { color: #6c757d; line-height: 1.6; margin: 0; }
    }
    .what-to-expect { text-align: center; h2 { color: var(--retreat-teal-dark); font-size: 2rem; margin-bottom: 1.5rem; } }
    .expect-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
    .expect-card {
      text-align: center; padding: 2rem 1.5rem;
      background: white; border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      transition: transform 0.3s, box-shadow 0.3s;
      i { font-size: 2rem; color: var(--retreat-sunset); margin-bottom: 0.75rem; }
      h3 { color: var(--retreat-teal-dark); font-size: 1.15rem; margin: 0 0 0.5rem 0; }
      p { color: #6c757d; line-height: 1.6; margin: 0; }
      &:hover { transform: translateY(-4px); box-shadow: 0 8px 16px rgba(0,0,0,0.12); }
    }
    @media (max-width: 768px) {
      .hero-section { padding: 2rem 1.5rem; }
      .hero-content { flex-direction: column; text-align: center; gap: 2rem; }
      .hero-text h1 { font-size: 2rem; }
      .hero-details { justify-content: center; }
      .hero-actions { justify-content: center; }
      .flyer-thumb img { width: 250px; }
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  private registrationService = inject(RegistrationService);
  private realtime = inject(RealtimeService);
  private capacitySub?: Subscription;

  lightboxOpen = false;
  /** Second lightbox for the Retreat Info Breakfast flyer. Separate
   *  state so opening one doesn't interfere with the other. */
  breakfastLightboxOpen = false;
  /** Master switch for the flyer thumbnail + download button + lightbox.
   *  Flip to true when the 2027 flyer assets are in place. */
  showFlyer = true;
  /** Master switch for the "Register Now" hero button. True = live CTA;
   *  false = hidden (use during pre-open periods, paired with a "coming
   *  soon" pill via hero-status-soon). */
  showRegisterCta = true;
  /** Toggle for the "Upcoming Event: Retreat Info Breakfast" callout
   *  on the home page. Flip to true to bring it back for the next
   *  event with the same wiring; false hides the card + lightbox trigger. */
  showUpcomingEvent = false;

  /** Live overnight capacity snapshot. Populated on ngOnInit and shown as
   *  the hero counter -- "N of 35 overnight spots filled" or "Overnight
   *  lodging is full" when spacesLeft = 0. Day attendees never count
   *  against this (backend already scopes it to full-retreat rows). */
  availability: Availability | null = null;

  ngOnInit(): void {
    // Initial snapshot -- the hero counter has to have something to render
    // on first paint before STOMP events start flowing.
    this.registrationService.getAvailability().subscribe({
      next: (a) => this.availability = a,
      error: () => { /* leave hero counter hidden if backend is unreachable */ }
    });
    // Live updates: swap in each fresh snapshot as new registrations come
    // in / rows get deleted. Same shape as the HTTP response so the
    // template needs no changes.
    this.capacitySub = this.realtime.on('/topic/public/capacity').subscribe(evt => {
      this.availability = evt;
    });
  }

  ngOnDestroy(): void {
    this.capacitySub?.unsubscribe();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.lightboxOpen = false;
    this.breakfastLightboxOpen = false;
  }
}
