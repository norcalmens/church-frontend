import { Component, OnInit, inject } from '@angular/core';
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
import { WaitlistService, WaitlistEntry } from '../../../services/waitlist.service';

@Component({
  selector: 'app-waitlist-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CardModule, TableModule, ButtonModule, TagModule, InputTextModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
    <div class="waitlist-admin">
      <div class="back-bar">
        <a routerLink="/admin/dashboard" class="back-link"><i class="pi pi-arrow-left"></i> Back to Dashboard</a>
      </div>
      <div class="page-header"><h1>Waitlist</h1><p>Manage attendees waiting for a spot to open up</p></div>
      <p-card>
        <ng-template pTemplate="header">
          <div class="card-header-bar"><i class="pi pi-list"></i><span>Waitlist ({{ entries.length }})</span></div>
        </ng-template>
        <div class="toolbar">
          <span class="p-input-icon-left"><i class="pi pi-search"></i><input type="text" pInputText [(ngModel)]="searchTerm" placeholder="Search..." (input)="filter()" /></span>
          <span class="totals">{{ totalSeatsRequested }} seat{{ totalSeatsRequested === 1 ? '' : 's' }} requested across {{ entries.length }} entries</span>
        </div>
        <p-table [value]="filtered" [paginator]="true" [rows]="10" [sortField]="'createdAt'" [sortOrder]="1" [tableStyle]="{'min-width': '60rem'}">
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 60px">#</th>
              <th pSortableColumn="firstName">Name <p-sortIcon field="firstName"></p-sortIcon></th>
              <th>Email</th>
              <th>Phone</th>
              <th>Congregation</th>
              <th style="width: 80px; text-align: center;">Seats</th>
              <th pSortableColumn="createdAt">Joined <p-sortIcon field="createdAt"></p-sortIcon></th>
              <th style="width: 110px; text-align: center;">Contacted</th>
              <th style="width: 60px"></th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-e let-i="rowIndex">
            <tr [class.contacted-row]="e.contacted">
              <td class="position">{{ positionOf(e) }}</td>
              <td>{{ e.firstName }} {{ e.lastName }}</td>
              <td><a [href]="'mailto:' + e.email">{{ e.email }}</a></td>
              <td>{{ e.phone || '—' }}</td>
              <td>{{ e.congregation || '—' }}</td>
              <td style="text-align: center;">{{ e.requestedSeats }}</td>
              <td>{{ e.createdAt | date:'short' }}</td>
              <td style="text-align: center;">
                <button type="button" class="contacted-toggle" [class.is-contacted]="e.contacted"
                        (click)="toggleContacted(e)"
                        [title]="e.contacted ? 'Mark as not contacted' : 'Mark as contacted'">
                  <i class="pi" [class.pi-check-circle]="e.contacted" [class.pi-circle]="!e.contacted"></i>
                </button>
              </td>
              <td>
                <button pButton icon="pi pi-trash" class="p-button-danger p-button-text p-button-sm"
                        (click)="confirmDelete(e)"></button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="9" style="text-align: center; padding: 2rem; color: #999;">No one on the waitlist.</td></tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>
  `,
  styles: [`
    .waitlist-admin { max-width: 1400px; margin: 0 auto; }
    .back-bar { margin-bottom: 1rem; }
    .back-link {
      display: inline-flex; align-items: center; gap: 0.5rem;
      color: #1a3a4a; text-decoration: none; font-weight: 600; font-size: 0.9rem;
      padding: 0.5rem 1rem; border-radius: 8px; transition: all 0.2s;
      &:hover { background: rgba(26, 58, 74, 0.08); color: #d4782f; }
    }
    .page-header {
      text-align: center; padding: 2.5rem 2rem;
      background: linear-gradient(180deg, #1a3a4a 0%, #2a5a6a 30%, #c8923a 70%, #d4782f 100%);
      color: #f0e6d0; border-radius: 12px; margin-bottom: 1.5rem;
      h1 { font-size: 2rem; font-weight: 700; margin: 0 0 0.5rem 0; }
      p { font-size: 1rem; margin: 0; opacity: 0.9; }
    }
    .card-header-bar {
      display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.5rem;
      background: linear-gradient(135deg, #1a3a4a 0%, #1e4d5e 100%);
      color: #f0e6d0; font-size: 1.1rem; font-weight: 600;
    }
    .toolbar { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem;
      .totals { margin-left: auto; color: #6c757d; font-size: 0.9rem; }
    }
    ::ng-deep .waitlist-admin .p-card { border-radius: 12px; overflow: hidden;
      .p-card-header { padding: 0; border-bottom: none; }
      .p-card-body { padding: 1.5rem; }
      .p-card-content { padding: 0; }
    }
    ::ng-deep .waitlist-admin .p-datatable .p-datatable-thead > tr > th { background: linear-gradient(135deg, #1a3a4a 0%, #1e4d5e 100%); color: #f0e6d0; }
    .position { font-weight: 700; color: #1a3a4a; }
    .contacted-row { opacity: 0.6; td.position { text-decoration: line-through; } }
    .contacted-toggle {
      background: transparent; border: none; cursor: pointer; padding: 0.25rem 0.5rem;
      border-radius: 6px; transition: all 0.15s;
      i { font-size: 1.3rem; color: #ccc; transition: color 0.15s; }
      &:hover { background: rgba(46, 158, 91, 0.12);
        i { color: #2e9e5b; }
      }
      &.is-contacted i { color: #2e9e5b; }
    }
  `]
})
export class WaitlistAdminComponent implements OnInit {
  private waitlistService = inject(WaitlistService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  entries: WaitlistEntry[] = [];
  filtered: WaitlistEntry[] = [];
  searchTerm = '';

  get totalSeatsRequested(): number {
    return this.entries.reduce((sum, e) => sum + (e.requestedSeats || 0), 0);
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.waitlistService.list().subscribe({
      next: (data) => { this.entries = data; this.filter(); },
      error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load waitlist' }); }
    });
  }

  filter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filtered = !term ? [...this.entries] : this.entries.filter(e =>
      e.firstName.toLowerCase().includes(term) ||
      e.lastName.toLowerCase().includes(term) ||
      e.email.toLowerCase().includes(term) ||
      (e.congregation || '').toLowerCase().includes(term)
    );
  }

  positionOf(e: WaitlistEntry): number {
    // Position is the entry's place in the original (createdAt-sorted) list,
    // not in the current filtered/sorted view -- so it doesn't shift when
    // the admin searches or re-sorts.
    return this.entries.indexOf(e) + 1;
  }

  toggleContacted(e: WaitlistEntry): void {
    if (!e.id) return;
    const newVal = !e.contacted;
    e.contacted = newVal;
    this.waitlistService.setContacted(e.id, newVal).subscribe({
      next: () => this.messageService.add({ severity: newVal ? 'success' : 'info', summary: newVal ? 'Marked contacted' : 'Marked not contacted', detail: `${e.firstName} ${e.lastName}`, life: 2000 }),
      error: () => { e.contacted = !newVal; this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update' }); }
    });
  }

  confirmDelete(e: WaitlistEntry): void {
    this.confirmationService.confirm({
      message: `Remove ${e.firstName} ${e.lastName} from the waitlist?`,
      header: 'Confirm Remove', icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (!e.id) return;
        this.waitlistService.delete(e.id).subscribe({
          next: () => { this.messageService.add({ severity: 'success', summary: 'Removed', detail: 'Entry removed from waitlist' }); this.load(); },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to remove' })
        });
      }
    });
  }
}
