import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, ButtonModule],
  template: `
    <div class="home-container">
      <div class="hero-section">
        <div class="hero-content">
          <div class="hero-text">
            <h1>NorCal Men's Retreat 2026</h1>
            <p class="hero-subtitle">Standing in the Gap</p>
            <p class="hero-details"><i class="pi pi-calendar"></i> June 11-13, 2026</p>
            <p class="hero-details"><i class="pi pi-map-marker"></i> Alliance Redwoods, Occidental, CA</p>
            <p class="hero-details"><i class="pi pi-dollar"></i> Full retreat $248 &middot; Single day $85</p>
            <p class="hero-details hero-details-sub"><i class="pi pi-info-circle"></i> Linen &amp; towel package $25 (or $5/item) &middot; Single-day meals $50 (2) / $65 (3)</p>
            <div class="hero-actions">
              <a routerLink="/waitlist">
                <button pButton label="Reserve a Spot for 2027" icon="pi pi-calendar-plus" size="large"></button>
              </a>
              <a routerLink="/venue">
                <button pButton label="View Venue" icon="pi pi-map" size="large"
                        class="p-button-outlined" style="border-color: #f0e6d0; color: #f0e6d0;"></button>
              </a>
              <a routerLink="/donations">
                <button pButton label="Donate" icon="pi pi-heart" size="large" class="donate-hero-btn"></button>
              </a>
            </div>
          </div>
          <div class="hero-flyer">
            <button type="button" class="flyer-thumb" (click)="lightboxOpen = true" aria-label="Enlarge flyer">
              <img src="assets/images/retreat-flyer.png" alt="NorCal Men's Retreat 2026 Flyer" />
              <span class="flyer-zoom-hint"><i class="pi pi-search-plus"></i> Click to enlarge</span>
            </button>
            <a class="flyer-download" href="assets/retreat-flyer.pdf" target="_blank" rel="noopener">
              <i class="pi pi-download"></i> Download Flyer (PDF)
            </a>
          </div>
        </div>
      </div>

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
            <p>Can't stay overnight? Attend any day for $85, with optional half-day meals ($50, 2 meals) or full-day meals ($65, 3 meals).</p>
          </div>
          <div class="expect-card">
            <i class="pi pi-map"></i>
            <h3>Redwood Setting</h3>
            <p>Experience God's creation at Alliance Redwoods, nestled among towering coastal redwoods.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="flyer-lightbox" *ngIf="lightboxOpen" (click)="lightboxOpen = false">
      <button type="button" class="lightbox-close" (click)="lightboxOpen = false" aria-label="Close"><i class="pi pi-times"></i></button>
      <img src="assets/images/retreat-flyer.png" alt="NorCal Men's Retreat 2026 Flyer" (click)="$event.stopPropagation()" />
      <a class="lightbox-download" href="assets/retreat-flyer.pdf" target="_blank" rel="noopener" (click)="$event.stopPropagation()">
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
      flex: 1; color: #f0e6d0;
      h1 { font-size: 2.8rem; font-weight: 800; margin: 0 0 0.5rem 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
    }
    .hero-subtitle { font-size: 1.3rem; font-style: italic; margin: 0 0 1.5rem 0; opacity: 0.9; }
    .hero-details { font-size: 1.1rem; margin: 0.5rem 0; display: flex; align-items: center; gap: 0.5rem; i { color: #e8a832; } }
    .hero-details-sub { font-size: 0.95rem; opacity: 0.85; }
    .hero-flyer {
      flex-shrink: 0;
      display: flex; flex-direction: column; align-items: center; gap: 0.85rem;
    }
    .flyer-thumb {
      position: relative; display: block; line-height: 0; cursor: pointer;
      padding: 9px; border: none; background: #f0e6d0;
      border-radius: 14px; box-shadow: 0 10px 34px rgba(0, 0, 0, 0.45);
      img { display: block; width: 300px; border-radius: 7px; }
    }
    .flyer-zoom-hint {
      position: absolute; inset: 9px; border-radius: 7px;
      display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      background: rgba(26, 58, 74, 0.55); color: #f0e6d0; font-weight: 600; font-size: 0.95rem;
      opacity: 0; transition: opacity 0.2s; line-height: 1;
      i { font-size: 1.15rem; }
    }
    .flyer-thumb:hover .flyer-zoom-hint, .flyer-thumb:focus-visible .flyer-zoom-hint { opacity: 1; }
    .flyer-download {
      display: inline-flex; align-items: center; gap: 0.5rem;
      color: #f0e6d0; text-decoration: none; font-weight: 600; font-size: 0.9rem;
      padding: 0.5rem 1rem; border: 1px solid rgba(240, 230, 208, 0.4); border-radius: 8px;
      transition: all 0.2s;
      i { color: #e8a832; }
      &:hover { background: rgba(240, 230, 208, 0.12); border-color: #e8a832; color: #e8a832; }
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
      background: #e8a832; color: #1a3a4a; text-decoration: none; font-weight: 700;
      padding: 0.6rem 1.25rem; border-radius: 8px; transition: background 0.2s;
      &:hover { background: #f0e6d0; }
    }
    @keyframes lbFade { from { opacity: 0; } to { opacity: 1; } }
    .hero-actions { display: flex; gap: 1rem; margin-top: 2rem; flex-wrap: wrap; }
    .hero-actions a { text-decoration: none; }
    ::ng-deep .donate-hero-btn.p-button {
      background: #e8a832; border-color: #e8a832; color: #1a3a4a; font-weight: 700;
    }
    ::ng-deep .donate-hero-btn.p-button:hover { background: #d4782f; border-color: #d4782f; color: #fff; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
    .info-card {
      text-align: center; padding: 1rem;
      i { font-size: 2.5rem; color: #d4782f; margin-bottom: 1rem; }
      h3 { color: #1a3a4a; font-size: 1.3rem; margin: 0 0 0.75rem 0; }
      p { color: #6c757d; line-height: 1.6; margin: 0; }
    }
    .what-to-expect { text-align: center; h2 { color: #1a3a4a; font-size: 2rem; margin-bottom: 1.5rem; } }
    .expect-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
    .expect-card {
      text-align: center; padding: 2rem 1.5rem;
      background: white; border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      transition: transform 0.3s, box-shadow 0.3s;
      i { font-size: 2rem; color: #d4782f; margin-bottom: 0.75rem; }
      h3 { color: #1a3a4a; font-size: 1.15rem; margin: 0 0 0.5rem 0; }
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
export class HomeComponent {
  lightboxOpen = false;

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.lightboxOpen = false;
  }
}
