import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { MenuVisibilityService } from '../../../core/services/menu-visibility.service';

export interface MenuItem {
  key: string;
  label: string;
  icon: string;
  adminOnly: boolean;
}

export const MENU_ITEMS: MenuItem[] = [
  // Public nav
  { key: 'home',                 label: 'Home',               icon: 'pi-home',          adminOnly: false },
  { key: 'registration',         label: 'Register',           icon: 'pi-pencil',        adminOnly: false },
  { key: 'venue',                label: 'Venue',              icon: 'pi-map',           adminOnly: false },
  { key: 'directions',           label: 'Directions',         icon: 'pi-map-marker',    adminOnly: false },
  { key: 'itinerary',            label: 'Itinerary',          icon: 'pi-calendar',      adminOnly: false },
  { key: 'worship',              label: 'Worship',            icon: 'pi-video',         adminOnly: false },
  { key: 'qr-codes',             label: 'QR Codes',           icon: 'pi-qrcode',        adminOnly: false },
  { key: 'feedback',             label: 'Feedback',           icon: 'pi-comments',      adminOnly: false },
  { key: 'donations',            label: 'Donate',             icon: 'pi-heart',         adminOnly: false },
  // Admin-only top-level + admin dropdown
  { key: 'merchandise',          label: 'Merch',              icon: 'pi-shopping-bag',  adminOnly: true  },
  { key: 'theme-poll',           label: 'Theme Poll',         icon: 'pi-chart-bar',     adminOnly: true  },
  { key: 'admin/dashboard',      label: 'Dashboard',          icon: 'pi-chart-line',    adminOnly: true  },
  { key: 'admin/registrations',  label: 'All Registrations',  icon: 'pi-list',          adminOnly: true  },
  { key: 'admin/attendees',      label: 'All Attendees',      icon: 'pi-users',         adminOnly: true  },
  { key: 'admin/badges',         label: 'Print Name Badges',  icon: 'pi-id-card',       adminOnly: true  },
  { key: 'admin/waitlist',       label: '2027 Interest List', icon: 'pi-calendar-plus', adminOnly: true  },
  { key: 'admin/settings',       label: 'Settings',           icon: 'pi-cog',           adminOnly: true  },
  { key: 'admin/donations',      label: 'All Donations',      icon: 'pi-heart',         adminOnly: true  },
  { key: 'admin/payment-plans',  label: 'Payment Plans',      icon: 'pi-credit-card',   adminOnly: true  },
  { key: 'admin/users',          label: 'Manage Users',       icon: 'pi-users',         adminOnly: true  },
  { key: 'admin/zoom-links',     label: 'Manage Zoom Links',  icon: 'pi-video',         adminOnly: true  },
];

interface MenuCheckboxItem extends MenuItem {
  checked: boolean;
}

@Component({
  selector: 'app-menu-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, CheckboxModule, ButtonModule],
  template: `
    <p-dialog header="Menu Item Visibility"
              [(visible)]="visible"
              [modal]="true"
              [draggable]="false"
              [resizable]="false"
              [appendTo]="'body'"
              [style]="{width: '450px'}"
              [breakpoints]="{'640px': '95vw'}"
              styleClass="menu-selector-dialog">

      <p class="text-sm text-color-secondary mb-3">
        Toggle menu items on/off. Unchecked items will be hidden from the menu.
      </p>

      <div class="font-bold text-lg mb-2 pb-1"
           style="border-bottom: 2px solid #1a3a4a;">
        Public
      </div>
      <ng-container *ngFor="let item of items">
        <div *ngIf="!item.adminOnly" class="py-1 flex align-items-center">
          <p-checkbox [(ngModel)]="item.checked"
                      [binary]="true"
                      (onChange)="onToggle(item)"
                      [inputId]="item.key">
          </p-checkbox>
          <label [for]="item.key" class="ml-2 cursor-pointer">
            <i class="pi {{item.icon}} mr-1"></i> {{ item.label }}
          </label>
        </div>
      </ng-container>

      <div class="font-bold text-lg mb-2 mt-3 pb-1"
           style="border-bottom: 2px solid #1a3a4a;">
        Admin
      </div>
      <ng-container *ngFor="let item of items">
        <div *ngIf="item.adminOnly" class="py-1 flex align-items-center">
          <p-checkbox [(ngModel)]="item.checked"
                      [binary]="true"
                      (onChange)="onToggle(item)"
                      [inputId]="item.key">
          </p-checkbox>
          <label [for]="item.key" class="ml-2 cursor-pointer">
            <i class="pi {{item.icon}} mr-1"></i> {{ item.label }}
          </label>
        </div>
      </ng-container>

      <ng-template pTemplate="footer">
        <div class="menu-selector-footer">
          <div class="footer-actions">
            <button pButton label="Hide All" icon="pi pi-eye-slash"
                    class="p-button-outlined p-button-danger p-button-sm"
                    (click)="onHideAll()"></button>
            <button pButton label="Show All" icon="pi pi-eye"
                    class="p-button-outlined p-button-success p-button-sm"
                    (click)="onShowAll()"></button>
            <button pButton label="Reset" icon="pi pi-refresh"
                    class="p-button-outlined p-button-sm"
                    (click)="onReset()"></button>
          </div>
          <button pButton label="Close" icon="pi pi-times"
                  class="p-button-text p-button-sm close-btn"
                  (click)="visible = false"></button>
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    :host ::ng-deep .menu-selector-dialog {
      .p-dialog-content {
        padding-bottom: 0;
        max-height: 65vh;
        overflow-y: auto;
      }
      .p-dialog-footer { padding: 0.75rem 1.25rem; }
    }
    .menu-selector-footer {
      display: flex; justify-content: space-between; align-items: center;
      gap: 0.5rem; flex-wrap: wrap; width: 100%;
    }
    .footer-actions {
      display: flex; gap: 0.5rem; flex-wrap: wrap;
    }
    @media (max-width: 640px) {
      .menu-selector-footer { justify-content: stretch; }
      .footer-actions { flex: 1; }
      .footer-actions ::ng-deep .p-button { flex: 1; min-width: 0; }
      .close-btn { width: 100%; }
    }
  `]
})
export class MenuSelectorComponent {
  private menuVisibilityService = inject(MenuVisibilityService);

  visible = false;
  items: MenuCheckboxItem[] = [];

  open(): void {
    this.buildItemList();
    this.visible = true;
  }

  onToggle(item: MenuCheckboxItem): void {
    if (item.checked) {
      this.menuVisibilityService.showItem(item.key);
    } else {
      this.menuVisibilityService.hideItem(item.key);
    }
  }

  onHideAll(): void {
    const allKeys = this.items.map(i => i.key);
    this.menuVisibilityService.hideAll(allKeys);
    this.items.forEach(i => i.checked = false);
  }

  onShowAll(): void {
    this.menuVisibilityService.showAll();
    this.items.forEach(i => i.checked = true);
  }

  onReset(): void {
    this.menuVisibilityService.resetToDefault();
    this.items.forEach(i => i.checked = true);
  }

  private buildItemList(): void {
    const hidden = this.menuVisibilityService.getHiddenItems();
    this.items = MENU_ITEMS.map(item => ({
      ...item,
      checked: !hidden.has(item.key)
    }));
  }
}
