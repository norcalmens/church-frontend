import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { StepsModule } from 'primeng/steps';
import { CheckboxModule } from 'primeng/checkbox';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-complete-registration',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    CardModule, InputTextModule, ButtonModule, PasswordModule, StepsModule, CheckboxModule
  ],
  template: `
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <h1>Complete Your Registration</h1>
          <p>Enter the credentials provided by your retreat admin</p>
        </div>
        <p-card>
          <div class="steps-container">
            <div class="step" [class.active]="activeStep === 0" [class.completed]="activeStep > 0">
              <span class="step-number">1</span>
              <span class="step-label">Verify</span>
            </div>
            <div class="step-line" [class.completed]="activeStep > 0"></div>
            <div class="step" [class.active]="activeStep === 1">
              <span class="step-number">2</span>
              <span class="step-label">Complete</span>
            </div>
          </div>

          <div *ngIf="errorMessage" class="error-message">
            <i class="pi pi-exclamation-triangle"></i> {{ errorMessage }}
          </div>
          <div *ngIf="successMessage" class="success-message">
            <i class="pi pi-check-circle"></i> {{ successMessage }}
          </div>

          <!-- Step 1: Verify Credentials -->
          <div *ngIf="activeStep === 0">
            <div class="info-banner">
              <i class="pi pi-info-circle"></i>
              <span>Enter the email or username and temporary password your retreat administrator provided to you.</span>
            </div>
            <form [formGroup]="verifyForm">
              <div class="field">
                <label>Email or Username *</label>
                <input type="text" pInputText formControlName="email" class="w-full"
                       placeholder="your.email@example.com or username" />
              </div>
              <div class="field">
                <label>Temporary Password *</label>
                <p-password formControlName="currentPassword" [feedback]="false"
                            [toggleMask]="true" styleClass="w-full" inputStyleClass="w-full"
                            placeholder="Enter the password you were given"></p-password>
              </div>
              <button pButton label="Verify & Continue" icon="pi pi-arrow-right" iconPos="right"
                      class="w-full mt-2 verify-btn" [loading]="loading"
                      [disabled]="verifyForm.invalid" (click)="onVerify()"></button>
            </form>
            <div class="register-footer">
              Already registered? <a routerLink="/login">Sign in here</a>
            </div>
          </div>

          <!-- Step 2: Complete Profile -->
          <div *ngIf="activeStep === 1">
            <form [formGroup]="completeForm">
              <div class="form-grid">
                <div class="field">
                  <label>First Name *</label>
                  <input type="text" pInputText formControlName="firstName" class="w-full" />
                </div>
                <div class="field">
                  <label>Last Name *</label>
                  <input type="text" pInputText formControlName="lastName" class="w-full" />
                </div>
              </div>
              <div class="field">
                <label>New Password *</label>
                <p-password formControlName="newPassword" [toggleMask]="true"
                            styleClass="w-full" inputStyleClass="w-full"
                            placeholder="Create a strong new password"></p-password>
                <div class="password-requirements" *ngIf="completeForm.get('newPassword')?.dirty">
                  <div [class.met]="hasMinLength"><i [class]="hasMinLength ? 'pi pi-check-circle' : 'pi pi-circle'"></i> At least 8 characters</div>
                  <div [class.met]="hasUppercase"><i [class]="hasUppercase ? 'pi pi-check-circle' : 'pi pi-circle'"></i> One uppercase letter</div>
                  <div [class.met]="hasLowercase"><i [class]="hasLowercase ? 'pi pi-check-circle' : 'pi pi-circle'"></i> One lowercase letter</div>
                  <div [class.met]="hasNumber"><i [class]="hasNumber ? 'pi pi-check-circle' : 'pi pi-circle'"></i> One number</div>
                </div>
              </div>
              <div class="field">
                <label>Confirm New Password *</label>
                <p-password formControlName="confirmPassword" [feedback]="false"
                            [toggleMask]="true" styleClass="w-full" inputStyleClass="w-full"
                            placeholder="Re-enter your new password"></p-password>
                <small class="p-error" *ngIf="completeForm.get('confirmPassword')?.dirty && passwordMismatch">
                  Passwords do not match
                </small>
              </div>
              <div class="button-row">
                <button pButton label="Back" icon="pi pi-arrow-left"
                        class="p-button-text p-button-secondary" (click)="goBack()"></button>
                <button pButton label="Complete Registration" icon="pi pi-check"
                        class="complete-btn" [loading]="loading"
                        [disabled]="completeForm.invalid || passwordMismatch || !hasMinLength || !hasUppercase || !hasLowercase || !hasNumber"
                        (click)="onSubmit()"></button>
              </div>
            </form>
            <div class="register-footer">
              Already registered? <a routerLink="/login">Sign in here</a>
            </div>
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
    .register-card { width: 100%; max-width: 520px; }
    .register-header {
      text-align: center; color: #f0e6d0; margin-bottom: 2rem;
      background: linear-gradient(135deg, #1a3a4a 0%, #1e4d5e 100%);
      padding: 2rem; border-radius: 12px 12px 0 0;
      margin: -2rem -2rem 0 -2rem; position: relative;
      h1 { font-size: 1.6rem; margin: 0 0 0.5rem 0; font-weight: 700; }
      p { font-size: 0.95rem; opacity: 0.85; margin: 0; }
    }
    ::ng-deep .register-card .p-card {
      border-radius: 12px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      overflow: hidden;
    }
    ::ng-deep .register-card .p-card .p-card-body { padding-top: 0; }
    ::ng-deep .p-password { width: 100%; }

    .steps-container {
      display: flex; align-items: center; justify-content: center;
      padding: 1.5rem 0; gap: 0.75rem;
    }
    .step {
      display: flex; align-items: center; gap: 0.5rem;
      .step-number {
        width: 28px; height: 28px; border-radius: 50%;
        background: #ddd; color: #666; font-weight: 700; font-size: 0.85rem;
        display: flex; align-items: center; justify-content: center;
      }
      .step-label { color: #999; font-weight: 500; font-size: 0.9rem; }
      &.active .step-number { background: #1a3a4a; color: #fff; }
      &.active .step-label { color: #1a3a4a; font-weight: 700; }
      &.completed .step-number { background: #2e7d32; color: #fff; }
      &.completed .step-label { color: #2e7d32; }
    }
    .step-line {
      width: 60px; height: 2px; background: #ddd;
      &.completed { background: #2e7d32; }
    }

    .info-banner {
      display: flex; gap: 0.75rem; align-items: flex-start;
      background: rgba(26, 58, 74, 0.05); border-left: 3px solid #1a3a4a;
      padding: 0.75rem 1rem; border-radius: 4px; margin-bottom: 1.5rem;
      font-size: 0.85rem; color: #555;
      i { color: #1a3a4a; margin-top: 2px; }
    }

    .field {
      margin-bottom: 1.25rem;
      label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #1a3a4a; }
    }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

    .password-requirements {
      margin-top: 0.5rem; font-size: 0.8rem;
      div { display: flex; align-items: center; gap: 0.4rem; color: #999; margin: 0.2rem 0;
        i { font-size: 0.8rem; }
        &.met { color: #2e7d32; }
      }
    }

    .error-message {
      background: #fee; border: 1px solid #fcc; border-radius: 6px;
      padding: 0.75rem 1rem; margin-bottom: 1rem; color: #c00;
      display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem;
    }
    .success-message {
      background: #e8f5e9; border: 1px solid #c8e6c9; border-radius: 6px;
      padding: 0.75rem 1rem; margin-bottom: 1rem; color: #2e7d32;
      display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem;
    }

    ::ng-deep .verify-btn {
      background: #1a3a4a !important; border-color: #1a3a4a !important;
      &:hover { background: #1e4d5e !important; border-color: #1e4d5e !important; }
    }
    ::ng-deep .complete-btn {
      background: #1a3a4a !important; border-color: #1a3a4a !important;
      &:hover { background: #1e4d5e !important; border-color: #1e4d5e !important; }
    }

    .button-row {
      display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;
    }

    .register-footer {
      text-align: center; margin-top: 1.5rem; color: #666; font-size: 0.9rem;
      a { color: #1a3a4a; text-decoration: none; font-weight: 600;
        &:hover { text-decoration: underline; color: #d4782f; }
      }
    }

    @media (max-width: 480px) { .form-grid { grid-template-columns: 1fr; } }
  `]
})
export class CompleteRegistrationComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  activeStep = 0;
  loading = false;
  errorMessage = '';
  successMessage = '';

  verifyForm: FormGroup = this.fb.group({
    email: ['', Validators.required],
    currentPassword: ['', Validators.required]
  });

  completeForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  });

  get newPasswordValue(): string {
    return this.completeForm.get('newPassword')?.value || '';
  }

  get hasMinLength(): boolean { return this.newPasswordValue.length >= 8; }
  get hasUppercase(): boolean { return /[A-Z]/.test(this.newPasswordValue); }
  get hasLowercase(): boolean { return /[a-z]/.test(this.newPasswordValue); }
  get hasNumber(): boolean { return /[0-9]/.test(this.newPasswordValue); }
  get passwordMismatch(): boolean {
    return this.completeForm.get('confirmPassword')?.value !== this.newPasswordValue;
  }

  onVerify(): void {
    if (this.verifyForm.invalid) return;
    this.loading = true;
    this.errorMessage = '';

    const { email, currentPassword } = this.verifyForm.value;
    this.authService.login({ username: email, password: currentPassword }).subscribe({
      next: (state) => {
        this.loading = false;
        if (state.passwordChangeRequired) {
          this.activeStep = 1;
        } else {
          this.successMessage = 'Your account is already activated.';
          setTimeout(() => this.router.navigate(['/']), 1500);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message || 'Invalid credentials. Please check your email/username and temporary password.';
      }
    });
  }

  onSubmit(): void {
    if (this.completeForm.invalid || this.passwordMismatch) return;
    this.loading = true;
    this.errorMessage = '';

    const request = {
      email: this.verifyForm.value.email,
      currentPassword: this.verifyForm.value.currentPassword,
      newPassword: this.completeForm.value.newPassword,
      firstName: this.completeForm.value.firstName,
      lastName: this.completeForm.value.lastName
    };

    this.authService.completeRegistration(request).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Registration complete! Redirecting...';
        setTimeout(() => this.router.navigate(['/']), 1500);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || err?.message || 'Registration failed. Please try again.';
        if (this.errorMessage.toLowerCase().includes('credentials')) {
          this.activeStep = 0;
        }
      }
    });
  }

  goBack(): void {
    this.activeStep = 0;
    this.errorMessage = '';
  }
}
