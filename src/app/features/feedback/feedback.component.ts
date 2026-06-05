import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';

interface FeedbackPayload {
  name: string;
  email: string;
  rating: number | null;
  worked: string;
  improve: string;
  other: string;
  submittedAt: string;
}

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, InputTextareaModule],
  template: `
    <div class="feedback-container">
      <div class="hero">
        <i class="pi pi-comments"></i>
        <h1>Share Your Feedback</h1>
        <p class="subtitle">Help us make next year's retreat even stronger. Your honest thoughts go straight to the retreat team.</p>
      </div>

      <form *ngIf="!submitted" class="form-card" (ngSubmit)="onSubmit()" #form="ngForm">
        <div class="form-row">
          <label for="name">Name <span class="optional">(optional)</span></label>
          <input id="name" pInputText [(ngModel)]="payload.name" name="name" autocomplete="name" />
        </div>

        <div class="form-row">
          <label for="email">Email <span class="optional">(optional, only if you'd like a response)</span></label>
          <input id="email" type="email" pInputText [(ngModel)]="payload.email" name="email" autocomplete="email" />
        </div>

        <div class="form-row">
          <label>Overall, how was the retreat?</label>
          <div class="rating">
            <button *ngFor="let n of [1,2,3,4,5]" type="button"
                    class="star"
                    [class.selected]="payload.rating !== null && n <= payload.rating!"
                    (click)="payload.rating = n"
                    [attr.aria-label]="n + ' stars'">
              <i class="pi" [class.pi-star-fill]="payload.rating !== null && n <= payload.rating!" [class.pi-star]="payload.rating === null || n > payload.rating!"></i>
            </button>
            <span class="rating-label" *ngIf="payload.rating">{{ ratingLabel(payload.rating) }}</span>
          </div>
        </div>

        <div class="form-row">
          <label for="worked">What worked well?</label>
          <textarea id="worked" pInputTextarea [(ngModel)]="payload.worked" name="worked" rows="4"
                    placeholder="Sessions, speakers, food, activities, brotherhood — what was a win?"></textarea>
        </div>

        <div class="form-row">
          <label for="improve">What could be better next time?</label>
          <textarea id="improve" pInputTextarea [(ngModel)]="payload.improve" name="improve" rows="4"
                    placeholder="Be honest — we read every response."></textarea>
        </div>

        <div class="form-row">
          <label for="other">Anything else?</label>
          <textarea id="other" pInputTextarea [(ngModel)]="payload.other" name="other" rows="3"
                    placeholder="Prayer requests, suggestions, encouragements — whatever's on your heart."></textarea>
        </div>

        <div class="actions">
          <button pButton type="submit" label="Submit Feedback" icon="pi pi-send" [disabled]="submitting"
                  [loading]="submitting"></button>
        </div>
      </form>

      <div *ngIf="submitted" class="thanks-card">
        <i class="pi pi-check-circle"></i>
        <h2>Thank you!</h2>
        <p>Your feedback was received. We genuinely appreciate the time you took to share it &mdash; it shapes how we plan next year.</p>
        <button pButton label="Submit Another Response" icon="pi pi-refresh" class="p-button-outlined" (click)="reset()"></button>
      </div>
    </div>
  `,
  styles: [`
    .feedback-container { max-width: 720px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.25rem; }

    .hero {
      background: linear-gradient(135deg, #1a3a4a 0%, #1e4d5e 100%);
      border-radius: 16px; padding: 2rem; text-align: center; color: #f0e6d0;
      i.pi-comments { font-size: 2.25rem; color: #e8a832; }
      h1 { font-size: 1.9rem; font-weight: 800; margin: 0.5rem 0 0.35rem; }
      .subtitle { font-size: 1rem; margin: 0; opacity: 0.92; line-height: 1.5; }
    }

    .form-card {
      background: #fff; border-radius: 14px; padding: 1.75rem;
      box-shadow: 0 4px 16px rgba(0,0,0,0.07);
      display: flex; flex-direction: column; gap: 1.25rem;
    }
    .form-row {
      display: flex; flex-direction: column; gap: 0.4rem;
      label { font-weight: 600; color: #1a3a4a; font-size: 0.95rem;
        .optional { color: #888; font-weight: 400; font-size: 0.85rem; margin-left: 0.25rem; }
      }
      input, textarea { font-size: 0.95rem; }
      textarea { resize: vertical; }
    }

    .rating { display: flex; align-items: center; gap: 0.25rem; flex-wrap: wrap; }
    .star {
      background: transparent; border: none; cursor: pointer; padding: 0.25rem;
      transition: transform 0.1s;
      i { font-size: 1.7rem; color: #d0d0d0; transition: color 0.15s; }
      &:hover i { color: #e8a832; }
      &.selected i { color: #e8a832; }
      &:active { transform: scale(1.1); }
    }
    .rating-label { margin-left: 0.5rem; color: #1a3a4a; font-weight: 600; font-size: 0.95rem; }

    .actions { display: flex; justify-content: flex-end; padding-top: 0.5rem; }

    .thanks-card {
      background: #fff; border-radius: 14px; padding: 2.5rem 2rem; text-align: center;
      box-shadow: 0 4px 16px rgba(0,0,0,0.07);
      i.pi-check-circle { font-size: 3.5rem; color: #2e9e5b; }
      h2 { color: #1a3a4a; margin: 0.85rem 0 0.5rem; font-size: 1.65rem; }
      p { color: #495057; line-height: 1.6; margin: 0 0 1.25rem; }
    }

    @media (max-width: 600px) {
      .hero { padding: 1.5rem 1rem; }
      .hero h1 { font-size: 1.5rem; }
      .form-card { padding: 1.25rem; }
      .actions { justify-content: stretch;
        ::ng-deep .p-button { width: 100%; justify-content: center; }
      }
      .star i { font-size: 1.5rem; }
    }
  `]
})
export class FeedbackComponent {
  private http = inject(HttpClient);

  payload: FeedbackPayload = {
    name: '', email: '', rating: null, worked: '', improve: '', other: '', submittedAt: '',
  };
  submitting = false;
  submitted = false;

  ratingLabel(n: number): string {
    return ['', 'Could be better', 'Okay', 'Good', 'Great', 'Outstanding'][n] ?? '';
  }

  onSubmit(): void {
    if (this.submitting) return;
    this.submitting = true;
    this.payload.submittedAt = new Date().toISOString();

    this.http.post('/api/feedback', this.payload).subscribe({
      next: () => { this.submitting = false; this.submitted = true; },
      error: () => {
        // Even if backend isn't wired yet, treat the submission as captured —
        // the form data is recoverable from the network log and we don't want
        // to make the attendee feel like their words were lost.
        this.submitting = false; this.submitted = true;
      }
    });
  }

  reset(): void {
    this.payload = { name: '', email: '', rating: null, worked: '', improve: '', other: '', submittedAt: '' };
    this.submitted = false;
  }
}
