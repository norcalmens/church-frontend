import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { MeetingNotesService, MeetingNote, MeetingNoteAttachment } from '../../../services/meeting-notes.service';
import { AuthService } from '../../../core/auth/auth.service';

/**
 * Committee/admin meeting notes CRUD + file attachments.
 * List left, detail/edit dialog right. Attachments upload after the note
 * exists (so we have a note-id to associate them with).
 */
@Component({
  selector: 'app-meeting-notes-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink,
            CardModule, TableModule, ButtonModule, InputTextModule, InputTextareaModule,
            CalendarModule, DialogModule, ToastModule, ConfirmDialogModule, TooltipModule],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
    <div class="notes-container">
      <div class="back-bar">
        <a routerLink="/admin/dashboard" class="back-link"><i class="pi pi-arrow-left"></i> Back to Dashboard</a>
      </div>
      <div class="page-header"><h1>Meeting Notes</h1><p>Committee-internal notes, decisions, and attached documents</p></div>

      <p-card>
        <ng-template pTemplate="header">
          <div class="card-header-bar"><i class="pi pi-file-edit"></i><span>Notes ({{ notes.length }})</span></div>
        </ng-template>
        <div class="toolbar">
          <span class="p-input-icon-left search-wrap">
            <i class="pi pi-search"></i>
            <input pInputText [(ngModel)]="searchTerm" placeholder="Search title, body, attendees..." (input)="filter()" />
          </span>
          <button pButton label="New Note" icon="pi pi-plus" (click)="openNew()"></button>
        </div>

        <p-table [value]="filtered" [paginator]="true" [rows]="15" [rowsPerPageOptions]="[15, 30, 60]"
                 [sortField]="'meetingDate'" [sortOrder]="-1"
                 [tableStyle]="{'min-width': '55rem'}"
                 [showCurrentPageReport]="true"
                 currentPageReportTemplate="Showing {first} to {last} of {totalRecords}">
          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="meetingDate" style="width: 130px;">Date <p-sortIcon field="meetingDate"></p-sortIcon></th>
              <th pSortableColumn="title">Title <p-sortIcon field="title"></p-sortIcon></th>
              <th>Attendees</th>
              <th style="width: 100px; text-align: center;">Files</th>
              <th pSortableColumn="createdBy" style="width: 140px;">By <p-sortIcon field="createdBy"></p-sortIcon></th>
              <th style="width: 130px;"></th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-n>
            <tr>
              <td>{{ n.meetingDate | date:'MMM d, y' }}</td>
              <td>
                <a href="#" (click)="openEdit(n); $event.preventDefault()" class="title-link">{{ n.title }}</a>
              </td>
              <td class="attendees-cell">{{ n.attendees || '—' }}</td>
              <td style="text-align: center;">
                <span *ngIf="n.attachments?.length; else noFiles" class="file-count">
                  <i class="pi pi-paperclip"></i> {{ n.attachments.length }}
                </span>
                <ng-template #noFiles><span class="muted">—</span></ng-template>
              </td>
              <td>{{ n.createdBy || '—' }}</td>
              <td class="row-actions">
                <button pButton icon="pi pi-eye" class="p-button-text p-button-sm"
                        (click)="openEdit(n)" pTooltip="View / edit"></button>
                <button *ngIf="auth.isAdmin()" pButton icon="pi pi-trash"
                        class="p-button-danger p-button-text p-button-sm"
                        (click)="confirmDelete(n)" pTooltip="Delete note"></button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="6" style="text-align: center; padding: 2rem; color: #999;">No meeting notes yet. Click "New Note" to add one.</td></tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>

    <!-- Create/Edit dialog -->
    <p-dialog [(visible)]="dialogVisible" [modal]="true" [style]="{width: '720px'}"
              [header]="editing?.id ? 'Edit Meeting Note' : 'New Meeting Note'"
              [closable]="true" [draggable]="false" [breakpoints]="{'800px': '95vw'}">
      <form [formGroup]="form" class="note-form">
        <div class="field-row">
          <div class="field flex-2">
            <label>Title <span class="req">*</span></label>
            <input pInputText formControlName="title" placeholder="e.g. Planning committee sync" />
          </div>
          <div class="field flex-1">
            <label>Meeting Date <span class="req">*</span></label>
            <p-calendar formControlName="meetingDate" dateFormat="yy-mm-dd" [showIcon]="true" appendTo="body"></p-calendar>
          </div>
        </div>
        <div class="field">
          <label>Attendees <span class="optional">(comma-separated)</span></label>
          <input pInputText formControlName="attendees" placeholder="Bro. Washington, Patrick, Mike, Otheree" />
        </div>
        <div class="field">
          <label>Notes</label>
          <textarea pInputTextarea formControlName="body" rows="10"
                    placeholder="Agenda, decisions, action items..."></textarea>
        </div>

        <!-- Attachments -- only shown for saved notes (need an id to upload against) -->
        <div class="attachments-section" *ngIf="editing?.id">
          <div class="attachments-header">
            <h4><i class="pi pi-paperclip"></i> Attachments</h4>
            <button pButton type="button" label="Upload File" icon="pi pi-upload"
                    class="p-button-sm p-button-outlined"
                    (click)="fileInput.click()" [disabled]="uploading"></button>
            <input #fileInput type="file" hidden (change)="onFileSelected($event)" />
          </div>
          <div *ngIf="editing?.attachments?.length; else noAttachments" class="attachments-list">
            <div *ngFor="let a of editing?.attachments" class="attachment-row">
              <i class="pi pi-file"></i>
              <a [href]="svc.downloadUrl(a.id)" target="_blank" rel="noopener" class="att-name">{{ a.fileName }}</a>
              <span class="att-size">{{ formatBytes(a.fileSize) }}</span>
              <span class="att-meta">{{ a.uploadedBy }} · {{ a.uploadedAt | date:'short' }}</span>
              <button *ngIf="auth.isAdmin()" pButton icon="pi pi-times"
                      class="p-button-danger p-button-text p-button-sm"
                      (click)="deleteAttachment(a)" pTooltip="Remove file"></button>
            </div>
          </div>
          <ng-template #noAttachments>
            <p class="muted attachments-empty">No files attached yet. Click "Upload File" to add one (10 MB max per file).</p>
          </ng-template>
          <p *ngIf="uploading" class="uploading-note"><i class="pi pi-spin pi-spinner"></i> Uploading {{ uploadingName }}…</p>
        </div>
        <p *ngIf="!editing?.id" class="save-first-note"><i class="pi pi-info-circle"></i> Save the note first, then you can attach files.</p>
      </form>
      <ng-template pTemplate="footer">
        <button pButton label="Cancel" icon="pi pi-times" class="p-button-text" (click)="dialogVisible = false" [disabled]="saving"></button>
        <button pButton [label]="editing?.id ? 'Save Changes' : 'Save'" icon="pi pi-check"
                [disabled]="form.invalid || saving" [loading]="saving" (click)="save()"></button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .notes-container { max-width: 1400px; margin: 0 auto; }
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
    .card-header-bar { display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.5rem;
      background: var(--retreat-grad-nav); color: var(--retreat-cream); font-size: 1.1rem; font-weight: 600;
    }
    .toolbar { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1rem;
      .search-wrap { min-width: 320px; flex: 1; max-width: 500px; }
    }
    .title-link { color: var(--retreat-teal-dark); font-weight: 600; text-decoration: none;
      &:hover { color: var(--retreat-sunset); text-decoration: underline; }
    }
    .attendees-cell { color: #495057; font-size: 0.92rem; max-width: 320px;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .file-count { display: inline-flex; align-items: center; gap: 0.35rem;
      background: rgba(26, 58, 74, 0.08); padding: 0.2rem 0.55rem; border-radius: 999px;
      color: var(--retreat-teal-dark); font-weight: 600; font-size: 0.85rem;
      i { font-size: 0.85rem; color: var(--retreat-sunset); }
    }
    .muted { color: #999; }
    .row-actions { white-space: nowrap; text-align: right; }
    ::ng-deep .notes-container .p-card { border-radius: 12px; overflow: hidden;
      .p-card-header { padding: 0; border-bottom: none; }
      .p-card-body { padding: 1.5rem; } .p-card-content { padding: 0; }
    }
    ::ng-deep .notes-container .p-datatable .p-datatable-thead > tr > th {
      background: var(--retreat-grad-nav); color: var(--retreat-cream);
    }

    /* Dialog form */
    .note-form { display: flex; flex-direction: column; gap: 1rem; padding: 0.25rem 0; }
    .field { display: flex; flex-direction: column; gap: 0.35rem;
      label { font-size: 0.85rem; font-weight: 600; color: var(--retreat-teal-dark); }
      .req { color: var(--retreat-sunset); }
      .optional { color: #9aa0a6; font-weight: 400; font-size: 0.82em; }
      input, textarea { width: 100%; }
    }
    .field-row { display: flex; gap: 1rem;
      .flex-2 { flex: 2; } .flex-1 { flex: 1; }
    }
    ::ng-deep .note-form .p-calendar, ::ng-deep .note-form .p-calendar input { width: 100%; }

    .attachments-section { margin-top: 0.5rem; padding: 1rem;
      background: rgba(26, 58, 74, 0.04); border-radius: 8px;
      border: 1px dashed rgba(26, 58, 74, 0.2);
    }
    .attachments-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;
      h4 { margin: 0; color: var(--retreat-teal-dark); font-size: 0.95rem; display: inline-flex; align-items: center; gap: 0.4rem;
        i { color: var(--retreat-sunset); }
      }
    }
    .attachments-list { display: flex; flex-direction: column; gap: 0.4rem; }
    .attachment-row { display: flex; align-items: center; gap: 0.65rem;
      padding: 0.45rem 0.6rem; background: #fff; border-radius: 6px;
      i { color: var(--retreat-sunset); }
      .att-name { color: var(--retreat-teal-dark); font-weight: 600; text-decoration: none; flex: 1;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        &:hover { text-decoration: underline; }
      }
      .att-size { color: #6c757d; font-size: 0.82rem; }
      .att-meta { color: #999; font-size: 0.78rem; }
    }
    .attachments-empty { margin: 0; font-size: 0.88rem; }
    .uploading-note { margin: 0.6rem 0 0; font-size: 0.88rem; color: var(--retreat-teal-dark);
      i { color: var(--retreat-sunset); margin-right: 0.35rem; }
    }
    .save-first-note { margin: 0.5rem 0 0; padding: 0.6rem 0.85rem;
      background: #fff7e0; border-left: 3px solid var(--retreat-gold); border-radius: 4px;
      font-size: 0.88rem; color: #6e4b08;
      i { color: var(--retreat-sunset); margin-right: 0.4rem; }
    }
  `]
})
export class MeetingNotesAdminComponent implements OnInit {
  svc = inject(MeetingNotesService);
  private toast = inject(MessageService);
  private confirm = inject(ConfirmationService);
  private fb = inject(FormBuilder);
  auth = inject(AuthService);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  notes: MeetingNote[] = [];
  filtered: MeetingNote[] = [];
  searchTerm = '';

  dialogVisible = false;
  saving = false;
  editing: MeetingNote | null = null;

  uploading = false;
  uploadingName = '';

  form = this.fb.group({
    title:       ['', [Validators.required, Validators.maxLength(300)]],
    meetingDate: [null as Date | null, Validators.required],
    attendees:   [''],
    body:        [''],
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.svc.list().subscribe({
      next: (data) => { this.notes = data || []; this.filter(); },
      error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load notes' })
    });
  }

  filter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filtered = !term ? [...this.notes] : this.notes.filter(n => {
      const hay = `${n.title} ${n.body || ''} ${n.attendees || ''}`.toLowerCase();
      return hay.includes(term);
    });
  }

  openNew(): void {
    this.editing = { title: '', meetingDate: '' };
    this.form.reset({
      title: '',
      meetingDate: new Date(),
      attendees: '',
      body: '',
    });
    this.dialogVisible = true;
  }

  openEdit(n: MeetingNote): void {
    // Load fresh detail so attachments are up-to-date in case list is stale
    this.svc.get(n.id!).subscribe({
      next: (fresh) => {
        this.editing = fresh;
        this.form.reset({
          title: fresh.title,
          meetingDate: fresh.meetingDate ? new Date(fresh.meetingDate + 'T00:00:00') : null,
          attendees: fresh.attendees || '',
          body: fresh.body || '',
        });
        this.dialogVisible = true;
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load note' })
    });
  }

  save(): void {
    if (this.form.invalid || this.saving) return;
    this.saving = true;
    const v = this.form.value;
    const payload: MeetingNote = {
      title: (v.title || '').trim(),
      meetingDate: this.toIsoDate(v.meetingDate as Date),
      attendees: v.attendees?.trim() || undefined,
      body: v.body?.trim() || undefined,
    };
    const obs = this.editing?.id
      ? this.svc.update(this.editing.id, payload)
      : this.svc.create(payload);
    obs.subscribe({
      next: (saved) => {
        this.saving = false;
        // Merge saved data back into `editing` so the attachments block
        // unlocks and can host uploads immediately after first save.
        this.editing = { ...this.editing, ...saved };
        this.toast.add({ severity: 'success', summary: 'Saved',
          detail: this.editing?.id ? 'Note saved' : 'Note created', life: 2500 });
        this.load();
      },
      error: (e) => {
        this.saving = false;
        this.toast.add({ severity: 'error', summary: 'Error', detail: e?.error?.message || 'Failed to save note' });
      }
    });
  }

  confirmDelete(n: MeetingNote): void {
    if (n.id == null) return;
    this.confirm.confirm({
      header: 'Delete note',
      icon: 'pi pi-exclamation-triangle',
      message: `Delete "${n.title}" and all its attachments?`,
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.svc.delete(n.id!).subscribe({
          next: () => { this.toast.add({ severity: 'success', summary: 'Deleted', detail: 'Note removed', life: 2000 }); this.load(); },
          error: (e) => this.toast.add({ severity: 'error', summary: 'Error', detail: e?.error?.message || 'Failed to delete' })
        });
      }
    });
  }

  onFileSelected(evt: Event): void {
    const el = evt.target as HTMLInputElement;
    const file = el.files?.[0];
    if (!file || !this.editing?.id) return;
    this.uploading = true;
    this.uploadingName = file.name;
    this.svc.uploadAttachment(this.editing.id, file).subscribe({
      next: (a) => {
        this.uploading = false;
        this.uploadingName = '';
        this.editing!.attachments = [...(this.editing!.attachments || []), a];
        el.value = '';   // reset so re-uploading same file works
        this.toast.add({ severity: 'success', summary: 'Uploaded', detail: a.fileName, life: 2500 });
        this.load();     // refresh list count
      },
      error: (e) => {
        this.uploading = false;
        this.uploadingName = '';
        el.value = '';
        this.toast.add({ severity: 'error', summary: 'Upload failed',
          detail: e?.error?.message || 'Could not upload the file' });
      }
    });
  }

  deleteAttachment(a: MeetingNoteAttachment): void {
    this.confirm.confirm({
      header: 'Remove file',
      icon: 'pi pi-exclamation-triangle',
      message: `Remove "${a.fileName}"?`,
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.svc.deleteAttachment(a.id).subscribe({
          next: () => {
            this.editing!.attachments = (this.editing!.attachments || []).filter(x => x.id !== a.id);
            this.toast.add({ severity: 'success', summary: 'Removed', detail: a.fileName, life: 2000 });
            this.load();
          },
          error: (e) => this.toast.add({ severity: 'error', summary: 'Error', detail: e?.error?.message || 'Failed to remove file' })
        });
      }
    });
  }

  formatBytes(n?: number): string {
    if (!n && n !== 0) return '';
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / 1024 / 1024).toFixed(1)} MB`;
  }

  private toIsoDate(d: Date): string {
    if (!d) return '';
    // Local-timezone date -> YYYY-MM-DD (avoid UTC shift that would put
    // a US evening meeting on the wrong calendar day)
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
