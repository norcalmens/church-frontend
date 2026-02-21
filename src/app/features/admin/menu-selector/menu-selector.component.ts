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
  { key: 'home', label: 'Home', icon: 'pi-home', adminOnly: false },
  { key: 'registration', label: 'Register', icon: 'pi-pencil', adminOnly: false },
  { key: 'venue', label: 'Venue', icon: 'pi-map', adminOnly: false },
  { key: 'payment', label: 'Payment', icon: 'pi-credit-card', adminOnly: false },
  { key: 'theme-poll', label: 'Theme Poll', icon: 'pi-chart-bar', adminOnly: true },
  { key: 'admin/dashboard', label: 'Dashboard', icon: 'pi-chart-line', adminOnly: true },
  { key: 'admin/registrations', label: 'All Registrations', icon: 'pi-list', adminOnly: true },
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
        <div class="flex justify-content-between w-full">
          <div>
            <button pButton label="Hide All" icon="pi pi-eye-slash"
                    class="p-button-outlined p-button-danger p-button-sm mr-2"
                    (click)="onHideAll()"></button>
            <button pButton label="Show All" icon="pi pi-eye"
                    class="p-button-outlined p-button-success p-button-sm mr-2"
                    (click)="onShowAll()"></button>
            <button pButton label="Reset" icon="pi pi-refresh"
                    class="p-button-outlined p-button-sm"
                    (click)="onReset()"></button>
          </div>
          <button pButton label="Close" icon="pi pi-times"
                  class="p-button-text p-button-sm"
                  (click)="visible = false"></button>
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    :host ::ng-deep .menu-selector-dialog .p-dialog-content {
      padding-bottom: 0;
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
