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
        <div class="login-header">
          <i class="pi pi-sun"></i>
          <h1>NorCal Men's Retreat</h1>
          <p>June 11-13, 2026</p>
        </div>
        <p-card>
          <h2 style="text-align: center; margin-bottom: 1.5rem; color: #1a3a4a;">Sign In</h2>
          <div *ngIf="errorMessage" class="error-message">
            <i class="pi pi-exclamation-triangle"></i> {{ errorMessage }}
          </div>
          <div class="field">
            <label for="username">Username</label>
            <input id="username" type="text" pInputText [(ngModel)]="username"
                   class="w-full" placeholder="Enter username" (keyup.enter)="login()" />
          </div>
          <div class="field">
            <label for="password">Password</label>
            <p-password id="password" [(ngModel)]="password" [feedback]="false"
                        [toggleMask]="true" styleClass="w-full"
                        inputStyleClass="w-full" placeholder="Enter password"
                        (onKeyUp)="onPasswordKeyup($event)"></p-password>
          </div>
          <button pButton label="Sign In" icon="pi pi-sign-in" class="w-full mt-3"
                  [loading]="loading" (click)="login()"></button>
          <div class="login-footer">
            <a routerLink="/register">Create an account</a>
          </div>
        </p-card>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(180deg, #1a3a4a 0%, #2a5a6a 40%, #c8923a 80%, #d4782f 100%);
      padding: 2rem;
    }
    .login-card { width: 100%; max-width: 420px; }
    .login-header {
      text-align: center; color: #f0e6d0; margin-bottom: 2rem;
      i { font-size: 3rem; color: #e8a832; }
      h1 { font-size: 2rem; margin: 1rem 0 0.5rem 0; font-weight: 700; }
      p { font-size: 1.1rem; opacity: 0.9; margin: 0; }
    }
    .field {
      margin-bottom: 1.25rem;
      label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #1a3a4a; }
    }
    .error-message {
      background: #fee; border: 1px solid #fcc; border-radius: 6px;
      padding: 0.75rem 1rem; margin-bottom: 1rem; color: #c00;
      display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem;
    }
    .login-footer {
      text-align: center; margin-top: 1.5rem;
      a { color: #1a3a4a; text-decoration: none; font-weight: 500;
        &:hover { text-decoration: underline; color: #d4782f; }
      }
    }
    ::ng-deep .login-card .p-card { border-radius: 12px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2); }
    ::ng-deep .p-password { width: 100%; }
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
      next: () => this.router.navigate(['/']),
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
