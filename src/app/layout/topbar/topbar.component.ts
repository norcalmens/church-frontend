import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ButtonModule],
  template: `
    <div class="topbar">
      <div class="topbar-left">
        <button pButton icon="pi pi-bars" class="p-button-text p-button-rounded mobile-menu-btn"
                (click)="toggleSidebar.emit()"></button>
        <a routerLink="/" class="topbar-logo">
          <i class="pi pi-sun"></i>
          <span>NorCal Men's Retreat</span>
        </a>
      </div>
      <nav class="topbar-nav">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a>
        <a routerLink="/registration" routerLinkActive="active">Register</a>
        <a routerLink="/venue" routerLinkActive="active">Venue</a>
        <a routerLink="/theme-poll" routerLinkActive="active">Theme Poll</a>
        <a routerLink="/admin/dashboard" routerLinkActive="active" *ngIf="authService.isAdmin()">Admin</a>
      </nav>
      <div class="topbar-right">
        <ng-container *ngIf="authService.getCurrentUser() as user; else loginLink">
          <span class="user-greeting">{{ user.username }}</span>
          <button pButton icon="pi pi-sign-out" class="p-button-text p-button-rounded"
                  (click)="authService.logout()"></button>
        </ng-container>
        <ng-template #loginLink>
          <a routerLink="/login" class="login-link">
            <i class="pi pi-sign-in"></i> Login
          </a>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .topbar {
      position: fixed;
      top: 0; left: 0; right: 0;
      height: 60px;
      background: linear-gradient(135deg, #1a3a4a 0%, #1e4d5e 100%);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      z-index: 1000;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
    .topbar-left { display: flex; align-items: center; gap: 0.5rem; }
    .mobile-menu-btn { display: none; color: #f0e6d0 !important; }
    .topbar-logo {
      display: flex; align-items: center; gap: 0.75rem;
      text-decoration: none; color: #f0e6d0;
      font-size: 1.3rem; font-weight: 700;
      i { font-size: 1.5rem; color: #e8a832; }
    }
    .topbar-nav {
      display: flex; gap: 0.5rem;
      a {
        color: rgba(240, 230, 208, 0.8); text-decoration: none;
        padding: 0.5rem 1rem; border-radius: 6px;
        font-weight: 500; transition: all 0.2s;
        &:hover { color: #f0e6d0; background: rgba(255, 255, 255, 0.1); }
        &.active { color: #e8a832; background: rgba(232, 168, 50, 0.15); }
      }
    }
    .topbar-right { display: flex; align-items: center; gap: 0.75rem; }
    .user-greeting { color: #f0e6d0; font-size: 0.9rem; font-weight: 500; }
    .login-link {
      color: #f0e6d0; text-decoration: none; font-weight: 500;
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.5rem 1rem; border-radius: 6px; transition: all 0.2s;
      &:hover { background: rgba(255, 255, 255, 0.1); color: #e8a832; }
    }
    ::ng-deep .topbar-right .p-button.p-button-text {
      color: #f0e6d0 !important;
      &:hover { background: rgba(255, 255, 255, 0.1) !important; }
    }
    @media (max-width: 768px) {
      .mobile-menu-btn { display: block; }
      .topbar-nav { display: none; }
      .user-greeting { display: none; }
    }
  `]
})
export class TopbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
  authService = inject(AuthService);
}
