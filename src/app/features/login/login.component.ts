import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CardModule, InputTextModule, ButtonModule, PasswordModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-card-header">
          <h1>Welcome Back</h1>
        </div>
        <div class="login-card-body">
          <div *ngIf="errorMessage" class="error-message">
            <i class="pi pi-exclamation-triangle"></i> {{ errorMessage }}
          </div>
          <div class="field">
            <label for="username">Username or Email</label>
            <input id="username" type="text" pInputText [(ngModel)]="username"
                   class="w-full" placeholder="Enter your username or email" (keyup.enter)="login()" />
          </div>
          <div class="field">
            <label for="password">Password</label>
            <p-password id="password" [(ngModel)]="password" [feedback]="false"
                        [toggleMask]="true" styleClass="w-full"
                        inputStyleClass="w-full" placeholder="Enter your password"
                        (onKeyUp)="onPasswordKeyup($event)"></p-password>
          </div>
          <div class="forgot-link">
            <a routerLink="/forgot-password">Forgot your password?</a>
          </div>
          <button pButton label="Login" class="login-btn w-full"
                  [loading]="loading" (click)="login()"></button>
          <div class="login-footer">
            <p>Have credentials from an admin? <a routerLink="/register">Complete your registration</a></p>
            <a routerLink="/" class="guest-link">Continue browsing as guest</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: var(--retreat-grad-page-header);
      padding: 2rem;
    }
    .login-card {
      width: 100%; max-width: 420px;
      background: white; border-radius: 16px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
      overflow: hidden;
    }
    .login-card-header {
      padding: 2rem 2rem 0.5rem;
      text-align: center;
      h1 {
        font-size: 1.8rem; font-weight: 700; color: var(--retreat-teal-dark);
        margin: 0;
        font-style: italic;
      }
    }
    .login-card-body { padding: 1.5rem 2rem 2rem; }
    .field {
      margin-bottom: 1.25rem;
      label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: var(--retreat-teal-dark); font-size: 0.9rem; }
    }
    .error-message {
      background: #fee; border: 1px solid #fcc; border-radius: 6px;
      padding: 0.75rem 1rem; margin-bottom: 1rem; color: #c00;
      display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem;
    }
    .forgot-link {
      text-align: right; margin-bottom: 1.5rem;
      a { color: var(--retreat-sunset); text-decoration: none; font-size: 0.85rem; font-weight: 500;
        &:hover { text-decoration: underline; color: var(--retreat-copper); }
      }
    }
    ::ng-deep .login-btn.p-button {
      background: white !important;
      color: var(--retreat-teal-dark) !important;
      border: 2px solid var(--retreat-teal-dark) !important;
      font-weight: 700; font-size: 1rem;
      padding: 0.65rem; border-radius: 8px;
      transition: all 0.2s;
      &:hover {
        background: var(--retreat-grad-nav) !important;
        color: var(--retreat-cream) !important;
        border-color: var(--retreat-teal-dark) !important;
      }
    }
    .login-footer {
      margin-top: 1.5rem;
      p {
        margin: 0 0 0.35rem 0; color: #555; font-size: 0.9rem;
        a { color: var(--retreat-sunset); text-decoration: underline; font-weight: 500;
          &:hover { color: var(--retreat-copper); }
        }
      }
      .guest-link {
        color: var(--retreat-sunset); text-decoration: underline; font-size: 0.9rem; font-weight: 500;
        &:hover { color: var(--retreat-copper); }
      }
    }
    ::ng-deep .login-card-body .p-password { width: 100%; }
    ::ng-deep .login-card-body .p-inputtext {
      border-radius: 6px;
      border: 1px solid #ddd;
      padding: 0.65rem 0.85rem;
      &:focus { border-color: var(--retreat-teal-dark); box-shadow: 0 0 0 2px rgba(26, 58, 74, 0.15); }
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  loading = false;
  errorMessage = '';

  login(): void {
    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter username and password';
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: (state) => {
        if (state.passwordChangeRequired) {
          this.router.navigate(['/change-password']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message || 'Login failed';
      }
    });
  }

  onPasswordKeyup(event: any): void {
    if (event.key === 'Enter') this.login();
  }
}
