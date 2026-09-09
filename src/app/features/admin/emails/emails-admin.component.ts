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
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SentEmailsService, SentEmail, SentEmailStats } from '../../../services/sent-emails.service';
import { AuthService } from '../../../core/auth/auth.service';

/**
 * Admin log of every outbound email attempt. Server-side filtered + paged;
 * click a row to see the full body. Failures show the exact SMTP error so
 * admin can act on it (bad credentials, unconfigured server, throttled, etc.)
 */
@Component({
  selector: 'app-emails-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CardModule, TableModule, ButtonModule,
            InputTextModule, DropdownModule, TagModule, DialogModule, ToastModule,
            ConfirmDialogModule, TooltipModule],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
    <div class="emails-container">
      <div class="back-bar">
        <a routerLink="/admin/dashboard" class="back-link"><i class="pi pi-arrow-left"></i> Back to Dashboard</a>
      </div>
      <div class="page-header">
        <h1>Email Log</h1>
        <p>Every outbound email the app has attempted &mdash; sent, failed, or pending</p>
      </div>

      <div class="stats-row" *ngIf="stats">
        <div class="stat-card"><div class="stat-label">Total</div><div class="stat-value">{{ stats.total }}</div></div>
        <div class="stat-card sent"><div class="stat-label">Sent</div><div class="stat-value">{{ stats.sent }}</div></div>
        <div class="stat-card failed" [class.has-failures]="stats.failed > 0">
          <div class="stat-label">Failed</div><div class="stat-value">{{ stats.failed }}</div>
        </div>
        <div class="stat-card pending"><div class="stat-label">Pending</div><div class="stat-value">{{ stats.pending }}</div></div>
      </div>

      <p-card>
        <ng-template pTemplate="header">
          <div class="card-header-bar"><i class="pi pi-envelope"></i><span>Log ({{ total }})</span></div>
        </ng-template>
        <div class="toolbar">
          <span class="p-input-icon-left search-wrap">
            <i class="pi pi-search"></i>
            <input pInputText [(ngModel)]="q" (input)="onFilterChange()" placeholder="Search recipient or subject..." />
          </span>
          <span class="filter">
            <label for="statusFilter">Status:</label>
            <p-dropdown inputId="statusFilter" [options]="statusOptions" [(ngModel)]="statusFilter"
                        optionLabel="label" optionValue="value" [style]="{'min-width': '150px'}"
                        (onChange)="onFilterChange()"></p-dropdown>
          </span>
          <span class="filter">
            <label for="catFilter">Category:</label>
            <p-dropdown inputId="catFilter" [options]="categoryOptions" [(ngModel)]="categoryFilter"
                        optionLabel="label" optionValue="value" [style]="{'min-width': '220px'}"
                        (onChange)="onFilterChange()"></p-dropdown>
          </span>
          <button pButton icon="pi pi-refresh" class="p-button-text" (click)="reload()"
                  pTooltip="Refresh"></button>
        </div>

        <p-table [value]="rows" [loading]="loading"
                 [paginator]="true" [rows]="pageSize" [totalRecords]="total"
                 [lazy]="true" (onLazyLoad)="onPage($event)"
                 [rowsPerPageOptions]="[25, 50, 100]"
                 [tableStyle]="{'min-width': '65rem'}"
                 [showCurrentPageReport]="true"
                 currentPageReportTemplate="Showing {first} to {last} of {totalRecords}">
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 160px">When</th>
              <th style="width: 90px">Status</th>
              <th>Recipient</th>
              <th>Subject</th>
              <th style="width: 180px">Category</th>
              <th style="width: 60px"></th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-e>
            <tr [class.row-failed]="e.status === 'failed'"
                (click)="openDetail(e)" style="cursor: pointer;">
              <td>{{ e.attemptedAt | date:'MMM d, h:mm a' }}</td>
              <td><p-tag [value]="e.status" [severity]="statusSeverity(e.status)"></p-tag></td>
              <td>{{ e.recipient }}</td>
              <td class="subject-cell">{{ e.subject || '—' }}</td>
              <td class="muted">{{ prettyCategory(e.category) }}</td>
              <td class="actions" (click)="$event.stopPropagation()">
                <button *ngIf="auth.isAdmin()" pButton icon="pi pi-trash"
                        class="p-button-danger p-button-text p-button-sm"
                        (click)="confirmDelete(e)" pTooltip="Delete log entry"></button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="6" style="text-align: center; padding: 2rem; color: #999;">
              No email attempts logged yet.
            </td></tr>
          </ng-template>
        </p-table>
      </p-card>

      <!-- Detail modal -->
      <p-dialog [(visible)]="detailOpen" [modal]="true" [style]="{width: '720px'}"
                [header]="detail?.subject || 'Email'" [closable]="true" [draggable]="false"
                [breakpoints]="{'800px': '95vw'}">
        <div class="detail-body" *ngIf="detail">
          <div class="detail-row">
            <span class="k">Status:</span>
            <p-tag [value]="detail.status" [severity]="statusSeverity(detail.status)"></p-tag>
          </div>
          <div class="detail-row">
            <span class="k">To:</span> <span class="v">{{ detail.recipient }}</span>
          </div>
          <div class="detail-row">
            <span class="k">Subject:</span> <span class="v">{{ detail.subject }}</span>
          </div>
          <div class="detail-row">
            <span class="k">Category:</span> <span class="v">{{ prettyCategory(detail.category) }}</span>
          </div>
          <div class="detail-row">
            <span class="k">Attempted:</span> <span class="v">{{ detail.attemptedAt | date:'medium' }}</span>
          </div>
          <div class="detail-row" *ngIf="detail.triggeredBy">
            <span class="k">Triggered by:</span> <span class="v">{{ detail.triggeredBy }}</span>
          </div>
          <div class="detail-row" *ngIf="detail.relatedEntityType">
            <span class="k">Related:</span> <span class="v">{{ detail.relatedEntityType }} #{{ detail.relatedEntityId }}</span>
          </div>

          <div *ngIf="detail.status === 'failed'" class="error-panel">
            <strong><i class="pi pi-exclamation-triangle"></i> Send failed</strong>
            <pre>{{ detail.errorMessage || 'No error message captured' }}</pre>
          </div>

          <div class="body-panel">
            <div class="body-header">Body</div>
            <pre>{{ detail.body || '(empty)' }}</pre>
          </div>
        </div>
        <ng-template pTemplate="footer">
          <button pButton label="Close" class="p-button-text" (click)="detailOpen = false"></button>
        </ng-template>
      </p-dialog>
    </div>
  `,
  styles: [`
    .emails-container { max-width: 1400px; margin: 0 auto; }
    .back-bar { margin-bottom: 1rem; }
    .back-link {
      display: inline-flex; align-items: center; gap: 0.5rem;
      color: var(--retreat-teal-dark); text-decoration: none; font-weight: 600; font-size: 0.9rem;
      padding: 0.5rem 1rem; border-radius: 8px; transition: all 0.2s;
      &:hover { background: rgba(26, 58, 74, 0.08); color: var(--retreat-sunset); }
    }
    .page-header {
      text-align: center; padding: 2.5rem 2rem; color: var(--retreat-cream);
      border-radius: 12px; margin-bottom: 1.5rem;
      background: var(--retreat-grad-page-header);
      h1 { font-size: 2rem; font-weight: 700; margin: 0 0 0.5rem; }
      p { font-size: 1rem; margin: 0; opacity: 0.9; }
    }
    .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .stat-card {
      background: #fff; border-radius: 12px; padding: 1.25rem; text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      .stat-label { color: #6c757d; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; }
      .stat-value { color: var(--retreat-teal-dark); font-size: 1.8rem; font-weight: 700; margin-top: 0.35rem; }
    }
    .stat-card.sent .stat-value { color: #1a6e3b; }
    .stat-card.failed.has-failures { background: #fff3f2;
      .stat-value { color: #c0392b; }
    }
    .stat-card.pending .stat-value { color: #b48a2a; }
    .card-header-bar {
      display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.5rem;
      background: var(--retreat-grad-nav); color: var(--retreat-cream); font-size: 1.1rem; font-weight: 600;
    }
    .toolbar { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem;
      .search-wrap { min-width: 260px; flex: 1; max-width: 400px; }
      .filter { display: inline-flex; align-items: center; gap: 0.5rem;
        label { font-size: 0.85rem; font-weight: 600; color: var(--retreat-teal-dark); }
      }
    }
    .subject-cell { max-width: 380px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .muted { color: #6c757d; font-size: 0.9rem; }
    .actions { white-space: nowrap; text-align: right; }
    .row-failed { background: rgba(192, 57, 43, 0.05); }
    ::ng-deep .emails-container .p-card { border-radius: 12px; overflow: hidden;
      .p-card-header { padding: 0; border-bottom: none; }
      .p-card-body { padding: 1.5rem; } .p-card-content { padding: 0; }
    }
    ::ng-deep .emails-container .p-datatable .p-datatable-thead > tr > th {
      background: var(--retreat-grad-nav); color: var(--retreat-cream);
    }

    /* Detail modal */
    .detail-body { display: flex; flex-direction: column; gap: 0.65rem; }
    .detail-row { display: flex; gap: 0.6rem; align-items: baseline;
      .k { color: #6c757d; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.04em; font-weight: 600; min-width: 110px; }
      .v { color: var(--retreat-teal-dark); word-break: break-all; }
    }
    .error-panel {
      background: #fff3f2; border-left: 4px solid #c0392b; border-radius: 6px;
      padding: 0.85rem 1rem; margin-top: 0.6rem;
      strong { display: block; color: #c0392b; margin-bottom: 0.35rem;
        i { margin-right: 0.4rem; }
      }
      pre { margin: 0; white-space: pre-wrap; font-size: 0.85rem; color: #6b2119; font-family: ui-monospace, "Cascadia Code", monospace; }
    }
    .body-panel {
      margin-top: 0.75rem; border: 1px solid #e6dcc4; border-radius: 8px; overflow: hidden;
      background: #fafaf6;
      .body-header { padding: 0.5rem 0.85rem; background: rgba(232, 168, 50, 0.15);
        font-size: 0.82rem; font-weight: 700; color: #6e4b08; text-transform: uppercase; letter-spacing: 0.05em; }
      pre { margin: 0; padding: 1rem; white-space: pre-wrap; font-size: 0.9rem; color: #495057;
        font-family: ui-monospace, "Cascadia Code", monospace; max-height: 380px; overflow: auto; }
    }
  `]
})
export class EmailsAdminComponent implements OnInit {
  private svc = inject(SentEmailsService);
  private toast = inject(MessageService);
  private confirm = inject(ConfirmationService);
  auth = inject(AuthService);

  rows: SentEmail[] = [];
  total = 0;
  pageSize = 25;
  loading = false;
  stats: SentEmailStats | null = null;

  q = '';
  statusFilter: string | null = null;
  categoryFilter: string | null = null;

  statusOptions = [
    { label: 'All',     value: null },
    { label: 'Sent',    value: 'sent' },
    { label: 'Failed',  value: 'failed' },
    { label: 'Pending', value: 'pending' },
  ];

  categoryOptions = [
    { label: 'All categories', value: null },
    { label: 'Registration confirmation', value: 'registration_confirmation' },
    { label: 'Admin notification',        value: 'admin_notification' },
    { label: 'Payment plan invite',       value: 'payment_plan_invite' },
    { label: 'Payment plan request',      value: 'payment_plan_request_notification' },
    { label: 'Payment receipt',           value: 'payment_receipt' },
    { label: 'Password reset',            value: 'password_reset' },
    { label: 'Welcome',                   value: 'welcome' },
    { label: 'Account activated',         value: 'account_activated' },
  ];

  detailOpen = false;
  detail: SentEmail | null = null;

  private filterTimer: any;

  ngOnInit(): void {
    this.loadStats();
    this.load(0, this.pageSize);
  }

  onFilterChange(): void {
    // Debounce -- typing in search shouldn't fire a request per keystroke.
    clearTimeout(this.filterTimer);
    this.filterTimer = setTimeout(() => this.load(0, this.pageSize), 250);
  }

  onPage(evt: any): void {
    const page = evt.first / (evt.rows || this.pageSize);
    this.pageSize = evt.rows || this.pageSize;
    this.load(page, this.pageSize);
  }

  reload(): void {
    this.loadStats();
    this.load(0, this.pageSize);
  }

  private loadStats(): void {
    this.svc.stats().subscribe({
      next: (s) => this.stats = s,
      error: () => { /* stats are nice-to-have; suppress errors */ }
    });
  }

  private load(page: number, size: number): void {
    this.loading = true;
    this.svc.list({
      status:   this.statusFilter || undefined,
      category: this.categoryFilter || undefined,
      q:        this.q?.trim() || undefined,
      page, size,
    }).subscribe({
      next: (r) => {
        this.rows = r.content;
        this.total = r.totalElements;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load email log' });
      }
    });
  }

  openDetail(e: SentEmail): void {
    this.detail = e;
    this.detailOpen = true;
    // Refresh from server in case the row changed since the list was loaded
    this.svc.get(e.id).subscribe({
      next: (fresh) => { if (this.detailOpen) this.detail = fresh; },
      error: () => { /* stick with the row we have */ }
    });
  }

  confirmDelete(e: SentEmail): void {
    this.confirm.confirm({
      header: 'Delete log entry',
      icon: 'pi pi-exclamation-triangle',
      message: `Delete this ${e.status} entry to ${e.recipient}?`,
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.svc.delete(e.id).subscribe({
          next: () => { this.toast.add({ severity: 'success', summary: 'Deleted', life: 2000 }); this.reload(); },
          error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'Delete failed' }),
        });
      }
    });
  }

  statusSeverity(s: string): string {
    switch (s) {
      case 'sent':    return 'success';
      case 'failed':  return 'danger';
      case 'pending': return 'warning';
      default:        return 'info';
    }
  }

  prettyCategory(c: string | undefined): string {
    if (!c) return '';
    return c.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
}
