import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService, SocialLinks } from '../../services/settings.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="app-footer">
      <!-- Social icons row. Each icon requires THREE things to render:
           master switch + per-icon switch + a non-empty URL. -->
      <div *ngIf="(social$ | async) as social" class="social-row">
        <ng-container *ngIf="social.enabled">
          <a *ngIf="social.showFacebook && social.facebook" [href]="social.facebook" target="_blank" rel="noopener"
             class="social-icon facebook" aria-label="Facebook">
            <i class="pi pi-facebook"></i>
          </a>
          <a *ngIf="social.showInstagram && social.instagram" [href]="social.instagram" target="_blank" rel="noopener"
             class="social-icon instagram" aria-label="Instagram">
            <i class="pi pi-instagram"></i>
          </a>
          <a *ngIf="social.showYoutube && social.youtube" [href]="social.youtube" target="_blank" rel="noopener"
             class="social-icon youtube" aria-label="YouTube">
            <i class="pi pi-youtube"></i>
          </a>
        </ng-container>
      </div>
      <div class="footer-content">
        <span>&copy; {{ currentYear }} NorCal Men's Retreat</span>
        <span class="separator">|</span>
        <span>Churches of Christ, Northern California</span>
      </div>
    </footer>
  `,
  styles: [`
    .app-footer {
      background: linear-gradient(135deg, #1a3a4a 0%, #1e4d5e 100%);
      color: rgba(240, 230, 208, 0.7);
      padding: 1.25rem 2rem;
      text-align: center;
      font-size: 0.9rem;
    }
    .footer-content {
      display: flex; align-items: center; justify-content: center;
      gap: 0.75rem; flex-wrap: wrap;
    }
    .separator { opacity: 0.5; }
    .social-row {
      display: flex; align-items: center; justify-content: center;
      gap: 0.75rem; margin-bottom: 0.75rem;
      &:empty { display: none; }   // hide row entirely when no icons rendered
    }
    .social-icon {
      width: 36px; height: 36px; border-radius: 50%;
      display: inline-flex; align-items: center; justify-content: center;
      color: #f0e6d0;
      background: rgba(240, 230, 208, 0.08);
      border: 1px solid rgba(240, 230, 208, 0.18);
      transition: all 0.2s;
      text-decoration: none;
      i { font-size: 1.05rem; }
      &:hover { transform: translateY(-2px); color: #1a3a4a; }
      &.facebook:hover  { background: #1877f2; border-color: #1877f2; color: #fff; }
      &.instagram:hover { background: linear-gradient(135deg, #f09433, #e6683c 30%, #dc2743 60%, #cc2366 80%, #bc1888);
                          border-color: transparent; color: #fff; }
      &.youtube:hover   { background: #ff0000; border-color: #ff0000; color: #fff; }
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
}
