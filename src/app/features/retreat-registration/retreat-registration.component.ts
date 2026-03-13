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
import { AuthService } from '../../core/auth/auth.service';
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
  private authService = inject(AuthService);
  private ngZone = inject(NgZone);

  registrationForm: FormGroup;
  attendeeForm: FormGroup;
  attendees: Attendee[] = [];
  isSubmitting = false;
  agreedToTerms = false;
  paymentSuccess = false;

  stripe: Stripe | null = null;
  stripeLoaded = false;
  private cardElement: StripeCardElement | null = null;
  cardError = '';
  cardComplete = false;

  get cardReady(): boolean {
    return this.cardComplete || (this.stripeLoaded && !this.stripe);
  }

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

  testingMode = true;

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get canRegister(): boolean {
    return this.testingMode && this.isAdmin;
  }

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
      age: [null, [Validators.required, Validators.min(1)]],
      dietaryRestrictions: ['None']
    });
  }

  fillTestData(): void {
    this.registrationForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@test.com',
      phone: '555-123-4567',
      address: '123 Test Street',
      city: 'Sacramento',
      state: 'CA',
      zipCode: '95814',
      emergencyName: 'Jane Doe',
      emergencyRelationship: 'Spouse',
      emergencyPhone: '555-987-6543'
    });
    this.attendeeForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      age: 35
    });
  }

  async ngAfterViewInit(): Promise<void> {
    if (!this.canRegister) return;
    try {
      this.stripe = await this.stripeService.getStripe();
    } catch {
      this.stripe = null;
    }
    this.stripeLoaded = true;
    if (this.stripe) {
      // Wait for Angular to render the #card-element div after *ngIf="stripe" becomes true
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

  getMissingFields(): { label: string; done: boolean }[] {
    const f = this.registrationForm.controls;
    return [
      { label: 'First Name', done: f['firstName'].valid },
      { label: 'Last Name', done: f['lastName'].valid },
      { label: 'Email', done: f['email'].valid },
      { label: 'Phone', done: f['phone'].valid },
      { label: 'Address', done: f['address'].valid },
      { label: 'City', done: f['city'].valid },
      { label: 'State', done: f['state'].valid },
      { label: 'Zip Code', done: f['zipCode'].valid },
      { label: 'Emergency Contact Name', done: f['emergencyName'].valid },
      { label: 'Emergency Relationship', done: f['emergencyRelationship'].valid },
      { label: 'Emergency Phone', done: f['emergencyPhone'].valid },
      { label: 'At least one attendee added', done: this.attendees.length > 0 },
      { label: 'Card details complete', done: this.cardReady },
      { label: 'Agreed to terms', done: this.agreedToTerms },
    ];
  }

  get totalCost(): number {
    return this.attendees.length * 248;
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
    if (this.stripe && !this.cardComplete) {
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

      if (this.stripe && this.cardElement) {
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
        }
      }

      this.paymentSuccess = true;
      this.messageService.add({ severity: 'success', summary: 'Success', detail: this.stripe ? 'Registration and payment completed!' : 'Registration created (payment skipped - Stripe not configured)' });
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
