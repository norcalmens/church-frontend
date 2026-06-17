import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ZoomLinkService } from '../../../services/zoom-link.service';
import { ZoomLink } from '../../../core/models/zoom-link.model';

@Component({
  selector: 'app-zoom-links-admin',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, RouterLink,
    CardModule, TableModule, ButtonModule, InputTextModule, InputTextareaModule,
    InputNumberModule, InputSwitchModule, DialogModule, TagModule, ToastModule, ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
    <div class="zoom-admin-container">
      <div class="back-bar">
        <a routerLink="/admin/dashboard" class="back-link"><i class="pi pi-arrow-left"></i> Back to Dashboard</a>
      </div>
      <div class="page-header"><h1>Manage Zoom Links</h1><p>Add, edit, or remove the Zoom meetings shown on the Worship page</p></div>

      <p-card>
        <ng-template pTemplate="header">
          <div class="card-header-bar">
            <i class="pi pi-video"></i>
            <span>Zoom Meetings ({{ links.length }})</span>
          </div>
        </ng-template>
        <div class="toolbar">
          <button pButton label="Add Zoom Link" icon="pi pi-plus" (click)="openNew()"></button>
          <a routerLink="/worship">
            <button pButton label="View Worship Page" icon="pi pi-external-link" class="p-button-outlined p-button-sm"></button>
          </a>
        </div>

        <p-table [value]="links" [tableStyle]="{'min-width': '55rem'}">
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 60px">Order</th>
              <th>Title</th>
              <th>Schedule</th>
              <th style="width: 110px">Status</th>
              <th style="width: 200px"></th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-link>
            <tr>
              <td>{{ link.sortOrder ?? 0 }}</td>
              <td>
                <div class="link-title">{{ link.title }}</div>
                <div class="link-url"><i class="pi pi-link"></i> {{ link.joinUrl }}</div>
              </td>
              <td>{{ link.scheduleText || '—' }}</td>
              <td>
                <p-tag [value]="link.isActive ? 'Active' : 'Hidden'"
                       [severity]="link.isActive ? 'success' : 'warning'"></p-tag>
              </td>
              <td>
                <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm"
                        (click)="openEdit(link)" pTooltip="Edit"></button>
                <button pButton icon="pi pi-trash" class="p-button-danger p-button-text p-button-sm"
                        (click)="confirmDelete(link)" pTooltip="Delete"></button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="5" style="text-align: center; padding: 2rem; color: #999;">
              No Zoom links yet. Click "Add Zoom Link" to create one.
            </td></tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>

    <p-dialog [(visible)]="dialogVisible" [modal]="true" [style]="{width: '560px'}"
              [header]="editing?.id ? 'Edit Zoom Link' : 'New Zoom Link'"
              [closable]="true" [draggable]="false">
      <form [formGroup]="form" class="zoom-form" *ngIf="dialogVisible">
        <div class="field">
          <label>Title <span class="req">*</span></label>
          <input pInputText formControlName="title" placeholder="e.g., Men's Retreat Zoom Meeting" />
        </div>
        <div class="field">
          <label>Join URL <span class="req">*</span></label>
          <input pInputText formControlName="joinUrl" placeholder="https://zoom.us/j/..." />
        </div>
        <div class="field-row">
          <div class="field">
            <label>Meeting ID</label>
            <input pInputText formControlName="meetingId" placeholder="123 456 7890" />
          </div>
          <div class="field">
            <label>Passcode</label>
            <input pInputText formControlName="passcode" placeholder="optional" />
          </div>
        </div>
        <div class="field">
          <label>Schedule</label>
          <input pInputText formControlName="scheduleText" placeholder="e.g., Tuesdays at 7:00 PM PT" />
        </div>
        <div class="field">
          <label>Description</label>
          <textarea pInputTextarea formControlName="description" rows="3" placeholder="Optional notes about this meeting"></textarea>
        </div>
        <div class="field-row">
          <div class="field">
            <label>Sort Order</label>
            <p-inputNumber formControlName="sortOrder" [min]="0" [max]="9999"></p-inputNumber>
          </div>
          <div class="field switch-field">
            <label>Active</label>
            <p-inputSwitch formControlName="isActive"></p-inputSwitch>
            <small>Inactive links are hidden from the Worship page.</small>
          </div>
        </div>
      </form>
      <ng-template pTemplate="footer">
        <button pButton label="Cancel" icon="pi pi-times" class="p-button-text" (click)="dialogVisible = false"></button>
        <button pButton [label]="editing?.id ? 'Save' : 'Create'" icon="pi pi-check"
                [disabled]="form.invalid || saving" [loading]="saving" (click)="save()"></button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .zoom-admin-container { max-width: 1200px; margin: 0 auto; }
    .back-bar { margin-bottom: 1rem; }
    .back-link {
      display: inline-flex; align-items: center; gap: 0.5rem;
      color: #1a3a4a; text-decoration: none; font-weight: 600; font-size: 0.9rem;
      padding: 0.5rem 1rem; border-radius: 8px; transition: all 0.2s;
      &:hover { background: rgba(26, 58, 74, 0.08); color: #d4782f; }
    }
    .page-header {
      text-align: center; padding: 2rem; color: #f0e6d0; border-radius: 12px; margin-bottom: 1.5rem;
      background: var(--retreat-grad-nav);
      h1 { font-size: 1.8rem; font-weight: 700; margin: 0 0 0.35rem; }
      p { font-size: 0.95rem; margin: 0; opacity: 0.9; }
    }
    .card-header-bar {
      display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.5rem;
      background: var(--retreat-grad-nav); color: #f0e6d0;
      font-size: 1.1rem; font-weight: 600;
    }
    .toolbar {
      display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1rem;
      a { text-decoration: none; margin-left: auto; }
    }
    .link-title { font-weight: 600; color: #1a3a4a; }
    .link-url {
      font-size: 0.78rem; color: #6c757d; margin-top: 2px;
      max-width: 380px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      i { font-size: 0.7rem; margin-right: 0.25rem; }
    }
    .zoom-form { display: flex; flex-direction: column; gap: 0.9rem; padding-top: 0.5rem; }
    .field { display: flex; flex-direction: column; gap: 0.35rem;
      label { font-size: 0.85rem; color: #1a3a4a; font-weight: 600; }
      .req { color: #d4782f; }
      input, textarea { width: 100%; }
      small { color: #6c757d; font-size: 0.78rem; }
    }
    .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .switch-field { flex-direction: row; align-items: center; gap: 0.65rem;
      label { margin: 0; }
      small { flex-basis: 100%; }
    }
    ::ng-deep .zoom-admin-container .p-card { border-radius: 12px; overflow: hidden;
      .p-card-header { padding: 0; border-bottom: none; }
      .p-card-body { padding: 1.5rem; } .p-card-content { padding: 0; }
    }
    ::ng-deep .zoom-admin-container .p-datatable .p-datatable-thead > tr > th {
      background: var(--retreat-grad-nav); color: #f0e6d0;
    }
  `]
})
export class ZoomLinksAdminComponent implements OnInit {
  private fb = inject(FormBuilder);
  private zoomService = inject(ZoomLinkService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  links: ZoomLink[] = [];
  dialogVisible = false;
  editing: ZoomLink | null = null;
  saving = false;

  form: FormGroup = this.fb.group({
    title: ['', Validators.required],
    joinUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
    meetingId: [''],
    passcode: [''],
    scheduleText: [''],
    description: [''],
    sortOrder: [0],
    isActive: [true],
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.zoomService.listAll().subscribe({
      next: (data) => { this.links = data || []; },
      error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load Zoom links' }); }
    });
  }

  openNew(): void {
    this.editing = null;
    this.form.reset({ title: '', joinUrl: '', meetingId: '', passcode: '', scheduleText: '', description: '', sortOrder: 0, isActive: true });
    this.dialogVisible = true;
  }

  openEdit(link: ZoomLink): void {
    this.editing = link;
    this.form.reset({
      title: link.title,
      joinUrl: link.joinUrl,
      meetingId: link.meetingId || '',
      passcode: link.passcode || '',
      scheduleText: link.scheduleText || '',
      description: link.description || '',
      sortOrder: link.sortOrder ?? 0,
      isActive: link.isActive ?? true,
    });
    this.dialogVisible = true;
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const payload: ZoomLink = this.form.value;
    const obs = this.editing?.id
      ? this.zoomService.update(this.editing.id, payload)
      : this.zoomService.create(payload);
    obs.subscribe({
      next: () => {
        this.saving = false;
        this.dialogVisible = false;
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: this.editing?.id ? 'Zoom link updated' : 'Zoom link created' });
        this.load();
      },
      error: () => {
        this.saving = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Save failed. Please try again.' });
      }
    });
  }

  confirmDelete(link: ZoomLink): void {
    this.confirmationService.confirm({
      message: `Delete the Zoom link "${link.title}"?`,
      header: 'Confirm Delete', icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (link.id == null) return;
        this.zoomService.delete(link.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Zoom link removed' });
            this.load();
          },
          error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Delete failed' }); }
        });
      }
    });
  }
}
