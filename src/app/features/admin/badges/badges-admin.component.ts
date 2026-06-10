import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { RegistrationService } from '../../../services/registration.service';
import { Registration } from '../../../core/models/registration.model';

interface BadgeData {
  firstName: string;
  lastName: string;
  congregation: string;
  isSpeaker: boolean;
  paid: boolean;
}

@Component({
  selector: 'app-badges-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ButtonModule, CheckboxModule, InputTextModule],
  template: `
    <div class="badges-container">

      <!-- Screen-only controls (hidden on print) -->
      <div class="no-print">
        <div class="back-bar">
          <a routerLink="/admin/dashboard" class="back-link"><i class="pi pi-arrow-left"></i> Back to Dashboard</a>
        </div>
        <div class="page-header">
          <h1>Printable Name Badges</h1>
          <p>Avery 5392 &mdash; 6 badges per sheet (4&times;3&Prime; landscape)</p>
        </div>

        <div class="toolbar">
          <span class="p-input-icon-left search-wrap">
            <i class="pi pi-search"></i>
            <input pInputText [(ngModel)]="searchTerm" (input)="recompute()" placeholder="Search by name or congregation..." />
          </span>
          <label class="filter">
            <p-checkbox [(ngModel)]="onlyPaid" [binary]="true" (onChange)="recompute()"></p-checkbox>
            <span>Paid registrations only</span>
          </label>
          <label class="filter">
            <p-checkbox [(ngModel)]="onlySpeakers" [binary]="true" (onChange)="recompute()"></p-checkbox>
            <span>Speakers only</span>
          </label>
          <div class="spacer"></div>
          <span class="count">{{ filteredBadges.length }} badge{{ filteredBadges.length === 1 ? '' : 's' }} &middot; {{ sheetCount }} sheet{{ sheetCount === 1 ? '' : 's' }}</span>
          <button pButton label="Print" icon="pi pi-print" (click)="print()" [disabled]="!filteredBadges.length"></button>
        </div>

        <div class="hint">
          <i class="pi pi-info-circle"></i>
          <span>When printing, set scale to <strong>100% / Actual Size</strong> and margins to <strong>None</strong>. Print a single test sheet on plain paper first to confirm alignment before loading Avery 5392 stock.</span>
        </div>
      </div>

      <!-- The sheets (shown on screen as preview, used as-is when printing) -->
      <div class="sheets">
        <div *ngFor="let sheet of sheets; let i = index" class="sheet">
          <div class="sheet-inner">
            <div *ngFor="let badge of sheet" class="badge"
                 [class.badge-speaker]="badge.isSpeaker">
              <div class="badge-stripe">
                <span>{{ badge.isSpeaker ? 'SPEAKER' : 'HELLO, MY NAME IS' }}</span>
              </div>
              <div class="badge-name">
                <div class="first">{{ badge.firstName }}</div>
                <div class="last">{{ badge.lastName }}</div>
              </div>
              <div class="badge-foot">
                <div class="congregation" *ngIf="badge.congregation">{{ badge.congregation }}</div>
                <div class="event">NorCal Men's Retreat 2026</div>
              </div>
            </div>
            <!-- Fill empty slots so the sheet keeps grid layout -->
            <div *ngFor="let _ of emptySlotsFor(sheet)" class="badge badge-empty"></div>
          </div>
        </div>

        <div *ngIf="!filteredBadges.length && !loading" class="empty">
          <i class="pi pi-id-card"></i>
          <p>No badges to print with the current filters.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .badges-container { max-width: 1200px; margin: 0 auto; }

    .back-bar { margin-bottom: 1rem; }
    .back-link {
      display: inline-flex; align-items: center; gap: 0.5rem;
      color: #1a3a4a; text-decoration: none; font-weight: 600; font-size: 0.9rem;
      padding: 0.5rem 1rem; border-radius: 8px; transition: all 0.2s;
      &:hover { background: rgba(26, 58, 74, 0.08); color: #d4782f; }
    }
    .page-header {
      text-align: center; padding: 2rem; color: #f0e6d0; border-radius: 12px;
      background: linear-gradient(180deg, #1a3a4a 0%, #2a5a6a 30%, #c8923a 70%, #d4782f 100%);
      margin-bottom: 1.5rem;
      h1 { font-size: 1.9rem; font-weight: 700; margin: 0 0 0.4rem 0; }
      p { font-size: 0.95rem; margin: 0; opacity: 0.92; }
    }

    .toolbar {
      display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;
      margin-bottom: 1rem;
      background: #fff; padding: 0.85rem 1.1rem; border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.06);
      .search-wrap { min-width: 240px; }
      .filter { display: flex; align-items: center; gap: 0.45rem; cursor: pointer; color: #1a3a4a; font-weight: 500; font-size: 0.95rem; }
      .spacer { flex: 1; }
      .count { color: #6c757d; font-size: 0.9rem; }
    }
    .hint {
      display: flex; gap: 0.6rem; align-items: flex-start;
      background: #fff7e0; border: 1px solid #f1d889; border-left: 4px solid #d4782f;
      border-radius: 10px; padding: 0.75rem 1rem; margin-bottom: 1.5rem;
      color: #6e4b08;
      i { color: #d4782f; font-size: 1.1rem; margin-top: 0.15rem; flex-shrink: 0; }
      strong { color: #8a4a08; }
    }

    .sheets { display: flex; flex-direction: column; align-items: center; gap: 1rem; }

    /* === Avery 5392 sheet specs ===
       Page: 8.5 x 11 in (Letter)
       Labels: 4 x 3 in (landscape), 2 columns x 3 rows = 6 per sheet
       Margins: 1 in top, 0.25 in side, no gaps between labels */
    .sheet {
      width: 8.5in;
      height: 11in;
      background: #fff;
      box-shadow: 0 6px 24px rgba(0,0,0,0.12);
      padding: 1in 0.25in;
      box-sizing: border-box;
    }
    .sheet-inner {
      display: grid;
      grid-template-columns: 4in 4in;
      grid-template-rows: 3in 3in 3in;
      gap: 0;
      width: 8in;
      height: 9in;
    }

    .badge {
      width: 4in; height: 3in;
      box-sizing: border-box;
      padding: 0.18in;
      display: flex; flex-direction: column;
      border: 1px dashed #c8c8c8;       /* screen guide only -- hidden when printing */
      background: #fff;
      color: #1a3a4a;
      overflow: hidden;
      position: relative;
    }
    .badge-empty { background: transparent; }

    .badge-stripe {
      background: linear-gradient(135deg, #1a3a4a 0%, #1e4d5e 100%);
      color: #e8a832;
      text-align: center;
      padding: 0.13in 0.1in;
      font-weight: 800;
      font-size: 0.16in;
      letter-spacing: 0.02in;
      text-transform: uppercase;
      border-radius: 0.08in;
    }
    .badge-name {
      flex: 1;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      text-align: center;
      padding: 0.08in 0;
      .first { font-size: 0.42in; font-weight: 800; line-height: 1.05; color: #1a3a4a; }
      .last  { font-size: 0.36in; font-weight: 700; line-height: 1.1;  color: #1a3a4a; margin-top: 0.04in; }
    }
    .badge-foot {
      text-align: center;
      .congregation { font-size: 0.14in; font-weight: 600; color: #d4782f; line-height: 1.2; }
      .event { font-size: 0.11in; color: #6c757d; margin-top: 0.03in; }
    }

    /* Speaker variant -- gold stripe, gold border accent */
    .badge-speaker {
      .badge-stripe {
        background: linear-gradient(135deg, #d4782f 0%, #e8a832 100%);
        color: #fff;
      }
      .badge-name .first, .badge-name .last { color: #8a4a08; }
      .badge-foot .congregation { color: #b8651f; }
      &::after {
        content: '';
        position: absolute; inset: 0;
        border: 0.04in solid #e8a832;
        border-radius: 0.04in;
        pointer-events: none;
      }
    }

    .empty {
      background: #fff; border-radius: 14px; padding: 3rem; text-align: center; color: #6c757d;
      box-shadow: 0 4px 16px rgba(0,0,0,0.06);
      i { font-size: 3rem; color: #d0d0d0; }
      p { margin: 1rem 0 0; font-size: 1.05rem; }
    }

    /* Responsive: scale the preview down on smaller screens so it still fits.
       Print uses real inches so this only affects on-screen layout. */
    @media (max-width: 900px) {
      .sheet { transform: scale(0.7); transform-origin: top center;
        margin-bottom: -3.3in;  /* compensate for the scale so sheets don't overlap */
      }
    }
    @media (max-width: 600px) {
      .sheet { transform: scale(0.42); margin-bottom: -6.4in; }
    }

    /* ===== Print rules ===== */
    @media print {
      .no-print { display: none !important; }
      .badges-container { max-width: none; }
      .sheets { gap: 0; }
      .sheet {
        box-shadow: none;
        page-break-after: always;
        margin: 0;
        transform: none !important;
      }
      .badge { border: none; }
      .empty { display: none; }
    }
    @page { size: letter; margin: 0; }
  `]
})
export class BadgesAdminComponent implements OnInit {
  private registrationService = inject(RegistrationService);

  searchTerm = '';
  onlyPaid = true;
  onlySpeakers = false;
  loading = true;

  private allBadges: BadgeData[] = [];
  filteredBadges: BadgeData[] = [];
  sheets: BadgeData[][] = [];

  readonly BADGES_PER_SHEET = 6;

  get sheetCount(): number { return this.sheets.length; }

  ngOnInit(): void {
    this.registrationService.getAllRegistrations().subscribe({
      next: (regs) => {
        this.allBadges = this.flatten(regs);
        this.recompute();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  private flatten(regs: Registration[]): BadgeData[] {
    const out: BadgeData[] = [];
    for (const r of regs) {
      const paid = r.paymentStatus === 'paid';
      const congregation = (r.congregation || '').trim();
      const primaryKey = (r.firstName + '|' + r.lastName).toLowerCase().trim();
      for (const a of (r.attendees || [])) {
        const attendeeKey = ((a.firstName || '') + '|' + (a.lastName || '')).toLowerCase().trim();
        const isPrimary = attendeeKey === primaryKey;
        out.push({
          firstName: a.firstName,
          lastName: a.lastName,
          congregation,
          isSpeaker: !!r.speaker && isPrimary,
          paid,
        });
      }
    }
    return out;
  }

  recompute(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredBadges = this.allBadges.filter(b => {
      if (this.onlyPaid && !b.paid) return false;
      if (this.onlySpeakers && !b.isSpeaker) return false;
      if (term) {
        const hay = (b.firstName + ' ' + b.lastName + ' ' + b.congregation).toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });

    this.sheets = [];
    for (let i = 0; i < this.filteredBadges.length; i += this.BADGES_PER_SHEET) {
      this.sheets.push(this.filteredBadges.slice(i, i + this.BADGES_PER_SHEET));
    }
  }

  emptySlotsFor(sheet: BadgeData[]): number[] {
    const remaining = this.BADGES_PER_SHEET - sheet.length;
    return remaining > 0 ? Array(remaining).fill(0) : [];
  }

  print(): void {
    window.print();
  }
}
