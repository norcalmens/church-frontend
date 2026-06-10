import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SettingsService } from '../../../services/settings.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CardModule, ButtonModule, InputNumberModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <div class="settings-container">
      <div class="back-bar">
        <a routerLink="/admin/dashboard" class="back-link"><i class="pi pi-arrow-left"></i> Back to Dashboard</a>
      </div>
      <div class="page-header">
        <h1>Retreat Settings</h1>
        <p>Admin-only knobs that take effect immediately, no redeploy required</p>
      </div>

      <p-card>
        <ng-template pTemplate="header">
          <div class="card-header-bar"><i class="pi pi-users"></i><span>Capacity</span></div>
        </ng-template>
        <div class="setting-row">
          <div class="setting-label">
            <strong>Retreat capacity</strong>
            <p>Maximum total attendees the registration page will accept. Once reached, the form shows "All spaces have been filled" and the waitlist takes over.</p>
          </div>
          <div class="setting-control">
            <p-inputNumber [(ngModel)]="capacity" [min]="1" [max]="500" [showButtons]="true" buttonLayout="horizontal" inputId="capacity"></p-inputNumber>
            <button pButton label="Save" icon="pi pi-check" (click)="save()" [disabled]="saving || capacity === original" [loading]="saving"></button>
          </div>
        </div>
        <p class="hint" *ngIf="capacity !== original">
          <i class="pi pi-info-circle"></i>
          Unsaved &mdash; previous value: <strong>{{ original }}</strong>
        </p>
      </p-card>
    </div>
  `,
  styles: [`
    .settings-container { max-width: 800px; margin: 0 auto; }
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
    ::ng-deep .settings-container .p-card { border-radius: 12px; overflow: hidden;
      .p-card-header { padding: 0; border-bottom: none; }
      .p-card-body { padding: 1.5rem 1.75rem; }
      .p-card-content { padding: 0; }
    }
    .setting-row { display: flex; gap: 1.5rem; align-items: center; flex-wrap: wrap; }
    .setting-label { flex: 1; min-width: 250px;
      strong { color: #1a3a4a; font-size: 1.05rem; }
      p { color: #495057; margin: 0.35rem 0 0; line-height: 1.5; font-size: 0.92rem; }
    }
    .setting-control { display: flex; gap: 0.6rem; align-items: center; }
    .hint { margin: 1rem 0 0; color: #6e4b08; background: #fff7e0;
      border-left: 4px solid #d4782f; border-radius: 6px; padding: 0.6rem 0.85rem; font-size: 0.9rem;
      i { color: #d4782f; margin-right: 0.4rem; }
      strong { color: #8a4a08; }
    }
    @media (max-width: 600px) {
      .setting-control { width: 100%; ::ng-deep .p-button, ::ng-deep .p-inputnumber { flex: 1; } }
    }
  `]
})
export class AdminSettingsComponent implements OnInit {
  private settingsService = inject(SettingsService);
  private messageService = inject(MessageService);

  capacity = 35;
  original = 35;
  saving = false;

  ngOnInit(): void {
    this.settingsService.getCapacity().subscribe({
      next: (c) => { this.capacity = c; this.original = c; },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load capacity' })
    });
  }

  save(): void {
    if (this.saving) return;
    this.saving = true;
    this.settingsService.setCapacity(this.capacity).subscribe({
      next: (c) => {
        this.saving = false;
        this.original = c;
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: `Capacity set to ${c}` });
      },
      error: () => {
        this.saving = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save capacity' });
      }
    });
  }
}
