import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService, SocialLinks } from '../../services/settings.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="app-footer">
      <!-- Follow Us section. Each icon requires master switch + per-icon
           switch + a non-empty URL. The whole block is omitted when no
           icon would render, so the copyright line sits flush at the
           top of the footer in that case. -->
      <ng-container *ngIf="(social$ | async) as social">
        <div *ngIf="hasAnyIcon(social)" class="follow-us">
          <span class="follow-us-label">Follow Us</span>
          <div class="social-row">
            <a *ngIf="social.showFacebook && social.facebook" [href]="social.facebook" target="_blank" rel="noopener"
               class="social-icon facebook" aria-label="Facebook">
              <i class="pi pi-facebook"></i>
              <span class="social-name">Facebook</span>
            </a>
            <a *ngIf="social.showInstagram && social.instagram" [href]="social.instagram" target="_blank" rel="noopener"
               class="social-icon instagram" aria-label="Instagram">
              <i class="pi pi-instagram"></i>
              <span class="social-name">Instagram</span>
            </a>
            <a *ngIf="social.showYoutube && social.youtube" [href]="social.youtube" target="_blank" rel="noopener"
               class="social-icon youtube" aria-label="YouTube">
              <i class="pi pi-youtube"></i>
              <span class="social-name">YouTube</span>
            </a>
          </div>
        </div>
      </ng-container>
      <div class="footer-content">
        <span>&copy; {{ currentYear }} NorCal Men's Retreat</span>
        <span class="separator">|</span>
        <span>Churches of Christ, Northern California</span>
      </div>
    </footer>
  `,
  styles: [`
    .app-footer {
      background: var(--retreat-grad-nav);
      color: rgba(240, 230, 208, 0.7);
      padding: 1.5rem 2rem 1.25rem;
      text-align: center;
      font-size: 0.9rem;
    }
    .footer-content {
      display: flex; align-items: center; justify-content: center;
      gap: 0.75rem; flex-wrap: wrap;
    }
    .separator { opacity: 0.5; }

    /* "Follow Us" section: prominent label + bigger pill icons with brand
       colors as the BASE state (not just hover). Sits on its own with a
       hairline divider so the footer reads as two zones -- social first,
       legal small-print second. */
    .follow-us {
      display: flex; flex-direction: column; align-items: center;
      gap: 0.85rem;
      padding-bottom: 1.25rem; margin-bottom: 1rem;
      border-bottom: 1px solid rgba(240, 230, 208, 0.18);
    }
    .follow-us-label {
      color: var(--retreat-gold);
      font-size: 0.78rem; font-weight: 700;
      letter-spacing: 0.18em; text-transform: uppercase;
    }
    .social-row {
      display: flex; align-items: center; justify-content: center;
      gap: 1rem; flex-wrap: wrap;
    }
    .social-icon {
      display: inline-flex; align-items: center; gap: 0.55rem;
      padding: 0.55rem 1.1rem 0.55rem 0.95rem;
      border-radius: 999px;
      color: #fff; text-decoration: none;
      font-weight: 600; font-size: 0.95rem;
      transition: all 0.2s;
      box-shadow: 0 3px 10px rgba(0,0,0,0.15);
      i { font-size: 1.35rem; }
      &:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.28); }
      &.facebook  { background: #1877f2; }
      &.instagram { background: linear-gradient(135deg, #f09433, #e6683c 30%, #dc2743 60%, #cc2366 80%, #bc1888); }
      &.youtube   { background: #ff0000; }
    }
    @media (max-width: 480px) {
      .social-name { display: none; }       // pill -> icon-only on phones to save row width
      .social-icon { padding: 0.6rem; width: 44px; height: 44px; justify-content: center; }
    }
  `]
})
export class FooterComponent implements OnInit {
  private settings = inject(SettingsService);
  currentYear = new Date().getFullYear();
  social$ = this.settings.socialLinks$;

  ngOnInit(): void {
    // Kick the cached load -- subsequent consumers (topbar, etc.) get the
    // values from the BehaviorSubject without a second round trip.
    this.settings.loadSocialLinks().subscribe();
  }

  /** True when at least one icon will render given the current state. Lets
   *  us hide the entire "Follow Us" frame + divider when nothing's set up,
   *  so the footer doesn't show an empty header. */
  hasAnyIcon(s: SocialLinks): boolean {
    if (!s.enabled) return false;
    return (s.showFacebook  && !!s.facebook)
        || (s.showInstagram && !!s.instagram)
        || (s.showYoutube   && !!s.youtube);
  }
}
