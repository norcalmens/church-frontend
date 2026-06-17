import { Component, OnInit, OnDestroy, AfterViewInit, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PaymentPlanService } from '../../services/payment-plan.service';
import { StripeService } from '../../services/stripe.service';
import { PaymentPlan } from '../../core/models/payment-plan.model';
import { Stripe, StripeCardElement } from '@stripe/stripe-js';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-payment-plan-portal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CardModule, ButtonModule,
            InputNumberModule, TagModule, ProgressBarModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <div class="portal-container">
      <div *ngIf="loading" class="loading-state">
        <i class="pi pi-spin pi-spinner"></i>
        <p>Loading your plan…</p>
      </div>

      <div *ngIf="!loading && notFound" class="empty-state">
        <i class="pi pi-exclamation-circle"></i>
        <h2>Plan not found</h2>
        <p>This payment link is invalid or has been removed. If you think this is an error, please contact the retreat team.</p>
        <a routerLink="/"><button pButton label="Back to Home" icon="pi pi-home" class="p-button-outlined"></button></a>
      </div>

      <ng-container *ngIf="!loading && plan && !notFound">
        <div class="hero">
          <i class="pi pi-credit-card"></i>
          <h1>{{ plan.planName }}</h1>
          <p class="subtitle">{{ plan.retreatLabel }}</p>
        </div>

        <p-card>
          <div class="balance-card">
            <p class="greeting">Hi {{ plan.payerName }} 👋 — here's where you stand:</p>
            <div class="totals">
              <div><span class="label">Total</span><div class="amount">{{'$'}}{{ plan.totalAmount | number:'1.2-2' }}</div></div>
              <div><span class="label">Paid</span><div class="amount paid">{{'$'}}{{ (plan.paidAmount || 0) | number:'1.2-2' }}</div></div>
              <div><span class="label">Balance</span><div class="amount balance">{{'$'}}{{ (plan.balance ?? plan.totalAmount) | number:'1.2-2' }}</div></div>
            </div>
            <p-progressBar [value]="progress()" [showValue]="true" [style]="{height:'12px', marginTop:'1rem'}"></p-progressBar>
            <p-tag *ngIf="plan.status === 'completed'" value="Paid in full — thank you!" severity="success" styleClass="completed-tag"></p-tag>
            <p-tag *ngIf="plan.status === 'canceled'" value="This plan has been canceled" severity="danger" styleClass="completed-tag"></p-tag>
          </div>
        </p-card>

        <!-- Active recurring banner -->
        <p-card *ngIf="plan.recurringStatus === 'active' && plan.recurringAmount">
          <div class="recurring-active">
            <i class="pi pi-sync"></i>
            <div>
              <strong>Monthly auto-pay is on</strong>
              <p>{{'$'}}{{ plan.recurringAmount | number:'1.2-2' }} per month — Stripe will charge your card automatically until your balance reaches zero or the plan is canceled.</p>
              <small>To cancel auto-pay, contact the retreat team.</small>
            </div>
          </div>
        </p-card>

        <p-card *ngIf="plan.status === 'active' && (plan.balance ?? plan.totalAmount) > 0">
          <ng-template pTemplate="header">
            <div class="section-header"><i class="pi pi-dollar"></i>Make a Payment</div>
          </ng-template>
          <div class="pay-form">
            <p class="hint">Pay any amount toward your balance. Save your spot at your own pace.</p>
            <div class="amount-row">
              <div class="field">
                <label>Amount</label>
                <p-inputNumber [(ngModel)]="payAmount" mode="currency" currency="USD" locale="en-US"
                               [min]="1" inputStyleClass="w-full"></p-inputNumber>
              </div>
              <div class="quick-amounts">
                <button pButton label="$50" class="p-button-outlined p-button-sm" (click)="payAmount = 50"></button>
                <button pButton label="$100" class="p-button-outlined p-button-sm" (click)="payAmount = 100"></button>
                <button pButton [label]="'Pay Balance'" class="p-button-outlined p-button-sm" (click)="payAmount = balance"></button>
              </div>
            </div>

            <div *ngIf="stripe" class="card-field">
              <label>Card details</label>
              <div id="plan-card-element" class="stripe-card"></div>
              <small class="card-error" *ngIf="cardError">{{ cardError }}</small>
            </div>
            <div *ngIf="stripeLoaded && !stripe" class="stripe-fallback">
              <i class="pi pi-info-circle"></i> Online card payment is not available in this environment.
            </div>

            <button pButton class="pay-submit"
                    [label]="payAmount > 0 ? ('Pay $' + (payAmount | number:'1.2-2')) : 'Pay'"
                    icon="pi pi-lock" [disabled]="!canPay" [loading]="submitting" (click)="pay()"></button>
            <p class="secure"><i class="pi pi-shield"></i> Secure payment processed by Stripe</p>
          </div>
        </p-card>

        <!-- Recurring (monthly) setup card -->
        <p-card *ngIf="plan.status === 'active' && (plan.balance ?? plan.totalAmount) > 0 && plan.recurringStatus !== 'active'">
          <ng-template pTemplate="header">
            <div class="section-header"><i class="pi pi-sync"></i>Pay Monthly (Auto-Pay)</div>
          </ng-template>
          <div class="pay-form">
            <p class="hint">Set up an automatic monthly charge so you don't have to remember. We'll stop the moment your balance reaches zero.</p>
            <div class="amount-row">
              <div class="field">
                <label>Monthly amount</label>
                <p-inputNumber [(ngModel)]="recurringAmount" mode="currency" currency="USD" locale="en-US"
                               [min]="5" inputStyleClass="w-full"></p-inputNumber>
              </div>
              <div class="quick-amounts">
                <button pButton label="$25/mo" class="p-button-outlined p-button-sm" (click)="recurringAmount = 25"></button>
                <button pButton label="$50/mo" class="p-button-outlined p-button-sm" (click)="recurringAmount = 50"></button>
                <button pButton label="$100/mo" class="p-button-outlined p-button-sm" (click)="recurringAmount = 100"></button>
              </div>
            </div>
            <button pButton class="pay-submit"
                    [label]="recurringAmount && recurringAmount > 0 ? ('Set up $' + (recurringAmount | number:'1.2-2') + '/month') : 'Set up monthly'"
                    icon="pi pi-external-link"
                    [disabled]="!recurringAmount || recurringAmount < 5 || submittingRecurring"
                    [loading]="submittingRecurring" (click)="startRecurring()"></button>
            <p class="secure"><i class="pi pi-shield"></i> You'll be redirected to Stripe to securely enter your card.</p>
          </div>
        </p-card>

        <p-card *ngIf="plan.payments?.length">
          <ng-template pTemplate="header">
            <div class="section-header"><i class="pi pi-list"></i>Payment History</div>
          </ng-template>
          <table class="history">
            <thead><tr><th>Date</th><th>Amount</th><th>Method</th><th>Status</th></tr></thead>
            <tbody>
              <tr *ngFor="let p of plan.payments">
                <td>{{ p.paidAt | date:'mediumDate' }}</td>
                <td><strong>{{'$'}}{{ p.amount | number:'1.2-2' }}</strong></td>
                <td><span class="method-tag">{{ p.method }}</span></td>
                <td><p-tag [value]="p.status" [severity]="statusSeverity(p.status)"></p-tag></td>
              </tr>
            </tbody>
          </table>
        </p-card>
      </ng-container>
    </div>
  `,
  styles: [`
    .portal-container { max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.25rem; }
    .loading-state, .empty-state { text-align: center; padding: 3rem 2rem; background: #fff; border-radius: 16px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.06);
      i { font-size: 2.5rem; color: var(--retreat-sunset); display: block; margin-bottom: 0.75rem; }
      h2 { color: var(--retreat-teal-dark); margin: 0 0 0.5rem; } p { color: #6c757d; margin: 0 0 1.25rem; max-width: 480px; margin-left:auto; margin-right:auto; }
    }
    .hero { background: var(--retreat-grad-nav); color: var(--retreat-cream);
      border-radius: 16px; padding: 2.5rem 2rem; text-align: center;
      i { font-size: 2.5rem; color: var(--retreat-gold); }
      h1 { font-size: 1.85rem; font-weight: 800; margin: 0.65rem 0 0.35rem; }
      .subtitle { margin: 0; opacity: 0.9; }
    }
    .section-header { display:flex; align-items:center; gap:0.65rem; padding: 0.85rem 1.25rem;
      background: var(--retreat-grad-nav); color:var(--retreat-cream); font-weight:600;
    }
    .balance-card .greeting { color:var(--retreat-teal-dark); font-size: 1.05rem; margin: 0 0 1rem; }
    .balance-card .totals { display:grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; text-align:center;
      .label { font-size: 0.75rem; color:#6c757d; text-transform: uppercase; letter-spacing: 0.06em; }
      .amount { color:var(--retreat-teal-dark); font-size: 1.5rem; font-weight: 700; margin-top: 0.25rem; }
      .amount.paid { color:#2e9e5b; } .amount.balance { color:var(--retreat-sunset); }
    }
    ::ng-deep .completed-tag { display:block; text-align:center; margin-top: 1rem; }
    .pay-form { display: flex; flex-direction: column; gap: 1rem; }
    .pay-form .hint { color:#6c757d; margin: 0; }
    .amount-row { display:flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap; }
    .amount-row .field { flex: 1; min-width: 180px; display:flex; flex-direction: column; gap: 0.35rem;
      label { font-size: 0.85rem; color:var(--retreat-teal-dark); font-weight:600; }
    }
    ::ng-deep .amount-row .p-inputnumber { width: 100%; }
    .quick-amounts { display:flex; gap: 0.4rem; flex-wrap: wrap; }
    .card-field label { display:block; font-size: 0.85rem; color:var(--retreat-teal-dark); font-weight:600; margin-bottom:0.35rem; }
    .stripe-card { padding: 0.85rem 0.75rem; border: 1px solid #ced4da; border-radius: 8px; background: #fff; }
    .card-error { color:#e53935; font-size: 0.8rem; margin-top: 0.35rem; display: block; }
    .stripe-fallback { display:flex; align-items:center; gap: 0.5rem; padding: 0.85rem 1rem;
      background:#fff3e0; border:1px solid #ffd9a0; border-radius:8px; color:#8a5a1f; font-size:0.9rem; }
    .pay-submit { width: 100%; justify-content: center; background:var(--retreat-sunset) !important; border-color:var(--retreat-sunset) !important; font-weight:700; }
    ::ng-deep .pay-submit.p-button:hover { background:var(--retreat-sunset) !important; border-color:var(--retreat-sunset) !important; }
    .secure { text-align:center; color:#9aa0a6; font-size: 0.8rem; margin: 0; i { font-size: 0.75rem; margin-right: 0.25rem; } }
    .recurring-active { display:flex; align-items:flex-start; gap: 0.85rem; padding: 1rem 1.15rem;
      background: linear-gradient(135deg, #e8f5ec 0%, #d6efdf 100%); border-left: 4px solid #2e9e5b; border-radius: 8px;
      i { font-size: 1.5rem; color: #2e9e5b; margin-top: 2px; }
      strong { display:block; color:var(--retreat-teal-dark); font-size: 1rem; margin-bottom: 0.25rem; }
      p { margin: 0 0 0.35rem; color: var(--retreat-teal-dark); font-size: 0.92rem; }
      small { color: #6c757d; font-size: 0.8rem; }
    }
    .history { width: 100%; border-collapse: collapse;
      th, td { padding: 0.65rem 0.85rem; text-align: left; border-bottom: 1px solid #eee; font-size: 0.92rem; }
      th { color:var(--retreat-teal-dark); background: #f8f9fa; font-weight: 600; }
      .method-tag { background: #eef2f6; color: var(--retreat-teal-dark); padding: 2px 8px; border-radius: 999px; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.04em; }
    }
    ::ng-deep .portal-container .p-card .p-card-header { padding: 0; border-bottom: none; }
    ::ng-deep .portal-container .p-card { border-radius: 14px; overflow: hidden; }
  `]
})
export class PaymentPlanPortalComponent implements OnInit, AfterViewInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private svc = inject(PaymentPlanService);
  private stripeService = inject(StripeService);
  private toast = inject(MessageService);
  private ngZone = inject(NgZone);

  token = '';
  loading = true;
  notFound = false;
  plan: PaymentPlan | null = null;
  payAmount: number | null = null;
  submitting = false;
  recurringAmount: number | null = 50;
  submittingRecurring = false;

  stripe: Stripe | null = null;
  stripeLoaded = false;
  private cardElement: StripeCardElement | null = null;
  cardError = '';
  cardComplete = false;

  get balance(): number { return Number(this.plan?.balance ?? this.plan?.totalAmount ?? 0); }
  get canPay(): boolean {
    if (this.submitting) return false;
    if (this.plan?.status !== 'active') return false;
    if (!this.payAmount || this.payAmount <= 0) return false;
    if (this.payAmount > this.balance + 0.01) return false;
    if (this.stripe && !this.cardComplete) return false;
    return true;
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    if (!this.token) { this.notFound = true; this.loading = false; return; }
    this.loadPlan();
    // Show a friendly toast when returning from the Stripe Checkout redirect
    const recurringQs = this.route.snapshot.queryParamMap.get('recurring');
    if (recurringQs === 'success') {
      setTimeout(() => this.toast.add({
        severity: 'success', summary: 'Monthly auto-pay is set up',
        detail: 'Stripe will charge your card automatically each month. You\'ll see each charge here.'
      }), 200);
    } else if (recurringQs === 'canceled') {
      setTimeout(() => this.toast.add({
        severity: 'info', summary: 'Monthly setup canceled',
        detail: 'No card was saved. You can still make one-time payments any time.'
      }), 200);
    }
  }

  loadPlan(): void {
    this.svc.getByToken(this.token).subscribe({
      next: (p) => {
        this.plan = p;
        this.payAmount = Math.min(50, this.balance) || null;
        this.loading = false;
      },
      error: () => { this.notFound = true; this.loading = false; }
    });
  }

  async ngAfterViewInit(): Promise<void> {
    try { this.stripe = await this.stripeService.getStripe(); } catch { this.stripe = null; }
    this.stripeLoaded = true;
    if (!this.stripe) return;
    // wait for *ngIf to render the card element host
    const waitForEl = async () => {
      for (let i = 0; i < 30; i++) {
        if (document.getElementById('plan-card-element')) return true;
        await new Promise(r => setTimeout(r, 100));
      }
      return false;
    };
    if (!(await waitForEl())) return;
    const elements = this.stripe.elements();
    this.cardElement = elements.create('card', {
      style: { base: { fontSize: '16px', color: 'var(--retreat-teal-dark)', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', '::placeholder': { color: '#999' } }, invalid: { color: '#e53935' } }
    });
    this.cardElement.mount('#plan-card-element');
    this.cardElement.on('change', (event) => {
      this.ngZone.run(() => {
        this.cardError = event.error ? event.error.message : '';
        this.cardComplete = event.complete;
      });
    });
  }

  ngOnDestroy(): void { if (this.cardElement) this.cardElement.destroy(); }

  progress(): number {
    if (!this.plan?.totalAmount) return 0;
    return Math.max(0, Math.min(100, Math.round(((this.plan.paidAmount || 0) / this.plan.totalAmount) * 100)));
  }

  statusSeverity(s: string | undefined): string {
    switch (s) { case 'paid': return 'success'; case 'pending': return 'warning'; case 'processing': return 'info'; case 'failed': return 'danger'; default: return 'info'; }
  }

  async startRecurring(): Promise<void> {
    if (!this.plan || this.recurringAmount == null || this.recurringAmount < 5) return;
    this.submittingRecurring = true;
    try {
      const resp = await firstValueFrom(this.svc.startRecurringCheckout(this.token, this.recurringAmount));
      if (resp?.url) {
        window.location.href = resp.url;
        return; // browser navigates away
      }
      this.toast.add({ severity: 'error', summary: 'Error', detail: 'No checkout URL returned.' });
    } catch (err: any) {
      this.toast.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || err?.message || 'Could not start monthly setup.' });
    } finally {
      this.submittingRecurring = false;
    }
  }

  async pay(): Promise<void> {
    if (!this.canPay || !this.plan || this.payAmount == null) return;
    this.submitting = true;
    try {
      if (this.stripe && this.cardElement) {
        const started = await firstValueFrom(this.svc.startStripePayment(this.token, this.payAmount));
        const { error, paymentIntent } = await this.stripe.confirmCardPayment(started.clientSecret, {
          payment_method: {
            card: this.cardElement,
            billing_details: { name: this.plan.payerName, email: this.plan.payerEmail }
          }
        });
        if (error) {
          this.toast.add({ severity: 'error', summary: 'Payment failed', detail: error.message || 'Card payment failed' });
          this.submitting = false;
          return;
        }
        await firstValueFrom(this.svc.confirmStripePayment(this.token, started.paymentId));
        if (paymentIntent?.status === 'succeeded') {
          this.toast.add({ severity: 'success', summary: 'Thank you!', detail: 'Payment received.' });
        } else {
          this.toast.add({ severity: 'info', summary: 'Processing', detail: 'Payment is processing — your balance will update shortly.' });
        }
        this.loadPlan();
      } else {
        this.toast.add({ severity: 'info', summary: 'Stripe not configured', detail: 'Payment was skipped in this environment.' });
      }
    } catch (err: any) {
      this.toast.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || err?.message || 'Payment could not be processed.' });
    } finally {
      this.submitting = false;
    }
  }
}
