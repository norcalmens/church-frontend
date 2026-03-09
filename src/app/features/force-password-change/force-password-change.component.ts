import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-force-password-change',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, ButtonModule, PasswordModule],
  template: `
    <div class="change-container">
      <div class="change-card">
        <p-card>
          <div class="change-header">
            <i class="pi pi-lock"></i>
            <h1>Password Change Required</h1>
            <p>For security, you must change your password before continuing.</p>
          </div>

          <div *ngIf="errorMessage" class="error-message">
            <i class="pi pi-exclamation-triangle"></i> {{ errorMessage }}
          </div>

          <form [formGroup]="form">
            <div class="field">
              <label>Current Password *</label>
              <p-password formControlName="currentPassword" [feedback]="false"
                          [toggleMask]="true" styleClass="w-full" inputStyleClass="w-full"
                          placeholder="Enter your current password"></p-password>
            </div>

            <div class="field">
              <label>New Password *</label>
              <p-password formControlName="newPassword" [toggleMask]="true"
                          styleClass="w-full" inputStyleClass="w-full"
                          placeholder="Create a strong new password"></p-password>
              <div class="password-requirements" *ngIf="form.get('newPassword')?.dirty">
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
              <small class="p-error" *ngIf="form.get('confirmPassword')?.dirty && passwordMismatch">
                Passwords do not match
              </small>
            </div>

            <button pButton label="Change Password & Continue" icon="pi pi-check"
                    class="w-full mt-2 change-btn" [loading]="loading"
                    [disabled]="form.invalid || passwordMismatch || !hasMinLength || !hasUppercase || !hasLowercase || !hasNumber"
                    (click)="onSubmit()"></button>
          </form>

          <div class="logout-link">
            <a (click)="onLogout()"><i class="pi pi-sign-out"></i> Log out and return to login</a>
          </div>
        </p-card>
      </div>
    </div>
  `,
  styles: [`
    .change-container {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(180deg, #1a3a4a 0%, #2a5a6a 40%, #c8923a 80%, #d4782f 100%);
      padding: 2rem;
    }
    .change-card { width: 100%; max-width: 480px; }
    ::ng-deep .change-card .p-card {
      border-radius: 12px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2); overflow: hidden;
    }
    ::ng-deep .p-password { width: 100%; }

    .change-header {
      text-align: center; color: #f0e6d0;
      background: linear-gradient(135deg, #1a3a4a 0%, #1e4d5e 100%);
      padding: 2rem; margin: -1.25rem -1.25rem 1.5rem -1.25rem;
      i { font-size: 2.5rem; color: #f0e6d0; }
      h1 { font-size: 1.5rem; margin: 0.75rem 0 0.5rem 0; font-weight: 700; }
      p { font-size: 0.9rem; opacity: 0.85; margin: 0; }
    }

    .field {
      margin-bottom: 1.25rem;
      label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #1a3a4a; }
    }

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

    ::ng-deep .change-btn {
      background: #1a3a4a !important; border-color: #1a3a4a !important;
      &:hover { background: #1e4d5e !important; border-color: #1e4d5e !important; }
    }

    .logout-link {
      text-align: center; margin-top: 1.5rem;
      a { color: #999; text-decoration: none; cursor: pointer; font-size: 0.85rem;
        display: inline-flex; align-items: center; gap: 0.4rem;
        &:hover { color: #d4782f; }
      }
    }
  `]
})
export class ForcePasswordChangeComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = false;
  errorMessage = '';

  form: FormGroup = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  });

  get newPasswordValue(): string {
    return this.form.get('newPassword')?.value || '';
  }

  get hasMinLength(): boolean { return this.newPasswordValue.length >= 8; }
  get hasUppercase(): boolean { return /[A-Z]/.test(this.newPasswordValue); }
  get hasLowercase(): boolean { return /[a-z]/.test(this.newPasswordValue); }
  get hasNumber(): boolean { return /[0-9]/.test(this.newPasswordValue); }
  get passwordMismatch(): boolean {
    return this.form.get('confirmPassword')?.value !== this.newPasswordValue;
  }

  onSubmit(): void {
    if (this.form.invalid || this.passwordMismatch) return;
    this.loading = true;
    this.errorMessage = '';

    this.authService.changePassword({
      currentPassword: this.form.value.currentPassword,
      newPassword: this.form.value.newPassword
    }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message || 'Password change failed. Please try again.';
      }
    });
  }

  onLogout(): void {
    this.authService.logout();
  }
}
