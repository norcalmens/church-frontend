import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-directions',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule],
  template: `
    <div class="directions-container">

      <div class="hero">
        <i class="pi pi-map-marker"></i>
        <h1>Directions to the Retreat</h1>
        <p class="subtitle">Alliance Redwoods Conference Grounds &mdash; Occidental, CA</p>
      </div>

      <!-- THE CRITICAL HIGHLIGHTED WARNING -->
      <div class="critical-callout" role="alert">
        <div class="critical-icon"><i class="pi pi-exclamation-triangle"></i></div>
        <div class="critical-body">
          <span class="critical-label">Don't miss the turn</span>
          <p class="critical-text">
            Look for the <strong>Sonoma Zipline Adventures</strong> sign on your <strong>left</strong>,
            then <strong>turn left into the parking lot.</strong>
          </p>
          <p class="critical-sub">
            (The sign is for the zipline business on the same property &mdash; that's how you'll know you've arrived at Alliance Redwoods.)
          </p>
        </div>
      </div>

      <div class="address-card">
        <h3><i class="pi pi-home"></i> Address</h3>
        <p class="address">
          Alliance Redwoods Conference Grounds<br>
          6250 Bohemian Hwy<br>
          Occidental, CA 95465
        </p>
        <div class="cta-row">
          <a href="https://www.google.com/maps/dir/?api=1&destination=Alliance+Redwoods+Conference+Grounds+6250+Bohemian+Hwy+Occidental+CA+95465"
             target="_blank" rel="noopener">
            <button pButton label="Open in Google Maps" icon="pi pi-external-link"></button>
          </a>
          <a href="https://maps.apple.com/?daddr=6250+Bohemian+Hwy+Occidental+CA+95465"
             target="_blank" rel="noopener">
            <button pButton label="Open in Apple Maps" icon="pi pi-external-link" class="p-button-outlined"></button>
          </a>
        </div>
      </div>

      <div class="route-card">
        <h3><i class="pi pi-compass"></i> From the Bay Area</h3>
        <ol class="steps">
          <li><strong>Take US-101 North</strong> toward Santa Rosa.</li>
          <li>Exit at <strong>CA-116 W / River Rd</strong> in Rohnert Park (or take Hwy 12 West through Sebastopol &mdash; both work).</li>
          <li>Follow <strong>CA-116 West</strong> through Sebastopol toward Forestville.</li>
          <li>Turn <strong>left onto Bohemian Hwy</strong> at Monte Rio / Occidental.</li>
          <li>Continue south on Bohemian Hwy through the town of Occidental.</li>
          <li class="critical-step">
            <strong>Watch for the Sonoma Zipline Adventures sign on your LEFT</strong> &mdash;
            turn left there into the parking lot. <em>(This is the Alliance Redwoods entrance.)</em>
          </li>
          <li>Park, then check in at the welcome table starting at <strong>3:00 PM Thursday.</strong></li>
        </ol>
      </div>

      <div class="tips-card">
        <h3><i class="pi pi-info-circle"></i> Travel Tips</h3>
        <ul>
          <li><i class="pi pi-clock"></i> Plan for <strong>~1.5 to 2 hours</strong> from Oakland / SF, longer with traffic.</li>
          <li><i class="pi pi-signal"></i> <strong>Cell service drops</strong> as you get close &mdash; download the Google Maps area offline before you leave.</li>
          <li><i class="pi pi-car"></i> The last stretch of Bohemian Hwy is <strong>winding through redwoods</strong> &mdash; drive carefully, especially after dark.</li>
          <li><i class="pi pi-users"></i> <strong>Carpool if you can</strong> &mdash; parking is limited and it's a great way to start the brotherhood early.</li>
          <li><i class="pi pi-phone"></i> Running into trouble? Call <strong>Bro. Washington</strong> at <a href="tel:+17076563789">(707) 656-3789</a>.</li>
        </ul>
      </div>

      <div class="footer-row">
        <a routerLink="/venue"><button pButton label="Back to Venue" icon="pi pi-map" class="p-button-outlined"></button></a>
        <a routerLink="/itinerary"><button pButton label="See the Itinerary" icon="pi pi-calendar"></button></a>
      </div>
    </div>
  `,
  styles: [`
    .directions-container { max-width: 920px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.25rem; }

    .hero {
      background: var(--retreat-grad-nav);
      border-radius: 16px; padding: 2rem; text-align: center; color: #f0e6d0;
      i.pi-map-marker { font-size: 2.25rem; color: #e8a832; }
      h1 { font-size: 2rem; font-weight: 800; margin: 0.5rem 0 0.35rem; }
      .subtitle { font-size: 1.05rem; margin: 0; opacity: 0.92; }
    }

    /* THE highlighted critical callout */
    .critical-callout {
      display: flex; gap: 1rem; align-items: stretch;
      background: linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%);
      border: 3px solid #d4782f;
      border-radius: 14px;
      padding: 1.25rem 1.5rem;
      box-shadow: 0 6px 20px rgba(212, 120, 47, 0.25);
      position: relative;
    }
    .critical-callout::before {
      content: ''; position: absolute; inset: -3px; border-radius: 14px;
      box-shadow: 0 0 0 2px rgba(212, 120, 47, 0.15);
      pointer-events: none;
    }
    .critical-icon {
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      i { font-size: 2.5rem; color: #b8651f; }
    }
    .critical-body { flex: 1; }
    .critical-label {
      display: inline-block;
      background: #b8651f; color: #fff;
      padding: 0.2rem 0.65rem; border-radius: 6px;
      font-size: 0.75rem; font-weight: 800;
      text-transform: uppercase; letter-spacing: 0.08em;
      margin-bottom: 0.5rem;
    }
    .critical-text {
      margin: 0; font-size: 1.2rem; line-height: 1.5; color: #5a3608; font-weight: 600;
      strong { color: #8a4a08; background: rgba(255,255,255,0.55); padding: 0.05rem 0.35rem; border-radius: 4px; }
    }
    .critical-sub { margin: 0.65rem 0 0; font-size: 0.92rem; color: #6e4b08; font-style: italic; }

    .address-card, .route-card, .tips-card {
      background: #fff; border-radius: 14px; padding: 1.5rem;
      box-shadow: 0 4px 16px rgba(0,0,0,0.07);
      h3 {
        color: #1a3a4a; margin: 0 0 0.85rem;
        display: flex; align-items: center; gap: 0.55rem; font-size: 1.15rem;
        i { color: #d4782f; }
      }
    }
    .address { color: #495057; line-height: 1.6; margin: 0 0 1rem; font-size: 1rem; }
    .cta-row, .footer-row { display: flex; gap: 0.75rem; flex-wrap: wrap;
      a { text-decoration: none; }
    }
    .footer-row { justify-content: center; padding: 0.5rem 0 1rem; }

    .steps {
      margin: 0; padding-left: 1.25rem; color: #495057; line-height: 1.75; font-size: 1rem;
      li { padding: 0.25rem 0; }
      .critical-step {
        background: rgba(232, 168, 50, 0.18);
        border-left: 4px solid #d4782f;
        padding: 0.65rem 0.85rem;
        margin: 0.4rem 0;
        border-radius: 4px;
        color: #5a3608;
        em { color: #6e4b08; font-size: 0.92rem; }
      }
    }
    .tips-card ul {
      list-style: none; margin: 0; padding: 0; color: #495057;
      li { display: flex; gap: 0.6rem; align-items: flex-start; padding: 0.35rem 0; line-height: 1.55;
        i { color: #d4782f; font-size: 1rem; margin-top: 0.2rem; flex-shrink: 0; }
        a { color: #b8651f; font-weight: 600; }
      }
    }

    @media (max-width: 600px) {
      .critical-callout { flex-direction: column; gap: 0.5rem; padding: 1rem; }
      .critical-icon i { font-size: 2rem; }
      .critical-text { font-size: 1.05rem; }
      .hero { padding: 1.5rem 1rem; }
      .hero h1 { font-size: 1.6rem; }
      .cta-row, .footer-row { flex-direction: column;
        a, button { width: 100%; }
        ::ng-deep .p-button { width: 100%; justify-content: center; }
      }
    }
  `]
})
export class DirectionsComponent {}
