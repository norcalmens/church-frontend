import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { DonationService } from '../../../services/donation.service';
import { Donation } from '../../../core/models/donation.model';

@Component({
  selector: 'app-all-donations',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, CardModule, TableModule, ButtonModule,
            TagModule, InputTextModule, InputTextareaModule, InputNumberModule, DropdownModule, DialogModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
    <div class="donations-container">
      <div class="back-bar">
        <a routerLink="/admin/dashboard" class="back-link"><i class="pi pi-arrow-left"></i> Back to Dashboard</a>
      </div>
      <div class="page-header"><h1>All Donations</h1><p>View every donation processed through the site</p></div>

      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-label">Total Donations</div>
          <div class="stat-value">{{ donations.length }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Paid</div>
          <div class="stat-value">{{ paidCount }}</div>
        </div>
        <div class="stat-card highlight">
          <div class="stat-label">Total Raised</div>
          <div class="stat-value">{{'$'}}{{ totalRaised | number:'1.2-2' }}</div>
        </div>
      </div>

      <p-card>
        <ng-template pTemplate="header">
          <div class="card-header-bar"><i class="pi pi-heart"></i><span>Donations ({{ filteredDonations.length }})</span></div>
        </ng-template>
        <div class="table-toolbar">
          <span class="p-input-icon-left"><i class="pi pi-search"></i><input type="text" pInputText [(ngModel)]="searchTerm" placeholder="Search donor name or email..." (input)="filter()" /></span>
          <button *ngIf="selected.length" pButton
                  [label]="'Delete ' + selected.length + ' selected'" icon="pi pi-trash"
                  class="p-button-danger bulk-btn" (click)="confirmBulkDelete()"></button>
          <button pButton label="Add Donation" icon="pi pi-plus" class="p-button-outlined add-btn" (click)="openAdd()"></button>
          <button pButton label="Download CSV" icon="pi pi-download" class="p-button-outlined csv-btn"
                  (click)="exportCsv()" [disabled]="!donations.length"></button>
        </div>
        <p-table [value]="filteredDonations" [(selection)]="selected" dataKey="id"
                 [paginator]="true" [rows]="10" [rowsPerPageOptions]="[10, 25, 50]"
                 [sortField]="'createdAt'" [sortOrder]="-1" [tableStyle]="{'min-width': '55rem'}"
                 [showCurrentPageReport]="true" currentPageReportTemplate="Showing {first} to {last} of {totalRecords}">
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 3rem"><p-tableHeaderCheckbox></p-tableHeaderCheckbox></th>
              <th pSortableColumn="donorName">Donor <p-sortIcon field="donorName"></p-sortIcon></th>
              <th>Email</th>
              <th pSortableColumn="amount">Amount <p-sortIcon field="amount"></p-sortIcon></th>
              <th>Message</th>
              <th pSortableColumn="paymentStatus">Status <p-sortIcon field="paymentStatus"></p-sortIcon></th>
              <th pSortableColumn="createdAt">Date <p-sortIcon field="createdAt"></p-sortIcon></th>
              <th style="width: 110px"></th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-d>
            <tr>
              <td><p-tableCheckbox [value]="d"></p-tableCheckbox></td>
              <td>{{ d.donorName }}</td>
              <td>{{ d.donorEmail }}</td>
              <td><strong>{{'$'}}{{ d.amount | number:'1.2-2' }}</strong></td>
              <td class="message-cell" [pTooltip]="d.message || ''">{{ d.message || '—' }}</td>
              <td><p-tag [value]="d.paymentStatus || 'pending'" [severity]="statusSeverity(d.paymentStatus)"></p-tag></td>
              <td>{{ d.createdAt | date:'short' }}</td>
              <td class="row-actions">
                <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm"
                        (click)="openEdit(d)" pTooltip="Edit"></button>
                <button pButton icon="pi pi-trash" class="p-button-danger p-button-text p-button-sm"
                        (click)="confirmDelete(d)" pTooltip="Delete"></button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="8" style="text-align: center; padding: 2rem; color: #999;">No donations yet.</td></tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>

    <p-dialog [(visible)]="dialogVisible" [modal]="true" [style]="{width: '520px'}"
              [header]="editing?.id ? 'Edit Donation' : 'Add Donation'" [closable]="true" [draggable]="false">
      <p class="dialog-hint" *ngIf="!editing?.id">Manually record a donation processed outside this app — a past Stripe charge, a cash gift, or a check.</p>
      <p class="dialog-hint" *ngIf="editing?.id">Editing donation #{{ editing?.id }}. Stripe is not touched — this only updates the local record.</p>
      <form [formGroup]="form" class="donation-form" *ngIf="dialogVisible">
        <div class="field-row">
          <div class="field">
            <label>Donor Name <span class="req">*</span></label>
            <input pInputText formControlName="donorName" />
          </div>
          <div class="field">
            <label>Donor Email <span class="req">*</span></label>
            <input pInputText formControlName="donorEmail" type="email" />
          </div>
        </div>
        <div class="field-row">
          <div class="field">
            <label>Amount <span class="req">*</span></label>
            <p-inputNumber formControlName="amount" mode="currency" currency="USD" locale="en-US"
                           [min]="0.01" inputStyleClass="w-full"></p-inputNumber>
          </div>
          <div class="field">
            <label>Status</label>
            <p-dropdown [options]="statusOptions" formControlName="paymentStatus" styleClass="w-full"></p-dropdown>
          </div>
        </div>
        <div class="field">
          <label>Stripe Payment ID <span class="optional">(optional)</span></label>
          <input pInputText formControlName="stripePaymentId" placeholder="pi_..." />
          <small>For past Stripe charges, paste the payment intent ID from your Stripe dashboard.</small>
        </div>
        <div class="field">
          <label>Message / Note <span class="optional">(optional)</span></label>
          <textarea pInputTextarea formControlName="message" rows="2" maxlength="500"></textarea>
        </div>
      </form>
      <ng-template pTemplate="footer">
        <button pButton label="Cancel" icon="pi pi-times" class="p-button-text" (click)="dialogVisible = false"></button>
        <button pButton [label]="editing?.id ? 'Save Changes' : 'Save'" icon="pi pi-check"
                [disabled]="form.invalid || saving" [loading]="saving" (click)="saveManual()"></button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .donations-container { max-width: 1400px; margin: 0 auto; }
    .back-bar { margin-bottom: 1rem; }
    .back-link {
      display: inline-flex; align-items: center; gap: 0.5rem;
      color: #1a3a4a; text-decoration: none; font-weight: 600; font-size: 0.9rem;
      padding: 0.5rem 1rem; border-radius: 8px; transition: all 0.2s;
      &:hover { background: rgba(26, 58, 74, 0.08); color: #d4782f; }
    }
    .page-header { text-align: center; padding: 2.5rem 2rem; color: #f0e6d0; border-radius: 12px; margin-bottom: 1.5rem;
      background: linear-gradient(180deg, #1a3a4a 0%, #2a5a6a 30%, #c8923a 70%, #d4782f 100%);
      h1 { font-size: 2rem; font-weight: 700; margin: 0 0 0.5rem; } p { font-size: 1rem; margin: 0; opacity: 0.9; }
    }
    .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .stat-card {
      background: #fff; border-radius: 12px; padding: 1.25rem; text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      .stat-label { color: #6c757d; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; }
      .stat-value { color: #1a3a4a; font-size: 1.8rem; font-weight: 700; margin-top: 0.35rem; }
    }
    .stat-card.highlight { background: linear-gradient(135deg, #d4782f 0%, #b8651f 100%); color: #fff;
      .stat-label, .stat-value { color: #fff; }
    }
    .card-header-bar { display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.5rem;
      background: linear-gradient(135deg, #1a3a4a 0%, #1e4d5e 100%); color: #f0e6d0; font-size: 1.1rem; font-weight: 600;
    }
    .table-toolbar { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1rem; }
    .add-btn { margin-left: auto; }
    .csv-btn { margin-left: 0; }
    .message-cell { max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .row-actions { white-space: nowrap; }
    .dialog-hint { color: #6c757d; font-size: 0.9rem; margin: 0 0 1rem; }
    .donation-form { display: flex; flex-direction: column; gap: 0.85rem; }
    .donation-form .field { display: flex; flex-direction: column; gap: 0.35rem;
      label { font-size: 0.85rem; color: #1a3a4a; font-weight: 600; }
      .req { color: #d4782f; }
      .optional { color: #9aa0a6; font-weight: 400; }
      input, textarea { width: 100%; }
      small { color: #6c757d; font-size: 0.78rem; }
    }
    .donation-form .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    ::ng-deep .donation-form .p-inputnumber, ::ng-deep .donation-form .p-dropdown { width: 100%; }
    ::ng-deep .donations-container .p-card { border-radius: 12px; overflow: hidden;
      .p-card-header { padding: 0; border-bottom: none; }
      .p-card-body { padding: 1.5rem; } .p-card-content { padding: 0; }
    }
    ::ng-deep .donations-container .p-datatable .p-datatable-thead > tr > th {
      background: linear-gradient(135deg, #1a3a4a 0%, #1e4d5e 100%); color: #f0e6d0;
    }
  `]
})
export class AllDonationsComponent implements OnInit {
  private donationService = inject(DonationService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);
  donations: Donation[] = [];
  filteredDonations: Donation[] = [];
  selected: Donation[] = [];
  searchTerm = '';

  dialogVisible = false;
  saving = false;
  editing: Donation | null = null;
  statusOptions = [
    { label: 'Paid', value: 'paid' },
    { label: 'Pending', value: 'pending' },
    { label: 'Processing', value: 'processing' },
    { label: 'Failed', value: 'failed' },
  ];
  form: FormGroup = this.fb.group({
    donorName: ['', Validators.required],
    donorEmail: ['', [Validators.required, Validators.email]],
    amount: [null, [Validators.required, Validators.min(0.01)]],
    paymentStatus: ['paid'],
    stripePaymentId: [''],
    message: [''],
  });

  get paidCount(): number { return this.donations.filter(d => d.paymentStatus === 'paid').length; }
  get totalRaised(): number {
    return this.donations
      .filter(d => d.paymentStatus === 'paid')
      .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.donationService.listAll().subscribe({
      next: (data) => { this.donations = data || []; this.filteredDonations = this.donations; },
      error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load donations' }); }
    });
  }

  filter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredDonations = term
      ? this.donations.filter(d => (d.donorName || '').toLowerCase().includes(term) || (d.donorEmail || '').toLowerCase().includes(term))
      : this.donations;
  }

  statusSeverity(status: string | undefined): string {
    switch (status) {
      case 'paid': return 'success';
      case 'processing': return 'info';
      case 'pending': return 'warning';
      case 'failed': return 'danger';
      default: return 'warning';
    }
  }

  openAdd(): void {
    this.editing = null;
    this.form.reset({ donorName: '', donorEmail: '', amount: null, paymentStatus: 'paid', stripePaymentId: '', message: '' });
    this.dialogVisible = true;
  }

  openEdit(d: Donation): void {
    this.editing = d;
    this.form.reset({
      donorName: d.donorName,
      donorEmail: d.donorEmail,
      amount: Number(d.amount),
      paymentStatus: d.paymentStatus || 'paid',
      stripePaymentId: d.stripePaymentId || '',
      message: d.message || '',
    });
    this.dialogVisible = true;
  }

  saveManual(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const v = this.form.value;
    const payload: Donation = {
      donorName: v.donorName.trim(),
      donorEmail: v.donorEmail.trim(),
      amount: Number(v.amount),
      paymentStatus: v.paymentStatus,
      stripePaymentId: v.stripePaymentId?.trim() || undefined,
      message: v.message?.trim() || undefined,
    };
    const obs = this.editing?.id
      ? this.donationService.update(this.editing.id, payload)
      : this.donationService.createManual(payload);
    obs.subscribe({
      next: () => {
        this.saving = false;
        this.dialogVisible = false;
        const detail = this.editing?.id ? 'Donation updated' : 'Donation recorded';
        this.messageService.add({ severity: 'success', summary: 'Saved', detail });
        this.load();
      },
      error: (e) => {
        this.saving = false;
        const msg = e?.error?.message || (this.editing?.id ? 'Failed to update donation' : 'Failed to record donation');
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
      }
    });
  }

  confirmBulkDelete(): void {
    const n = this.selected.length;
    if (!n) return;
    const paidCount = this.selected.filter(d => d.paymentStatus === 'paid').length;
    const paidWarn = paidCount
      ? ` ${paidCount} of these ${paidCount === 1 ? 'is' : 'are'} marked PAID -- the local record will be removed but the Stripe charge stays on the books.`
      : '';
    this.confirmationService.confirm({
      header: 'Delete Selected',
      icon: 'pi pi-exclamation-triangle',
      message: `Delete ${n} donation${n === 1 ? '' : 's'}?${paidWarn} This cannot be undone.`,
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        const calls = this.selected.filter(d => d.id).map(d => this.donationService.delete(d.id!));
        if (!calls.length) return;
        forkJoin(calls).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `${n} donation${n === 1 ? '' : 's'} removed`, life: 2000 });
            this.selected = [];
            this.load();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Some donations failed to delete -- reloading' });
            this.load();
          }
        });
      }
    });
  }

  confirmDelete(d: Donation): void {
    const isPaid = d.paymentStatus === 'paid';
    const warn = isPaid
      ? ' This donation is marked PAID — deleting only removes the local record; the Stripe charge stays on the books.'
      : '';
    this.confirmationService.confirm({
      header: 'Delete Donation',
      icon: 'pi pi-exclamation-triangle',
      message: `Delete the $${Number(d.amount).toFixed(2)} donation from ${d.donorName}?${warn}`,
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        if (!d.id) return;
        this.donationService.delete(d.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Donation removed', life: 2000 });
            this.load();
          },
          error: (e) => {
            const msg = e?.error?.message || 'Failed to delete donation';
            this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
          }
        });
      }
    });
  }

  exportCsv(): void {
    const cols: [string, (d: Donation) => unknown][] = [
      ['ID', d => d.id],
      ['Date', d => d.createdAt],
      ['Donor Name', d => d.donorName],
      ['Donor Email', d => d.donorEmail],
      ['Amount', d => d.amount],
      ['Currency', d => (d.currency || 'usd').toUpperCase()],
      ['Status', d => d.paymentStatus || 'pending'],
      ['Message', d => d.message],
      ['Stripe Payment ID', d => d.stripePaymentId],
    ];
    const esc = (v: unknown): string => {
      const s = v == null ? '' : String(v);
      return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const header = cols.map(c => c[0]).join(',');
    const body = this.donations.map(d => cols.map(c => esc(c[1](d))).join(','));
    const csv = [header, ...body].join('\r\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donations-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
