import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

/** Lightweight "forgot password" landing page. We don't have email
 *  infrastructure wired for self-serve resets yet, so this page walks the
 *  user through the manual path: contact Bro. Washington, who logs in as
 *  admin and uses Force Password in User Management to issue a temp
 *  credential. Replaces the broken /forgot-password route that was sending
 *  visitors to home via the wildcard. */
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule],
  template: `
    <div class="fp-container">
      <div class="fp-card">
        <div class="fp-icon"><i class="pi pi-key"></i></div>
        <h1>Reset Your Password</h1>
        <p class="lead">
          We don't yet have an automated reset link. A site admin can reset
          your password for you in seconds &mdash; reach out using either
          option below.
        </p>

        <div class="fp-options">
          <a href="tel:+17076563789" class="fp-option">
            <i class="pi pi-phone"></i>
            <div>
              <strong>Call Bro. Washington</strong>
              <span>(707) 656-3789</span>
            </div>
          </a>
          <a href="mailto:deronsoftware@gmail.com?subject=Password reset request"
             class="fp-option">
            <i class="pi pi-envelope"></i>
            <div>
              <strong>Email the site admin</strong>
              <span>deronsoftware&#64;gmail.com</span>
            </div>
          </a>
        </div>

        <p class="hint">
          <i class="pi pi-info-circle"></i>
          Once the admin sets a temporary password, you'll be asked to
          choose a new one on your next sign-in.
        </p>

        <a routerLink="/login">
          <button pButton label="Back to Login" icon="pi pi-arrow-left" class="p-button-outlined"></button>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .fp-container {
      min-height: 80vh; display: flex; align-items: center; justify-content: center;
      padding: 2rem 1rem;
    }
    .fp-card {
      background: #fff; border-radius: 16px;
      max-width: 540px; width: 100%;
      padding: 2.25rem 2rem;
      box-shadow: 0 12px 32px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.04);
      text-align: center;
    }
    .fp-icon {
      width: 64px; height: 64px; border-radius: 50%;
      background: var(--retreat-grad-nav);
      color: var(--retreat-gold);
      display: inline-flex; align-items: center; justify-content: center;
      margin-bottom: 1rem;
      i { font-size: 1.65rem; }
    }
    h1 { color: var(--retreat-teal-dark); font-size: 1.55rem; margin: 0 0 0.5rem; }
    .lead { color: #495057; line-height: 1.55; margin: 0 0 1.4rem; }

    .fp-options {
      display: flex; flex-direction: column; gap: 0.65rem;
      margin: 0 auto 1.25rem; max-width: 380px;
    }
    .fp-option {
      display: flex; align-items: center; gap: 0.85rem; text-align: left;
      padding: 0.85rem 1.1rem;
      background: var(--retreat-cream-soft);
      border: 1px solid rgba(212, 120, 47, 0.25);
      border-radius: 10px; color: var(--retreat-teal-dark);
      text-decoration: none; transition: all 0.15s;
      &:hover { transform: translateY(-1px); border-color: var(--retreat-sunset);
        box-shadow: 0 6px 16px rgba(212, 120, 47, 0.18);
      }
      i { font-size: 1.3rem; color: var(--retreat-sunset); flex-shrink: 0; }
      strong { display: block; font-size: 0.98rem; }
      span { font-size: 0.88rem; color: #6c757d; }
    }

    .hint {
      color: #6e4b08; font-size: 0.88rem; line-height: 1.5;
      background: rgba(232, 168, 50, 0.08);
      border-left: 3px solid var(--retreat-gold);
      padding: 0.65rem 0.85rem; margin: 0 auto 1.5rem; max-width: 420px;
      border-radius: 6px;
      i { color: var(--retreat-sunset); margin-right: 0.3rem; }
    }

    a { text-decoration: none; }
  `]
})
export class ForgotPasswordComponent {}
