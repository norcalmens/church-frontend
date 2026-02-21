import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PaymentService } from '../../services/payment.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule, InputNumberModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <div class="payment-container">
      <div class="payment-header">
        <h1>Make a Payment</h1>
        <p>Secure payment for your retreat registration</p>
      </div>
      <p-card>
        <ng-template pTemplate="header">
          <div class="card-header-bar"><i class="pi pi-credit-card"></i><span>Payment Details</span></div>
        </ng-template>
        <div class="payment-form">
          <div class="field"><label>Amount ($)</label><p-inputNumber [(ngModel)]="amount" mode="currency" currency="USD" locale="en-US" [min]="1" styleClass="w-full"></p-inputNumber></div>
          <div class="field"><label>Name on Card</label><input type="text" pInputText [(ngModel)]="donorName" class="w-full" placeholder="Full name" /></div>
          <div class="field"><label>Email</label><input type="email" pInputText [(ngModel)]="donorEmail" class="w-full" placeholder="Email address" /></div>
          <div class="stripe-placeholder">
            <i class="pi pi-lock"></i>
            <p>Stripe card element will be mounted here when Stripe is configured.</p>
            <small>Configure STRIPE_PUBLISHABLE_KEY in environment to enable payments.</small>
          </div>
          <button pButton label="Pay Now" icon="pi pi-check" class="w-full mt-3" size="large" [loading]="processing" (click)="processPayment()"></button>
        </div>
      </p-card>
      <div class="payment-info">
        <p-card>
          <div class="info-content">
            <h3><i class="pi pi-shield"></i> Secure Payment</h3>
            <p>All payments are processed securely through Stripe. Your card information is never stored on our servers.</p>
            <h3><i class="pi pi-info-circle"></i> Payment Policy</h3>
            <p>The retreat cost is $288 per person. Full refunds are available until May 28, 2026. After that date, registrations are non-refundable.</p>
          </div>
        </p-card>
      </div>
    </div>
  `,
  styles: [`
    .payment-container { max-width: 700px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem; }
    .payment-header { text-align: center; padding: 3rem 2rem; background: linear-gradient(180deg, #1a3a4a 0%, #2a5a6a 30%, #c8923a 70%, #d4782f 100%); color: #f0e6d0; border-radius: 12px; h1 { font-size: 2.5rem; font-weight: 700; margin: 0 0 0.5rem 0; } p { font-size: 1.1rem; margin: 0; opacity: 0.9; } }
    .card-header-bar { display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.5rem; background: linear-gradient(135deg, #1a3a4a 0%, #1e4d5e 100%); color: #f0e6d0; font-size: 1.1rem; font-weight: 600; }
    .field { margin-bottom: 1.25rem; label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #1a3a4a; } }
    .stripe-placeholder { text-align: center; padding: 2rem; background: #f8f9fa; border: 2px dashed #dee2e6; border-radius: 8px; margin: 1rem 0; i { font-size: 2rem; color: #1a3a4a; } p { color: #6c757d; margin: 0.5rem 0; } small { color: #999; } }
    .info-content { h3 { color: #1a3a4a; display: flex; align-items: center; gap: 0.5rem; margin: 0 0 0.5rem 0; &:not(:first-child) { margin-top: 1.5rem; } i { color: #d4782f; } } p { color: #6c757d; line-height: 1.6; margin: 0; } }
    ::ng-deep .payment-container .p-card { border-radius: 12px; overflow: hidden; .p-card-header { padding: 0; border-bottom: none; } }
  `]
})
export class PaymentComponent implements OnInit {
  private paymentService = inject(PaymentService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  amount = 288;
  donorName = '';
  donorEmail = '';
  processing = false;

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) { this.donorEmail = user.email; this.donorName = user.username; }
  }

  processPayment(): void {
    if (!this.donorName || !this.donorEmail) { this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please fill in all fields' }); return; }
    this.processing = true;
    this.paymentService.createPaymentIntent({ amount: this.amount * 100, currency: 'usd', description: 'NorCal Men\'s Retreat 2026 Registration', donorName: this.donorName, donorEmail: this.donorEmail }).subscribe({
      next: () => { this.processing = false; this.messageService.add({ severity: 'info', summary: 'Payment Intent Created', detail: 'Stripe card element integration needed to complete payment.' }); },
      error: (err) => { this.processing = false; this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.error || 'Payment failed' }); }
    });
  }
}
