import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { FeedbackService, FeedbackEntry } from '../../../services/feedback.service';

@Component({
  selector: 'app-feedback-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CardModule, TableModule, ButtonModule, InputTextModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
    <div class="feedback-admin">
      <div class="back-bar">
        <a routerLink="/admin/dashboard" class="back-link"><i class="pi pi-arrow-left"></i> Back to Dashboard</a>
      </div>
      <div class="page-header">
        <h1>Retreat Feedback</h1>
        <p>What attendees said after the retreat &mdash; newest first.</p>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-label">Total</div>
          <div class="stat-value">{{ entries.length }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">With Rating</div>
          <div class="stat-value">{{ ratedCount }}</div>
        </div>
        <div class="stat-card highlight">
          <div class="stat-label">Avg Rating</div>
          <div class="stat-value">{{ avgRating === null ? '—' : avgRating.toFixed(1) }} <span class="suffix" *ngIf="avgRating !== null">/ 5</span></div>
        </div>
      </div>

      <p-card>
        <ng-template pTemplate="header">
          <div class="card-header-bar"><i class="pi pi-comments"></i><span>Submissions ({{ filtered.length }})</span></div>
        </ng-template>

        <div class="toolbar">
          <span class="p-input-icon-left search-wrap">
            <i class="pi pi-search"></i>
            <input pInputText [(ngModel)]="searchTerm" placeholder="Search name, email, or text..." (input)="filter()" />
          </span>
          <button *ngIf="selected.length" pButton
                  [label]="'Delete ' + selected.length + ' selected'" icon="pi pi-trash"
                  class="p-button-danger" (click)="confirmBulkDelete()"></button>
          <button pButton label="Download CSV" icon="pi pi-download" class="p-button-outlined"
                  (click)="exportCsv()" [disabled]="!entries.length"></button>
        </div>

        <p-table [value]="filtered" [(selection)]="selected" dataKey="id"
                 [paginator]="true" [rows]="10" [rowsPerPageOptions]="[10, 25, 50]"
                 [sortField]="'submittedAt'" [sortOrder]="-1" [tableStyle]="{'min-width': '60rem'}">
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 3rem"><p-tableHeaderCheckbox></p-tableHeaderCheckbox></th>
              <th pSortableColumn="submittedAt" style="width: 140px">Submitted <p-sortIcon field="submittedAt"></p-sortIcon></th>
              <th style="width: 180px">From</th>
              <th pSortableColumn="rating" style="width: 100px">Rating <p-sortIcon field="rating"></p-sortIcon></th>
              <th>Worked well</th>
              <th>Could improve</th>
              <th>Other</th>
              <th style="width: 50px"></th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-e>
            <tr>
              <td><p-tableCheckbox [value]="e"></p-tableCheckbox></td>
              <td>{{ e.submittedAt | date:'short' }}</td>
              <td>
                <div *ngIf="e.name; else anon"><strong>{{ e.name }}</strong></div>
                <ng-template #anon><span class="muted">Anonymous</span></ng-template>
                <div *ngIf="e.email" class="email"><a [href]="'mailto:' + e.email">{{ e.email }}</a></div>
              </td>
              <td class="rating-cell">
                <ng-container *ngIf="e.rating !== null && e.rating !== undefined; else noRating">
                  <span class="stars">
                    <i *ngFor="let s of [1,2,3,4,5]" class="pi"
                       [class.pi-star-fill]="s <= e.rating"
                       [class.pi-star]="s > e.rating"></i>
                  </span>
                </ng-container>
                <ng-template #noRating><span class="muted">—</span></ng-template>
              </td>
              <td class="text-cell">{{ e.worked || '—' }}</td>
              <td class="text-cell">{{ e.improve || '—' }}</td>
              <td class="text-cell">{{ e.other || '—' }}</td>
              <td>
                <button pButton icon="pi pi-trash" class="p-button-danger p-button-text p-button-sm"
                        (click)="confirmDelete(e)" pTooltip="Delete"></button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="8" style="text-align: center; padding: 2rem; color: #999;">No feedback yet.</td></tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>
  `,
  styles: [`
    .feedback-admin { max-width: 1400px; margin: 0 auto; }
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
    .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .stat-card {
      background: #fff; border-radius: 12px; padding: 1.25rem; text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      .stat-label { color: #6c757d; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; }
      .stat-value { color: var(--retreat-teal-dark); font-size: 1.8rem; font-weight: 700; margin-top: 0.35rem;
        .suffix { font-size: 1rem; color: #6c757d; font-weight: 500; }
      }
    }
    .stat-card.highlight { background: linear-gradient(135deg, var(--retreat-sunset) 0%, var(--retreat-sunset) 100%); color: #fff;
      .stat-label, .stat-value, .suffix { color: #fff; }
    }
    .card-header-bar {
      display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.5rem;
      background: var(--retreat-grad-nav);
      color: var(--retreat-cream); font-size: 1.1rem; font-weight: 600;
    }
    .toolbar { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem;
      .search-wrap { min-width: 280px; flex: 1; }
    }
    ::ng-deep .feedback-admin .p-card { border-radius: 12px; overflow: hidden;
      .p-card-header { padding: 0; border-bottom: none; }
      .p-card-body { padding: 1.5rem; }
      .p-card-content { padding: 0; }
    }
    ::ng-deep .feedback-admin .p-datatable .p-datatable-thead > tr > th {
      background: var(--retreat-grad-nav); color: var(--retreat-cream);
    }
    .email a { color: var(--retreat-sunset); font-size: 0.85rem; }
    .muted { color: #888; font-style: italic; }
    .rating-cell .stars i { font-size: 0.95rem; color: var(--retreat-gold); }
    .text-cell { max-width: 240px; vertical-align: top; padding: 0.5rem; line-height: 1.4;
      white-space: pre-wrap; word-wrap: break-word;
    }
  `]
})
export class FeedbackAdminComponent implements OnInit {
  private feedbackService = inject(FeedbackService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  entries: FeedbackEntry[] = [];
  filtered: FeedbackEntry[] = [];
  selected: FeedbackEntry[] = [];
  searchTerm = '';

  get ratedCount(): number { return this.entries.filter(e => e.rating != null).length; }
  get avgRating(): number | null {
    const rated = this.entries.filter(e => e.rating != null);
    if (!rated.length) return null;
    return rated.reduce((sum, e) => sum + (e.rating as number), 0) / rated.length;
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.feedbackService.list().subscribe({
      next: (data) => { this.entries = data || []; this.filter(); },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load feedback' })
    });
  }

  filter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filtered = !term ? [...this.entries] : this.entries.filter(e => {
      const hay = `${e.name || ''} ${e.email || ''} ${e.worked || ''} ${e.improve || ''} ${e.other || ''}`.toLowerCase();
      return hay.includes(term);
    });
  }

  confirmBulkDelete(): void {
    const n = this.selected.length;
    if (!n) return;
    this.confirmationService.confirm({
      header: 'Delete Selected',
      icon: 'pi pi-exclamation-triangle',
      message: `Delete ${n} feedback ${n === 1 ? 'entry' : 'entries'}? This cannot be undone.`,
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        const calls = this.selected.filter(e => e.id).map(e => this.feedbackService.delete(e.id!));
        if (!calls.length) return;
        forkJoin(calls).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `${n} ${n === 1 ? 'entry' : 'entries'} removed`, life: 2000 });
            this.selected = [];
            this.load();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Some entries failed to delete -- reloading' });
            this.load();
          }
        });
      }
    });
  }

  confirmDelete(e: FeedbackEntry): void {
    const who = e.name || e.email || 'this anonymous submission';
    this.confirmationService.confirm({
      header: 'Delete Feedback',
      icon: 'pi pi-exclamation-triangle',
      message: `Delete feedback from ${who}?`,
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        if (!e.id) return;
        this.feedbackService.delete(e.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Feedback removed', life: 2000 });
            this.load();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete' })
        });
      }
    });
  }

  exportCsv(): void {
    const cols: [string, (e: FeedbackEntry) => unknown][] = [
      ['Submitted', e => e.submittedAt],
      ['Name', e => e.name],
      ['Email', e => e.email],
      ['Rating', e => e.rating],
      ['Worked well', e => e.worked],
      ['Could improve', e => e.improve],
      ['Other', e => e.other],
    ];
    const esc = (v: unknown): string => {
      const s = v == null ? '' : String(v);
      return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const header = cols.map(c => c[0]).join(',');
    const body = this.entries.map(e => cols.map(c => esc(c[1](e))).join(','));
    const csv = [header, ...body].join('\r\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `feedback-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
