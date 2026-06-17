import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { WaitlistService } from '../../services/waitlist.service';

@Component({
  selector: 'app-waitlist',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ButtonModule, InputTextModule, InputTextareaModule, InputNumberModule],
  template: `
    <div class="waitlist-container">
      <div class="hero">
        <i class="pi pi-calendar-plus"></i>
        <h1>Reserve Your Spot for Next Year</h1>
        <p class="subtitle">This year's retreat is full. Leave your info and we'll reach out as soon as <strong>2027</strong> registration opens &mdash; you'll be first in line.</p>
      </div>

      <form *ngIf="!submitted" class="form-card" (ngSubmit)="onSubmit()" #form="ngForm">
        <div class="form-row two-col">
          <div>
            <label for="first">First Name *</label>
            <input id="first" pInputText [(ngModel)]="entry.firstName" name="firstName" required autocomplete="given-name" />
          </div>
          <div>
            <label for="last">Last Name *</label>
            <input id="last" pInputText [(ngModel)]="entry.lastName" name="lastName" required autocomplete="family-name" />
          </div>
        </div>

        <div class="form-row">
          <label for="email">Email *</label>
          <input id="email" type="email" pInputText [(ngModel)]="entry.email" name="email" required autocomplete="email" />
        </div>

        <div class="form-row two-col">
          <div>
            <label for="phone">Phone</label>
            <input id="phone" pInputText [(ngModel)]="entry.phone" name="phone" autocomplete="tel" placeholder="(707) 555-0123" />
          </div>
          <div>
            <label for="seats">How many seats?</label>
            <p-inputNumber id="seats" [(ngModel)]="entry.requestedSeats" name="requestedSeats" [min]="1" [max]="20" [showButtons]="true" buttonLayout="horizontal" inputId="seats-input"></p-inputNumber>
          </div>
        </div>

        <div class="form-row">
          <label for="congregation">Congregation / Church</label>
          <input id="congregation" pInputText [(ngModel)]="entry.congregation" name="congregation" />
        </div>

        <div class="form-row">
          <label for="notes">Notes <span class="optional">(optional)</span></label>
          <textarea id="notes" pInputTextarea [(ngModel)]="entry.notes" name="notes" rows="3"
                    placeholder="Anything we should know about your flexibility, dates, or group?"></textarea>
        </div>

        <div class="actions">
          <button pButton type="submit" label="Notify Me About 2027" icon="pi pi-check"
                  [disabled]="!entry.firstName || !entry.lastName || !entry.email || submitting"
                  [loading]="submitting"></button>
        </div>

        <p *ngIf="errorMessage" class="error">{{ errorMessage }}</p>

        <p class="fallback">
          Prefer to call? Reach <strong>Bro. Washington</strong> at <a href="tel:+17076563789">(707) 656-3789</a>.
        </p>
      </form>

      <div *ngIf="submitted" class="thanks-card">
        <i class="pi pi-check-circle"></i>
        <h2>You're on the list!</h2>
        <p class="position">You are <strong>#{{ position }}</strong> in line for next year.</p>
        <p>We'll email <strong>{{ entry.email }}</strong> the moment 2027 registration opens &mdash; your {{ entry.requestedSeats }} seat{{ entry.requestedSeats === 1 ? '' : 's' }} will be held for early signup.</p>
        <div class="thanks-actions">
          <a routerLink="/"><button pButton label="Return Home" icon="pi pi-home" class="p-button-outlined"></button></a>
          <a routerLink="/itinerary"><button pButton label="See This Year's Itinerary" icon="pi pi-calendar"></button></a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .waitlist-container { max-width: 720px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.25rem; }

    .hero {
      background: var(--retreat-grad-nav);
      border-radius: 16px; padding: 2rem; text-align: center; color: #f0e6d0;
      i.pi-calendar-plus { font-size: 2.25rem; color: #e8a832; }
      h1 { font-size: 1.9rem; font-weight: 800; margin: 0.5rem 0 0.35rem; }
      .subtitle { font-size: 1rem; margin: 0; opacity: 0.92; line-height: 1.5; }
    }

    .form-card {
      background: #fff; border-radius: 14px; padding: 1.75rem;
      box-shadow: 0 4px 16px rgba(0,0,0,0.07);
      display: flex; flex-direction: column; gap: 1.1rem;
    }
    .form-row { display: flex; flex-direction: column; gap: 0.4rem;
      label { font-weight: 600; color: #1a3a4a; font-size: 0.95rem;
        .optional { color: #888; font-weight: 400; font-size: 0.85rem; margin-left: 0.25rem; }
      }
      input, textarea { font-size: 0.95rem; }
      textarea { resize: vertical; }
    }
    .form-row.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
      > div { display: flex; flex-direction: column; gap: 0.4rem; }
    }
    .actions { display: flex; justify-content: flex-end; padding-top: 0.4rem; }
    .error { color: #c0392b; margin: 0; font-size: 0.9rem; }
    .fallback { color: #6c757d; font-size: 0.88rem; text-align: center; margin: 0; padding-top: 0.5rem; border-top: 1px solid #eee;
      a { color: #b8651f; font-weight: 600; }
    }

    .thanks-card {
      background: #fff; border-radius: 14px; padding: 2.5rem 2rem; text-align: center;
      box-shadow: 0 4px 16px rgba(0,0,0,0.07);
      i.pi-check-circle { font-size: 3.5rem; color: #2e9e5b; }
      h2 { color: #1a3a4a; margin: 0.85rem 0 0.4rem; font-size: 1.65rem; }
      .position { font-size: 1.25rem; color: #1a3a4a; margin: 0.25rem 0 1rem;
        strong { color: #d4782f; font-size: 1.5rem; }
      }
      p { color: #495057; line-height: 1.55; margin: 0 0 0.5rem; }
    }
    .thanks-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center; margin-top: 1.25rem;
      a { text-decoration: none; }
    }

    @media (max-width: 600px) {
      .hero { padding: 1.5rem 1rem; }
      .hero h1 { font-size: 1.5rem; }
      .form-card { padding: 1.25rem; }
      .form-row.two-col { grid-template-columns: 1fr; }
      .actions { justify-content: stretch;
        ::ng-deep .p-button { width: 100%; justify-content: center; }
      }
      .thanks-actions a, .thanks-actions ::ng-deep .p-button { width: 100%; justify-content: center; }
    }
  `]
})
export class WaitlistComponent {
  private waitlistService = inject(WaitlistService);

  entry = {
    firstName: '', lastName: '', email: '', phone: '',
    congregation: '', requestedSeats: 1, notes: ''
  };

  submitting = false;
  submitted = false;
  position = 0;
  errorMessage = '';

  onSubmit(): void {
    if (this.submitting) return;
    this.errorMessage = '';
    this.submitting = true;
    this.waitlistService.create(this.entry).subscribe({
      next: (res) => {
        this.submitting = false;
        this.submitted = true;
        this.position = res.position;
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err?.error?.message || 'Could not add you to the waitlist. Please try again or call (707) 656-3789.';
      }
    });
  }
}
