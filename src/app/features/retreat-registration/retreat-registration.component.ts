import { Component, inject, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RegistrationService, Availability } from '../../services/registration.service';
import { StripeService } from '../../services/stripe.service';
import { AuthService } from '../../core/auth/auth.service';
import { Attendee, RetreatDay } from '../../core/models/attendee.model';
import { Stripe, StripeCardElement } from '@stripe/stripe-js';
import { firstValueFrom } from 'rxjs';

const FULL_RETREAT_PRICE = 248;
const PER_DAY_PRICE = 85;
const LINEN_PACKAGE_PRICE = 25;
const LINEN_ITEM_PRICE = 5;
const HALF_DAY_MEAL_PRICE = 50;
const FULL_DAY_MEAL_PRICE = 65;

@Component({
  selector: 'app-retreat-registration',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, RouterLink,
    CardModule, InputTextModule, InputMaskModule, ButtonModule, DropdownModule,
    CheckboxModule, RadioButtonModule, InputNumberModule, InputTextareaModule, TableModule, ToastModule
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

  availability: Availability | null = null;

  get isFull(): boolean { return !!this.availability?.isFull; }
  get spacesLeft(): number { return this.availability?.spacesLeft ?? 0; }
  get totalAttendees(): number { return this.availability?.totalAttendees ?? 0; }
  get capacity(): number { return this.availability?.capacity ?? 35; }
  get notEnoughSpaces(): boolean {
    return !!this.availability && this.attendees.length > this.availability.spacesLeft;
  }

  stripe: Stripe | null = null;
  stripeLoaded = false;
  private cardElement: StripeCardElement | null = null;
  cardError = '';
  cardComplete = false;

  readonly fullRetreatPrice = FULL_RETREAT_PRICE;
  readonly perDayPrice = PER_DAY_PRICE;
  readonly linenPackagePrice = LINEN_PACKAGE_PRICE;
  readonly linenItemPrice = LINEN_ITEM_PRICE;
  readonly halfDayMealPrice = HALF_DAY_MEAL_PRICE;
  readonly fullDayMealPrice = FULL_DAY_MEAL_PRICE;

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

  retreatDays: { value: RetreatDay; label: string }[] = [
    { value: 'thu', label: 'Thu, Jun 11' },
    { value: 'fri', label: 'Fri, Jun 12' },
    { value: 'sat', label: 'Sat, Jun 13' }
  ];

  testingMode = true;

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get canRegister(): boolean {
    return true;
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
      congregation: [''],
      roomPreference: ['no-preference'],
      emergencyName: ['', Validators.required],
      emergencyRelationship: ['', Validators.required],
      emergencyPhone: ['', Validators.required],
      specialRequests: ['']
    });

    this.attendeeForm = this.buildAttendeeForm();
  }

  private buildAttendeeForm(): FormGroup {
    return this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      age: [null, [Validators.required, Validators.min(1)]],
      dietaryRestrictions: ['None'],
      attendanceType: ['full'],
      dayThu: [false],
      dayFri: [false],
      daySat: [false],
      linenOption: ['none'],
      linenItemCount: [1],
      mealOption: ['none']
    });
  }

  fillTestData(): void {
    this.registrationForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@test.com',
      phone: '(555) 123-4567',
      address: '123 Test Street',
      city: 'Sacramento',
      state: 'CA',
      zipCode: '95814',
      congregation: 'Test Community Church',
      emergencyName: 'Jane Doe',
      emergencyRelationship: 'Spouse',
      emergencyPhone: '(555) 987-6543'
    });
    this.attendeeForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      age: 35
    });
  }

  async ngAfterViewInit(): Promise<void> {
    if (!this.canRegister) return;
    this.loadAvailability();
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

  loadAvailability(): void {
    this.registrationService.getAvailability().subscribe({
      next: (a) => { this.availability = a; },
      // If the call fails, just leave the form open -- backend will still
      // reject an over-capacity submission.
      error: () => {}
    });
  }

  addAttendee(): void {
    if (this.attendeeForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please fill in all attendee fields' });
      return;
    }

    const v = this.attendeeForm.value;
    const isPartial = v.attendanceType === 'partial';
    const days: RetreatDay[] = isPartial
      ? ([
          v.dayThu ? 'thu' : null,
          v.dayFri ? 'fri' : null,
          v.daySat ? 'sat' : null
        ].filter(Boolean) as RetreatDay[])
      : [];

    if (isPartial && days.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Pick at least one day for a single-day attendee.' });
      return;
    }

    const attendee: Attendee = {
      firstName: v.firstName,
      lastName: v.lastName,
      age: v.age,
      dietaryRestrictions: v.dietaryRestrictions,
      attendanceType: isPartial ? 'partial' : 'full',
      days: isPartial ? days : undefined,
      linenOption: isPartial ? 'none' : v.linenOption,
      linenItemCount: !isPartial && v.linenOption === 'individual' ? v.linenItemCount : undefined,
      mealOption: isPartial ? v.mealOption : 'none'
    };

    this.attendees.push(attendee);
    this.attendeeForm.reset({
      dietaryRestrictions: 'None',
      attendanceType: 'full',
      dayThu: false,
      dayFri: false,
      daySat: false,
      linenOption: 'none',
      linenItemCount: 1,
      mealOption: 'none'
    });
    this.messageService.add({ severity: 'success', summary: 'Added', detail: 'Attendee added successfully' });
  }

  removeAttendee(index: number): void {
    this.attendees.splice(index, 1);
  }

  attendeeBaseCost(a: Attendee): number {
    if (a.attendanceType === 'partial') {
      const dayCount = a.days?.length ?? 0;
      return Math.min(dayCount * PER_DAY_PRICE, FULL_RETREAT_PRICE);
    }
    return FULL_RETREAT_PRICE;
  }

  attendeeLinenCost(a: Attendee): number {
    if (a.attendanceType === 'partial') return 0;
    if (a.linenOption === 'package') return LINEN_PACKAGE_PRICE;
    if (a.linenOption === 'individual') return LINEN_ITEM_PRICE * (a.linenItemCount ?? 0);
    return 0;
  }

  attendeeMealCost(a: Attendee): number {
    if (a.attendanceType !== 'partial') return 0;
    if (a.mealOption === 'half') return HALF_DAY_MEAL_PRICE;
    if (a.mealOption === 'full') return FULL_DAY_MEAL_PRICE;
    return 0;
  }

  attendeeTotal(a: Attendee): number {
    return this.attendeeBaseCost(a) + this.attendeeLinenCost(a) + this.attendeeMealCost(a);
  }

  attendeeBreakdown(a: Attendee): string {
    const parts: string[] = [];
    if (a.attendanceType === 'partial') {
      const dayLabels = (a.days ?? []).map(d => this.dayLabel(d)).join(', ');
      parts.push(`Single day (${dayLabels}) $${this.attendeeBaseCost(a)}`);
      const meal = this.attendeeMealCost(a);
      if (meal > 0) parts.push(`${a.mealOption === 'full' ? 'Full-day meals' : 'Half-day meals'} $${meal}`);
    } else {
      parts.push(`Full retreat $${FULL_RETREAT_PRICE}`);
      const linen = this.attendeeLinenCost(a);
      if (linen > 0) {
        const label = a.linenOption === 'package'
          ? 'Linen package'
          : `Linens (${a.linenItemCount} item${(a.linenItemCount ?? 0) === 1 ? '' : 's'})`;
        parts.push(`${label} $${linen}`);
      }
    }
    return parts.join(' + ');
  }

  dayLabel(d: RetreatDay): string {
    return this.retreatDays.find(rd => rd.value === d)?.label ?? d;
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
    return this.attendees.reduce((sum, a) => sum + this.attendeeTotal(a), 0);
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
      const registration = {
        ...this.registrationForm.value,
        agreedToTerms: this.agreedToTerms,
        attendees: this.attendees
      };
      const created = await firstValueFrom(this.registrationService.createRegistration(registration));

      if (this.stripe && this.cardElement) {
        const paymentResponse = await firstValueFrom(
          this.registrationService.createPaymentIntent(created.id!)
        );

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
