import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ZoomLinkService } from '../../services/zoom-link.service';
import { ZoomLink } from '../../core/models/zoom-link.model';

@Component({
  selector: 'app-worship',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  template: `
    <div class="worship-container">
      <div class="hero-section">
        <i class="pi pi-video"></i>
        <h1>Worship</h1>
        <p>Join our brothers in worship, prayer, and fellowship — wherever you are.</p>
      </div>

      <div *ngIf="loading" class="loading-state">
        <i class="pi pi-spin pi-spinner"></i>
        <p>Loading meetings…</p>
      </div>

      <div *ngIf="!loading && links.length === 0" class="empty-state">
        <i class="pi pi-calendar-times"></i>
        <h3>No Zoom meetings scheduled yet</h3>
        <p>Check back soon — meeting links will appear here once they're added.</p>
      </div>

      <div *ngIf="!loading && links.length > 0" class="zoom-grid">
        <div *ngFor="let link of links" class="zoom-card">
          <div class="zoom-card-header">
            <i class="pi pi-video"></i>
            <h3>{{ link.title }}</h3>
          </div>
          <p *ngIf="link.scheduleText" class="zoom-schedule">
            <i class="pi pi-calendar"></i> {{ link.scheduleText }}
          </p>
          <p *ngIf="link.description" class="zoom-description">{{ link.description }}</p>
          <div *ngIf="link.meetingId || link.passcode" class="zoom-info">
            <div *ngIf="link.meetingId"><strong>Meeting ID:</strong> {{ link.meetingId }}</div>
            <div *ngIf="link.passcode"><strong>Passcode:</strong> {{ link.passcode }}</div>
          </div>
          <a [href]="link.joinUrl" target="_blank" rel="noopener" class="zoom-join">
            <button pButton label="Join Meeting" icon="pi pi-external-link" class="zoom-btn"></button>
          </a>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .worship-container { max-width: 1100px; margin: 0 auto; }
    .hero-section {
      background: var(--retreat-grad-nav);
      border-radius: 16px; padding: 2.5rem 2rem; text-align: center;
      color: #f0e6d0; margin-bottom: 2rem;
      i { font-size: 2.5rem; color: #e8a832; }
      h1 { font-size: 2.2rem; font-weight: 800; margin: 0.75rem 0 0.5rem; }
      p { margin: 0 auto; max-width: 560px; line-height: 1.6; opacity: 0.92; }
    }
    .loading-state, .empty-state {
      background: #fff; border-radius: 16px; padding: 3rem 2rem; text-align: center;
      box-shadow: 0 4px 16px rgba(0,0,0,0.06);
      i { font-size: 2.5rem; color: #d4782f; display: block; margin-bottom: 0.75rem; }
      h3 { color: #1a3a4a; margin: 0 0 0.5rem; }
      p { color: #6c757d; margin: 0 0 1.25rem; }
    }
    .zoom-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1.5rem;
    }
    .zoom-card {
      background: #fff; border-radius: 14px; padding: 1.5rem 1.5rem 1.25rem;
      box-shadow: 0 4px 16px rgba(0,0,0,0.07); border-top: 4px solid #e8a832;
      display: flex; flex-direction: column;
    }
    .zoom-card-header { display: flex; align-items: center; gap: 0.65rem; margin-bottom: 0.5rem;
      i { font-size: 1.5rem; color: #d4782f; }
      h3 { color: #1a3a4a; margin: 0; font-size: 1.25rem; font-weight: 700; }
    }
    .zoom-schedule {
      color: #1a3a4a; font-weight: 600; margin: 0.25rem 0 0.75rem;
      display: flex; align-items: center; gap: 0.5rem;
      i { color: #e8a832; font-size: 0.95rem; }
    }
    .zoom-description { color: #495057; line-height: 1.55; margin: 0 0 1rem; flex: 1; }
    .zoom-info {
      background: #f8f9fa; border-radius: 8px; padding: 0.6rem 0.85rem; margin-bottom: 1rem;
      font-size: 0.9rem; color: #495057;
      div { padding: 2px 0; }
      strong { color: #1a3a4a; margin-right: 0.4rem; }
    }
    .zoom-join { text-decoration: none; }
    ::ng-deep .zoom-btn.p-button {
      width: 100%; justify-content: center;
      background: #d4782f !important; border-color: #d4782f !important; color: #fff !important;
      font-weight: 700;
      &:hover { background: #b8651f !important; border-color: #b8651f !important; }
    }
  `]
})
export class WorshipComponent implements OnInit {
  private zoomService = inject(ZoomLinkService);

  links: ZoomLink[] = [];
  loading = true;

  ngOnInit(): void {
    this.zoomService.listActive().subscribe({
      next: (data) => { this.links = data || []; this.loading = false; },
      error: () => {
        // Silently fall through to the empty state — covers the case where
        // the backend isn't deployed yet or returns no links.
        this.links = [];
        this.loading = false;
      }
    });
  }
}
