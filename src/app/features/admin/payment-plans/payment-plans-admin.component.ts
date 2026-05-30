import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageService, ConfirmationService } from 'primeng/api';
import { PaymentPlanService } from '../../../services/payment-plan.service';
import { PaymentPlan, PaymentPlanPayment } from '../../../core/models/payment-plan.model';

@Component({
  selector: 'app-payment-plans-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink,
            CardModule, TableModule, ButtonModule, InputTextModule, InputTextareaModule,
            InputNumberModule, DropdownModule, DialogModule, TagModule, ToastModule,
            ConfirmDialogModule, ProgressBarModule],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
    <div class="plans-container">
      <div class="back-bar">
        <a routerLink="/admin/dashboard" class="back-link"><i class="pi pi-arrow-left"></i> Back to Dashboard</a>
      </div>
      <div class="page-header"><h1>Payment Plans</h1><p>Let registrants pay over time for a future retreat</p></div>

      <p-card>
        <ng-template pTemplate="header">
          <div class="card-header-bar"><i class="pi pi-credit-card"></i><span>Plans ({{ plans.length }})</span></div>
        </ng-template>
        <div class="toolbar">
          <button pButton label="New Plan" icon="pi pi-plus" (click)="openNew()"></button>
        </div>
        <p-table [value]="plans" [paginator]="true" [rows]="10" [rowsPerPageOptions]="[10, 25, 50]"
                 [tableStyle]="{'min-width': '70rem'}" sortField="createdAt" [sortOrder]="-1">
          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="planName">Plan <p-sortIcon field="planName"></p-sortIcon></th>
              <th pSortableColumn="retreatLabel">Retreat <p-sortIcon field="retreatLabel"></p-sortIcon></th>
              <th>Payer</th>
              <th pSortableColumn="totalAmount" style="width: 95px">Total <p-sortIcon field="totalAmount"></p-sortIcon></th>
              <th style="width: 95px">Paid</th>
              <th style="width: 95px">Balance</th>
              <th style="width: 160px">Progress</th>
              <th style="width: 110px">Status</th>
              <th style="width: 220px"></th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-p>
            <tr>
              <td><strong>{{ p.planName }}</strong></td>
              <td>{{ p.retreatLabel }}</td>
              <td>
                <div>{{ p.payerName }}</div>
                <small class="muted">{{ p.payerEmail }}</small>
              </td>
              <td>{{'$'}}{{ p.totalAmount | number:'1.2-2' }}</td>
              <td>{{'$'}}{{ (p.paidAmount || 0) | number:'1.2-2' }}</td>
              <td><strong>{{'$'}}{{ (p.balance ?? p.totalAmount) | number:'1.2-2' }}</strong></td>
              <td><p-progressBar [value]="progress(p)" [showValue]="false" [style]="{height: '8px'}"></p-progressBar></td>
              <td><p-tag [value]="p.status || 'active'" [severity]="statusSeverity(p.status)"></p-tag></td>
              <td class="actions">
                <button pButton icon="pi pi-list" class="p-button-text p-button-sm" (click)="openDetail(p)" pTooltip="Payments"></button>
                <button pButton icon="pi pi-copy" class="p-button-text p-button-sm" (click)="copyPayLink(p)" pTooltip="Copy pay link"></button>
                <button pButton icon="pi pi-send" class="p-button-text p-button-sm" (click)="resendInvite(p)" pTooltip="Resend invite email"></button>
                <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm" (click)="openEdit(p)" pTooltip="Edit plan"></button>
                <button pButton icon="pi pi-trash" class="p-button-danger p-button-text p-button-sm" (click)="confirmDelete(p)" pTooltip="Delete plan"></button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="9" style="text-align:center; padding:2rem; color:#999;">No payment plans yet. Click "New Plan" to create one.</td></tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>

    <!-- Create/Edit plan dialog -->
    <p-dialog [(visible)]="planDialog" [modal]="true" [style]="{width: '560px'}"
              [header]="editing?.id ? 'Edit Payment Plan' : 'New Payment Plan'"
              [closable]="true" [draggable]="false">
      <form [formGroup]="planForm" class="form" *ngIf="planDialog">
        <div class="field">
          <label>Plan name <span class="req">*</span></label>
          <input pInputText formControlName="planName" placeholder="e.g., Joe Smith — 2027 Retreat" />
        </div>
        <div class="field">
          <label>Retreat <span class="req">*</span></label>
          <input pInputText formControlName="retreatLabel" placeholder="e.g., 2027 NorCal Men's Retreat" />
        </div>
        <div class="field-row">
          <div class="field">
            <label>Payer name <span class="req">*</span></label>
            <input pInputText formControlName="payerName" />
          </div>
          <div class="field">
            <label>Payer email <span class="req">*</span></label>
            <input pInputText formControlName="payerEmail" type="email" />
          </div>
        </div>
        <div class="field-row">
          <div class="field">
            <label>Total amount <span class="req">*</span></label>
            <p-inputNumber formControlName="totalAmount" mode="currency" currency="USD" locale="en-US"
                           [min]="1" inputStyleClass="w-full"></p-inputNumber>
          </div>
          <div class="field" *ngIf="editing?.id">
            <label>Status</label>
            <p-dropdown [options]="statusOptions" formControlName="status" styleClass="w-full"></p-dropdown>
          </div>
        </div>
        <div class="field">
          <label>Notes <span class="optional">(optional)</span></label>
          <textarea pInputTextarea formControlName="notes" rows="2" maxlength="500"></textarea>
        </div>
      </form>
      <ng-template pTemplate="footer">
        <button pButton label="Cancel" icon="pi pi-times" class="p-button-text" (click)="planDialog = false"></button>
        <button pButton [label]="editing?.id ? 'Save Changes' : 'Create Plan'" icon="pi pi-check"
                [disabled]="planForm.invalid || saving" [loading]="saving" (click)="savePlan()"></button>
      </ng-template>
    </p-dialog>

    <!-- Plan detail (payments) dialog -->
    <p-dialog [(visible)]="detailDialog" [modal]="true" [style]="{width: '760px'}"
              [header]="detail?.planName || 'Plan'" [closable]="true" [draggable]="false">
      <div *ngIf="detail">
        <div class="detail-meta">
          <div><strong>Retreat:</strong> {{ detail.retreatLabel }}</div>
          <div><strong>Payer:</strong> {{ detail.payerName }} &lt;{{ detail.payerEmail }}&gt;</div>
          <div class="totals">
            <div><span class="muted">Total</span><div class="amount">{{'$'}}{{ detail.totalAmount | number:'1.2-2' }}</div></div>
            <div><span class="muted">Paid</span><div class="amount paid">{{'$'}}{{ (detail.paidAmount || 0) | number:'1.2-2' }}</div></div>
            <div><span class="muted">Balance</span><div class="amount balance">{{'$'}}{{ (detail.balance ?? detail.totalAmount) | number:'1.2-2' }}</div></div>
          </div>
          <p-progressBar [value]="progress(detail)" [showValue]="true" [style]="{height: '10px', marginTop: '0.75rem'}"></p-progressBar>
          <div class="pay-link-row" *ngIf="detail.payerToken">
            <input pInputText [value]="payerUrl(detail)" readonly #payInput />
            <button pButton icon="pi pi-copy" label="Copy" class="p-button-outlined p-button-sm" (click)="copyPayLink(detail)"></button>
          </div>
        </div>

        <div class="payments-toolbar">
          <h3>Payments</h3>
          <button pButton label="Add Payment" icon="pi pi-plus" class="p-button-sm" (click)="openAddPayment()"></button>
        </div>
        <p-table [value]="detail.payments || []" [tableStyle]="{'min-width': '40rem'}">
          <ng-template pTemplate="header">
            <tr>
              <th>Date</th>
              <th style="width: 100px">Amount</th>
              <th>Method</th>
              <th>Reference</th>
              <th>Status</th>
              <th style="width: 100px"></th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-pay>
            <tr>
              <td>{{ pay.paidAt | date:'short' }}</td>
              <td><strong>{{'$'}}{{ pay.amount | number:'1.2-2' }}</strong></td>
              <td><p-tag [value]="pay.method" severity="info"></p-tag></td>
              <td class="muted">{{ pay.reference || pay.stripePaymentId || '—' }}</td>
              <td><p-tag [value]="pay.status" [severity]="paymentSeverity(pay.status)"></p-tag></td>
              <td>
                <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm" (click)="openEditPayment(pay)"></button>
                <button pButton icon="pi pi-trash" class="p-button-danger p-button-text p-button-sm" (click)="confirmDeletePayment(pay)"></button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="6" style="text-align:center; padding:1.5rem; color:#999;">No payments yet.</td></tr>
          </ng-template>
        </p-table>
      </div>
    </p-dialog>

    <!-- Add/Edit payment dialog -->
    <p-dialog [(visible)]="paymentDialog" [modal]="true" [style]="{width: '460px'}"
              [header]="editingPayment?.id ? 'Edit Payment' : 'Add Payment'" [closable]="true" [draggable]="false">
      <form [formGroup]="paymentForm" class="form" *ngIf="paymentDialog">
        <div class="field-row">
          <div class="field">
            <label>Amount <span class="req">*</span></label>
            <p-inputNumber formControlName="amount" mode="currency" currency="USD" locale="en-US"
                           [min]="0.01" inputStyleClass="w-full"></p-inputNumber>
          </div>
          <div class="field">
            <label>Method</label>
            <p-dropdown [options]="methodOptions" formControlName="method" styleClass="w-full"></p-dropdown>
          </div>
        </div>
        <div class="field">
          <label>Reference <span class="optional">(check #, memo, etc.)</span></label>
          <input pInputText formControlName="reference" />
        </div>
        <div class="field">
          <label>Notes <span class="optional">(optional)</span></label>
          <textarea pInputTextarea formControlName="notes" rows="2" maxlength="500"></textarea>
        </div>
      </form>
      <ng-template pTemplate="footer">
        <button pButton label="Cancel" icon="pi pi-times" class="p-button-text" (click)="paymentDialog = false"></button>
        <button pButton [label]="editingPayment?.id ? 'Save Changes' : 'Add'" icon="pi pi-check"
                [disabled]="paymentForm.invalid || saving" [loading]="saving" (click)="savePayment()"></button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .plans-container { max-width: 1300px; margin: 0 auto; }
    .back-bar { margin-bottom: 1rem; }
    .back-link { display:inline-flex; align-items:center; gap:0.5rem; color:#1a3a4a; text-decoration:none; font-weight:600; font-size:0.9rem;
      padding:0.5rem 1rem; border-radius:8px; transition:all 0.2s;
      &:hover { background: rgba(26,58,74,0.08); color:#d4782f; }
    }
    .page-header { text-align:center; padding:2rem; color:#f0e6d0; border-radius:12px; margin-bottom:1.5rem;
      background: linear-gradient(135deg, #1a3a4a 0%, #1e4d5e 100%);
      h1 { font-size: 1.9rem; font-weight: 700; margin: 0 0 0.35rem; } p { font-size: 0.95rem; margin: 0; opacity: 0.9; }
    }
    .card-header-bar { display:flex; align-items:center; gap:0.75rem; padding:1rem 1.5rem;
      background: linear-gradient(135deg, #1a3a4a 0%, #1e4d5e 100%); color:#f0e6d0; font-size:1.1rem; font-weight:600;
    }
    .toolbar { margin-bottom: 1rem; }
    .muted { color: #6c757d; font-size: 0.82rem; }
    .actions { white-space: nowrap; }
    ::ng-deep .plans-container .p-card { border-radius: 12px; overflow: hidden;
      .p-card-header { padding: 0; border-bottom: none; } .p-card-body { padding: 1.5rem; } .p-card-content { padding: 0; }
    }
    ::ng-deep .plans-container .p-datatable .p-datatable-thead > tr > th {
      background: linear-gradient(135deg, #1a3a4a 0%, #1e4d5e 100%); color:#f0e6d0;
    }
    /* dialog */
    .form { display:flex; flex-direction:column; gap:0.85rem; padding-top:0.25rem; }
    .form .field { display:flex; flex-direction:column; gap:0.35rem;
      label { font-size: 0.85rem; color:#1a3a4a; font-weight:600; }
      .req { color: #d4782f; } .optional { color:#9aa0a6; font-weight:400; }
      input, textarea { width: 100%; }
    }
    .form .field-row { display:grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    ::ng-deep .form .p-inputnumber, ::ng-deep .form .p-dropdown { width: 100%; }
    /* detail */
    .detail-meta { background:#f8f9fa; padding:1rem 1.15rem; border-radius:10px; margin-bottom:1rem;
      > div { margin-bottom: 0.35rem; }
    }
    .detail-meta .totals { display:grid; grid-template-columns: repeat(3,1fr); gap: 1rem; margin-top:0.5rem;
      .muted { font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.05em; }
      .amount { color:#1a3a4a; font-weight:700; font-size: 1.15rem; }
      .amount.paid { color:#2e9e5b; } .amount.balance { color:#d4782f; }
    }
    .pay-link-row { display:flex; gap:0.5rem; margin-top: 0.85rem;
      input { flex:1; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.8rem; }
    }
    .payments-toolbar { display:flex; align-items:center; justify-content:space-between; margin: 0.5rem 0 0.75rem;
      h3 { color:#1a3a4a; margin: 0; font-size: 1.1rem; }
    }
  `]
})
export class PaymentPlansAdminComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(PaymentPlanService);
  private toast = inject(MessageService);
  private confirm = inject(ConfirmationService);

  plans: PaymentPlan[] = [];
  saving = false;

  // Plan dialog
  planDialog = false;
  editing: PaymentPlan | null = null;
  planForm: FormGroup = this.fb.group({
    planName: ['', Validators.required],
    retreatLabel: ['', Validators.required],
    payerName: ['', Validators.required],
    payerEmail: ['', [Validators.required, Validators.email]],
    totalAmount: [null, [Validators.required, Validators.min(1)]],
    status: ['active'],
    notes: [''],
  });
  statusOptions = [
    { label: 'Active',    value: 'active'    },
    { label: 'Completed', value: 'completed' },
    { label: 'Canceled',  value: 'canceled'  },
  ];

  // Detail
  detailDialog = false;
  detail: PaymentPlan | null = null;

  // Payment dialog
  paymentDialog = false;
  editingPayment: PaymentPlanPayment | null = null;
  paymentForm: FormGroup = this.fb.group({
    amount: [null, [Validators.required, Validators.min(0.01)]],
    method: ['cash', Validators.required],
    reference: [''],
    notes: [''],
  });
  methodOptions = [
    { label: 'Cash',   value: 'cash'   },
    { label: 'Check',  value: 'check'  },
    { label: 'Stripe', value: 'stripe' },
  ];

  ngOnInit(): void { this.load(); }

  load(): void {
    this.svc.listAll().subscribe({
      next: (data) => { this.plans = data || []; },
      error: () => { this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load payment plans' }); }
    });
  }

  progress(p: PaymentPlan): number {
    if (!p?.totalAmount || p.totalAmount <= 0) return 0;
    const pct = ((p.paidAmount || 0) / p.totalAmount) * 100;
    return Math.max(0, Math.min(100, Math.round(pct)));
  }

  statusSeverity(s: string | undefined): string {
    switch (s) { case 'completed': return 'success'; case 'canceled': return 'danger'; default: return 'info'; }
  }
  paymentSeverity(s: string | undefined): string {
    switch (s) { case 'paid': return 'success'; case 'pending': return 'warning'; case 'processing': return 'info'; case 'failed': return 'danger'; default: return 'warning'; }
  }

  payerUrl(p: PaymentPlan): string {
    return `${window.location.origin}/plan/${p.payerToken}`;
  }
  copyPayLink(p: PaymentPlan): void {
    const url = this.payerUrl(p);
    navigator.clipboard?.writeText(url).then(
      () => this.toast.add({ severity: 'success', summary: 'Copied', detail: 'Pay link copied to clipboard' }),
      () => this.toast.add({ severity: 'warn', summary: 'Copy failed', detail: url })
    );
  }

  resendInvite(p: PaymentPlan): void {
    if (p.id == null) return;
    this.svc.resendInvite(p.id).subscribe({
      next: () => this.toast.add({ severity: 'success', summary: 'Email sent', detail: `Invite re-sent to ${p.payerEmail}` }),
      error: (e) => this.toast.add({ severity: 'error', summary: 'Error', detail: e?.error?.message || 'Could not send invite' })
    });
  }

  // ===== Plan CRUD =====
  openNew(): void {
    this.editing = null;
    this.planForm.reset({ planName: '', retreatLabel: '', payerName: '', payerEmail: '', totalAmount: null, status: 'active', notes: '' });
    this.planDialog = true;
  }
  openEdit(p: PaymentPlan): void {
    this.editing = p;
    this.planForm.reset({
      planName: p.planName, retreatLabel: p.retreatLabel,
      payerName: p.payerName, payerEmail: p.payerEmail,
      totalAmount: Number(p.totalAmount),
      status: p.status || 'active', notes: p.notes || '',
    });
    this.planDialog = true;
  }
  savePlan(): void {
    if (this.planForm.invalid) return;
    this.saving = true;
    const payload: PaymentPlan = {
      ...this.planForm.value,
      totalAmount: Number(this.planForm.value.totalAmount),
    };
    const obs = this.editing?.id ? this.svc.update(this.editing.id, payload) : this.svc.create(payload);
    obs.subscribe({
      next: () => { this.saving = false; this.planDialog = false;
        this.toast.add({ severity: 'success', summary: 'Saved', detail: this.editing?.id ? 'Plan updated' : 'Plan created' });
        this.load();
      },
      error: (e) => { this.saving = false;
        this.toast.add({ severity: 'error', summary: 'Error', detail: e?.error?.message || 'Save failed' });
      }
    });
  }
  confirmDelete(p: PaymentPlan): void {
    this.confirm.confirm({
      message: `Delete payment plan "${p.planName}" and all of its payments?`,
      header: 'Confirm Delete', icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (p.id == null) return;
        this.svc.delete(p.id).subscribe({
          next: () => { this.toast.add({ severity: 'success', summary: 'Deleted', detail: 'Plan removed' }); this.load(); },
          error: () => { this.toast.add({ severity: 'error', summary: 'Error', detail: 'Delete failed' }); }
        });
      }
    });
  }

  // ===== Detail / Payments =====
  openDetail(p: PaymentPlan): void {
    if (p.id == null) return;
    this.svc.get(p.id).subscribe({
      next: (full) => { this.detail = full; this.detailDialog = true; },
      error: () => { this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load plan' }); }
    });
  }
  refreshDetail(): void {
    if (this.detail?.id == null) return;
    this.svc.get(this.detail.id).subscribe({
      next: (full) => { this.detail = full; this.load(); },
    });
  }
  openAddPayment(): void {
    this.editingPayment = null;
    this.paymentForm.reset({ amount: null, method: 'cash', reference: '', notes: '' });
    this.paymentDialog = true;
  }
  openEditPayment(p: PaymentPlanPayment): void {
    this.editingPayment = p;
    this.paymentForm.reset({
      amount: Number(p.amount), method: p.method || 'cash',
      reference: p.reference || '', notes: p.notes || '',
    });
    this.paymentDialog = true;
  }
  savePayment(): void {
    if (this.paymentForm.invalid || !this.detail?.id) return;
    this.saving = true;
    const v = this.paymentForm.value;
    const payload: PaymentPlanPayment = {
      amount: Number(v.amount),
      method: v.method,
      reference: v.reference?.trim() || undefined,
      notes: v.notes?.trim() || undefined,
      status: 'paid',
    };
    const obs = this.editingPayment?.id
      ? this.svc.updatePayment(this.editingPayment.id, payload)
      : this.svc.recordPayment(this.detail.id, payload);
    obs.subscribe({
      next: () => { this.saving = false; this.paymentDialog = false;
        this.toast.add({ severity: 'success', summary: 'Saved', detail: this.editingPayment?.id ? 'Payment updated' : 'Payment added' });
        this.refreshDetail();
      },
      error: (e) => { this.saving = false;
        this.toast.add({ severity: 'error', summary: 'Error', detail: e?.error?.message || 'Save failed' });
      }
    });
  }
  confirmDeletePayment(p: PaymentPlanPayment): void {
    this.confirm.confirm({
      message: `Delete this ${p.method} payment of $${Number(p.amount).toFixed(2)}?`,
      header: 'Confirm Delete', icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (p.id == null) return;
        this.svc.deletePayment(p.id).subscribe({
          next: () => { this.toast.add({ severity: 'success', summary: 'Deleted', detail: 'Payment removed' }); this.refreshDetail(); },
          error: () => { this.toast.add({ severity: 'error', summary: 'Error', detail: 'Delete failed' }); }
        });
      }
    });
  }
}
