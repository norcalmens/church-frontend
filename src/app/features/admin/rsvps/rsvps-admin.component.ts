import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { EventRsvpService, EventRsvp } from '../../../services/event-rsvp.service';
import { AuthService } from '../../../core/auth/auth.service';

/**
 * Admin RSVP list. Loads every RSVP once, filters client-side by
 * event key + search term (small dataset, no need for a paged endpoint).
 */
@Component({
  selector: 'app-rsvps-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CardModule, TableModule, ButtonModule,
            InputTextModule, DropdownModule, TagModule, ToastModule, ConfirmDialogModule, TooltipModule],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
    <div class="rsvps-container">
      <div class="back-bar">
        <a routerLink="/admin/dashboard" class="back-link"><i class="pi pi-arrow-left"></i> Back to Dashboard</a>
      </div>
      <div class="page-header"><h1>Event RSVPs</h1><p>Everyone who's signed up for an event</p></div>

      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-label">RSVPs Shown</div>
          <div class="stat-value">{{ filtered.length }}</div>
        </div>
        <div class="stat-card highlight">
          <div class="stat-label">Total Guests</div>
          <div class="stat-value">{{ totalGuests }}</div>
        </div>
      </div>

      <p-card>
        <ng-template pTemplate="header">
          <div class="card-header-bar"><i class="pi pi-users"></i><span>RSVPs ({{ filtered.length }})</span></div>
        </ng-template>
        <div class="toolbar">
          <span class="p-input-icon-left search-wrap">
            <i class="pi pi-search"></i>
            <input pInputText [(ngModel)]="searchTerm" placeholder="Search name, email, notes..." (input)="filter()" />
          </span>
          <span class="event-filter">
            <label for="evFilter">Event:</label>
            <p-dropdown inputId="evFilter" [options]="eventOptions" [(ngModel)]="eventKey"
                        optionLabel="label" optionValue="value" [style]="{'min-width': '260px'}"
                        (onChange)="filter()"></p-dropdown>
          </span>
          <button pButton label="Copy Emails" icon="pi pi-envelope"
                  class="p-button-outlined act-copy" (click)="copyEmails()"
                  [disabled]="!filtered.length"
                  pTooltip="Copy unique emails from the current view"></button>
          <button pButton label="Download CSV" icon="pi pi-download"
                  class="p-button-outlined" (click)="exportCsv()"
                  [disabled]="!filtered.length"></button>
        </div>

        <p-table [value]="filtered" [paginator]="true" [rows]="25" [rowsPerPageOptions]="[25, 50, 100]"
                 [sortField]="'createdAt'" [sortOrder]="-1"
                 [tableStyle]="{'min-width': '60rem'}"
                 [showCurrentPageReport]="true"
                 currentPageReportTemplate="Showing {first} to {last} of {totalRecords}">
          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="name">Name <p-sortIcon field="name"></p-sortIcon></th>
              <th>Email</th>
              <th>Phone</th>
              <th pSortableColumn="congregation">Congregation <p-sortIcon field="congregation"></p-sortIcon></th>
              <th pSortableColumn="guestCount" style="width: 100px; text-align: center;">Guests <p-sortIcon field="guestCount"></p-sortIcon></th>
              <th pSortableColumn="eventKey">Event <p-sortIcon field="eventKey"></p-sortIcon></th>
              <th>Notes</th>
              <th pSortableColumn="createdAt" style="width: 150px;">Received <p-sortIcon field="createdAt"></p-sortIcon></th>
              <th style="width: 60px"></th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-r>
            <tr>
              <td><strong>{{ r.name }}</strong></td>
              <td><a *ngIf="r.email" [href]="'mailto:' + r.email">{{ r.email }}</a><span *ngIf="!r.email" class="muted">&mdash;</span></td>
              <td><a *ngIf="r.phone" [href]="'tel:' + r.phone">{{ r.phone }}</a><span *ngIf="!r.phone" class="muted">&mdash;</span></td>
              <td>{{ r.congregation || '—' }}</td>
              <td style="text-align: center;"><strong>{{ r.guestCount }}</strong></td>
              <td><p-tag [value]="prettyEvent(r.eventKey)" severity="info"></p-tag></td>
              <td class="notes-cell" [pTooltip]="r.notes || ''">{{ r.notes || '—' }}</td>
              <td>{{ r.createdAt | date:'short' }}</td>
              <td>
                <button *ngIf="auth.isAdmin()" pButton icon="pi pi-trash"
                        class="p-button-danger p-button-text p-button-sm"
                        (click)="confirmDelete(r)" pTooltip="Delete RSVP"></button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="9" style="text-align: center; padding: 2rem; color: #999;">No RSVPs yet.</td></tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>
  `,
  styles: [`
    .rsvps-container { max-width: 1400px; margin: 0 auto; }
    .back-bar { margin-bottom: 1rem; }
    .back-link {
      display: inline-flex; align-items: center; gap: 0.5rem;
      color: var(--retreat-teal-dark); text-decoration: none; font-weight: 600; font-size: 0.9rem;
      padding: 0.5rem 1rem; border-radius: 8px; transition: all 0.2s;
      &:hover { background: rgba(26, 58, 74, 0.08); color: var(--retreat-sunset); }
    }
    .page-header { text-align: center; padding: 2.5rem 2rem; color: var(--retreat-cream); border-radius: 12px; margin-bottom: 1.5rem;
      background: var(--retreat-grad-page-header);
      h1 { font-size: 2rem; font-weight: 700; margin: 0 0 0.5rem; }
      p { font-size: 1rem; margin: 0; opacity: 0.9; }
    }
    .stats-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .stat-card {
      background: #fff; border-radius: 12px; padding: 1.25rem; text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      .stat-label { color: #6c757d; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; }
      .stat-value { color: var(--retreat-teal-dark); font-size: 1.8rem; font-weight: 700; margin-top: 0.35rem; }
    }
    .stat-card.highlight { background: linear-gradient(135deg, var(--retreat-sunset) 0%, var(--retreat-sunset) 100%); color: #fff;
      .stat-label, .stat-value { color: #fff; }
    }
    .card-header-bar { display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.5rem;
      background: var(--retreat-grad-nav); color: var(--retreat-cream); font-size: 1.1rem; font-weight: 600;
    }
    .toolbar { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1rem;
      .search-wrap { min-width: 260px; }
      .event-filter { display: inline-flex; align-items: center; gap: 0.5rem;
        label { font-size: 0.85rem; font-weight: 600; color: var(--retreat-teal-dark); }
      }
      .act-copy { margin-left: auto; }
    }
    .notes-cell { max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .muted { color: #999; }
    ::ng-deep .rsvps-container .p-card { border-radius: 12px; overflow: hidden;
      .p-card-header { padding: 0; border-bottom: none; }
      .p-card-body { padding: 1.5rem; } .p-card-content { padding: 0; }
    }
    ::ng-deep .rsvps-container .p-datatable .p-datatable-thead > tr > th {
      background: var(--retreat-grad-nav); color: var(--retreat-cream);
    }
  `]
})
export class RsvpsAdminComponent implements OnInit {
  private svc = inject(EventRsvpService);
  private toast = inject(MessageService);
  private confirm = inject(ConfirmationService);
  auth = inject(AuthService);

  all: EventRsvp[] = [];
  filtered: EventRsvp[] = [];
  searchTerm = '';

  eventKey: string | null = null;    // null = "All events"
  eventOptions: { label: string; value: string | null }[] = [{ label: 'All events', value: null }];

  ngOnInit(): void { this.load(); }

  get totalGuests(): number {
    return this.filtered.reduce((sum, r) => sum + (r.guestCount || 1), 0);
  }

  load(): void {
    this.svc.listAll().subscribe({
      next: (data) => {
        this.all = data || [];
        this.rebuildEventOptions();
        this.filter();
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load RSVPs' })
    });
  }

  private rebuildEventOptions(): void {
    const keys = new Set<string>();
    for (const r of this.all) if (r.eventKey) keys.add(r.eventKey);
    const sorted = Array.from(keys).sort();
    this.eventOptions = [
      { label: 'All events', value: null },
      ...sorted.map(k => ({ label: this.prettyEvent(k), value: k as string | null })),
    ];
  }

  filter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filtered = this.all.filter(r => {
      if (this.eventKey && r.eventKey !== this.eventKey) return false;
      if (!term) return true;
      const hay = `${r.name} ${r.email || ''} ${r.phone || ''} ${r.congregation || ''} ${r.notes || ''}`.toLowerCase();
      return hay.includes(term);
    });
  }

  prettyEvent(key: string | undefined): string {
    if (!key) return '';
    return key.split('-')
      .filter(Boolean)
      .map(p => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' ');
  }

  confirmDelete(r: EventRsvp): void {
    if (r.id == null) return;
    this.confirm.confirm({
      header: 'Delete RSVP',
      icon: 'pi pi-exclamation-triangle',
      message: `Remove RSVP from ${r.name}?`,
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.svc.delete(r.id!).subscribe({
          next: () => { this.toast.add({ severity: 'success', summary: 'Deleted', detail: `${r.name} removed`, life: 2500 }); this.load(); },
          error: (e) => this.toast.add({ severity: 'error', summary: 'Error', detail: e?.error?.message || 'Failed to delete' })
        });
      }
    });
  }

  copyEmails(): void {
    const seen = new Set<string>();
    const emails: string[] = [];
    for (const r of this.filtered) {
      const raw = (r.email || '').trim();
      if (!raw) continue;
      const key = raw.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key); emails.push(raw);
    }
    if (!emails.length) {
      this.toast.add({ severity: 'warn', summary: 'No emails', detail: 'No email addresses in the current view.' });
      return;
    }
    const text = emails.join(', ');
    const done = () => this.toast.add({
      severity: 'success', summary: 'Copied',
      detail: `${emails.length} unique email${emails.length === 1 ? '' : 's'} copied.`, life: 3500,
    });
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done, done);
    else done();
  }

  exportCsv(): void {
    const esc = (v: unknown) => {
      const s = v == null ? '' : String(v);
      return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const cols: [string, (r: EventRsvp) => unknown][] = [
      ['ID',       r => r.id],
      ['Event',    r => this.prettyEvent(r.eventKey)],
      ['Name',         r => r.name],
      ['Email',        r => r.email],
      ['Phone',        r => r.phone],
      ['Congregation', r => r.congregation],
      ['Guests',       r => r.guestCount],
      ['Notes',    r => r.notes],
      ['Received', r => r.createdAt],
    ];
    const rows = [cols.map(c => c[0]).join(','), ...this.filtered.map(r => cols.map(c => esc(c[1](r))).join(','))];
    const blob = new Blob(['﻿' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const tag = this.eventKey ? this.eventKey : 'all-events';
    a.download = `rsvps-${tag}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
