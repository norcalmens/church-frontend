import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { RegistrationService } from '../../../services/registration.service';
import { SettingsService } from '../../../services/settings.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Attendee } from '../../../core/models/attendee.model';

@Component({
  selector: 'app-all-attendees',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CardModule, TableModule, ButtonModule, InputTextModule, InputNumberModule, DropdownModule, TooltipModule, ToastModule, DialogModule],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <div class="attendees-container">
      <div class="back-bar">
        <a routerLink="/admin/dashboard" class="back-link"><i class="pi pi-arrow-left"></i> Back to Dashboard</a>
      </div>
      <div class="page-header">
        <h1>All Attendees</h1>
        <p>Every individual coming to the retreat &mdash; including family members registered under someone else.</p>
      </div>

      <p-card>
        <ng-template pTemplate="header">
          <div class="card-header-bar"><i class="pi pi-users"></i><span>Attendees ({{ filtered.length }})</span></div>
        </ng-template>

        <div class="toolbar">
          <span class="p-input-icon-left search-wrap">
            <i class="pi pi-search"></i>
            <input pInputText [(ngModel)]="searchTerm" placeholder="Search by name, congregation, or email..." (input)="filter()" />
          </span>
          <span class="year-filter">
            <label for="attYearFilter">Season:</label>
            <p-dropdown inputId="attYearFilter" [options]="yearOptions" [(ngModel)]="yearFilter"
                        optionLabel="label" optionValue="value" [style]="{'min-width': '160px'}"
                        (onChange)="filter()"></p-dropdown>
          </span>
          <span class="totals">
            <strong>{{ filtered.length }}</strong> shown &middot;
            <strong>{{ speakerCount }}</strong> speaker{{ speakerCount === 1 ? '' : 's' }}
          </span>
          <button pButton label="Copy Emails" icon="pi pi-envelope" class="p-button-outlined copy-emails-btn"
                  (click)="copyEmails()" [disabled]="!filtered.length"
                  pTooltip="Copy unique registrant emails from the current view -- paste into Gmail BCC or the Google Form's Send dialog"></button>
          <button pButton label="Download CSV" icon="pi pi-download" class="p-button-outlined"
                  (click)="exportCsv()" [disabled]="!attendees.length"></button>
        </div>

        <p-table [value]="filtered" [paginator]="true" [rows]="25" [rowsPerPageOptions]="[25, 50, 100]"
                 [sortField]="'lastName'" [sortOrder]="1"
                 [tableStyle]="{'min-width': '60rem'}"
                 [showCurrentPageReport]="true"
                 currentPageReportTemplate="Showing {first} to {last} of {totalRecords}">
          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="lastName">Name <p-sortIcon field="lastName"></p-sortIcon></th>
              <th pSortableColumn="age" style="width: 70px">Age <p-sortIcon field="age"></p-sortIcon></th>
              <th pSortableColumn="congregation">Congregation <p-sortIcon field="congregation"></p-sortIcon></th>
              <th>Registered Under (email)</th>
              <th pSortableColumn="attendanceType" style="width: 100px">Days <p-sortIcon field="attendanceType"></p-sortIcon></th>
              <th pSortableColumn="retreatYear" style="width: 90px;">Year <p-sortIcon field="retreatYear"></p-sortIcon></th>
              <th pSortableColumn="speaker" style="width: 90px; text-align: center;">Speaker <p-sortIcon field="speaker"></p-sortIcon></th>
              <th style="width: 60px"></th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-a>
            <tr [class.speaker-row]="a.speaker">
              <td><strong>{{ a.firstName | titlecase }} {{ a.lastName | titlecase }}</strong></td>
              <td>{{ a.age }}</td>
              <td>{{ a.congregation || '—' }}</td>
              <td>
                <a *ngIf="a.primaryEmail" [href]="'mailto:' + a.primaryEmail">{{ a.primaryEmail }}</a>
                <span *ngIf="!a.primaryEmail">—</span>
              </td>
              <td>{{ daysLabel(a) }}</td>
              <td class="year-cell">{{ a.retreatYear || '—' }}</td>
              <td style="text-align: center;">
                <button *ngIf="auth.canEdit(); else readOnlySpeaker"
                        type="button" class="speaker-toggle" [class.is-speaker]="a.speaker"
                        (click)="toggleSpeaker(a)"
                        [title]="a.speaker ? 'Speaker — click to remove' : 'Click to mark as speaker'">
                  <i class="pi" [class.pi-star-fill]="a.speaker" [class.pi-star]="!a.speaker"></i>
                </button>
                <ng-template #readOnlySpeaker>
                  <i class="pi pi-star-fill" *ngIf="a.speaker" style="color: var(--retreat-gold); font-size: 0.95rem;"></i>
                  <span *ngIf="!a.speaker" style="color: #ccc;">—</span>
                </ng-template>
              </td>
              <td>
                <button *ngIf="auth.canEdit()" pButton icon="pi pi-pencil" class="p-button-text p-button-sm"
                        pTooltip="Edit name / age" (click)="openEdit(a)"></button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="8" style="text-align: center; padding: 2rem; color: #999;">No attendees yet.</td></tr>
          </ng-template>
        </p-table>
      </p-card>

      <p-dialog header="Edit Attendee" [(visible)]="editOpen" [modal]="true"
                [draggable]="false" [resizable]="false" [style]="{width: '400px'}"
                [breakpoints]="{'640px': '95vw'}">
        <div class="edit-form" *ngIf="draft">
          <div class="edit-row two">
            <div>
              <label>First Name</label>
              <input pInputText [(ngModel)]="draft.firstName" />
            </div>
            <div>
              <label>Last Name</label>
              <input pInputText [(ngModel)]="draft.lastName" />
            </div>
          </div>
          <div class="edit-row">
            <label>Age</label>
            <p-inputNumber [(ngModel)]="draft.age" [min]="1" [max]="120"></p-inputNumber>
          </div>
          <div class="edit-row">
            <label>Dietary Restrictions</label>
            <input pInputText [(ngModel)]="draft.dietaryRestrictions" />
          </div>
        </div>
        <ng-template pTemplate="footer">
          <button pButton label="Cancel" class="p-button-text" (click)="editOpen = false" [disabled]="saving"></button>
          <button pButton label="Save" icon="pi pi-check" (click)="saveEdit()" [loading]="saving"></button>
        </ng-template>
      </p-dialog>
    </div>
  `,
  styles: [`
    .attendees-container { max-width: 1400px; margin: 0 auto; }
    .back-bar { margin-bottom: 1rem; }
    .back-link {
      display: inline-flex; align-items: center; gap: 0.5rem;
      color: var(--retreat-teal-dark); text-decoration: none; font-weight: 600; font-size: 0.9rem;
      padding: 0.5rem 1rem; border-radius: 8px; transition: all 0.2s;
      &:hover { background: rgba(26, 58, 74, 0.08); color: var(--retreat-sunset); }
    }
    .page-header {
      text-align: center; padding: 2.5rem 2rem;
      background: var(--retreat-grad-page-header);
      color: var(--retreat-cream); border-radius: 12px; margin-bottom: 1.5rem;
      h1 { font-size: 2rem; font-weight: 700; margin: 0 0 0.5rem 0; }
      p { font-size: 1rem; margin: 0; opacity: 0.9; }
    }
    .card-header-bar {
      display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.5rem;
      background: var(--retreat-grad-nav);
      color: var(--retreat-cream); font-size: 1.1rem; font-weight: 600;
    }
    .toolbar {
      display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem;
      .search-wrap { min-width: 280px; }
      .year-filter { display: inline-flex; align-items: center; gap: 0.5rem;
        label { font-size: 0.85rem; font-weight: 600; color: var(--retreat-teal-dark); }
      }
      .totals { color: #6c757d; font-size: 0.92rem;
        strong { color: var(--retreat-teal-dark); }
      }
      button { margin-left: auto; }
      // The two right-side buttons cluster together; only the FIRST one
      // (Copy Emails) pushes right, and CSV rides along beside it.
      .copy-emails-btn + button, button + button { margin-left: 0; }
    }
    .year-cell { font-weight: 600; color: var(--retreat-teal-dark); text-align: center; }
    ::ng-deep .attendees-container .p-card { border-radius: 12px; overflow: hidden;
      .p-card-header { padding: 0; border-bottom: none; }
      .p-card-body { padding: 1.5rem; }
      .p-card-content { padding: 0; }
    }
    ::ng-deep .attendees-container .p-datatable .p-datatable-thead > tr > th {
      background: var(--retreat-grad-nav); color: var(--retreat-cream);
    }
    .speaker-row { background: rgba(232, 168, 50, 0.07); }
    .speaker-toggle {
      background: transparent; border: none; cursor: pointer; padding: 0.25rem 0.5rem;
      border-radius: 6px; transition: all 0.15s;
      i { font-size: 1.25rem; color: #ccc; transition: color 0.15s; }
      &:hover { background: rgba(232, 168, 50, 0.12);
        i { color: var(--retreat-gold); }
      }
      &.is-speaker i { color: var(--retreat-gold); text-shadow: 0 0 8px rgba(232, 168, 50, 0.4); }
    }
    .edit-form { display: flex; flex-direction: column; gap: 0.85rem; padding: 0.25rem 0; }
    .edit-row { display: flex; flex-direction: column; gap: 0.35rem;
      label { font-size: 0.85rem; font-weight: 600; color: var(--retreat-teal-dark); }
      input, ::ng-deep .p-inputnumber, ::ng-deep .p-inputnumber input { width: 100%; }
    }
    .edit-row.two { display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem;
      > div { display: flex; flex-direction: column; gap: 0.35rem; }
    }
  `]
})
export class AllAttendeesComponent implements OnInit {
  private registrationService = inject(RegistrationService);
  private settingsService = inject(SettingsService);
  private messageService = inject(MessageService);
  auth = inject(AuthService);

  attendees: Attendee[] = [];
  filtered: Attendee[] = [];
  searchTerm = '';

  // Client-side year filter: getAllAttendees returns every season and we
  // narrow in filter(). null = "All seasons". Defaults to the currently-
  // active retreat year so the operational view is this season's roster.
  yearFilter: number | null = null;
  yearOptions: { label: string; value: number | null }[] = [{ label: 'All seasons', value: null }];

  editOpen = false;
  saving = false;
  draft: Partial<Attendee> | null = null;
  private editTarget: Attendee | null = null;

  get speakerCount(): number { return this.filtered.filter(a => a.speaker).length; }

  ngOnInit(): void {
    this.settingsService.getActiveYear().subscribe({
      next: (year) => {
        this.yearFilter = year;
        this.yearOptions = [
          { label: `${year} (active)`, value: year },
          { label: `${year - 1}`,      value: year - 1 },
          { label: `${year - 2}`,      value: year - 2 },
          { label: 'All seasons',      value: null },
        ];
        this.load();
      },
      error: () => this.load(),
    });
  }

  load(): void {
    this.registrationService.getAllAttendees().subscribe({
      next: (data) => { this.attendees = data; this.filter(); },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load attendees' })
    });
  }

  filter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    const yearOk = (a: Attendee) => this.yearFilter == null || a.retreatYear === this.yearFilter;
    this.filtered = this.attendees.filter(a => {
      if (!yearOk(a)) return false;
      if (!term) return true;
      const hay = `${a.firstName} ${a.lastName} ${a.congregation || ''} ${a.primaryEmail || ''}`.toLowerCase();
      return hay.includes(term) || (a.speaker && 'speaker'.includes(term));
    });
  }

  daysLabel(a: Attendee): string {
    if (a.attendanceType === 'partial' && a.days && a.days.length) {
      return a.days.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ');
    }
    return 'All 3';
  }

  openEdit(a: Attendee): void {
    this.editTarget = a;
    this.draft = {
      firstName: a.firstName,
      lastName: a.lastName,
      age: a.age,
      dietaryRestrictions: a.dietaryRestrictions,
    };
    this.editOpen = true;
  }

  saveEdit(): void {
    if (!this.editTarget?.id || !this.draft) return;
    this.saving = true;
    this.registrationService.adminUpdateAttendee(this.editTarget.id, this.draft).subscribe({
      next: (updated) => {
        Object.assign(this.editTarget!, updated);
        this.filter();
        this.saving = false;
        this.editOpen = false;
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Attendee updated', life: 2000 });
      },
      error: (err) => {
        this.saving = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'Failed to save' });
      }
    });
  }

  toggleSpeaker(a: Attendee): void {
    if (!a.id) return;
    const newValue = !a.speaker;
    a.speaker = newValue;
    this.registrationService.setAttendeeSpeaker(a.id, newValue).subscribe({
      next: () => this.messageService.add({
        severity: newValue ? 'success' : 'info',
        summary: newValue ? 'Marked as speaker' : 'Speaker flag removed',
        detail: `${a.firstName} ${a.lastName}`,
        life: 2000,
      }),
      error: () => {
        a.speaker = !newValue;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update speaker flag' });
      }
    });
  }

  /** Copy the unique registrant emails from the current filtered view to
   *  the clipboard as a comma-separated list. Attendees under the same
   *  registration share a primaryEmail (family members register together),
   *  so dedup by lowercase email -- otherwise the family of five all get
   *  emailed five times. Respects year + search filters so an admin can
   *  scope to "2026 attendees" and get exactly that mailing list. */
  copyEmails(): void {
    const seen = new Set<string>();
    const emails: string[] = [];
    for (const a of this.filtered) {
      const raw = (a.primaryEmail || '').trim();
      if (!raw) continue;
      const key = raw.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      emails.push(raw);
    }
    if (!emails.length) {
      this.messageService.add({ severity: 'warn', summary: 'No emails', detail: 'No registrant emails in the current view.' });
      return;
    }
    const text = emails.join(', ');
    // navigator.clipboard is unavailable on non-HTTPS + very old browsers --
    // fall back to a hidden textarea + execCommand so the button still works
    // in prod (Hostinger + Railway serve HTTPS, so the primary path handles
    // it, but the fallback covers local http://localhost testing anyway).
    const copyFallback = () => {
      const ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.top = '-1000px';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } finally { document.body.removeChild(ta); }
    };
    const success = () => this.messageService.add({
      severity: 'success', summary: 'Copied',
      detail: `${emails.length} unique email${emails.length === 1 ? '' : 's'} copied. Paste into Gmail BCC or the Google Form's Send dialog.`,
      life: 4000,
    });
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(success, () => { copyFallback(); success(); });
    } else {
      copyFallback(); success();
    }
  }

  exportCsv(): void {
    const titleCase = (s: unknown): string => {
      const str = s == null ? '' : String(s);
      return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    };
    const cols: [string, (a: Attendee) => unknown][] = [
      ['First Name', a => titleCase(a.firstName)],
      ['Last Name', a => titleCase(a.lastName)],
      ['Age', a => a.age],
      ['Retreat Year', a => a.retreatYear],
      ['Congregation', a => a.congregation],
      ['Speaker', a => a.speaker ? 'Yes' : 'No'],
      ['Attendance', a => this.daysLabel(a)],
      ['Dietary', a => a.dietaryRestrictions],
      ['Registered Under (email)', a => a.primaryEmail],
      ['Registered Under (phone)', a => a.primaryPhone],
    ];
    const esc = (v: unknown): string => {
      const s = v == null ? '' : String(v);
      return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const header = cols.map(c => c[0]).join(',');
    // Export the CURRENT view (year filter + search) rather than every
    // attendee -- admins pick a year in the dropdown expecting the CSV to
    // match. "All seasons" still exports everything.
    const body = this.filtered.map(a => cols.map(c => esc(c[1](a))).join(','));
    const csv = [header, ...body].join('\r\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendees-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
