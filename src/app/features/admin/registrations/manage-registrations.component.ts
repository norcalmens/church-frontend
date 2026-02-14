import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

@Component({
  selector: 'app-manage-registrations',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, TableModule, ButtonModule, TagModule, InputTextModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
    <div class="registrations-container">
      <div class="page-header"><h1>All Registrations</h1><p>Manage retreat registrations</p></div>
      <p-card>
        <ng-template pTemplate="header">
          <div class="card-header-bar"><i class="pi pi-list"></i><span>Registrations ({{ registrations.length }})</span></div>
        </ng-template>
        <div class="table-toolbar">
          <span class="p-input-icon-left"><i class="pi pi-search"></i><input type="text" pInputText [(ngModel)]="searchTerm" placeholder="Search..." (input)="filterRegistrations()" /></span>
        </div>
        <p-table [value]="filteredRegistrations" [paginator]="true" [rows]="10" [rowsPerPageOptions]="[10, 25, 50]" [sortField]="'registeredAt'" [sortOrder]="-1" [tableStyle]="{'min-width': '60rem'}" [showCurrentPageReport]="true" currentPageReportTemplate="Showing {first} to {last} of {totalRecords}">
          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="firstName">Name <p-sortIcon field="firstName"></p-sortIcon></th>
              <th pSortableColumn="email">Email <p-sortIcon field="email"></p-sortIcon></th>
              <th>Phone</th>
              <th>Attendees</th>
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
              <td>{{ reg.attendees?.length || 0 }}</td>
              <td>\${{ reg.totalAmount }}</td>
              <td><p-tag [value]="reg.paymentStatus || 'pending'" [severity]="getStatusSeverity(reg.paymentStatus)"></p-tag></td>
              <td>{{ reg.registeredAt | date:'short' }}</td>
              <td><button pButton icon="pi pi-trash" class="p-button-danger p-button-text p-button-sm" (click)="confirmDelete(reg)"></button></td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage"><tr><td colspan="8" style="text-align: center; padding: 2rem; color: #999;">No registrations found.</td></tr></ng-template>
        </p-table>
      </p-card>
    </div>
  `,
  styles: [`
    .registrations-container { max-width: 1400px; margin: 0 auto; }
    .page-header { text-align: center; padding: 2.5rem 2rem; background: linear-gradient(180deg, #1a3a4a 0%, #2a5a6a 30%, #c8923a 70%, #d4782f 100%); color: #f0e6d0; border-radius: 12px; margin-bottom: 1.5rem; h1 { font-size: 2rem; font-weight: 700; margin: 0 0 0.5rem 0; } p { font-size: 1rem; margin: 0; opacity: 0.9; } }
    .card-header-bar { display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.5rem; background: linear-gradient(135deg, #1a3a4a 0%, #1e4d5e 100%); color: #f0e6d0; font-size: 1.1rem; font-weight: 600; }
    .table-toolbar { margin-bottom: 1rem; }
    ::ng-deep .registrations-container .p-card { border-radius: 12px; overflow: hidden; .p-card-header { padding: 0; border-bottom: none; } .p-card-body { padding: 1.5rem; } .p-card-content { padding: 0; } }
    ::ng-deep .p-datatable .p-datatable-thead > tr > th { background: linear-gradient(135deg, #1a3a4a 0%, #1e4d5e 100%); color: #f0e6d0; }
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
    this.filteredRegistrations = this.registrations.filter(r => r.firstName.toLowerCase().includes(term) || r.lastName.toLowerCase().includes(term) || r.email.toLowerCase().includes(term));
  }

  getStatusSeverity(status: string | undefined): string {
    switch (status) { case 'paid': return 'success'; case 'pending': return 'warning'; case 'refunded': return 'info'; default: return 'warning'; }
  }

  confirmDelete(reg: Registration): void {
    this.confirmationService.confirm({
      message: 'Delete registration for ' + reg.firstName + ' ' + reg.lastName + '?',
      header: 'Confirm Delete', icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (reg.id) {
          this.registrationService.deleteRegistration(reg.id).subscribe({
            next: () => { this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Registration deleted' }); this.loadRegistrations(); },
            error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete' }); }
          });
        }
      }
    });
  }
}
