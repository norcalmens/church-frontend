import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

interface QrEntry {
  label: string;
  path: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-qr-codes',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <div class="qr-container">

      <!-- Screen-only header (hidden when printing) -->
      <div class="hero no-print">
        <i class="pi pi-qrcode"></i>
        <h1>Retreat QR Codes</h1>
        <p class="subtitle">Scan to open, or print this page as a handout for the retreat.</p>
        <button pButton label="Print This Page" icon="pi pi-print" class="print-btn" (click)="print()"></button>
      </div>

      <!-- Print-only header -->
      <div class="print-header print-only">
        <h2>NorCal Men's Retreat 2026 &mdash; Quick Links</h2>
        <p>Scan these QR codes with your phone camera. norcalmensretreat.com</p>
      </div>

      <div class="qr-grid">
        <div *ngFor="let entry of entries" class="qr-card">
          <div class="qr-image-wrap">
            <img [src]="qrUrlFor(entry.path)" [alt]="entry.label + ' QR code'" loading="lazy" />
          </div>
          <div class="qr-meta">
            <h3><i class="pi" [class]="'pi ' + entry.icon"></i> {{ entry.label }}</h3>
            <p class="qr-desc">{{ entry.description }}</p>
            <p class="qr-url">{{ shortUrlFor(entry.path) }}</p>
          </div>
        </div>
      </div>

      <div class="print-footer print-only">
        <p>Trouble with registration? Call <strong>Bro. Washington</strong> &mdash; (707) 656-3789</p>
      </div>
    </div>
  `,
  styles: [`
    .qr-container { max-width: 1100px; margin: 0 auto; }

    .hero {
      background: var(--retreat-grad-nav);
      border-radius: 16px; padding: 2rem; text-align: center; color: #f0e6d0;
      margin-bottom: 1.25rem;
      i.pi-qrcode { font-size: 2.25rem; color: #e8a832; }
      h1 { font-size: 1.9rem; font-weight: 800; margin: 0.5rem 0 0.35rem; }
      .subtitle { font-size: 1rem; margin: 0 0 1rem; opacity: 0.92; }
      .print-btn { background: #e8a832 !important; border-color: #e8a832 !important; color: #1a3a4a !important; font-weight: 700; }
    }

    .qr-grid {
      display: grid; gap: 1.25rem;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    }

    .qr-card {
      background: #fff; border-radius: 14px; padding: 1.25rem;
      box-shadow: 0 4px 16px rgba(0,0,0,0.07);
      display: flex; flex-direction: column; align-items: center; text-align: center;
      border-top: 4px solid #e8a832;
    }
    .qr-image-wrap {
      width: 100%; aspect-ratio: 1 / 1; max-width: 240px;
      display: flex; align-items: center; justify-content: center;
      img { width: 100%; height: 100%; object-fit: contain; }
    }
    .qr-meta { width: 100%; }
    .qr-meta h3 {
      margin: 0.75rem 0 0.35rem; color: #1a3a4a;
      display: flex; align-items: center; justify-content: center; gap: 0.45rem;
      font-size: 1.1rem;
      i { color: #d4782f; font-size: 1rem; }
    }
    .qr-desc { margin: 0 0 0.4rem; color: #495057; font-size: 0.9rem; line-height: 1.4; }
    .qr-url { margin: 0; color: #888; font-size: 0.78rem; word-break: break-all; font-family: monospace; }

    .print-header, .print-footer { display: none; text-align: center; margin: 1rem 0; color: #1a3a4a;
      h2 { font-size: 1.4rem; margin: 0 0 0.35rem; }
      p { margin: 0; color: #495057; }
    }

    @media (max-width: 600px) {
      .hero { padding: 1.5rem 1rem; }
      .hero h1 { font-size: 1.5rem; }
      .qr-grid { grid-template-columns: 1fr; }
      .qr-image-wrap { max-width: 220px; }
    }

    @media print {
      .no-print { display: none !important; }
      .print-only { display: block !important; }
      .qr-container { max-width: none; }
      .qr-grid { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
      .qr-card { box-shadow: none; border: 1px solid #ccc; border-top: 3px solid #e8a832; padding: 0.85rem; page-break-inside: avoid; }
      .qr-image-wrap { max-width: 200px; }
    }
  `]
})
export class QrCodesComponent implements OnInit {
  entries: QrEntry[] = [
    { label: 'Itinerary',    path: '/itinerary',    description: 'Daily schedule, speakers, and sessions.', icon: 'pi-calendar' },
    { label: 'Feedback Form', path: '/feedback',    description: 'Tell us how the retreat went.',           icon: 'pi-comments' },
    { label: 'Directions',   path: '/directions',   description: 'How to get to Alliance Redwoods.',        icon: 'pi-map-marker' },
    { label: 'Register',     path: '/registration', description: 'Sign up and pay for the retreat.',        icon: 'pi-pencil' },
    { label: 'Donate',       path: '/donations',    description: 'Support the retreat.',                    icon: 'pi-heart' },
    { label: 'Worship',      path: '/worship',      description: 'Live Zoom worship sessions.',             icon: 'pi-video' },
  ];

  private origin = '';

  ngOnInit(): void {
    this.origin = typeof window !== 'undefined' ? window.location.origin : '';
  }

  qrUrlFor(path: string): string {
    const target = encodeURIComponent(this.origin + path);
    return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=8&data=${target}`;
  }

  shortUrlFor(path: string): string {
    const o = this.origin.replace(/^https?:\/\//, '');
    return o + path;
  }

  print(): void {
    window.print();
  }
}
