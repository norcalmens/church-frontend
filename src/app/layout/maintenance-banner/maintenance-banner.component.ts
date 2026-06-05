import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackendStatusService } from '../../core/services/backend-status.service';

@Component({
  selector: 'app-maintenance-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="maintenance-banner" role="status" aria-live="polite" *ngIf="status.isDown$ | async">
      <i class="pi pi-wrench"></i>
      <div class="banner-text">
        <strong>We're updating the site &mdash; back in a moment.</strong>
        <span class="banner-sub">You can keep browsing; some features may be unavailable until the backend comes back up.</span>
      </div>
      <i class="pi pi-spin pi-spinner spinner"></i>
    </div>
  `,
  styles: [`
    .maintenance-banner {
      position: fixed; top: 60px; left: 0; right: 0;
      display: flex; align-items: center; gap: 0.85rem;
      padding: 0.7rem 1.25rem;
      background: repeating-linear-gradient(45deg, #fff7e0, #fff7e0 14px, #ffeec0 14px, #ffeec0 28px);
      border-bottom: 2px solid #d4782f;
      color: #6e4b08;
      box-shadow: 0 2px 8px rgba(212, 120, 47, 0.18);
      z-index: 999;
      animation: slideDown 0.3s ease;
    }
    .maintenance-banner > i.pi-wrench {
      font-size: 1.35rem; color: #b8651f; flex-shrink: 0;
    }
    .banner-text { flex: 1; display: flex; flex-direction: column; gap: 0.1rem; line-height: 1.35;
      strong { color: #8a4a08; font-size: 0.98rem; }
      .banner-sub { font-size: 0.85rem; color: #6e4b08; opacity: 0.9; }
    }
    .spinner { font-size: 1.1rem; color: #b8651f; flex-shrink: 0; }

    @keyframes slideDown {
      from { transform: translateY(-100%); opacity: 0; }
      to   { transform: translateY(0);     opacity: 1; }
    }

    @media (max-width: 600px) {
      .maintenance-banner { padding: 0.55rem 0.85rem; gap: 0.55rem; }
      .banner-text strong { font-size: 0.88rem; }
      .banner-text .banner-sub { display: none; }
      .spinner { display: none; }
    }
  `]
})
export class MaintenanceBannerComponent {
  status = inject(BackendStatusService);
}
