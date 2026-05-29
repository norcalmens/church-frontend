import { Component, inject, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PaymentService } from '../../services/payment.service';
import { StripeService } from '../../services/stripe.service';
import { Stripe, StripeCardElement } from '@stripe/stripe-js';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-donations',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    CardModule, InputTextModule, InputNumberModule, InputTextareaModule, ButtonModule, ToastModule
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <div class="donate-container">
      <div class="donate-hero">
        <i class="pi pi-heart-fill"></i>
        <h1>Support the Retreat</h1>
        <p>Your gift helps cover scholarships, facilities, and speakers so more men can
           stand in the gap. Every amount makes a difference.</p>
      </div>

      <div *ngIf="!donationSuccess" class="donate-card">
        <h2>Choose an amount</h2>
        <div class="amount-grid">
          <button type="button" *ngFor="let p of presets"
                  class="amount-btn" [class.selected]="selectedAmount === p && !customAmount"
                  (click)="selectPreset(p)">\${{ p }}</button>
        </div>
        <div class="custom-amount">
          <label>Or enter a custom amount</label>
          <p-inputNumber [(ngModel)]="customAmount" mode="currency" currency="USD" locale="en-US"
                         [min]="1" [max]="100000" placeholder="$0.00"
                         (ngModelChange)="onCustomChange()" inputStyleClass="custom-amount-input"></p-inputNumber>
        </div>

        <h2 class="section-gap">Your information</h2>
        <div class="field-row">
          <div class="field">
            <label>Name <span class="req">*</span></label>
            <input pInputText [(ngModel)]="donorName" placeholder="Full name" />
          </div>
          <div class="field">
            <label>Email <span class="req">*</span></label>
            <input pInputText [(ngModel)]="donorEmail" type="email" placeholder="you@example.com" />
          </div>
        </div>
        <div class="field">
          <label>Message <span class="optional">(optional)</span></label>
          <textarea pInputTextarea [(ngModel)]="message" rows="2"
                    placeholder="Add a note or dedication..." maxlength="200"></textarea>
        </div>

        <h2 class="section-gap">Payment</h2>
        <div *ngIf="stripe" class="card-field">
          <label>Card details</label>
          <div id="donation-card-element" class="stripe-card"></div>
          <small class="card-error" *ngIf="cardError">{{ cardError }}</small>
        </div>
        <div *ngIf="stripeLoaded && !stripe" class="stripe-fallback">
          <i class="pi pi-info-circle"></i>
          Online card payment is not available in this environment.
        </div>

        <button pButton class="donate-submit"
                [label]="amount > 0 ? ('Donate $' + amount) : 'Donate'"
                icon="pi pi-heart"
                [disabled]="!canDonate || isSubmitting"
                [loading]="isSubmitting"
                (click)="donate()"></button>
        <p class="secure-note"><i class="pi pi-lock"></i> Secure payment processed by Stripe</p>
      </div>

      <div *ngIf="donationSuccess" class="donate-success">
        <i class="pi pi-check-circle"></i>
        <h2>Thank you, {{ donorName || 'friend' }}!</h2>
        <p>Your generous gift of <strong>\${{ donatedAmount }}</strong> has been received.
           Thank you for helping more men stand in the gap.</p>
        <a routerLink="/"><button pButton label="Back to Home" icon="pi pi-home" class="p-button-outlined"></button></a>
      </div>
    </div>
  `,
  styles: [`
    .donate-container { max-width: 720px; margin: 0 auto; }
    .donate-hero {
      background: linear-gradient(135deg, #1a3a4a 0%, #1e4d5e 100%);
      border-radius: 16px; padding: 2.5rem 2rem; text-align: center;
      color: #f0e6d0; margin-bottom: 1.5rem;
      i { font-size: 2.5rem; color: #d4782f; }
      h1 { font-size: 2rem; font-weight: 800; margin: 0.75rem 0 0.5rem; }
      p { margin: 0 auto; max-width: 520px; line-height: 1.6; opacity: 0.9; }
    }
    .donate-card, .donate-success {
      background: #fff; border-radius: 16px; padding: 2rem;
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    }
    h2 { color: #1a3a4a; font-size: 1.2rem; margin: 0 0 1rem; }
    .section-gap { margin-top: 1.75rem; }
    .amount-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.6rem; }
    .amount-btn {
      padding: 0.85rem 0.5rem; border: 2px solid #d9d9d9; background: #fff;
      border-radius: 10px; font-size: 1.1rem; font-weight: 700; color: #1a3a4a;
      cursor: pointer; transition: all 0.15s;
      &:hover { border-color: #e8a832; }
      &.selected { border-color: #d4782f; background: rgba(212,120,47,0.08); color: #d4782f; }
    }
    .custom-amount { margin-top: 0.85rem;
      label { display: block; font-size: 0.85rem; color: #6c757d; margin-bottom: 0.35rem; }
    }
    .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .field { margin-bottom: 1rem; display: flex; flex-direction: column;
      label { font-size: 0.85rem; color: #1a3a4a; font-weight: 600; margin-bottom: 0.35rem; }
      .req { color: #d4782f; }
      .optional { color: #9aa0a6; font-weight: 400; }
      input, textarea { width: 100%; }
    }
    .card-field label { display: block; font-size: 0.85rem; color: #1a3a4a; font-weight: 600; margin-bottom: 0.35rem; }
    .stripe-card { padding: 0.85rem 0.75rem; border: 1px solid #ced4da; border-radius: 8px; background: #fff; }
    .card-error { color: #e53935; font-size: 0.8rem; margin-top: 0.35rem; display: block; }
    .stripe-fallback {
      display: flex; align-items: center; gap: 0.5rem; padding: 0.85rem 1rem;
      background: #fff3e0; border: 1px solid #ffd9a0; border-radius: 8px; color: #8a5a1f; font-size: 0.9rem;
    }
    .donate-submit {
      width: 100%; margin-top: 1.5rem; justify-content: center;
      background: #d4782f !important; border-color: #d4782f !important; font-weight: 700; font-size: 1.05rem;
    }
    ::ng-deep .donate-submit.p-button:hover { background: #b8651f !important; border-color: #b8651f !important; }
    .secure-note { text-align: center; color: #9aa0a6; font-size: 0.8rem; margin: 0.85rem 0 0;
      i { font-size: 0.75rem; margin-right: 0.25rem; } }
    .donate-success { text-align: center;
      i { font-size: 3.5rem; color: #2e9e5b; }
      h2 { font-size: 1.6rem; margin: 1rem 0 0.5rem; }
      p { color: #6c757d; line-height: 1.6; margin-bottom: 1.5rem; }
    }
    ::ng-deep .custom-amount-input { width: 100%; }
    @media (max-width: 600px) {
      .amount-grid { grid-template-columns: repeat(3, 1fr); }
      .field-row { grid-template-columns: 1fr; }
    }
  `]
})
export class DonationsComponent implements AfterViewInit, OnDestroy {
  private messageService = inject(MessageService);
  private paymentService = inject(PaymentService);
  private stripeService = inject(StripeService);
  private ngZone = inject(NgZone);

  presets = [25, 50, 100, 250, 500];
  selectedAmount: number | null = 100;
  customAmount: number | null = null;
  donorName = '';
  donorEmail = '';
  message = '';
  isSubmitting = false;
  donationSuccess = false;
  donatedAmount = 0;

  stripe: Stripe | null = null;
  stripeLoaded = false;
  private cardElement: StripeCardElement | null = null;
  cardError = '';
  cardComplete = false;

  get amount(): number {
    if (this.customAmount && this.customAmount > 0) return Math.round(this.customAmount);
    return this.selectedAmount ?? 0;
  }

  get cardReady(): boolean {
    return this.cardComplete || (this.stripeLoaded && !this.stripe);
  }

  get canDonate(): boolean {
    return this.amount >= 1 &&
      this.donorName.trim().length > 0 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.donorEmail.trim()) &&
      this.cardReady;
  }

  selectPreset(value: number): void {
    this.selectedAmount = value;
    this.customAmount = null;
  }

  onCustomChange(): void {
    if (this.customAmount && this.customAmount > 0) {
      this.selectedAmount = null;
    }
  }

  async ngAfterViewInit(): Promise<void> {
    try {
      this.stripe = await this.stripeService.getStripe();
    } catch {
      this.stripe = null;
    }
    this.stripeLoaded = true;
    if (this.stripe) {
      await new Promise(resolve => setTimeout(resolve, 0));
      const elements = this.stripe.elements();
      this.cardElement = elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#1a3a4a',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            '::placeholder': { color: '#999' }
          },
          invalid: { color: '#e53935' }
        }
      });
      this.cardElement.mount('#donation-card-element');
      this.cardElement.on('change', (event) => {
        this.ngZone.run(() => {
          this.cardError = event.error ? event.error.message : '';
          this.cardComplete = event.complete;
        });
      });
    }
  }

  ngOnDestroy(): void {
    if (this.cardElement) this.cardElement.destroy();
  }

  async donate(): Promise<void> {
    if (!this.canDonate) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please enter an amount, your name, and a valid email.' });
      return;
    }

    this.isSubmitting = true;
    const amount = this.amount;
    try {
      if (this.stripe && this.cardElement) {
        const description = this.message.trim()
          ? `Donation — NorCal Men's Retreat 2026: ${this.message.trim()}`
          : "Donation — NorCal Men's Retreat 2026";

        const payment = await firstValueFrom(this.paymentService.createPaymentIntent({
          amount: amount * 100,
          currency: 'usd',
          description,
          donorName: this.donorName.trim(),
          donorEmail: this.donorEmail.trim()
        }));

        const { error, paymentIntent } = await this.stripe.confirmCardPayment(
          payment.clientSecret,
          {
            payment_method: {
              card: this.cardElement,
              billing_details: { name: this.donorName.trim(), email: this.donorEmail.trim() }
            }
          }
        );

        if (error) {
          this.messageService.add({ severity: 'error', summary: 'Payment Failed', detail: error.message || 'Card payment failed' });
          this.isSubmitting = false;
          return;
        }
        if (paymentIntent?.status !== 'succeeded') {
          this.messageService.add({ severity: 'warn', summary: 'Pending', detail: 'Payment is still processing. We will email your receipt once it clears.' });
        }
      } else {
        this.messageService.add({ severity: 'info', summary: 'Stripe not configured', detail: 'Payment was skipped in this environment.' });
      }

      this.donatedAmount = amount;
      this.donationSuccess = true;
    } catch (err: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: err?.error?.message || err?.message || 'Donation could not be processed. Please try again.'
      });
    } finally {
      this.isSubmitting = false;
    }
  }
}
