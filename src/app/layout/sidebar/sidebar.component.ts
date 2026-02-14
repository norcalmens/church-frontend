import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarModule } from 'primeng/sidebar';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, SidebarModule],
  template: `
    <p-sidebar [(visible)]="visible" (visibleChange)="visibleChange.emit($event)" [showCloseIcon]="true">
      <ng-template pTemplate="header">
        <div class="sidebar-header">
          <i class="pi pi-sun" style="color: #e8a832; font-size: 1.5rem;"></i>
          <span>Menu</span>
        </div>
      </ng-template>
      <div class="sidebar-content">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="close()">
          <i class="pi pi-home"></i> Home
        </a>
        <a routerLink="/registration" routerLinkActive="active" (click)="close()">
          <i class="pi pi-pencil"></i> Register
        </a>
        <a routerLink="/venue" routerLinkActive="active" (click)="close()">
          <i class="pi pi-map"></i> Venue
        </a>
        <a routerLink="/theme-poll" routerLinkActive="active" (click)="close()">
          <i class="pi pi-chart-bar"></i> Theme Poll
        </a>
        <a routerLink="/payment" routerLinkActive="active" (click)="close()">
          <i class="pi pi-credit-card"></i> Payment
        </a>
        <ng-container *ngIf="authService.isAdmin()">
          <div class="sidebar-divider"></div>
          <div class="sidebar-section-title">Admin</div>
          <a routerLink="/admin/dashboard" routerLinkActive="active" (click)="close()">
            <i class="pi pi-chart-line"></i> Dashboard
          </a>
          <a routerLink="/admin/registrations" routerLinkActive="active" (click)="close()">
            <i class="pi pi-list"></i> All Registrations
          </a>
        </ng-container>
      </div>
    </p-sidebar>
  `,
  styles: [`
    .sidebar-header {
      display: flex; align-items: center; gap: 0.75rem;
      font-size: 1.3rem; font-weight: 700; color: #1a3a4a;
    }
    .sidebar-content {
      display: flex; flex-direction: column; padding: 1rem 0;
      a {
        display: flex; align-items: center; gap: 0.75rem;
        padding: 0.75rem 1rem; color: #333;
        text-decoration: none; border-radius: 8px;
        font-weight: 500; transition: all 0.2s;
        i { width: 20px; text-align: center; color: #1a3a4a; }
        &:hover { background: rgba(26, 58, 74, 0.08); }
        &.active { background: rgba(26, 58, 74, 0.12); color: #1a3a4a; font-weight: 600; }
      }
    }
    .sidebar-divider { height: 1px; background: #e0e0e0; margin: 0.75rem 0; }
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

  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
