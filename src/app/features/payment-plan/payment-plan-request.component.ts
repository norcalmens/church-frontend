import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PaymentPlanService, PaymentPlanRequest } from '../../services/payment-plan.service';

/** Public "Request a Payment Plan" form. Anyone can submit -- backend
 *  saves the request in status="requested" (locked from payment) and
 *  emails admin. Admin approves in /admin/payment-plans, which flips it
 *  to active and sends the payer their secure pay link. */
@Component({
  selector: 'app-payment-plan-request',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink,
            CardModule, ButtonModule, InputTextModule, InputTextareaModule,
            InputNumberModule, DropdownModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <div class="request-container">
      <div class="hero-section">
        <i class="pi pi-credit-card"></i>
        <h1>Request a Payment Plan</h1>
        <p>Spread the cost of your retreat over monthly installments. Fill in a few details and our team will set up your plan and email you a secure payment link.</p>
      </div>

      <!-- Success state after submit -->
      <p-card *ngIf="submitted; else formCard">
        <div class="success-state">
          <i class="pi pi-check-circle"></i>
          <h2>Request received</h2>
          <p>Thanks, <strong>{{ submittedName }}</strong> &mdash; we got your payment plan request and our team will review it shortly. You'll receive an email at <strong>{{ submittedEmail }}</strong> with your secure payment link once it's approved (usually within 1-2 business days).</p>
          <p class="hint">Questions in the meantime? Call <strong>Bro. Washington</strong> at <a href="tel:+17076563789">(707) 656-3789</a>.</p>
          <div class="success-actions">
            <a routerLink="/"><button pButton label="Back to Home" icon="pi pi-home" class="p-button-outlined"></button></a>
          </div>
        </div>
      </p-card>

      <ng-template #formCard>
        <p-card>
          <ng-template pTemplate="header">
            <div class="card-header-bar"><i class="pi pi-pencil"></i><span>Your Request</span></div>
          </ng-template>
          <form [formGroup]="form" (ngSubmit)="submit()" class="request-form">
            <div class="field-row">
              <div class="field">
                <label>Your Name <span class="req">*</span></label>
                <input pInputText formControlName="payerName" placeholder="First and last name" />
              </div>
              <div class="field">
                <label>Email <span class="req">*</span></label>
                <input pInputText formControlName="payerEmail" type="email" placeholder="you@example.com" />
                <small>We'll send your payment link here once the plan is approved.</small>
              </div>
            </div>
            <div class="field-row">
              <div class="field">
                <label>Phone <span class="optional">(optional)</span></label>
                <input pInputText formControlName="payerPhone" placeholder="(555) 123-4567" />
              </div>
              <div class="field">
                <label>Retreat <span class="req">*</span></label>
                <p-dropdown [options]="retreatOptions" formControlName="retreatLabel"
                            placeholder="Which retreat?" styleClass="w-full"></p-dropdown>
              </div>
            </div>
            <div class="field-row">
              <div class="field">
                <label>Total Amount <span class="req">*</span></label>
                <p-inputNumber formControlName="totalAmount" mode="currency" currency="USD"
                               locale="en-US" [min]="1" inputStyleClass="w-full"></p-inputNumber>
                <small>The full amount you'd like to spread across installments.</small>
              </div>
              <div class="field">
                <label>Preferred Installments <span class="optional">(optional)</span></label>
                <p-dropdown [options]="installmentOptions" formControlName="preferredInstallments"
                            placeholder="How many payments?" [showClear]="true" styleClass="w-full"></p-dropdown>
                <small>We'll try to honor this when setting up your schedule.</small>
              </div>
            </div>
            <div class="field">
              <label>Anything We Should Know? <span class="optional">(optional)</span></label>
              <textarea pInputTextarea formControlName="message" rows="3" maxlength="1000"
                        placeholder="Timing preferences, questions, anything the admin should see..."></textarea>
            </div>

            <div class="submit-row">
              <button pButton type="submit" label="Submit Request" icon="pi pi-send"
                      [loading]="submitting" [disabled]="form.invalid || submitting" size="large"></button>
            </div>
          </form>
        </p-card>
      </ng-template>

      <div class="help-banner" role="note">
        <i class="pi pi-info-circle"></i>
        <div>
          <strong>How this works</strong>
          <p>You submit this request &rarr; our team reviews and creates your plan &rarr; you get an email with a secure link &rarr; pay any amount at your own pace, or set up automatic monthly payments. No login required &mdash; the link always shows your current balance.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .request-container { max-width: 780px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.25rem; padding: 0 1rem; }
    .hero-section {
      background: var(--retreat-grad-nav);
      border-radius: 16px; padding: 2.25rem 2rem; text-align: center; color: var(--retreat-cream);
      i { font-size: 2.4rem; color: var(--retreat-gold); }
      h1 { font-size: 2rem; font-weight: 800; margin: 0.6rem 0 0.5rem; }
      p { max-width: 560px; margin: 0 auto; line-height: 1.55; opacity: 0.92; }
    }
    .card-header-bar {
      display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.5rem;
      background: var(--retreat-grad-nav); color: var(--retreat-cream); font-size: 1.05rem; font-weight: 600;
    }
    ::ng-deep .request-container .p-card { border-radius: 12px; overflow: hidden;
      .p-card-header { padding: 0; border-bottom: none; }
      .p-card-body { padding: 1.5rem 1.75rem; }
      .p-card-content { padding: 0; }
    }
    .request-form { display: flex; flex-direction: column; gap: 1rem; }
    .field { display: flex; flex-direction: column; gap: 0.35rem;
      label { font-size: 0.9rem; font-weight: 600; color: var(--retreat-teal-dark); }
      .req { color: var(--retreat-sunset); }
      .optional { color: #9aa0a6; font-weight: 400; font-size: 0.82em; }
      input, textarea { width: 100%; }
      small { color: #6c757d; font-size: 0.78rem; }
    }
    .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
      > .field { min-width: 0; }
    }
    ::ng-deep .request-form .p-inputnumber, ::ng-deep .request-form .p-dropdown { width: 100%; }
    .submit-row { display: flex; justify-content: flex-end; margin-top: 0.5rem; }
    .help-banner {
      display: flex; gap: 1rem; align-items: flex-start;
      background: #fff; border: 1px solid #e6e6e6; border-left: 4px solid var(--retreat-sunset);
      border-radius: 12px; padding: 1rem 1.25rem;
      i { font-size: 1.4rem; color: var(--retreat-sunset); flex-shrink: 0; margin-top: 0.1rem; }
      strong { display: block; color: var(--retreat-teal-dark); font-size: 1rem; }
      p { margin: 0.3rem 0 0; color: #495057; line-height: 1.5; font-size: 0.92rem; }
    }
    .success-state {
      text-align: center; padding: 2rem 1rem;
      i { font-size: 3.5rem; color: #2e9e5b; display: block; margin-bottom: 0.85rem; }
      h2 { color: var(--retreat-teal-dark); margin: 0 0 0.75rem; font-size: 1.5rem; }
      p { color: #495057; line-height: 1.6; max-width: 480px; margin: 0.35rem auto;
        strong { color: var(--retreat-teal-dark); }
      }
      .hint { color: #6c757d; font-size: 0.9rem; margin-top: 1rem;
        a { color: var(--retreat-sunset); font-weight: 600; }
      }
    }
    .success-actions { margin-top: 1.5rem; a { text-decoration: none; } }
    @media (max-width: 640px) {
      .field-row { grid-template-columns: 1fr; }
    }
  `]
})
export class PaymentPlanRequestComponent {
  private fb = inject(FormBuilder);
  private planService = inject(PaymentPlanService);
  private toast = inject(MessageService);

  /** Which retreats we accept plan requests for. Kept as a small allowlist
   *  so payers can't submit "2019 retreat" or free-text garbage that the
   *  admin has to normalize on approval. Extend as new seasons open. */
  retreatOptions = [
    { label: '2027 Men\'s Retreat (April 15-17)', value: '2027 Men\'s Retreat' },
    { label: '2028 Men\'s Retreat', value: '2028 Men\'s Retreat' },
  ];

  installmentOptions = [
    { label: '2 payments',  value: 2 },
    { label: '3 payments',  value: 3 },
    { label: '4 payments',  value: 4 },
    { label: '6 payments',  value: 6 },
    { label: '12 payments', value: 12 },
  ];

  form = this.fb.group({
    payerName:  ['', [Validators.required, Validators.maxLength(200)]],
    payerEmail: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
    payerPhone: [''],
    retreatLabel: ['', Validators.required],
    totalAmount:  [null as number | null, [Validators.required, Validators.min(1)]],
    preferredInstallments: [null as number | null],
    message: [''],
  });

  submitting = false;
  submitted = false;
  submittedName = '';
  submittedEmail = '';

  submit(): void {
    if (this.form.invalid || this.submitting) return;
    this.submitting = true;
    const v = this.form.value;
    const payload: PaymentPlanRequest = {
      payerName:  (v.payerName  || '').trim(),
      payerEmail: (v.payerEmail || '').trim(),
      payerPhone: v.payerPhone?.trim() || undefined,
      retreatLabel: v.retreatLabel || '',
      totalAmount:  Number(v.totalAmount) || 0,
      preferredInstallments: v.preferredInstallments ?? undefined,
      message: v.message?.trim() || undefined,
    };
    this.planService.requestPlan(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.submittedName  = payload.payerName;
        this.submittedEmail = payload.payerEmail;
        this.submitted = true;
        // Scroll the success card into view so the confirmation is what
        // they see after clicking Submit, not the empty top of the page.
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
      },
      error: (e) => {
        this.submitting = false;
        const msg = e?.error?.message || 'Something went wrong submitting your request. Please try again or call Bro. Washington at (707) 656-3789.';
        this.toast.add({ severity: 'error', summary: 'Error', detail: msg, life: 6000 });
      },
    });
  }
}
