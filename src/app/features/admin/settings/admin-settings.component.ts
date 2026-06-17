import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SettingsService, SocialLinks } from '../../../services/settings.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CardModule, ButtonModule, InputNumberModule, InputTextModule, InputSwitchModule, ToastModule],
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

      <p-card class="social-card">
        <ng-template pTemplate="header">
          <div class="card-header-bar"><i class="pi pi-share-alt"></i><span>Social Links</span></div>
        </ng-template>
        <div class="social-intro">
          Paste full URLs (with <code>https://</code>) and flip the master switch when you're ready
          to show icons site-wide. With the switch off, every icon stays hidden even if the URLs
          are filled in &mdash; useful for pre-loading the Facebook link without revealing it yet.
        </div>
        <div class="social-master">
          <div class="social-master-label">
            <strong>Show social icons site-wide</strong>
            <p>
              Master switch. When off, the footer and topbar render no social icons regardless of which URLs are saved.
              Currently <strong>{{ social.enabled ? 'visible' : 'hidden' }}</strong>.
            </p>
          </div>
          <p-inputSwitch [(ngModel)]="social.enabled"></p-inputSwitch>
        </div>
        <div class="social-row">
          <label><i class="pi pi-facebook fb"></i> Facebook</label>
          <input pInputText [(ngModel)]="social.facebook" placeholder="https://facebook.com/your-page" />
          <p-inputSwitch [(ngModel)]="social.showFacebook" pTooltip="Show this icon"></p-inputSwitch>
        </div>
        <div class="social-row">
          <label><i class="pi pi-instagram ig"></i> Instagram</label>
          <input pInputText [(ngModel)]="social.instagram" placeholder="https://instagram.com/your-handle" />
          <p-inputSwitch [(ngModel)]="social.showInstagram" pTooltip="Show this icon"></p-inputSwitch>
        </div>
        <div class="social-row">
          <label><i class="pi pi-youtube yt"></i> YouTube</label>
          <input pInputText [(ngModel)]="social.youtube" placeholder="https://youtube.com/@your-channel" />
          <p-inputSwitch [(ngModel)]="social.showYoutube" pTooltip="Show this icon"></p-inputSwitch>
        </div>
        <div class="social-actions">
          <button pButton label="Save Social Links" icon="pi pi-check"
                  (click)="saveSocial()" [disabled]="savingSocial || !socialChanged" [loading]="savingSocial"></button>
        </div>
        <p class="hint" *ngIf="socialChanged">
          <i class="pi pi-info-circle"></i>
          Unsaved changes.
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

    .social-card { margin-top: 1.25rem; }
    .social-intro {
      color: #495057; font-size: 0.92rem; line-height: 1.5;
      margin-bottom: 1rem;
      code { background: rgba(26,58,74,0.06); padding: 0.05rem 0.35rem; border-radius: 4px; font-size: 0.88em; }
    }
    .social-master {
      display: flex; align-items: center; gap: 1.25rem;
      background: linear-gradient(135deg, #fffaf0 0%, #fff 100%);
      border: 1px solid #e8a832; border-left: 4px solid #d4782f;
      border-radius: 8px; padding: 0.85rem 1rem;
      margin-bottom: 1.25rem;
      .social-master-label { flex: 1;
        strong { color: #1a3a4a; font-size: 1.02rem; }
        p { color: #495057; font-size: 0.88rem; margin: 0.2rem 0 0; line-height: 1.4;
          strong { color: #b8651f; }
        }
      }
    }
    .social-row {
      display: grid; grid-template-columns: 140px 1fr auto; gap: 0.85rem; align-items: center;
      margin-bottom: 0.85rem;
      label { display: flex; align-items: center; gap: 0.5rem; color: #1a3a4a; font-weight: 600; font-size: 0.95rem;
        i { font-size: 1.1rem;
          &.fb { color: #1877f2; }
          &.ig { color: #cc2366; }
          &.yt { color: #ff0000; }
        }
      }
      input { width: 100%; }
    }
    .social-actions { display: flex; justify-content: flex-end; margin-top: 0.5rem; }
    @media (max-width: 600px) {
      .social-row { grid-template-columns: 1fr; gap: 0.35rem; }
    }
  `]
})
export class AdminSettingsComponent implements OnInit {
  private settingsService = inject(SettingsService);
  private messageService = inject(MessageService);

  capacity = 35;
  original = 35;
  saving = false;

  social: SocialLinks = {
    enabled: false,
    showFacebook: true, showInstagram: true, showYoutube: true,
    facebook: '', instagram: '', youtube: '',
  };
  private socialOriginal: SocialLinks = {
    enabled: false,
    showFacebook: true, showInstagram: true, showYoutube: true,
    facebook: '', instagram: '', youtube: '',
  };
  savingSocial = false;

  get socialChanged(): boolean {
    return this.social.enabled       !== this.socialOriginal.enabled
        || this.social.showFacebook  !== this.socialOriginal.showFacebook
        || this.social.showInstagram !== this.socialOriginal.showInstagram
        || this.social.showYoutube   !== this.socialOriginal.showYoutube
        || this.social.facebook      !== this.socialOriginal.facebook
        || this.social.instagram     !== this.socialOriginal.instagram
        || this.social.youtube       !== this.socialOriginal.youtube;
  }

  ngOnInit(): void {
    this.settingsService.getCapacity().subscribe({
      next: (c) => { this.capacity = c; this.original = c; },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load capacity' })
    });
    this.settingsService.loadSocialLinks().subscribe({
      next: (links) => {
        this.social = { ...links };
        this.socialOriginal = { ...links };
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load social links' })
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

  saveSocial(): void {
    if (this.savingSocial) return;
    this.savingSocial = true;
    this.settingsService.setSocialLinks(this.social).subscribe({
      next: (links) => {
        this.savingSocial = false;
        this.social = { ...links };
        this.socialOriginal = { ...links };
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Social links updated' });
      },
      error: (e) => {
        this.savingSocial = false;
        const msg = e?.error?.message || 'Failed to save social links';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
      }
    });
  }
}
