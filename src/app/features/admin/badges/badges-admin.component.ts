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
          <p *ngIf="orientation === 'landscape'">Avery 5392 &mdash; 6 badges per sheet (4&times;3&Prime; landscape)</p>
          <p *ngIf="orientation === 'portrait'">Portrait holders &mdash; 4 badges per sheet (3&times;4&Prime; portrait)</p>
        </div>

        <div class="toolbar">
          <span class="p-input-icon-left search-wrap">
            <i class="pi pi-search"></i>
            <input pInputText [(ngModel)]="searchTerm" (input)="recompute()" placeholder="Search by name or congregation..." />
          </span>
          <label class="filter">
            <p-checkbox [(ngModel)]="onlyPaid" [binary]="true" (onChange)="recompute()"></p-checkbox>
            <span>Paid only <em *ngIf="pendingCount">({{ pendingCount }} pending hidden)</em></span>
          </label>
          <label class="filter">
            <p-checkbox [(ngModel)]="onlySpeakers" [binary]="true" (onChange)="recompute()"></p-checkbox>
            <span>Speakers only</span>
          </label>
          <div class="orientation-toggle">
            <button pButton type="button"
                    [class.p-button-outlined]="orientation !== 'landscape'"
                    icon="pi pi-window-maximize" label="Landscape 4&times;3"
                    class="p-button-sm" (click)="setOrientation('landscape')"></button>
            <button pButton type="button"
                    [class.p-button-outlined]="orientation !== 'portrait'"
                    icon="pi pi-id-card" label="Portrait 3&times;4"
                    class="p-button-sm" (click)="setOrientation('portrait')"></button>
          </div>
          <div class="spacer"></div>
          <span class="count">
            <strong>{{ filteredBadges.length }}</strong> badge{{ filteredBadges.length === 1 ? '' : 's' }}
            <span *ngIf="filteredBadges.length !== allBadges.length" class="of-total"> of {{ allBadges.length }}</span>
            &middot; {{ sheetCount }} sheet{{ sheetCount === 1 ? '' : 's' }}
          </span>
          <button *ngIf="selectedCount > 0" pButton
                  [label]="'Clear (' + selectedCount + ')'"
                  icon="pi pi-times"
                  class="p-button-sm p-button-text"
                  (click)="clearSelection()"></button>
          <button *ngIf="selectedCount > 0" pButton
                  [label]="'Print ' + selectedCount + ' Selected'"
                  icon="pi pi-print"
                  (click)="printSelected()"></button>
          <button *ngIf="selectedCount === 0" pButton label="Print All" icon="pi pi-print"
                  (click)="print()" [disabled]="!filteredBadges.length"></button>
        </div>

        <div class="hint">
          <i class="pi pi-info-circle"></i>
          <span *ngIf="orientation === 'landscape'"><strong>Click any badge</strong> to mark it for selective printing, or hover and click the small printer icon to print just that one. <strong>Print All</strong> prints every badge below. When printing, set scale to <strong>100% / Actual Size</strong> and margins to <strong>None</strong>. Print a single test sheet on plain paper first to confirm alignment before loading Avery 5392 stock.</span>
          <span *ngIf="orientation === 'portrait'"><strong>Click any badge</strong> to mark it for selective printing, or hover and click the small printer icon to print just that one. Portrait 3&times;4&Prime; layout, 4 per sheet &mdash; for vertical badge holders. Doesn't match a stock Avery SKU; print on plain cardstock and trim along the inner border. Use scale <strong>100% / Actual Size</strong> and margins <strong>None</strong>.</span>
        </div>
      </div>

      <!-- The sheets (shown on screen as preview, used as-is when printing) -->
      <div class="sheets" [class.portrait]="orientation === 'portrait'">
        <div *ngFor="let sheet of sheets; let i = index" class="sheet-wrap">
          <!-- Screen-only header: print page number + content count.
               Use these numbers in your print dialog's "Pages:" field. -->
          <div class="sheet-header no-print">
            <span class="sheet-num">Page {{ i + 1 }} <span class="of">of {{ sheets.length }}</span></span>
            <span class="sheet-meta">
              <strong>{{ sheet.length }}</strong> badge{{ sheet.length === 1 ? '' : 's' }}
              <em *ngIf="sheet.length < badgesPerSheet">
                &middot; {{ badgesPerSheet - sheet.length }} empty slot{{ (badgesPerSheet - sheet.length) === 1 ? '' : 's' }}
              </em>
            </span>
          </div>
          <div class="sheet" [class.sheet-portrait]="orientation === 'portrait'">
            <!-- Print-only corner stamp so the actual paper has its page number too -->
            <div class="sheet-print-stamp print-only">Page {{ i + 1 }} of {{ sheets.length }}</div>
            <div class="sheet-inner">
            <div *ngFor="let badge of sheet" class="badge"
                 [class.badge-speaker]="badge.isSpeaker"
                 [class.badge-selected]="isSelected(badge)"
                 (click)="toggleBadgeSelection(badge)">

              <!-- Screen-only selection checkmark + per-badge print button (hidden on print) -->
              <div class="badge-select-mark no-print" *ngIf="isSelected(badge)">
                <i class="pi pi-check"></i>
              </div>
              <button type="button" class="badge-print-one no-print"
                      (click)="$event.stopPropagation(); printOne(badge)"
                      title="Print just this one badge">
                <i class="pi pi-print"></i>
              </button>

              <!-- Decorative top ribbon: scripture / role tag -->
              <div class="badge-ribbon">
                <i class="pi" [class.pi-sun]="!badge.isSpeaker" [class.pi-star-fill]="badge.isSpeaker"></i>
                <span>{{ badge.isSpeaker ? 'INVITED SPEAKER' : 'Standing in the Gap' }}</span>
                <i class="pi" [class.pi-sun]="!badge.isSpeaker" [class.pi-star-fill]="badge.isSpeaker"></i>
              </div>

              <!-- "Hello my name is" line with gold ornaments on each side -->
              <div class="badge-greeting">
                <span class="ornament"></span>
                <span class="greeting-text">{{ badge.isSpeaker ? 'PLEASE WELCOME' : 'Hello, my name is' }}</span>
                <span class="ornament"></span>
              </div>

              <!-- Name -->
              <div class="badge-name">
                <div class="first">{{ badge.firstName | titlecase }}</div>
                <div class="last">{{ badge.lastName | titlecase }}</div>
              </div>

              <!-- Decorative double rule -->
              <div class="badge-rule"></div>

              <!-- Congregation -->
              <div class="badge-congregation" *ngIf="badge.congregation">
                <i class="pi pi-bookmark-fill"></i>
                <span>{{ badge.congregation }}</span>
              </div>

              <!-- Footer: QR codes flanking the event stamp -->
              <div class="badge-foot">
                <div class="qr-cell">
                  <img [src]="qrItineraryUrl" alt="Itinerary QR" loading="lazy" />
                  <span class="qr-label">Itinerary</span>
                </div>
                <div class="event-stamp">
                  <span class="event">NorCal Men's</span>
                  <span class="event">Retreat 2026</span>
                  <span class="date">June 11&ndash;13</span>
                </div>
                <div class="qr-cell">
                  <img [src]="qrFeedbackUrl" alt="Feedback QR" loading="lazy" />
                  <span class="qr-label">Feedback</span>
                </div>
              </div>
            </div>
            <!-- Fill empty slots so the sheet keeps grid layout -->
            <div *ngFor="let _ of emptySlotsFor(sheet)" class="badge badge-empty"></div>
            </div>
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
      .count { color: #6c757d; font-size: 0.92rem;
        strong { color: #1a3a4a; font-size: 1rem; }
        .of-total { color: #b8651f; font-weight: 600; }
      }
      .filter em { color: #b8651f; font-style: italic; font-size: 0.85rem; font-weight: 500; }
      .orientation-toggle { display: flex; gap: 0.35rem; align-items: center;
        ::ng-deep .p-button { padding: 0.35rem 0.75rem; font-size: 0.85rem; }
      }
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

    /* Portrait: 3in x 4in badges, 2 columns x 2 rows = 4 per sheet.
       Three rows of 4in won't fit on Letter (11in tall) so we cap at 2 rows.
       Generous side + row gaps double as trim margins because this layout
       doesn't map to a stock Avery SKU. */
    .sheet.sheet-portrait {
      padding: 1in 1in;
    }
    .sheet.sheet-portrait .sheet-inner {
      grid-template-columns: 3in 3in;
      grid-template-rows: 4in 4in;
      gap: 1in 0.5in;       /* row-gap col-gap */
      width: 6.5in;
      height: 9in;
    }
    .sheet.sheet-portrait .badge {
      width: 3in; height: 4in;
      padding: 0.18in 0.16in;
    }
    /* In portrait the name has more vertical room but less horizontal room,
       so shrink the first/last fonts a touch to keep "Christopher" / longer
       names on one line. */
    .sheet.sheet-portrait .badge-name {
      .first { font-size: 0.36in; }
      .last  { font-size: 0.28in; }
    }
    /* QR row gets a touch more room when there are 4 vertical inches to spend. */
    .sheet.sheet-portrait .badge-foot { margin-top: 0.08in; }

    .badge {
      width: 4in; height: 3in;
      box-sizing: border-box;
      padding: 0.15in 0.18in;
      display: flex; flex-direction: column; align-items: stretch;
      border: 1px dashed #c8c8c8;       /* screen guide only -- hidden when printing */
      background:
        /* faint sunburst behind everything, anchored top-center */
        radial-gradient(circle at 50% 0%, rgba(232, 168, 50, 0.12) 0%, rgba(232, 168, 50, 0) 55%),
        /* cream paper tone */
        linear-gradient(180deg, #fffaf0 0%, #fff 100%);
      color: #1a3a4a;
      overflow: hidden;
      position: relative;
      font-family: 'Georgia', 'Times New Roman', serif;
    }
    /* Subtle double-line teal frame inside the cut edge */
    .badge::before {
      content: '';
      position: absolute; inset: 0.06in;
      border: 0.012in solid #1a3a4a;
      border-radius: 0.04in;
      pointer-events: none;
    }
    .badge::after {
      content: '';
      position: absolute; inset: 0.09in;
      border: 0.005in solid #e8a832;
      border-radius: 0.025in;
      pointer-events: none;
    }
    .badge-empty {
      background: transparent;
      &::before, &::after { display: none; }
    }
    /* Click-to-select visual */
    .badge { cursor: pointer; transition: transform 0.1s, box-shadow 0.15s;
      &:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(26, 58, 74, 0.22); }
      &:hover .badge-print-one { opacity: 1; }
    }
    .badge.badge-selected { box-shadow: 0 0 0 0.05in #d4782f, 0 6px 18px rgba(212, 120, 47, 0.35); }
    .badge-select-mark {
      position: absolute; top: 0.12in; left: 0.12in;
      width: 0.32in; height: 0.32in;
      background: #d4782f; color: #fff;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      z-index: 3;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
      i { font-size: 0.18in; font-weight: 900; }
    }
    .badge-print-one {
      position: absolute; top: 0.1in; right: 0.1in;
      width: 0.32in; height: 0.32in;
      background: #1a3a4a; color: #fff;
      border: none; border-radius: 50%;
      cursor: pointer; opacity: 0; transition: opacity 0.15s, background 0.15s;
      display: flex; align-items: center; justify-content: center;
      z-index: 3;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
      &:hover { background: #d4782f; opacity: 1 !important; }
      i { font-size: 0.16in; }
    }

    /* Top ribbon -- gold script-style with sun icon flourishes */
    .badge-ribbon {
      display: flex; align-items: center; justify-content: center; gap: 0.1in;
      color: #b8651f;
      font-family: 'Georgia', serif;
      font-style: italic;
      font-size: 0.16in;
      font-weight: 600;
      letter-spacing: 0.01in;
      padding: 0.04in 0 0.06in;
      position: relative; z-index: 1;
      i { font-size: 0.13in; color: #e8a832; font-style: normal; }
    }

    /* "Hello, my name is" with gold side-ornaments */
    .badge-greeting {
      display: flex; align-items: center; justify-content: center; gap: 0.1in;
      margin: 0.02in 0 0.06in;
      position: relative; z-index: 1;
      .greeting-text {
        font-family: 'Georgia', serif;
        font-style: italic;
        font-size: 0.11in;
        font-weight: 500;
        color: #1a3a4a;
        opacity: 0.85;
        text-transform: none;
        letter-spacing: 0.01in;
      }
      .ornament {
        flex: 0 0 0.5in;
        height: 0.012in;
        background: linear-gradient(90deg, transparent 0%, #e8a832 50%, transparent 100%);
        position: relative;
        &::after {
          content: '';
          position: absolute;
          left: 50%; top: 50%;
          width: 0.04in; height: 0.04in;
          transform: translate(-50%, -50%) rotate(45deg);
          background: #e8a832;
        }
      }
    }

    .badge-name {
      flex: 1;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      text-align: center;
      padding: 0.02in 0;
      position: relative; z-index: 1;
      font-family: 'Georgia', 'Times New Roman', serif;
      .first {
        font-size: 0.42in; font-weight: 700; line-height: 1.0; color: #1a3a4a;
        letter-spacing: -0.005in;
      }
      .last  {
        font-size: 0.32in; font-weight: 700; line-height: 1.05; color: #1a3a4a;
        margin-top: 0.04in;
        letter-spacing: -0.005in;
      }
    }

    /* Decorative gold double rule */
    .badge-rule {
      width: 1.4in;
      height: 0.05in;
      margin: 0.05in auto 0.06in;
      background:
        linear-gradient(180deg, transparent 0 38%, #e8a832 38% 48%, transparent 48% 52%, #e8a832 52% 62%, transparent 62% 100%);
      position: relative; z-index: 1;
    }

    .badge-congregation {
      display: flex; align-items: center; justify-content: center; gap: 0.05in;
      font-size: 0.13in; font-weight: 600; color: #b8651f; line-height: 1.2;
      font-family: 'Georgia', serif;
      font-style: italic;
      padding: 0 0.1in;
      position: relative; z-index: 1;
      i { font-size: 0.1in; color: #d4782f; font-style: normal; }
      span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 3in; }
    }

    .badge-foot {
      display: flex; align-items: center; justify-content: space-between; gap: 0.08in;
      margin-top: 0.05in;
      padding: 0 0.05in;
      font-family: 'Georgia', serif;
      color: #1a3a4a;
      position: relative; z-index: 1;
      .qr-cell {
        display: flex; flex-direction: column; align-items: center; gap: 0.015in;
        flex-shrink: 0;
        img {
          width: 0.62in; height: 0.62in;
          display: block;
          /* Print-safe -- forces the browser to render the raster crisply */
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
        }
        .qr-label {
          font-size: 0.085in;
          font-weight: 700;
          color: #1a3a4a;
          letter-spacing: 0.01in;
          text-transform: uppercase;
        }
      }
      .event-stamp {
        flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
        gap: 0.01in; line-height: 1.1;
        text-align: center;
        .event { font-size: 0.11in; font-weight: 700; color: #1a3a4a; opacity: 0.85; }
        .date { font-size: 0.1in; font-style: italic; color: #d4782f; margin-top: 0.02in; }
      }
    }

    /* === Speaker variant: regal gold accents === */
    .badge-speaker {
      background:
        radial-gradient(circle at 50% 0%, rgba(232, 168, 50, 0.22) 0%, rgba(232, 168, 50, 0) 60%),
        linear-gradient(180deg, #fff7e0 0%, #fffaf0 100%);
      &::before {
        border: 0.018in solid #b8651f;
      }
      &::after {
        border: 0.008in solid #e8a832;
      }
      .badge-ribbon {
        color: #8a4a08;
        font-style: normal;
        font-weight: 800;
        font-size: 0.15in;
        letter-spacing: 0.04in;
        text-transform: uppercase;
        i { color: #d4782f; }
      }
      .badge-greeting .greeting-text {
        color: #8a4a08; font-style: italic; opacity: 0.95;
        font-weight: 600;
      }
      .badge-greeting .ornament { background: linear-gradient(90deg, transparent 0%, #b8651f 50%, transparent 100%);
        &::after { background: #b8651f; }
      }
      .badge-name .first, .badge-name .last { color: #5a3608; }
      .badge-rule {
        background:
          linear-gradient(180deg, transparent 0 30%, #b8651f 30% 42%, transparent 42% 50%, #e8a832 50% 62%, transparent 62% 70%, #b8651f 70% 82%, transparent 82% 100%);
        height: 0.08in;
      }
      .badge-congregation { color: #5a3608;
        i { color: #b8651f; }
      }
      .badge-foot { color: #5a3608; opacity: 0.85;
        .dot { color: #d4782f; }
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

    /* ===== Screen-only sheet header (page number + content count) ===== */
    .sheet-wrap { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; }
    .sheet-header {
      width: 8.5in; max-width: 100%;
      display: flex; align-items: baseline; justify-content: space-between;
      padding: 0.35rem 0.5rem;
      color: #1a3a4a; font-size: 0.92rem;
      border-bottom: 1px dashed #d4782f;
      .sheet-num { font-weight: 700; color: #1a3a4a;
        .of { color: #6c757d; font-weight: 500; }
      }
      .sheet-meta { color: #495057;
        strong { color: #1a3a4a; }
        em { color: #b8651f; font-style: italic; }
      }
    }
    /* Print-only stamp lives inside the sheet area so it sits in the
       margin without touching the badge grid. */
    .sheet-print-stamp {
      display: none;
      position: absolute; right: 0.1in; bottom: 0.05in;
      font-family: 'Georgia', serif;
      font-size: 0.09in; color: #6c757d;
    }
    .sheet { position: relative; }
    .print-only { display: none; }

    @media (max-width: 900px) {
      .sheet-header { font-size: 0.85rem; padding: 0.3rem 0.4rem; }
    }

    /* ===== Print rules ===== */
    @media print {
      .no-print { display: none !important; }
      .print-only { display: block !important; }
      .badges-container { max-width: none; }
      .sheets { gap: 0; }
      .sheet-wrap { gap: 0; }
      .sheet {
        box-shadow: none;
        margin: 0;
        transform: none !important;
      }
      /* Force a page break BETWEEN sheets but not after the last one --
         "page-break-after: always" on the last sheet produces a trailing
         blank page in many browsers (Chrome, Edge). */
      .sheet-wrap:not(:last-child) { page-break-after: always; }
      .badge { border: none; }
      .empty { display: none; }
      .sheet-print-stamp { display: block; }
    }
    @page { size: letter; margin: 0; }
  `]
})
export class BadgesAdminComponent implements OnInit {
  private registrationService = inject(RegistrationService);

  searchTerm = '';
  // Default OFF so EVERY registered attendee gets a badge, including
  // pending registrations -- they still need a badge at check-in.
  onlyPaid = false;
  onlySpeakers = false;
  loading = true;

  allBadges: BadgeData[] = [];
  filteredBadges: BadgeData[] = [];
  sheets: BadgeData[][] = [];

  // Captured once in ngOnInit so the QR codes point at the same host the
  // admin is currently viewing -- works in dev, staging, and prod without
  // any hardcoded URL.
  private origin = '';
  qrItineraryUrl = '';
  qrFeedbackUrl = '';

  // Persist across sessions so an admin's stock choice sticks.
  private readonly ORIENTATION_KEY = 'badges:orientation';
  orientation: 'landscape' | 'portrait' =
    (typeof window !== 'undefined' && (localStorage.getItem(this.ORIENTATION_KEY) as 'landscape' | 'portrait')) || 'landscape';

  get badgesPerSheet(): number { return this.orientation === 'portrait' ? 4 : 6; }
  get sheetCount(): number { return this.sheets.length; }
  get pendingCount(): number { return this.allBadges.filter(b => !b.paid).length; }

  // Per-badge selection so admins can print one (or a few) without
  // sending the whole filtered set to the printer.
  selectedBadges = new Set<BadgeData>();
  get selectedCount(): number { return this.selectedBadges.size; }
  isSelected(b: BadgeData): boolean { return this.selectedBadges.has(b); }
  toggleBadgeSelection(b: BadgeData): void {
    if (this.selectedBadges.has(b)) this.selectedBadges.delete(b);
    else this.selectedBadges.add(b);
  }
  clearSelection(): void { this.selectedBadges.clear(); }

  setOrientation(o: 'landscape' | 'portrait'): void {
    if (this.orientation === o) return;
    this.orientation = o;
    try { localStorage.setItem(this.ORIENTATION_KEY, o); } catch { /* ignore quota */ }
    this.recompute();
  }

  ngOnInit(): void {
    this.origin = typeof window !== 'undefined' ? window.location.origin : '';
    this.qrItineraryUrl = this.qrUrlFor('/itinerary');
    this.qrFeedbackUrl = this.qrUrlFor('/feedback');
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
      for (const a of (r.attendees || [])) {
        out.push({
          firstName: a.firstName,
          lastName: a.lastName,
          congregation,
          // Per-attendee flag set on /admin/attendees -- covers the case
          // where the speaker isn't the family's primary contact.
          isSpeaker: !!a.speaker,
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
    for (let i = 0; i < this.filteredBadges.length; i += this.badgesPerSheet) {
      this.sheets.push(this.filteredBadges.slice(i, i + this.badgesPerSheet));
    }
  }

  emptySlotsFor(sheet: BadgeData[]): number[] {
    const remaining = this.badgesPerSheet - sheet.length;
    return remaining > 0 ? Array(remaining).fill(0) : [];
  }

  qrUrlFor(path: string): string {
    const target = encodeURIComponent(this.origin + path);
    // 250x250 at ~0.62 inch print size ~= 400 DPI -- well above the 200 DPI
    // floor where phone scanners reliably read.
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=0&data=${target}`;
  }

  print(): void {
    window.print();
  }

  /** Print only the selected badges -- re-paginates into sheets so the
   *  layout stays consistent (6/sheet landscape, 4/sheet portrait) and
   *  page-number stamps still make sense. */
  printSelected(): void {
    if (!this.selectedBadges.size) return;
    this.printSubset(Array.from(this.selectedBadges));
  }

  /** Print a single badge (the "print just this one" button on each card). */
  printOne(b: BadgeData): void {
    this.printSubset([b]);
  }

  private printSubset(subset: BadgeData[]): void {
    const savedSheets = this.sheets;
    const subsetSheets: BadgeData[][] = [];
    for (let i = 0; i < subset.length; i += this.badgesPerSheet) {
      subsetSheets.push(subset.slice(i, i + this.badgesPerSheet));
    }
    this.sheets = subsetSheets;
    // Wait for Angular to render the temporary sheets before opening the
    // print dialog, then restore the full preview afterward.
    setTimeout(() => {
      window.print();
      setTimeout(() => { this.sheets = savedSheets; }, 100);
    }, 50);
  }
}
