import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { RegistrationService } from '../../../services/registration.service';
import { Registration } from '../../../core/models/registration.model';
import { Attendee } from '../../../core/models/attendee.model';

@Component({
  selector: 'app-manage-registrations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CardModule, TableModule, ButtonModule, TagModule, InputTextModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
    <div class="registrations-container">
      <div class="back-bar">
        <a routerLink="/admin/dashboard" class="back-link"><i class="pi pi-arrow-left"></i> Back to Dashboard</a>
      </div>
      <div class="page-header"><h1>All Registrations</h1><p>Manage retreat registrations</p></div>
      <p-card>
        <ng-template pTemplate="header">
          <div class="card-header-bar"><i class="pi pi-list"></i><span>Registrations ({{ registrations.length }})</span></div>
        </ng-template>
        <div class="table-toolbar">
          <span class="p-input-icon-left"><i class="pi pi-search"></i><input type="text" pInputText [(ngModel)]="searchTerm" placeholder="Search..." (input)="filterRegistrations()" /></span>
          <button pButton label="Download CSV" icon="pi pi-download" class="p-button-outlined csv-btn"
                  (click)="exportCsv()" [disabled]="!registrations.length"></button>
        </div>
        <p-table [value]="filteredRegistrations" [paginator]="true" [rows]="10" [rowsPerPageOptions]="[10, 25, 50]" [sortField]="'registeredAt'" [sortOrder]="-1" [tableStyle]="{'min-width': '60rem'}" [showCurrentPageReport]="true" currentPageReportTemplate="Showing {first} to {last} of {totalRecords}">
          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="firstName">Name <p-sortIcon field="firstName"></p-sortIcon></th>
              <th pSortableColumn="email">Email <p-sortIcon field="email"></p-sortIcon></th>
              <th>Phone</th>
              <th pSortableColumn="congregation">Congregation <p-sortIcon field="congregation"></p-sortIcon></th>
              <th pSortableColumn="speaker" style="width: 90px; text-align: center;">Speaker <p-sortIcon field="speaker"></p-sortIcon></th>
              <th style="min-width: 220px;">Attendees</th>
              <th pSortableColumn="totalAmount">Total <p-sortIcon field="totalAmount"></p-sortIcon></th>
              <th pSortableColumn="paymentStatus">Status <p-sortIcon field="paymentStatus"></p-sortIcon></th>
              <th pSortableColumn="registeredAt">Date <p-sortIcon field="registeredAt"></p-sortIcon></th>
              <th style="width: 80px"></th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-reg>
            <tr>
              <td>{{ reg.firstName }} {{ reg.lastName }}</td>
              <td>{{ reg.email }}</td>
              <td>{{ reg.phone }}</td>
              <td>{{ reg.congregation || '—' }}</td>
              <td style="text-align: center;">
                <button type="button" class="speaker-toggle" [class.is-speaker]="reg.speaker"
                        (click)="toggleSpeaker(reg)"
                        [attr.aria-label]="reg.speaker ? 'Unmark as speaker' : 'Mark as speaker'"
                        [title]="reg.speaker ? 'Speaker — click to remove' : 'Click to mark as speaker'">
                  <i class="pi" [class.pi-star-fill]="reg.speaker" [class.pi-star]="!reg.speaker"></i>
                </button>
              </td>
              <td class="attendees-cell">
                <div *ngIf="reg.attendees?.length; else noAttendees" class="attendee-list">
                  <span class="attendee-count">{{ reg.attendees!.length }}</span>
                  <ul>
                    <li *ngFor="let a of reg.attendees">
                      <button type="button" class="attendee-speaker-toggle" [class.is-speaker]="a.speaker"
                              (click)="toggleAttendeeSpeaker(a)"
                              [title]="a.speaker ? 'Speaker — click to remove' : 'Click to mark as speaker'">
                        <i class="pi" [class.pi-star-fill]="a.speaker" [class.pi-star]="!a.speaker"></i>
                      </button>
                      <span class="attendee-name">{{ a.firstName }} {{ a.lastName }}</span>
                      <span class="attendee-age" *ngIf="a.age">({{ a.age }})</span>
                    </li>
                  </ul>
                </div>
                <ng-template #noAttendees><span class="muted">none</span></ng-template>
              </td>
              <td>\${{ reg.totalAmount }}</td>
              <td><p-tag [value]="reg.paymentStatus || 'pending'" [severity]="getStatusSeverity(reg.paymentStatus)"></p-tag></td>
              <td>{{ reg.registeredAt | date:'short' }}</td>
              <td><button pButton icon="pi pi-trash" class="p-button-danger p-button-text p-button-sm" (click)="confirmDelete(reg)"></button></td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage"><tr><td colspan="10" style="text-align: center; padding: 2rem; color: #999;">No registrations found.</td></tr></ng-template>
        </p-table>
      </p-card>
    </div>
  `,
  styles: [`
    .registrations-container { max-width: 1400px; margin: 0 auto; }
    .back-bar { margin-bottom: 1rem; }
    .back-link {
      display: inline-flex; align-items: center; gap: 0.5rem;
      color: #1a3a4a; text-decoration: none; font-weight: 600; font-size: 0.9rem;
      padding: 0.5rem 1rem; border-radius: 8px; transition: all 0.2s;
      &:hover { background: rgba(26, 58, 74, 0.08); color: #d4782f; }
    }
    .page-header { text-align: center; padding: 2.5rem 2rem; background: linear-gradient(180deg, #1a3a4a 0%, #2a5a6a 30%, #c8923a 70%, #d4782f 100%); color: #f0e6d0; border-radius: 12px; margin-bottom: 1.5rem; h1 { font-size: 2rem; font-weight: 700; margin: 0 0 0.5rem 0; } p { font-size: 1rem; margin: 0; opacity: 0.9; } }
    .card-header-bar { display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.5rem; background: linear-gradient(135deg, #1a3a4a 0%, #1e4d5e 100%); color: #f0e6d0; font-size: 1.1rem; font-weight: 600; }
    .table-toolbar { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem; }
    .csv-btn { margin-left: auto; }
    ::ng-deep .registrations-container .p-card { border-radius: 12px; overflow: hidden; .p-card-header { padding: 0; border-bottom: none; } .p-card-body { padding: 1.5rem; } .p-card-content { padding: 0; } }
    ::ng-deep .p-datatable .p-datatable-thead > tr > th { background: linear-gradient(135deg, #1a3a4a 0%, #1e4d5e 100%); color: #f0e6d0; }
    .speaker-toggle {
      background: transparent; border: none; cursor: pointer; padding: 0.25rem 0.5rem;
      border-radius: 6px; transition: all 0.15s;
      i { font-size: 1.25rem; color: #ccc; transition: color 0.15s; }
      &:hover { background: rgba(232, 168, 50, 0.12);
        i { color: #e8a832; }
      }
      &.is-speaker i { color: #e8a832; text-shadow: 0 0 8px rgba(232, 168, 50, 0.4); }
    }
    .attendees-cell { vertical-align: top; }
    .attendee-list { display: flex; gap: 0.5rem; align-items: flex-start;
      .attendee-count {
        background: #1a3a4a; color: #f0e6d0;
        font-weight: 700; font-size: 0.78rem;
        padding: 0.1rem 0.5rem; border-radius: 999px;
        min-width: 1.4rem; text-align: center;
        flex-shrink: 0; margin-top: 0.1rem;
      }
      ul { list-style: none; margin: 0; padding: 0; flex: 1;
        li {
          display: flex; align-items: center; gap: 0.3rem;
          padding: 0.08rem 0;
          font-size: 0.92rem; color: #1a3a4a;
          .attendee-name { flex-shrink: 0; }
          .attendee-age { color: #6c757d; font-size: 0.82rem; }
        }
      }
    }
    .attendee-speaker-toggle {
      background: transparent; border: none; cursor: pointer; padding: 0.1rem 0.3rem;
      border-radius: 4px; transition: all 0.15s; flex-shrink: 0;
      i { font-size: 0.82rem; color: #d0d0d0; transition: color 0.15s; }
      &:hover { background: rgba(232, 168, 50, 0.18);
        i { color: #e8a832; }
      }
      &.is-speaker i { color: #e8a832; }
    }
    .attendees-cell .muted { color: #999; font-style: italic; font-size: 0.85rem; }
  `]
})
export class ManageRegistrationsComponent implements OnInit {
  private registrationService = inject(RegistrationService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  registrations: Registration[] = [];
  filteredRegistrations: Registration[] = [];
  searchTerm = '';

  ngOnInit(): void { this.loadRegistrations(); }

  loadRegistrations(): void {
    this.registrationService.getAllRegistrations().subscribe({
      next: (data) => { this.registrations = data; this.filteredRegistrations = data; },
      error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load registrations' }); }
    });
  }

  filterRegistrations(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredRegistrations = this.registrations.filter(r =>
      r.firstName.toLowerCase().includes(term) ||
      r.lastName.toLowerCase().includes(term) ||
      r.email.toLowerCase().includes(term) ||
      (r.congregation || '').toLowerCase().includes(term) ||
      (r.speaker && 'speaker'.includes(term))
    );
  }

  toggleAttendeeSpeaker(a: Attendee): void {
    if (!a.id) return;
    const newValue = !a.speaker;
    a.speaker = newValue;
    this.registrationService.setAttendeeSpeaker(a.id, newValue).subscribe({
      next: () => {
        this.messageService.add({
          severity: newValue ? 'success' : 'info',
          summary: newValue ? 'Marked as speaker' : 'Speaker flag removed',
          detail: `${a.firstName} ${a.lastName}`,
          life: 2000,
        });
      },
      error: () => {
        a.speaker = !newValue;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update speaker flag' });
      }
    });
  }

  toggleSpeaker(reg: Registration): void {
    if (!reg.id) return;
    const newValue = !reg.speaker;
    // Optimistic update for snappy UX
    reg.speaker = newValue;
    this.registrationService.setSpeaker(reg.id, newValue).subscribe({
      next: () => {
        this.messageService.add({
          severity: newValue ? 'success' : 'info',
          summary: newValue ? 'Marked as speaker' : 'Speaker flag removed',
          detail: `${reg.firstName} ${reg.lastName}`,
          life: 2000,
        });
      },
      error: () => {
        reg.speaker = !newValue;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update speaker flag' });
      }
    });
  }

  getStatusSeverity(status: string | undefined): string {
    switch (status) { case 'paid': return 'success'; case 'pending': return 'warning'; case 'refunded': return 'info'; default: return 'warning'; }
  }

  exportCsv(): void {
    const cols: [string, (r: Registration) => unknown][] = [
      ['ID', r => r.id],
      ['Registered At', r => r.registeredAt],
      ['First Name', r => r.firstName],
      ['Last Name', r => r.lastName],
      ['Email', r => r.email],
      ['Phone', r => r.phone],
      ['Address', r => r.address],
      ['City', r => r.city],
      ['State', r => r.state],
      ['Zip', r => r.zipCode],
      ['Congregation', r => r.congregation],
      ['Speaker', r => r.speaker ? 'Yes' : 'No'],
      ['Room Preference', r => r.roomPreference],
      ['Attendee Count', r => r.attendees?.length || 0],
      ['Attendees', r => (r.attendees || []).map(a => `${a.firstName} ${a.lastName} (${a.age})`).join('; ')],
      ['Total Amount', r => r.totalAmount],
      ['Payment Status', r => r.paymentStatus || 'pending'],
      ['Stripe Payment ID', r => r.stripePaymentId],
      ['Emergency Name', r => r.emergencyName],
      ['Emergency Relationship', r => r.emergencyRelationship],
      ['Emergency Phone', r => r.emergencyPhone],
      ['Special Requests', r => r.specialRequests],
    ];
    const esc = (v: unknown): string => {
      const s = v == null ? '' : String(v);
      return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const header = cols.map(c => c[0]).join(',');
    const body = this.registrations.map(r => cols.map(c => esc(c[1](r))).join(','));
    const csv = [header, ...body].join('\r\n');
    // BOM so Excel recognizes UTF-8
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  confirmDelete(reg: Registration): void {
    this.confirmationService.confirm({
      message: 'Delete registration for ' + reg.firstName + ' ' + reg.lastName + '?',
      header: 'Confirm Delete', icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (reg.id) {
          this.registrationService.adminDeleteRegistration(reg.id).subscribe({
            next: () => { this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Registration deleted' }); this.loadRegistrations(); },
            error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete' }); }
          });
        }
      }
    });
  }
}
