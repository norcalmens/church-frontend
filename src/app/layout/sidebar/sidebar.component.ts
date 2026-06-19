import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarModule } from 'primeng/sidebar';
import { AuthService } from '../../core/auth/auth.service';
import { MenuVisibilityService } from '../../core/services/menu-visibility.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, SidebarModule],
  template: `
    <p-sidebar [(visible)]="visible" (visibleChange)="visibleChange.emit($event)" [showCloseIcon]="true">
      <ng-template pTemplate="header">
        <div class="sidebar-header">
          <i class="pi pi-sun" style="color: var(--retreat-gold); font-size: 1.5rem;"></i>
          <span>Menu</span>
        </div>
      </ng-template>
      <div class="sidebar-content">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="close()"
           *ngIf="menuVisibility.isVisible('home')">
          <i class="pi pi-home"></i> Home
        </a>
        <a routerLink="/waitlist" routerLinkActive="active" (click)="close()"
           *ngIf="menuVisibility.isVisible('registration')">
          <i class="pi pi-calendar-plus"></i> Waitlist 2027
        </a>
        <a routerLink="/venue" routerLinkActive="active" (click)="close()"
           *ngIf="menuVisibility.isVisible('venue')">
          <i class="pi pi-map"></i> Venue
        </a>
        <a routerLink="/directions" routerLinkActive="active" (click)="close()"
           *ngIf="menuVisibility.isVisible('directions')">
          <i class="pi pi-map-marker"></i> Directions
        </a>
        <a routerLink="/itinerary" routerLinkActive="active" (click)="close()"
           *ngIf="menuVisibility.isVisible('itinerary')">
          <i class="pi pi-calendar"></i> Itinerary
        </a>
        <a routerLink="/worship" routerLinkActive="active" (click)="close()"
           *ngIf="menuVisibility.isVisible('worship')">
          <i class="pi pi-video"></i> Worship
        </a>
        <ng-container *ngIf="menuVisibility.isVisible('qr-codes') || menuVisibility.isVisible('feedback')">
          <div class="sidebar-section-title">Resources</div>
          <a routerLink="/qr-codes" routerLinkActive="active" (click)="close()"
             *ngIf="menuVisibility.isVisible('qr-codes')">
            <i class="pi pi-qrcode"></i> QR Codes
          </a>
          <a routerLink="/feedback" routerLinkActive="active" (click)="close()"
             *ngIf="menuVisibility.isVisible('feedback')">
            <i class="pi pi-comments"></i> Feedback
          </a>
        </ng-container>
        <a routerLink="/donations" routerLinkActive="active" class="donate-link" (click)="close()"
           *ngIf="menuVisibility.isVisible('donations')">
          <i class="pi pi-heart"></i> Donate
        </a>
        <ng-container *ngIf="authService.canViewAdmin()">
          <div class="sidebar-divider"></div>
          <div class="sidebar-section-title">{{ authService.isAdmin() ? 'Admin' : 'Committee' }}</div>
          <a routerLink="/admin/dashboard" routerLinkActive="active" (click)="close()"
             *ngIf="menuVisibility.isVisible('admin/dashboard')">
            <i class="pi pi-chart-line"></i> Dashboard
          </a>
          <a routerLink="/admin/registrations" routerLinkActive="active" (click)="close()"
             *ngIf="menuVisibility.isVisible('admin/registrations')">
            <i class="pi pi-list"></i> All Registrations
          </a>
          <a routerLink="/admin/attendees" routerLinkActive="active" (click)="close()"
             *ngIf="menuVisibility.isVisible('admin/attendees')">
            <i class="pi pi-users"></i> All Attendees
          </a>
          <a routerLink="/admin/waitlist" routerLinkActive="active" (click)="close()"
             *ngIf="menuVisibility.isVisible('admin/waitlist')">
            <i class="pi pi-calendar-plus"></i> 2027 Interest List
          </a>
          <a routerLink="/admin/feedback" routerLinkActive="active" (click)="close()"
             *ngIf="menuVisibility.isVisible('admin/feedback')">
            <i class="pi pi-comments"></i> Feedback
          </a>
          <a routerLink="/admin/donations" routerLinkActive="active" (click)="close()"
             *ngIf="menuVisibility.isVisible('admin/donations')">
            <i class="pi pi-heart"></i> All Donations
          </a>
          <a routerLink="/admin/payment-plans" routerLinkActive="active" (click)="close()"
             *ngIf="menuVisibility.isVisible('admin/payment-plans')">
            <i class="pi pi-credit-card"></i> Payment Plans
          </a>
          <!-- Admin-only mutating surfaces -->
          <ng-container *ngIf="authService.isAdmin()">
            <a routerLink="/admin/badges" routerLinkActive="active" (click)="close()"
               *ngIf="menuVisibility.isVisible('admin/badges')">
              <i class="pi pi-id-card"></i> Print Name Badges
            </a>
            <a routerLink="/admin/settings" routerLinkActive="active" (click)="close()"
               *ngIf="menuVisibility.isVisible('admin/settings')">
              <i class="pi pi-cog"></i> Settings
            </a>
            <a routerLink="/admin/users" routerLinkActive="active" (click)="close()"
               *ngIf="menuVisibility.isVisible('admin/users')">
              <i class="pi pi-users"></i> Manage Users
            </a>
            <a routerLink="/admin/zoom-links" routerLinkActive="active" (click)="close()"
               *ngIf="menuVisibility.isVisible('admin/zoom-links')">
              <i class="pi pi-video"></i> Manage Zoom Links
            </a>
            <a routerLink="/merchandise" routerLinkActive="active" (click)="close()"
               *ngIf="menuVisibility.isVisible('merchandise')">
              <i class="pi pi-shopping-bag"></i> Merch
            </a>
            <a routerLink="/theme-poll" routerLinkActive="active" (click)="close()"
               *ngIf="menuVisibility.isVisible('theme-poll')">
              <i class="pi pi-chart-bar"></i> Theme Poll
            </a>
            <a href="javascript:void(0)" (click)="onForceRefresh()" class="refresh-action">
              <i class="pi pi-refresh"></i> Force Refresh
            </a>
          </ng-container>
        </ng-container>
      </div>
    </p-sidebar>
  `,
  styles: [`
    .sidebar-header {
      display: flex; align-items: center; gap: 0.75rem;
      font-size: 1.3rem; font-weight: 700; color: var(--retreat-teal-dark);
    }
    .sidebar-content {
      display: flex; flex-direction: column; padding: 1rem 0;
      a {
        display: flex; align-items: center; gap: 0.75rem;
        padding: 0.75rem 1rem; color: #333;
        text-decoration: none; border-radius: 8px;
        font-weight: 500; transition: all 0.2s;
        i { width: 20px; text-align: center; color: var(--retreat-teal-dark); }
        &:hover { background: rgba(26, 58, 74, 0.08); }
        &.active { background: rgba(26, 58, 74, 0.12); color: var(--retreat-teal-dark); font-weight: 600; }
      }
      a.donate-link {
        background: var(--retreat-sunset); color: #fff; font-weight: 700; margin-top: 0.35rem;
        i { color: #fff; }
        &:hover, &.active { background: var(--retreat-sunset); color: #fff; i { color: #fff; } }
      }
    }
    .sidebar-divider { height: 1px; background: #e0e0e0; margin: 0.75rem 0; }
    .refresh-action { color: var(--retreat-sunset) !important; margin-top: 0.5rem;
      i { color: var(--retreat-sunset) !important; }
    }
    .sidebar-section-title {
      padding: 0.5rem 1rem; font-size: 0.8rem; font-weight: 600;
      text-transform: uppercase; color: #6c757d; letter-spacing: 0.05em;
    }
  `]
})
export class SidebarComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  authService = inject(AuthService);
  menuVisibility = inject(MenuVisibilityService);

  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  /** Mirror of TopbarComponent.forceRefresh -- duplicated so the sidebar
   *  doesn't need a service injection for a one-shot user action. */
  async onForceRefresh(): Promise<void> {
    this.close();
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
      }
    } catch { /* best-effort */ }
    const url = new URL(window.location.href);
    url.searchParams.set('_r', Date.now().toString(36));
    window.location.replace(url.toString());
  }
}
