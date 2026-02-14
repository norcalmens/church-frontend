import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
import { Attendee } from '../../core/models/attendee.model';

@Component({
  selector: 'app-retreat-registration',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    CardModule, InputTextModule, ButtonModule, DropdownModule,
    CheckboxModule, InputTextareaModule, TableModule, ToastModule
  ],
  providers: [MessageService],
  templateUrl: './retreat-registration.component.html',
  styleUrls: ['./retreat-registration.component.scss']
})
export class RetreatRegistrationComponent {
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private registrationService = inject(RegistrationService);
  private router = inject(Router);

  registrationForm: FormGroup;
  attendeeForm: FormGroup;
  attendees: Attendee[] = [];
  isSubmitting = false;
  agreedToTerms = false;

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
    return this.attendees.length * 240;
  }

  submitRegistration(): void {
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

    this.isSubmitting = true;
    const registration = {
      ...this.registrationForm.value,
      agreedToTerms: this.agreedToTerms,
      attendees: this.attendees
    };

    this.registrationService.createRegistration(registration).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Registration submitted! Redirecting to payment...' });
        setTimeout(() => this.router.navigate(['/payment']), 2000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.message || 'Registration failed' });
      }
    });
  }
}
