import { Component, inject, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RegistrationService } from '../../services/registration.service';
import { StripeService } from '../../services/stripe.service';
import { Attendee } from '../../core/models/attendee.model';
import { Stripe, StripeCardElement } from '@stripe/stripe-js';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-retreat-registration',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, RouterLink,
    CardModule, InputTextModule, ButtonModule, DropdownModule,
    CheckboxModule, InputTextareaModule, TableModule, ToastModule
  ],
  providers: [MessageService],
  templateUrl: './retreat-registration.component.html',
  styleUrls: ['./retreat-registration.component.scss']
})
export class RetreatRegistrationComponent implements AfterViewInit, OnDestroy {
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private registrationService = inject(RegistrationService);
  private stripeService = inject(StripeService);
  private ngZone = inject(NgZone);

  registrationForm: FormGroup;
  attendeeForm: FormGroup;
  attendees: Attendee[] = [];
  isSubmitting = false;
  agreedToTerms = false;
  paymentSuccess = false;

  private stripe: Stripe | null = null;
  private cardElement: StripeCardElement | null = null;
  cardError = '';
  cardComplete = false;

  dietaryOptions = [
    { label: 'None', value: 'None' },
    { label: 'Vegetarian', value: 'Vegetarian' },
    { label: 'Vegan', value: 'Vegan' },
    { label: 'Gluten-Free', value: 'Gluten-Free' },
    { label: 'Halal', value: 'Halal' },
    { label: 'Other (specify in requests)', value: 'Other' }
  ];

  roomPreferences = [
    { label: 'Single Room', value: 'single' },
    { label: 'Double Room (shared)', value: 'double' },
    { label: 'No Preference', value: 'no-preference' }
  ];

  constructor() {
    this.registrationForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required],
      roomPreference: ['no-preference'],
      emergencyName: ['', Validators.required],
      emergencyRelationship: ['', Validators.required],
      emergencyPhone: ['', Validators.required],
      specialRequests: ['']
    });

    this.attendeeForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(18)]],
      dietaryRestrictions: ['None']
    });
  }

  async ngAfterViewInit(): Promise<void> {
    this.stripe = await this.stripeService.getStripe();
    if (this.stripe) {
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
      this.cardElement.mount('#card-element');
      this.cardElement.on('change', (event) => {
        this.ngZone.run(() => {
          this.cardError = event.error ? event.error.message : '';
          this.cardComplete = event.complete;
        });
      });
    }
  }

  ngOnDestroy(): void {
    if (this.cardElement) {
      this.cardElement.destroy();
    }
  }

  addAttendee(): void {
    if (this.attendeeForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please fill in all attendee fields' });
      return;
    }
    this.attendees.push({ ...this.attendeeForm.value });
    this.attendeeForm.reset({ dietaryRestrictions: 'None' });
    this.messageService.add({ severity: 'success', summary: 'Added', detail: 'Attendee added successfully' });
  }

  removeAttendee(index: number): void {
    this.attendees.splice(index, 1);
  }

  get totalCost(): number {
    return this.attendees.length * 288;
  }

  async submitRegistration(): Promise<void> {
    if (this.registrationForm.invalid) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fill in all required fields' });
      return;
    }
    if (this.attendees.length === 0) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please add at least one attendee' });
      return;
    }
    if (!this.agreedToTerms) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please agree to the terms' });
      return;
    }
    if (!this.stripe || !this.cardElement) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Payment system is not ready. Please refresh and try again.' });
      return;
    }
    if (!this.cardComplete) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please enter your card details' });
      return;
    }

    this.isSubmitting = true;

    try {
      // Step 1: Create registration (pending)
      const registration = {
        ...this.registrationForm.value,
        agreedToTerms: this.agreedToTerms,
        attendees: this.attendees
      };
      const created = await firstValueFrom(this.registrationService.createRegistration(registration));

      // Step 2: Create payment intent linked to registration
      const paymentResponse = await firstValueFrom(
        this.registrationService.createPaymentIntent(created.id!)
      );

      // Step 3: Confirm card payment with Stripe
      const { error, paymentIntent } = await this.stripe.confirmCardPayment(
        paymentResponse.clientSecret,
        {
          payment_method: {
            card: this.cardElement,
            billing_details: {
              name: `${this.registrationForm.value.firstName} ${this.registrationForm.value.lastName}`,
              email: this.registrationForm.value.email,
              phone: this.registrationForm.value.phone
            }
          }
        }
      );

      if (error) {
        this.messageService.add({ severity: 'error', summary: 'Payment Failed', detail: error.message || 'Card payment failed' });
        this.isSubmitting = false;
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        // Step 4: Confirm payment on backend (verifies with Stripe, updates status, sends emails)
        await firstValueFrom(this.registrationService.confirmPayment(created.id!));
        this.paymentSuccess = true;
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Registration and payment completed!' });
      }
    } catch (err: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: err?.error?.message || err?.message || 'Registration failed. Please try again.'
      });
    } finally {
      this.isSubmitting = false;
    }
  }
}
