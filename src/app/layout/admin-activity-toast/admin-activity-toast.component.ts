import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { RealtimeService, AdminActivityEvent } from '../../services/realtime.service';

/**
 * Live "someone just did something" toast for admin/committee users.
 * Sits inside the shared Layout so it's present on every page an admin
 * visits -- toast pops wherever they happen to be looking.
 *
 * Toast key ("adminActivity") is separated from the default page toasts
 * so live events don't collide with the page's own success/error toasts
 * (which use the default key). Positioned bottom-right so it doesn't
 * cover primary content the admin is trying to read.
 *
 * Anonymous / non-admin users: this component still mounts but never
 * subscribes -- the backend would reject a /topic/admin/** subscribe
 * anyway, but skipping it here avoids a wasted round-trip + STOMP error.
 */
@Component({
  selector: 'app-admin-activity-toast',
  standalone: true,
  imports: [CommonModule, ToastModule],
  providers: [MessageService],
  template: `<p-toast key="adminActivity" position="bottom-right"></p-toast>`,
})
export class AdminActivityToastComponent implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private realtime = inject(RealtimeService);
  private toast = inject(MessageService);

  private userSub?: Subscription;
  private activitySub?: Subscription;

  ngOnInit(): void {
    // Auth state can flip mid-session (login on a public page, logout
    // from admin). React to changes so toasts start/stop with the role.
    this.userSub = this.auth.currentUser$.subscribe(() => this.rewireForCurrentRole());
    this.rewireForCurrentRole();
  }

  private rewireForCurrentRole(): void {
    const canSee = this.auth.isAdmin() || this.auth.hasRole?.('COMMITTEE');
    if (canSee && !this.activitySub) {
      this.activitySub = this.realtime.on('/topic/admin/activity').subscribe(evt => this.showToast(evt));
    } else if (!canSee && this.activitySub) {
      this.activitySub.unsubscribe();
      this.activitySub = undefined;
    }
  }

  private showToast(evt: AdminActivityEvent): void {
    // Icon + severity keyed off event type -- registration/donation/plan
    // request each read as their own color so a stream of toasts is
    // visually parseable at a glance.
    const meta = severityFor(evt.type);
    this.toast.add({
      key: 'adminActivity',
      severity: meta.severity,
      summary: evt.title,
      detail: evt.detail,
      life: 6000,
      icon: meta.icon,
    });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
    this.activitySub?.unsubscribe();
  }
}

function severityFor(type: string): { severity: 'success' | 'info' | 'warn'; icon: string } {
  switch (type) {
    case 'registration':          return { severity: 'success', icon: 'pi pi-user-plus' };
    case 'donation':              return { severity: 'success', icon: 'pi pi-heart-fill' };
    case 'payment':               return { severity: 'success', icon: 'pi pi-dollar' };
    case 'payment_plan_request':  return { severity: 'warn',    icon: 'pi pi-credit-card' };
    default:                      return { severity: 'info',    icon: 'pi pi-bell' };
  }
}
