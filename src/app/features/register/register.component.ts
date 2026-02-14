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
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CardModule, InputTextModule, ButtonModule, PasswordModule],
  template: `
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <i class="pi pi-sun"></i>
          <h1>Create Account</h1>
          <p>NorCal Men's Retreat 2026</p>
        </div>
        <p-card>
          <div *ngIf="errorMessage" class="error-message">
            <i class="pi pi-exclamation-triangle"></i> {{ errorMessage }}
          </div>
          <div class="form-grid">
            <div class="field">
              <label>First Name</label>
              <input type="text" pInputText [(ngModel)]="firstName" class="w-full" />
            </div>
            <div class="field">
              <label>Last Name</label>
              <input type="text" pInputText [(ngModel)]="lastName" class="w-full" />
            </div>
          </div>
          <div class="field">
            <label>Username</label>
            <input type="text" pInputText [(ngModel)]="username" class="w-full" />
          </div>
          <div class="field">
            <label>Email</label>
            <input type="email" pInputText [(ngModel)]="email" class="w-full" />
          </div>
          <div class="field">
            <label>Password</label>
            <p-password [(ngModel)]="password" [toggleMask]="true" styleClass="w-full" inputStyleClass="w-full"></p-password>
          </div>
          <div class="field">
            <label>Confirm Password</label>
            <p-password [(ngModel)]="confirmPassword" [feedback]="false" [toggleMask]="true" styleClass="w-full" inputStyleClass="w-full"></p-password>
          </div>
          <button pButton label="Create Account" icon="pi pi-user-plus" class="w-full mt-3"
                  [loading]="loading" (click)="register()"></button>
          <div class="register-footer">
            Already have an account? <a routerLink="/login">Sign in</a>
          </div>
        </p-card>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(180deg, #1a3a4a 0%, #2a5a6a 40%, #c8923a 80%, #d4782f 100%);
      padding: 2rem;
    }
    .register-card { width: 100%; max-width: 500px; }
    .register-header {
      text-align: center; color: #f0e6d0; margin-bottom: 2rem;
      i { font-size: 3rem; color: #e8a832; }
      h1 { font-size: 2rem; margin: 1rem 0 0.5rem 0; font-weight: 700; }
      p { font-size: 1.1rem; opacity: 0.9; margin: 0; }
    }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .field {
      margin-bottom: 1rem;
      label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #1a3a4a; }
    }
    .error-message {
      background: #fee; border: 1px solid #fcc; border-radius: 6px;
      padding: 0.75rem 1rem; margin-bottom: 1rem; color: #c00;
      display: flex; align-items: center; gap: 0.5rem;
    }
    .register-footer {
      text-align: center; margin-top: 1.5rem; color: #666;
      a { color: #1a3a4a; text-decoration: none; font-weight: 500;
        &:hover { text-decoration: underline; color: #d4782f; }
      }
    }
    ::ng-deep .register-card .p-card { border-radius: 12px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2); }
    ::ng-deep .p-password { width: 100%; }
    @media (max-width: 480px) { .form-grid { grid-template-columns: 1fr; } }
  `]
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  firstName = '';
  lastName = '';
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  loading = false;
  errorMessage = '';

  register(): void {
    if (!this.firstName || !this.lastName || !this.username || !this.email || !this.password) {
      this.errorMessage = 'All fields are required';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }
    if (this.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters';
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.authService.register({
      firstName: this.firstName, lastName: this.lastName,
      username: this.username, email: this.email, password: this.password
    }).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message || 'Registration failed';
      }
    });
  }
}
