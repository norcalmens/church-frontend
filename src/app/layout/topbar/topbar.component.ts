import { Component, EventEmitter, Output, ViewChild, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../core/auth/auth.service';
import { MenuVisibilityService } from '../../core/services/menu-visibility.service';
import { MenuSelectorComponent } from '../../features/admin/menu-selector/menu-selector.component';

interface SearchItem {
  label: string;
  description: string;
  icon: string;
  route: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, ButtonModule, MenuSelectorComponent],
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
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}"
           *ngIf="menuVisibility.isVisible('home')">Home</a>
        <a routerLink="/registration" routerLinkActive="active"
           *ngIf="menuVisibility.isVisible('registration')">Register</a>
        <a routerLink="/venue" routerLinkActive="active"
           *ngIf="menuVisibility.isVisible('venue')">Venue</a>
        <a routerLink="/theme-poll" routerLinkActive="active"
           *ngIf="authService.isAdmin() && menuVisibility.isVisible('theme-poll')">Theme Poll</a>
        <a routerLink="/admin/dashboard" routerLinkActive="active"
           *ngIf="authService.isAdmin() && menuVisibility.isVisible('admin/dashboard')">Admin</a>
      </nav>
      <div class="topbar-right">
        <button pButton icon="pi pi-search" class="p-button-text p-button-rounded search-btn"
                pTooltip="Search" (click)="toggleSearch()"></button>
        <button *ngIf="authService.isAdmin()" pButton icon="pi pi-th-large"
                class="p-button-text p-button-rounded gear-btn"
                (click)="menuSelector.open()"
                pTooltip="Menu Visibility"></button>
        <ng-container *ngIf="authService.getCurrentUser() as user; else loginLink">
          <span class="user-greeting">{{ user.username }}</span>
          <button pButton icon="pi pi-sign-out" class="p-button-text p-button-rounded"
                  pTooltip="Logout" (click)="authService.logout()"></button>
        </ng-container>
        <ng-template #loginLink>
          <button pButton label="Login" icon="pi pi-sign-in"
                  class="p-button-outlined login-btn"
                  (click)="navigateTo('/login')"></button>
        </ng-template>
      </div>
    </div>

    <!-- Search Overlay -->
    <div class="search-overlay" *ngIf="searchOpen" (click)="closeSearch()">
      <div class="search-dialog" (click)="$event.stopPropagation()">
        <div class="search-input-wrapper">
          <i class="pi pi-search"></i>
          <input type="text" [(ngModel)]="searchQuery" placeholder="Search pages..."
                 (input)="onSearch()" autofocus #searchInput />
          <span class="search-shortcut" *ngIf="!searchQuery">ESC</span>
        </div>
        <div class="search-results" *ngIf="filteredItems.length > 0">
          <a *ngFor="let item of filteredItems" class="search-result-item"
             (click)="goTo(item.route)">
            <i [class]="'pi ' + item.icon"></i>
            <div class="result-text">
              <span class="result-label">{{ item.label }}</span>
              <span class="result-desc">{{ item.description }}</span>
            </div>
            <i class="pi pi-arrow-right result-arrow"></i>
          </a>
        </div>
        <div class="search-empty" *ngIf="searchQuery && filteredItems.length === 0">
          <i class="pi pi-search"></i>
          <span>No results for "{{ searchQuery }}"</span>
        </div>
      </div>
    </div>

    <app-menu-selector #menuSelector></app-menu-selector>
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
    .search-btn {
      color: #f0e6d0 !important;
      &:hover { background: rgba(255, 255, 255, 0.1) !important; color: #e8a832 !important; }
    }
    ::ng-deep .login-btn.p-button-outlined {
      color: #f0e6d0 !important;
      border-color: #f0e6d0 !important;
      background: transparent !important;
      font-weight: 600;
      padding: 0.4rem 1.25rem;
      border-radius: 8px;
      transition: all 0.2s;
      &:hover {
        background: rgba(240, 230, 208, 0.15) !important;
        border-color: #e8a832 !important;
        color: #e8a832 !important;
      }
    }
    ::ng-deep .topbar-right .p-button.p-button-text {
      color: #f0e6d0 !important;
      &:hover { background: rgba(255, 255, 255, 0.1) !important; }
    }
    .gear-btn {
      color: #e8a832 !important;
      &:hover { color: #f0e6d0 !important; }
    }

    /* Search Overlay */
    .search-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.5); z-index: 1100;
      display: flex; align-items: flex-start; justify-content: center;
      padding-top: 100px;
      animation: fadeIn 0.15s ease;
    }
    .search-dialog {
      width: 100%; max-width: 560px; background: #fff;
      border-radius: 12px; box-shadow: 0 16px 48px rgba(0, 0, 0, 0.3);
      overflow: hidden;
      animation: slideDown 0.15s ease;
    }
    .search-input-wrapper {
      display: flex; align-items: center; padding: 1rem 1.25rem;
      border-bottom: 1px solid #eee; gap: 0.75rem;
      i { color: #999; font-size: 1.1rem; }
      input {
        flex: 1; border: none; outline: none; font-size: 1.05rem;
        color: #1a3a4a; background: transparent;
        &::placeholder { color: #bbb; }
      }
      .search-shortcut {
        font-size: 0.7rem; color: #999; border: 1px solid #ddd;
        padding: 0.15rem 0.4rem; border-radius: 4px; font-weight: 600;
      }
    }
    .search-results { max-height: 350px; overflow-y: auto; }
    .search-result-item {
      display: flex; align-items: center; padding: 0.85rem 1.25rem;
      gap: 0.85rem; cursor: pointer; text-decoration: none; color: #333;
      transition: background 0.15s;
      &:hover { background: rgba(26, 58, 74, 0.06); }
      i:first-child { color: #1a3a4a; font-size: 1rem; width: 20px; text-align: center; }
      .result-text { flex: 1; display: flex; flex-direction: column; }
      .result-label { font-weight: 600; font-size: 0.95rem; color: #1a3a4a; }
      .result-desc { font-size: 0.8rem; color: #888; margin-top: 1px; }
      .result-arrow { color: #ccc; font-size: 0.8rem; }
      &:hover .result-arrow { color: #e8a832; }
    }
    .search-empty {
      padding: 2rem; text-align: center; color: #999;
      display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
      i { font-size: 1.5rem; }
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

    @media (max-width: 768px) {
      .mobile-menu-btn { display: block; }
      .topbar-nav { display: none; }
      .user-greeting { display: none; }
      .search-overlay { padding-top: 70px; padding-left: 1rem; padding-right: 1rem; }
    }
  `]
})
export class TopbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
  @ViewChild('menuSelector') menuSelector!: MenuSelectorComponent;
  authService = inject(AuthService);
  menuVisibility = inject(MenuVisibilityService);
  private router = inject(Router);

  searchOpen = false;
  searchQuery = '';
  filteredItems: SearchItem[] = [];

  private allItems: SearchItem[] = [
    { label: 'Home', description: 'Main landing page', icon: 'pi-home', route: '/' },
    { label: 'Registration', description: 'Register for the retreat and pay', icon: 'pi-pencil', route: '/registration' },
    { label: 'Venue', description: 'Alliance Redwoods venue details', icon: 'pi-map-marker', route: '/venue' },
    { label: 'Payment', description: 'Retreat registration and payment', icon: 'pi-credit-card', route: '/registration' },
    { label: 'Theme Poll', description: 'Vote on retreat theme', icon: 'pi-chart-bar', route: '/theme-poll', adminOnly: true },
    { label: 'Admin Dashboard', description: 'View registrations and statistics', icon: 'pi-chart-line', route: '/admin/dashboard', adminOnly: true },
    { label: 'Manage Registrations', description: 'View and manage all registrations', icon: 'pi-users', route: '/admin/registrations', adminOnly: true },
    { label: 'User Management', description: 'Create and manage user accounts', icon: 'pi-user-edit', route: '/admin/users', adminOnly: true },
    { label: 'Login', description: 'Sign in to your account', icon: 'pi-sign-in', route: '/login' },
    { label: 'Complete Registration', description: 'Activate your admin account', icon: 'pi-user-plus', route: '/register' },
  ];

  toggleSearch(): void {
    this.searchOpen = !this.searchOpen;
    if (this.searchOpen) {
      this.searchQuery = '';
      this.filteredItems = this.getVisibleItems();
    }
  }

  closeSearch(): void {
    this.searchOpen = false;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.searchOpen) this.closeSearch();
  }

  onSearch(): void {
    const q = this.searchQuery.toLowerCase().trim();
    const visible = this.getVisibleItems();
    if (!q) {
      this.filteredItems = visible;
      return;
    }
    this.filteredItems = visible.filter(item =>
      item.label.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    );
  }

  goTo(route: string): void {
    this.closeSearch();
    this.router.navigate([route]);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  private getVisibleItems(): SearchItem[] {
    return this.allItems.filter(item => !item.adminOnly || this.authService.isAdmin());
  }
}
