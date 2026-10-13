import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ProspectiveSpeakerService } from '../../../services/prospective-speaker.service';
import { ProspectiveSpeaker, SpeakerStatus } from '../../../core/models/prospective-speaker.model';

interface StatusOption { label: string; value: SpeakerStatus; severity: 'info' | 'warning' | 'success' | 'danger'; }

@Component({
  selector: 'app-speakers-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink,
            CardModule, TableModule, ButtonModule, InputTextModule, InputTextareaModule,
            DropdownModule, DialogModule, ToastModule, TagModule, ConfirmDialogModule, TooltipModule],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
    <div class="speakers-container">
      <div class="back-bar">
        <a routerLink="/admin/dashboard" class="back-link"><i class="pi pi-arrow-left"></i> Back to Dashboard</a>
      </div>
      <div class="page-header">
        <h1>Prospective Speakers</h1>
        <p>Track outreach to potential retreat speakers — contact info, proposed topic, and where you are in the invite process.</p>
      </div>

      <p-card>
        <ng-template pTemplate="header">
          <div class="card-header-bar">
            <i class="pi pi-megaphone"></i><span>Speakers ({{ filtered.length }})</span>
          </div>
        </ng-template>

        <div class="toolbar">
          <span class="p-input-icon-left search-wrap">
            <i class="pi pi-search"></i>
            <input pInputText [(ngModel)]="searchTerm" placeholder="Search name, church, topic, notes..." (input)="filter()" />
          </span>
          <p-dropdown [options]="statusFilterOptions" [(ngModel)]="statusFilter" (onChange)="filter()"
                      placeholder="All statuses" [showClear]="true" styleClass="status-filter"></p-dropdown>
          <!-- Stat chip row — at-a-glance counts per status so the planning
               team sees "how many invited? how many still pending?" without
               filtering. Hidden when the list is empty to keep the empty
               state clean. -->
          <div class="stat-chips" *ngIf="speakers.length > 0">
            <span class="stat-chip pending" *ngIf="counts.pending > 0" [pTooltip]="'Pending outreach'">
              <i class="pi pi-clock"></i> {{ counts.pending }} pending
            </span>
            <span class="stat-chip invited" *ngIf="counts.invited > 0" [pTooltip]="'Invited, awaiting response'">
              <i class="pi pi-send"></i> {{ counts.invited }} invited
            </span>
            <span class="stat-chip confirmed" *ngIf="counts.confirmed > 0" [pTooltip]="'Confirmed to speak'">
              <i class="pi pi-check-circle"></i> {{ counts.confirmed }} confirmed
            </span>
            <span class="stat-chip declined" *ngIf="counts.declined > 0" [pTooltip]="'Declined the invite'">
              <i class="pi pi-times-circle"></i> {{ counts.declined }} declined
            </span>
          </div>
          <button pButton label="New Speaker" icon="pi pi-plus" (click)="openNew()" class="new-btn"></button>
        </div>

        <p-table [value]="filtered" [paginator]="true" [rows]="20" [rowsPerPageOptions]="[20, 50, 100]"
                 [tableStyle]="{'min-width': '58rem'}"
                 [showCurrentPageReport]="true"
                 currentPageReportTemplate="Showing {first} to {last} of {totalRecords}">
          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="name">Name <p-sortIcon field="name"></p-sortIcon></th>
              <th pSortableColumn="church">Church <p-sortIcon field="church"></p-sortIcon></th>
              <th>Contact</th>
              <th pSortableColumn="topic">Topic <p-sortIcon field="topic"></p-sortIcon></th>
              <th pSortableColumn="status" style="width:140px;">Status <p-sortIcon field="status"></p-sortIcon></th>
              <th style="width:120px;">Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-s>
            <tr>
              <td>
                <div class="name-cell">
                  <strong>{{ s.name }}</strong>
                  <span class="notes-preview" *ngIf="s.notes" [pTooltip]="s.notes" tooltipPosition="right">
                    <i class="pi pi-comment"></i> notes
                  </span>
                </div>
              </td>
              <td>{{ s.church || '—' }}</td>
              <td>
                <div class="contact-cell">
                  <a *ngIf="s.email" [href]="'mailto:' + s.email" class="contact-link"><i class="pi pi-envelope"></i> {{ s.email }}</a>
                  <a *ngIf="s.phone" [href]="'tel:' + s.phone" class="contact-link"><i class="pi pi-phone"></i> {{ s.phone }}</a>
                  <span *ngIf="!s.email && !s.phone" class="muted">—</span>
                </div>
              </td>
              <td>{{ s.topic || '—' }}</td>
              <td>
                <p-tag [value]="statusLabel(s.status)" [severity]="statusSeverity(s.status)"></p-tag>
              </td>
              <td>
                <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm act-icon act-edit"
                        (click)="openEdit(s)" pTooltip="Edit"></button>
                <button pButton icon="pi pi-trash" class="p-button-text p-button-sm act-icon act-delete"
                        (click)="confirmDelete(s)" pTooltip="Delete"></button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="6" style="text-align:center; padding:2rem; color:#999;">
              No prospective speakers yet. Click "New Speaker" to add the first one.
            </td></tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>

    <!-- New/Edit dialog -->
    <p-dialog [(visible)]="dialogOpen" [modal]="true" [style]="{width: '560px'}"
              [header]="editing?.id ? 'Edit Speaker' : 'New Prospective Speaker'"
              [closable]="true" [draggable]="false">
      <form [formGroup]="form" class="speaker-form" *ngIf="dialogOpen">
        <div class="field">
          <label>Name <span class="req">*</span></label>
          <input pInputText formControlName="name" maxlength="120" placeholder="Pastor Jane Smith" />
        </div>
        <div class="field-row">
          <div class="field">
            <label>Email</label>
            <input pInputText formControlName="email" maxlength="180" placeholder="jane@church.org" />
          </div>
          <div class="field">
            <label>Phone</label>
            <input pInputText formControlName="phone" maxlength="40" placeholder="(555) 123-4567" />
          </div>
        </div>
        <div class="field">
          <label>Church / Affiliation</label>
          <input pInputText formControlName="church" maxlength="160" placeholder="Grace Community Church" />
        </div>
        <div class="field">
          <label>Proposed Topic / Session Title</label>
          <input pInputText formControlName="topic" maxlength="240" placeholder="Walking in the Spirit (opening message)" />
        </div>
        <div class="field">
          <label>Status</label>
          <p-dropdown [options]="statusOptions" formControlName="status" optionLabel="label" optionValue="value" appendTo="body"></p-dropdown>
        </div>
        <div class="field">
          <label>Notes</label>
          <textarea pInputTextarea formControlName="notes" rows="4"
                    placeholder="Who referred them, scheduling constraints, follow-up reminders..."></textarea>
        </div>
      </form>
      <ng-template pTemplate="footer">
        <button pButton label="Cancel" icon="pi pi-times" class="p-button-text" (click)="dialogOpen = false" [disabled]="saving"></button>
        <button pButton label="Save" icon="pi pi-check" (click)="save()" [disabled]="form.invalid || saving" [loading]="saving"></button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .speakers-container { max-width: 1200px; margin: 0 auto; padding: 1.5rem; }
    .back-bar { margin-bottom: 1rem; }
    .back-link { color: var(--retreat-teal-dark); font-weight: 600; text-decoration: none;
      display: inline-flex; align-items: center; gap: 0.35rem;
      &:hover { text-decoration: underline; }
    }
    .page-header { margin-bottom: 1.5rem;
      h1 { margin: 0 0 0.35rem 0; color: var(--retreat-teal-dark); }
      p { margin: 0; color: var(--retreat-text-secondary); max-width: 60ch; }
    }
    .card-header-bar { padding: 1rem 1.25rem; background: var(--retreat-teal-dark); color: var(--retreat-cream);
      font-weight: 700; display: flex; align-items: center; gap: 0.5rem; }
    .toolbar { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; margin-bottom: 1rem; }
    .search-wrap { flex: 1; min-width: 240px;
      input { width: 100%; padding-left: 2rem; }
    }
    ::ng-deep .status-filter { min-width: 160px; }
    .new-btn { margin-left: auto; }
    .stat-chips { display: flex; gap: 0.4rem; flex-wrap: wrap; }
    .stat-chip { display: inline-flex; align-items: center; gap: 0.3rem;
      padding: 0.25rem 0.65rem; border-radius: 999px; font-size: 0.82rem; font-weight: 600;
      i { font-size: 0.75rem; }
    }
    .stat-chip.pending   { background: #fff4d6; color: #7a5a00; }
    .stat-chip.invited   { background: #dbeafe; color: #1e40af; }
    .stat-chip.confirmed { background: #d1fae5; color: #065f46; }
    .stat-chip.declined  { background: #fee2e2; color: #991b1b; }
    .name-cell { display: flex; align-items: center; gap: 0.5rem;
      strong { color: var(--retreat-teal-dark); }
    }
    .notes-preview { font-size: 0.78rem; color: #666; cursor: help;
      i { margin-right: 0.2rem; }
    }
    .contact-cell { display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.88rem; }
    .contact-link { color: var(--retreat-teal); text-decoration: none;
      display: inline-flex; align-items: center; gap: 0.3rem;
      i { font-size: 0.75rem; }
      &:hover { text-decoration: underline; }
    }
    .muted { color: #aaa; }
    ::ng-deep .act-icon.p-button { width: 2rem; height: 2rem; padding: 0; border-radius: 50%;
      transition: background 0.15s; .p-button-icon { font-size: 0.9rem; }
    }
    ::ng-deep .act-edit.p-button { color: #fff; background: #6c757d; border: 1px solid #565e64;
      &:hover { background: #565e64; color: #fff; } }
    ::ng-deep .act-delete.p-button { color: #fff; background: #c0392b; border: 1px solid #a03225;
      &:hover { background: #a03225; color: #fff; } }
    .speaker-form { display: flex; flex-direction: column; gap: 0.85rem; }
    .field { display: flex; flex-direction: column; gap: 0.3rem;
      label { font-weight: 600; font-size: 0.9rem; color: var(--retreat-teal-dark); }
      input, textarea { padding: 0.5rem 0.65rem; border: 1px solid #cfd4da; border-radius: 6px; font-size: 0.95rem;
        font-family: inherit; }
      .req { color: #c0392b; }
    }
    .field-row { display: flex; gap: 0.75rem; .field { flex: 1; } }
  `]
})
export class SpeakersAdminComponent implements OnInit {
  private svc = inject(ProspectiveSpeakerService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  speakers: ProspectiveSpeaker[] = [];
  filtered: ProspectiveSpeaker[] = [];
  searchTerm = '';
  statusFilter: SpeakerStatus | null = null;

  dialogOpen = false;
  editing: ProspectiveSpeaker | null = null;
  saving = false;

  readonly statusOptions: StatusOption[] = [
    { label: 'Pending',   value: 'pending',   severity: 'warning' },
    { label: 'Invited',   value: 'invited',   severity: 'info' },
    { label: 'Confirmed', value: 'confirmed', severity: 'success' },
    { label: 'Declined',  value: 'declined',  severity: 'danger' },
  ];
  readonly statusFilterOptions = this.statusOptions.map(s => ({ label: s.label, value: s.value }));

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', Validators.maxLength(180)],
    phone: ['', Validators.maxLength(40)],
    church: ['', Validators.maxLength(160)],
    topic: ['', Validators.maxLength(240)],
    status: ['pending' as SpeakerStatus],
    notes: [''],
  });

  // Rendered next to the search box as colored chips. Counts freshly on
  // every load so adds/edits reflect immediately.
  get counts() {
    const c = { pending: 0, invited: 0, confirmed: 0, declined: 0 };
    for (const s of this.speakers) {
      const k = (s.status || 'pending') as SpeakerStatus;
      if (k in c) (c as any)[k]++;
    }
    return c;
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.svc.list().subscribe({
      next: (list) => { this.speakers = list; this.filter(); },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load speakers' })
    });
  }

  filter(): void {
    const q = this.searchTerm.trim().toLowerCase();
    this.filtered = this.speakers.filter(s => {
      if (this.statusFilter && (s.status || 'pending') !== this.statusFilter) return false;
      if (!q) return true;
      return (s.name + ' ' + (s.email || '') + ' ' + (s.church || '') + ' ' +
              (s.topic || '') + ' ' + (s.notes || '')).toLowerCase().includes(q);
    });
  }

  openNew(): void {
    this.editing = null;
    this.form.reset({ name: '', email: '', phone: '', church: '', topic: '', status: 'pending', notes: '' });
    this.dialogOpen = true;
  }

  openEdit(s: ProspectiveSpeaker): void {
    this.editing = s;
    this.form.reset({
      name: s.name || '',
      email: s.email || '',
      phone: s.phone || '',
      church: s.church || '',
      topic: s.topic || '',
      status: (s.status || 'pending') as SpeakerStatus,
      notes: s.notes || '',
    });
    this.dialogOpen = true;
  }

  save(): void {
    if (this.form.invalid || this.saving) return;
    const payload = this.form.value as ProspectiveSpeaker;
    this.saving = true;
    const req = this.editing?.id
      ? this.svc.update(this.editing.id, payload)
      : this.svc.create(payload);
    req.subscribe({
      next: () => {
        this.saving = false;
        this.dialogOpen = false;
        this.messageService.add({
          severity: 'success', summary: 'Saved',
          detail: `${payload.name} ${this.editing?.id ? 'updated' : 'added'}`
        });
        this.load();
      },
      error: (e) => {
        this.saving = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: e?.error?.message || 'Save failed' });
      }
    });
  }

  confirmDelete(s: ProspectiveSpeaker): void {
    if (s.id == null) return;
    this.confirmationService.confirm({
      header: 'Delete speaker?',
      message: `Delete ${s.name} from the prospective speakers list? This cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete', rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.svc.delete(s.id!).subscribe({
        next: () => { this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `${s.name} removed` }); this.load(); },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Delete failed' })
      })
    });
  }

  statusLabel(status?: string): string {
    return this.statusOptions.find(o => o.value === status)?.label || 'Pending';
  }
  statusSeverity(status?: string): 'info' | 'warning' | 'success' | 'danger' {
    return this.statusOptions.find(o => o.value === status)?.severity || 'warning';
  }
}
