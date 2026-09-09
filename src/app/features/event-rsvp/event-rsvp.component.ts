import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { EventRsvpService, EventRsvp } from '../../services/event-rsvp.service';

/**
 * Public RSVP form at /rsvp/:eventKey. Uses a small allowlist of
 * pretty labels so we can render event-specific copy ("You're RSVPing
 * for the Men's Breakfast") without needing a full Event entity server-side.
 */
@Component({
  selector: 'app-event-rsvp',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink,
            CardModule, ButtonModule, InputTextModule, InputTextareaModule,
            InputNumberModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <div class="rsvp-container">
      <!-- Loading state while we verify the event key with the backend -->
      <div *ngIf="loading" class="hero-section loading">
        <i class="pi pi-spin pi-spinner"></i>
        <p>Loading&hellip;</p>
      </div>

      <!-- 404 -->
      <div *ngIf="!loading && !eventExists" class="hero-section not-found">
        <i class="pi pi-exclamation-circle"></i>
        <h2>Event not found</h2>
        <p>This RSVP link is invalid or the event has ended.</p>
        <a routerLink="/"><button pButton label="Back to Home" icon="pi pi-home" class="p-button-outlined"></button></a>
      </div>

      <!-- Success -->
      <p-card *ngIf="submitted; else formCard" class="success-card">
        <div class="success-state">
          <i class="pi pi-check-circle"></i>
          <h2>You're on the list</h2>
          <p>Thanks, <strong>{{ submittedName }}</strong> &mdash; we've got your RSVP for the <strong>{{ eventLabel }}</strong>. See you {{ eventWhen }}.</p>
          <p class="hint" *ngIf="submittedEmail">We'll send any updates to <strong>{{ submittedEmail }}</strong>.</p>
          <a routerLink="/"><button pButton label="Back to Home" icon="pi pi-home" class="p-button-outlined"></button></a>
        </div>
      </p-card>

      <ng-template #formCard>
        <div *ngIf="!loading && eventExists">
          <div class="hero-section">
            <i class="pi pi-calendar-plus"></i>
            <h1>{{ eventLabel }}</h1>
            <p class="event-when">{{ eventWhen }}</p>
            <p class="event-where" *ngIf="eventWhere">{{ eventWhere }}</p>
          </div>

          <p-card>
            <ng-template pTemplate="header">
              <div class="card-header-bar"><i class="pi pi-pencil"></i><span>RSVP</span></div>
            </ng-template>
            <form [formGroup]="form" (ngSubmit)="submit()" class="rsvp-form">
              <div class="field">
                <label>Your Name <span class="req">*</span></label>
                <input pInputText formControlName="name" placeholder="First and last name" />
              </div>
              <div class="field-row">
                <div class="field">
                  <label>Email</label>
                  <input pInputText formControlName="email" type="email" placeholder="you@example.com" />
                </div>
                <div class="field">
                  <label>Phone</label>
                  <input pInputText formControlName="phone" placeholder="(555) 123-4567" />
                </div>
              </div>
              <small class="contact-hint">Provide at least one (email or phone) so we can confirm.</small>

              <div class="field">
                <label>Congregation <span class="optional">(optional)</span></label>
                <input pInputText formControlName="congregation" placeholder="Which church / congregation do you attend?" />
              </div>

              <div class="field">
                <label>How many total (including you)?</label>
                <p-inputNumber formControlName="guestCount" [min]="1" [max]="20" [showButtons]="true"
                               buttonLayout="horizontal" inputStyleClass="small-num"></p-inputNumber>
              </div>

              <div class="field">
                <label>Anything we should know? <span class="optional">(optional)</span></label>
                <textarea pInputTextarea formControlName="notes" rows="2" maxlength="500"
                          placeholder="Dietary restrictions, questions, anything to flag"></textarea>
              </div>

              <div class="submit-row">
                <button pButton type="submit" label="RSVP" icon="pi pi-check"
                        [loading]="submitting" [disabled]="form.invalid || submitting" size="large"></button>
              </div>
            </form>
          </p-card>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .rsvp-container { max-width: 640px; margin: 0 auto; padding: 0 1rem; display: flex; flex-direction: column; gap: 1.25rem; }
    .hero-section {
      background: var(--retreat-grad-nav);
      border-radius: 16px; padding: 2rem 1.5rem; text-align: center; color: var(--retreat-cream);
      i { font-size: 2.4rem; color: var(--retreat-gold); }
      h1, h2 { font-size: 1.9rem; font-weight: 800; margin: 0.5rem 0 0.5rem; }
      p { margin: 0.2rem 0; line-height: 1.5; opacity: 0.94; }
      .event-when { font-size: 1.15rem; font-weight: 600; color: var(--retreat-gold); margin-top: 0.6rem; }
      .event-where { font-size: 1rem; opacity: 0.9; }
    }
    .hero-section.loading, .hero-section.not-found {
      background: #fff; color: var(--retreat-teal-dark); box-shadow: 0 4px 16px rgba(0,0,0,0.06);
      i { color: var(--retreat-sunset); }
      a { text-decoration: none; display: inline-block; margin-top: 1rem; }
    }
    .card-header-bar {
      display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.5rem;
      background: var(--retreat-grad-nav); color: var(--retreat-cream); font-size: 1.05rem; font-weight: 600;
    }
    ::ng-deep .rsvp-container .p-card { border-radius: 12px; overflow: hidden;
      .p-card-header { padding: 0; border-bottom: none; }
      .p-card-body { padding: 1.5rem 1.75rem; }
      .p-card-content { padding: 0; }
    }
    .rsvp-form { display: flex; flex-direction: column; gap: 1rem; }
    .field { display: flex; flex-direction: column; gap: 0.35rem;
      label { font-size: 0.9rem; font-weight: 600; color: var(--retreat-teal-dark); }
      .req { color: var(--retreat-sunset); }
      .optional { color: #9aa0a6; font-weight: 400; font-size: 0.82em; }
      input, textarea { width: 100%; }
    }
    .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
      > .field { min-width: 0; }
    }
    .contact-hint { color: #6c757d; font-size: 0.78rem; margin-top: -0.4rem; }
    ::ng-deep .rsvp-form .p-inputnumber { width: fit-content; }
    ::ng-deep .rsvp-form .small-num { width: 5rem; text-align: center; }
    .submit-row { display: flex; justify-content: flex-end; margin-top: 0.5rem; }
    .success-state {
      text-align: center; padding: 1.5rem 1rem;
      i { font-size: 3.5rem; color: #2e9e5b; display: block; margin-bottom: 0.85rem; }
      h2 { color: var(--retreat-teal-dark); margin: 0 0 0.75rem; font-size: 1.5rem; }
      p { color: #495057; line-height: 1.6; max-width: 480px; margin: 0.35rem auto;
        strong { color: var(--retreat-teal-dark); }
      }
      .hint { color: #6c757d; font-size: 0.9rem; margin-top: 0.75rem; }
      a { text-decoration: none; display: inline-block; margin-top: 1.25rem; }
    }
    @media (max-width: 640px) { .field-row { grid-template-columns: 1fr; } }
  `]
})
export class EventRsvpComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private svc = inject(EventRsvpService);
  private toast = inject(MessageService);
  private fb = inject(FormBuilder);

  /** Pretty label + when/where strings per event. Kept on the frontend so
   *  we don't need a whole Event table server-side just to show a title. */
  private static readonly EVENTS: Record<string, { label: string; when: string; where?: string }> = {
    'breakfast-oct-2026': {
      label: 'Retreat Info Breakfast',
      when: 'Saturday, October 3, 2026 · 8:00 AM',
      where: 'Golden Corral #2697 · 2050 Diamond Blvd, Concord, CA 94520',
    },
  };

  eventKey = '';
  eventLabel = '';
  eventWhen  = '';
  eventWhere = '';

  loading = true;
  eventExists = false;
  submitted = false;
  submitting = false;
  submittedName = '';
  submittedEmail = '';

  form = this.fb.group({
    name:  ['', [Validators.required, Validators.maxLength(200)]],
    email: ['', [Validators.email, Validators.maxLength(200)]],
    phone: [''],
    congregation: ['', Validators.maxLength(200)],
    guestCount: [1, [Validators.required, Validators.min(1), Validators.max(20)]],
    notes: [''],
  });

  ngOnInit(): void {
    this.eventKey = (this.route.snapshot.paramMap.get('eventKey') || '').toLowerCase();
    const meta = EventRsvpComponent.EVENTS[this.eventKey];
    this.eventLabel = meta?.label || this.eventKey;
    this.eventWhen  = meta?.when  || '';
    this.eventWhere = meta?.where || '';

    // Ask the backend to confirm the event key -- protects the URL space
    // even if the frontend map goes stale (backend allowlist is the source
    // of truth for "is this event live").
    this.svc.exists(this.eventKey).subscribe({
      next: () => { this.eventExists = true;  this.loading = false; },
      error: () => { this.eventExists = false; this.loading = false; },
    });
  }

  submit(): void {
    if (this.form.invalid || this.submitting) return;
    this.submitting = true;
    const v = this.form.value;
    const payload: EventRsvp = {
      name:  (v.name  || '').trim(),
      email: v.email?.trim() || undefined,
      phone: v.phone?.trim() || undefined,
      congregation: v.congregation?.trim() || undefined,
      guestCount: v.guestCount ?? 1,
      notes: v.notes?.trim() || undefined,
    };
    this.svc.submit(this.eventKey, payload).subscribe({
      next: () => {
        this.submitting = false;
        this.submittedName  = payload.name;
        this.submittedEmail = payload.email || '';
        this.submitted = true;
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
      },
      error: (e) => {
        this.submitting = false;
        const msg = e?.error?.message || 'Something went wrong submitting your RSVP. Please try again.';
        this.toast.add({ severity: 'error', summary: 'Error', detail: msg, life: 6000 });
      }
    });
  }
}
