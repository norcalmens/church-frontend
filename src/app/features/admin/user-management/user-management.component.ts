import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { MessageService, ConfirmationService } from 'primeng/api';
import { UserDTO } from '../../../core/auth/auth.types';
import { UserManagementService, AdminCreateUserRequest } from '../../../services/user-management.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, DialogModule,
    InputTextModule, DropdownModule, TagModule, ToastModule, ConfirmDialogModule,
    ToolbarModule, TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="user-mgmt-container">
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
            <td>
              <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm" pTooltip="Edit" (click)="showEditDialog(user)"></button>
              <button pButton icon="pi pi-shield" class="p-button-text p-button-sm" pTooltip="Change Role" (click)="showRoleDialog(user)"></button>
              <button pButton icon="pi pi-key" class="p-button-text p-button-sm p-button-warning" pTooltip="Force Password" (click)="showForcePasswordDialog(user)"></button>
              <button *ngIf="user.isLocked" pButton icon="pi pi-lock-open" class="p-button-text p-button-sm p-button-success" pTooltip="Unlock" (click)="unlockUser(user)"></button>
              <button pButton icon="pi pi-sign-out" class="p-button-text p-button-sm p-button-secondary" pTooltip="Force Logout" (click)="forceLogout(user)"></button>
              <button pButton icon="pi pi-trash" class="p-button-text p-button-sm p-button-danger" pTooltip="Deactivate" (click)="confirmDeactivate(user)"></button>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="7" style="text-align: center; padding: 2rem;">No users found.</td></tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Create User Dialog -->
    <p-dialog header="Create New User" [(visible)]="createDialogVisible" [modal]="true" [style]="{width: '450px'}">
      <div class="info-box">
        <i class="pi pi-info-circle"></i>
        <span>Default password is <strong>123456</strong>. User will be required to change it on first login.</span>
      </div>
      <div class="dialog-field"><label>Email *</label><input pInputText [(ngModel)]="newUser.email" class="w-full" /></div>
      <div class="dialog-field"><label>First Name *</label><input pInputText [(ngModel)]="newUser.firstName" class="w-full" /></div>
      <div class="dialog-field"><label>Last Name *</label><input pInputText [(ngModel)]="newUser.lastName" class="w-full" /></div>
      <div class="dialog-field"><label>Username (optional)</label><input pInputText [(ngModel)]="newUser.username" class="w-full" placeholder="Defaults to email" /></div>
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
    .page-header {
      text-align: center; padding: 2rem; margin-bottom: 1.5rem;
      background: linear-gradient(180deg, #1a3a4a 0%, #2a5a6a 30%, #c8923a 70%, #d4782f 100%);
      color: #f0e6d0; border-radius: 12px;
      h1 { font-size: 2rem; font-weight: 700; margin: 0 0 0.5rem 0; }
      p { margin: 0; opacity: 0.9; }
    }
    ::ng-deep .p-toolbar { margin-bottom: 1rem; border-radius: 8px; }
    ::ng-deep .p-toolbar .p-button { background: #1a3a4a !important; border-color: #1a3a4a !important; }
    ::ng-deep .p-toolbar .p-button:hover { background: #1e4d5e !important; }

    .dialog-field {
      margin-bottom: 1rem;
      label { display: block; margin-bottom: 0.4rem; font-weight: 600; color: #1a3a4a; font-size: 0.9rem; }
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

  users: UserDTO[] = [];
  loading = false;
  saving = false;
  searchText = '';

  roleOptions: { label: string; value: string }[] = [];

  // Create dialog
  createDialogVisible = false;
  newUser: AdminCreateUserRequest = { email: '', firstName: '', lastName: '', roleName: 'MEMBER', username: '' };

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
      case 'SUPERUSER': return 'danger';
      case 'ADMIN': return 'warning';
      default: return 'info';
    }
  }

  showCreateDialog(): void {
    this.newUser = { email: '', firstName: '', lastName: '', roleName: 'MEMBER', username: '' };
    this.createDialogVisible = true;
  }

  createUser(): void {
    this.saving = true;
    this.userService.createUser(this.newUser).subscribe({
      next: (response) => {
        this.saving = false;
        this.createDialogVisible = false;
        this.loadUsers();
        const detail = response.welcomeEmailSent
          ? 'User created. Welcome email sent.'
          : `User created. Default password: ${response.defaultPassword}`;
        this.messageService.add({ severity: 'success', summary: 'Created', detail, life: 8000 });
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
