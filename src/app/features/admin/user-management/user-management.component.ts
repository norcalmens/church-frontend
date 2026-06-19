import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { MenuModule } from 'primeng/menu';
import { Menu } from 'primeng/menu';
import { ViewChild } from '@angular/core';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import { UserDTO } from '../../../core/auth/auth.types';
import { UserManagementService, AdminCreateUserRequest } from '../../../services/user-management.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink, TableModule, ButtonModule, DialogModule,
    InputTextModule, DropdownModule, TagModule, ToastModule, ConfirmDialogModule,
    ToolbarModule, TooltipModule, MenuModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="user-mgmt-container">
      <div class="back-bar">
        <a routerLink="/admin/dashboard" class="back-link"><i class="pi pi-arrow-left"></i> Back to Dashboard</a>
      </div>
      <div class="page-header">
        <h1>User Management</h1>
        <p>Create and manage user accounts</p>
      </div>

      <p-toolbar>
        <div class="p-toolbar-group-start">
          <button pButton label="Create User" icon="pi pi-user-plus" (click)="showCreateDialog()"></button>
        </div>
        <div class="p-toolbar-group-end">
          <span class="p-input-icon-left">
            <i class="pi pi-search"></i>
            <input pInputText type="text" [(ngModel)]="searchText" placeholder="Search users..." (input)="dt.filterGlobal(searchText, 'contains')" />
          </span>
        </div>
      </p-toolbar>

      <p-table #dt [value]="users" [globalFilterFields]="['username','email','firstName','lastName']"
               [paginator]="true" [rows]="10" [rowsPerPageOptions]="[10,25,50]"
               [loading]="loading" styleClass="p-datatable-sm">
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="firstName">Name <p-sortIcon field="firstName"></p-sortIcon></th>
            <th pSortableColumn="username">Username <p-sortIcon field="username"></p-sortIcon></th>
            <th pSortableColumn="email">Email <p-sortIcon field="email"></p-sortIcon></th>
            <th>Role(s)</th>
            <th>Status</th>
            <th>Last Login</th>
            <th style="width: 200px">Actions</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-user>
          <tr>
            <td>{{ user.firstName }} {{ user.lastName }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.email }}</td>
            <td>
              <p-tag *ngFor="let role of user.roles" [value]="role" [severity]="getRoleSeverity(role)" styleClass="mr-1"></p-tag>
            </td>
            <td>
              <p-tag *ngIf="user.isLocked" value="Locked" severity="danger"></p-tag>
              <p-tag *ngIf="!user.isActive" value="Inactive" severity="warning"></p-tag>
              <p-tag *ngIf="user.isActive && !user.isLocked" value="Active" severity="success"></p-tag>
            </td>
            <td>{{ user.lastLogin ? (user.lastLogin | date:'short') : 'Never' }}</td>
            <td class="actions-cell">
              <!-- Edit stays as a primary one-click action. Everything else
                   collapses into a single Actions menu so each row only has
                   two controls regardless of how many tools we add later. -->
              <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm primary-action"
                      pTooltip="Edit" (click)="showEditDialog(user)"></button>
              <button pButton icon="pi pi-ellipsis-v" class="p-button-text p-button-sm"
                      pTooltip="More actions"
                      (click)="openActionsMenu($event, user)"></button>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="7" style="text-align: center; padding: 2rem;">No users found.</td></tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Shared actions menu -- one instance, repositioned per row click -->
    <p-menu #actionsMenu [model]="actionsItems" [popup]="true" appendTo="body"></p-menu>

    <!-- Diagnostic dialog -->
    <p-dialog header="User Diagnostic" [(visible)]="diagnosticDialogVisible" [modal]="true"
              [style]="{width: '520px'}" [breakpoints]="{'640px': '95vw'}">
      <p class="diag-intro" *ngIf="diagnosticUser">
        Auth-state snapshot for <strong>{{ diagnosticUser.username }}</strong>
        ({{ diagnosticUser.email }}). Red rows are likely blocking login.
      </p>
      <div *ngIf="diagnosticLoading" class="diag-loading">
        <i class="pi pi-spinner pi-spin"></i> Loading...
      </div>
      <table *ngIf="!diagnosticLoading && diagnosticData" class="diag-table">
        <tr *ngFor="let entry of (diagnosticData | keyvalue)" [class]="diagnosticRowClass(entry.key, entry.value)">
          <th>{{ entry.key }}</th>
          <td>{{ diagnosticValue(entry.value) }}</td>
        </tr>
      </table>
      <ng-template pTemplate="footer">
        <button pButton label="Close" class="p-button-text" (click)="diagnosticDialogVisible = false"></button>
      </ng-template>
    </p-dialog>

    <!-- Create User Dialog -->
    <p-dialog header="Create New User" [(visible)]="createDialogVisible" [modal]="true" [style]="{width: '450px'}">
      <div class="info-box">
        <i class="pi pi-info-circle"></i>
        <span>Leave the password field blank to auto-generate a temp one (the dialog will show you what to share). Either way, the user is required to change it on first login.</span>
      </div>
      <div class="dialog-field"><label>Email *</label><input pInputText [(ngModel)]="newUser.email" class="w-full" /></div>
      <div class="dialog-field"><label>First Name *</label><input pInputText [(ngModel)]="newUser.firstName" class="w-full" /></div>
      <div class="dialog-field"><label>Last Name *</label><input pInputText [(ngModel)]="newUser.lastName" class="w-full" /></div>
      <div class="dialog-field"><label>Username (optional)</label><input pInputText [(ngModel)]="newUser.username" class="w-full" placeholder="Defaults to email" /></div>
      <div class="dialog-field"><label>Temp Password (optional)</label>
        <input pInputText [(ngModel)]="newUser.password" class="w-full" placeholder="Leave blank to auto-generate" type="text" autocomplete="off" />
      </div>
      <div class="dialog-field">
        <label>Role *</label>
        <p-dropdown [options]="roleOptions" [(ngModel)]="newUser.roleName" styleClass="w-full" placeholder="Select role"></p-dropdown>
      </div>
      <ng-template pTemplate="footer">
        <button pButton label="Cancel" icon="pi pi-times" class="p-button-text" (click)="createDialogVisible = false"></button>
        <button pButton label="Create" icon="pi pi-check" (click)="createUser()" [loading]="saving"
                [disabled]="!newUser.email || !newUser.firstName || !newUser.lastName || !newUser.roleName"></button>
      </ng-template>
    </p-dialog>

    <!-- Edit User Dialog -->
    <p-dialog header="Edit User" [(visible)]="editDialogVisible" [modal]="true" [style]="{width: '450px'}">
      <div class="dialog-field"><label>First Name</label><input pInputText [(ngModel)]="editUser.firstName" class="w-full" /></div>
      <div class="dialog-field"><label>Last Name</label><input pInputText [(ngModel)]="editUser.lastName" class="w-full" /></div>
      <div class="dialog-field"><label>Email</label><input pInputText [(ngModel)]="editUser.email" class="w-full" /></div>
      <ng-template pTemplate="footer">
        <button pButton label="Cancel" icon="pi pi-times" class="p-button-text" (click)="editDialogVisible = false"></button>
        <button pButton label="Save" icon="pi pi-check" (click)="saveUser()" [loading]="saving"></button>
      </ng-template>
    </p-dialog>

    <!-- Change Role Dialog -->
    <p-dialog header="Change Role" [(visible)]="roleDialogVisible" [modal]="true" [style]="{width: '400px'}">
      <p>User: <strong>{{ selectedUser?.firstName }} {{ selectedUser?.lastName }}</strong></p>
      <p>Current role(s): <strong>{{ selectedUser?.roles?.join(', ') }}</strong></p>
      <div class="dialog-field">
        <label>New Role</label>
        <p-dropdown [options]="roleOptions" [(ngModel)]="selectedRole" styleClass="w-full"></p-dropdown>
      </div>
      <ng-template pTemplate="footer">
        <button pButton label="Cancel" icon="pi pi-times" class="p-button-text" (click)="roleDialogVisible = false"></button>
        <button pButton label="Assign Role" icon="pi pi-check" (click)="assignRole()" [loading]="saving" [disabled]="!selectedRole"></button>
      </ng-template>
    </p-dialog>

    <!-- Force Password Dialog -->
    <p-dialog header="Force Password Change" [(visible)]="passwordDialogVisible" [modal]="true" [style]="{width: '400px'}">
      <div class="info-box warn">
        <i class="pi pi-exclamation-triangle"></i>
        <span>This will set a temporary password. The user will be forced to change it on next login.</span>
      </div>
      <p>User: <strong>{{ selectedUser?.firstName }} {{ selectedUser?.lastName }}</strong></p>
      <div class="dialog-field"><label>New Temporary Password</label><input pInputText [(ngModel)]="forcePasswordValue" class="w-full" /></div>
      <ng-template pTemplate="footer">
        <button pButton label="Cancel" icon="pi pi-times" class="p-button-text" (click)="passwordDialogVisible = false"></button>
        <button pButton label="Set Password" icon="pi pi-check" class="p-button-warning" (click)="setForcePassword()" [loading]="saving" [disabled]="!forcePasswordValue"></button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .user-mgmt-container { max-width: 1200px; margin: 0 auto; }
    .back-bar { margin-bottom: 1rem; }
    .back-link {
      display: inline-flex; align-items: center; gap: 0.5rem;
      color: var(--retreat-teal-dark); text-decoration: none; font-weight: 600; font-size: 0.9rem;
      padding: 0.5rem 1rem; border-radius: 8px; transition: all 0.2s;
      &:hover { background: rgba(26, 58, 74, 0.08); color: var(--retreat-sunset); }
    }
    .page-header {
      text-align: center; padding: 2rem; margin-bottom: 1.5rem;
      background: var(--retreat-grad-page-header);
      color: var(--retreat-cream); border-radius: 12px;
      h1 { font-size: 2rem; font-weight: 700; margin: 0 0 0.5rem 0; }
      p { margin: 0; opacity: 0.9; }
    }
    ::ng-deep .p-toolbar { margin-bottom: 1rem; border-radius: 8px; }
    ::ng-deep .p-toolbar .p-button { background: var(--retreat-teal-dark) !important; border-color: var(--retreat-teal-dark) !important; }
    ::ng-deep .p-toolbar .p-button:hover { background: var(--retreat-teal-light) !important; }

    .dialog-field {
      margin-bottom: 1rem;
      label { display: block; margin-bottom: 0.4rem; font-weight: 600; color: var(--retreat-teal-dark); font-size: 0.9rem; }
    }
    .actions-cell { white-space: nowrap; display: flex; gap: 0.25rem; align-items: center; }
    .diag-intro { color: #495057; font-size: 0.9rem; margin: 0 0 1rem; line-height: 1.45;
      strong { color: var(--retreat-teal-dark); }
    }
    .diag-loading { text-align: center; padding: 2rem; color: #6c757d;
      i { font-size: 1.5rem; margin-right: 0.5rem; color: var(--retreat-sunset); }
    }
    .diag-table { width: 100%; border-collapse: collapse;
      tr { border-bottom: 1px solid #eee; }
      th { text-align: left; color: var(--retreat-teal-dark); padding: 0.5rem 0.75rem;
        font-size: 0.85rem; font-weight: 600; width: 45%; vertical-align: top;
      }
      td { padding: 0.5rem 0.75rem; color: #495057; font-family: 'Consolas', monospace; font-size: 0.85rem;
        word-break: break-all;
      }
      .diag-bad th, .diag-bad td { background: rgba(192, 57, 43, 0.08); color: #8a1a13; }
      .diag-bad th::after { content: ' \\26A0'; }   // ⚠ (escaped for TS template literal)
      .diag-warn th, .diag-warn td { background: rgba(212, 120, 47, 0.08); color: #6e4b08; }
    }
    .actions-cell .primary-action :host ::ng-deep .p-button { color: var(--retreat-teal-dark); }
    ::ng-deep .menu-danger .p-menuitem-link {
      color: #c0392b !important;
      .p-menuitem-icon { color: #c0392b !important; }
      &:hover { background: rgba(192, 57, 43, 0.08) !important; }
    }
    .info-box {
      display: flex; gap: 0.75rem; align-items: flex-start; padding: 0.75rem 1rem;
      background: #e3f2fd; border-radius: 6px; margin-bottom: 1rem; font-size: 0.85rem; color: #1565c0;
      i { margin-top: 2px; }
      &.warn { background: #fff3e0; color: #e65100; }
    }
    .mr-1 { margin-right: 0.25rem; }
  `]
})
export class UserManagementComponent implements OnInit {
  private userService = inject(UserManagementService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  // The shared popup menu we re-position per row click. One <p-menu> in the
  // template, repopulated each time so the bound actions point at the right
  // user without us building a menu per row.
  @ViewChild('actionsMenu') actionsMenu!: Menu;
  actionsItems: MenuItem[] = [];

  users: UserDTO[] = [];
  loading = false;
  saving = false;
  searchText = '';

  roleOptions: { label: string; value: string }[] = [];

  // Create dialog
  createDialogVisible = false;
  newUser: AdminCreateUserRequest = { email: '', firstName: '', lastName: '', roleName: 'MEMBER', username: '', password: '' };

  // Edit dialog
  editDialogVisible = false;
  editUser: Partial<UserDTO> = {};
  editUserId: number = 0;

  // Role dialog
  roleDialogVisible = false;
  selectedUser: UserDTO | null = null;
  selectedRole = '';

  // Force password dialog
  passwordDialogVisible = false;
  forcePasswordValue = '';

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => { this.users = users; this.loading = false; },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load users' });
        this.loading = false;
      }
    });
  }

  loadRoles(): void {
    this.userService.getAvailableRoles().subscribe({
      next: (roles) => this.roleOptions = roles.map(r => ({ label: r, value: r })),
      error: () => this.roleOptions = [{ label: 'MEMBER', value: 'MEMBER' }, { label: 'ADMIN', value: 'ADMIN' }]
    });
  }

  getRoleSeverity(role: string): string {
    switch (role) {
      case 'SUPERADMIN': return 'danger';
      case 'SUPERUSER': return 'warning';
      case 'ADMIN': return 'warning';
      default: return 'info';
    }
  }

  showCreateDialog(): void {
    this.newUser = { email: '', firstName: '', lastName: '', roleName: 'MEMBER', username: '', password: '' };
    this.createDialogVisible = true;
  }

  createUser(): void {
    this.saving = true;
    this.userService.createUser(this.newUser).subscribe({
      next: (response) => {
        this.saving = false;
        this.createDialogVisible = false;
        this.loadUsers();
        // ALWAYS surface the temp password to the admin -- even when an
        // email goes out, the admin often needs to relay it manually.
        // Long life so it stays on screen long enough to copy.
        this.messageService.add({
          severity: 'success', summary: 'User created',
          detail: `Temp password: ${response.defaultPassword}  (user must change on first sign-in)`,
          life: 20000,
        });
      },
      error: (err) => {
        this.saving = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'Failed to create user' });
      }
    });
  }

  showEditDialog(user: UserDTO): void {
    this.editUserId = user.id;
    this.editUser = { firstName: user.firstName, lastName: user.lastName, email: user.email };
    this.editDialogVisible = true;
  }

  saveUser(): void {
    this.saving = true;
    this.userService.updateUser(this.editUserId, this.editUser).subscribe({
      next: () => {
        this.saving = false;
        this.editDialogVisible = false;
        this.loadUsers();
        this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'User updated' });
      },
      error: (err) => {
        this.saving = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'Update failed' });
      }
    });
  }

  showRoleDialog(user: UserDTO): void {
    this.selectedUser = user;
    this.selectedRole = '';
    this.roleDialogVisible = true;
  }

  assignRole(): void {
    if (!this.selectedUser || !this.selectedRole) return;
    this.saving = true;
    this.userService.assignRole(this.selectedUser.id, this.selectedRole).subscribe({
      next: () => {
        this.saving = false;
        this.roleDialogVisible = false;
        this.loadUsers();
        this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Role assigned' });
      },
      error: (err) => {
        this.saving = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'Failed to assign role' });
      }
    });
  }

  showForcePasswordDialog(user: UserDTO): void {
    this.selectedUser = user;
    this.forcePasswordValue = '';
    this.passwordDialogVisible = true;
  }

  setForcePassword(): void {
    if (!this.selectedUser) return;
    this.saving = true;
    this.userService.forcePassword(this.selectedUser.id, this.forcePasswordValue).subscribe({
      next: () => {
        this.saving = false;
        this.passwordDialogVisible = false;
        this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Password set. User must change on next login.' });
      },
      error: (err) => {
        this.saving = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'Failed to set password' });
      }
    });
  }

  /** Rebuild the action list for THIS user, then anchor the shared menu
   *  to the click-target. Bound actions close over `user` so the right row
   *  gets the action regardless of how many open/close cycles happen. */
  openActionsMenu(event: MouseEvent, user: UserDTO): void {
    this.actionsItems = [
      { label: 'Change Role',       icon: 'pi pi-shield',
        command: () => this.showRoleDialog(user) },
      { label: 'Force Password',    icon: 'pi pi-key',
        command: () => this.showForcePasswordDialog(user) },
      ...(user.isLocked ? [{ label: 'Unlock Account', icon: 'pi pi-lock-open',
        command: () => this.unlockUser(user) } as MenuItem] : []),
      { label: 'Force Logout',      icon: 'pi pi-sign-out',
        command: () => this.forceLogout(user) },
      { label: 'View Diagnostic',   icon: 'pi pi-search',
        command: () => this.showDiagnostic(user) },
      { separator: true },
      { label: 'Deactivate',        icon: 'pi pi-trash',
        styleClass: 'menu-danger',
        command: () => this.confirmDeactivate(user) },
    ];
    this.actionsMenu.toggle(event);
  }

  // Diagnostic dialog state
  diagnosticDialogVisible = false;
  diagnosticUser: UserDTO | null = null;
  diagnosticData: Record<string, unknown> | null = null;
  diagnosticLoading = false;

  showDiagnostic(user: UserDTO): void {
    this.diagnosticUser = user;
    this.diagnosticDialogVisible = true;
    this.diagnosticLoading = true;
    this.diagnosticData = null;
    this.userService.diagnostic(user.id).subscribe({
      next: (data) => { this.diagnosticData = data; this.diagnosticLoading = false; },
      error: (e) => {
        this.diagnosticLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Diagnostic failed',
          detail: e?.error?.message || 'Could not load user diagnostic' });
        this.diagnosticDialogVisible = false;
      }
    });
  }

  /** Stringify the diagnostic value (booleans, dates, nulls, arrays) into
   *  something the admin can read at a glance. */
  diagnosticValue(v: unknown): string {
    if (v === null || v === undefined) return '—';
    if (Array.isArray(v)) return v.join(', ') || '(none)';
    if (typeof v === 'boolean') return v ? 'true' : 'false';
    return String(v);
  }

  /** Highlight rows that often cause login failure. */
  diagnosticRowClass(key: string, value: unknown): string {
    if (key === 'isLocked' && value === true) return 'diag-bad';
    if (key === 'isActive' && value === false) return 'diag-bad';
    if (key === 'failedLoginAttempts' && typeof value === 'number' && value >= 5) return 'diag-bad';
    if (key === 'passwordChangeRequired' && value === true) return 'diag-warn';
    return '';
  }

  unlockUser(user: UserDTO): void {
    this.userService.unlockUser(user.id).subscribe({
      next: () => {
        this.loadUsers();
        this.messageService.add({ severity: 'success', summary: 'Unlocked', detail: 'User account unlocked' });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to unlock user' })
    });
  }

  forceLogout(user: UserDTO): void {
    this.userService.forceLogout(user.id).subscribe({
      next: () => this.messageService.add({ severity: 'success', summary: 'Done', detail: 'User sessions revoked' }),
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to force logout' })
    });
  }

  confirmDeactivate(user: UserDTO): void {
    this.confirmationService.confirm({
      message: `Deactivate ${user.firstName} ${user.lastName}?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.userService.deactivateUser(user.id).subscribe({
          next: () => {
            this.loadUsers();
            this.messageService.add({ severity: 'success', summary: 'Deactivated', detail: 'User deactivated' });
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to deactivate user' })
        });
      }
    });
  }
}
