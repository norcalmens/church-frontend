import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RegistrationService } from '../../../services/registration.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, ButtonModule],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>NorCal Men's Retreat 2026 — Overview</p>
      </div>
      <div class="stats-grid">
        <p-card><div class="stat-card"><i class="pi pi-users"></i><div class="stat-value">{{ stats?.totalRegistrations || 0 }}</div><div class="stat-label">Total Registrations</div></div></p-card>
        <p-card><div class="stat-card"><i class="pi pi-user-plus"></i><div class="stat-value">{{ stats?.totalAttendees || 0 }}</div><div class="stat-label">Total Attendees</div></div></p-card>
        <p-card><div class="stat-card"><i class="pi pi-check-circle"></i><div class="stat-value">{{ stats?.paidRegistrations || 0 }}</div><div class="stat-label">Paid Registrations</div></div></p-card>
        <p-card><div class="stat-card"><i class="pi pi-dollar"></i><div class="stat-value">{{'$'}}{{ stats?.totalRevenue || 0 }}</div><div class="stat-label">Total Revenue</div></div></p-card>
      </div>
      <div class="actions-section">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <a routerLink="/admin/registrations" class="action-card"><i class="pi pi-list"></i><span>View All Registrations</span></a>
          <a routerLink="/admin/donations" class="action-card"><i class="pi pi-heart"></i><span>View All Donations</span></a>
          <a routerLink="/admin/users" class="action-card"><i class="pi pi-users"></i><span>Manage Users</span></a>
          <a routerLink="/registration" class="action-card"><i class="pi pi-pencil"></i><span>New Registration</span></a>
        </div>
      </div>
      <div class="qr-section">
        <h2>Registration QR Code</h2>
        <p-card>
          <div class="qr-card">
            <img src="assets/registration-qr.png" alt="Registration QR Code" class="qr-image" />
            <div class="qr-info">
              <div class="qr-label">Scan to Register</div>
              <div class="qr-url">norcalmensretreat.com/registration</div>
              <a href="assets/registration-qr.png" download="norcal-mens-retreat-registration-qr.png" class="qr-download">
                <i class="pi pi-download"></i>
                <span>Download PNG</span>
              </a>
            </div>
          </div>
        </p-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { max-width: 1200px; margin: 0 auto; }
    .dashboard-header { text-align: center; padding: 3rem 2rem; background: linear-gradient(180deg, #1a3a4a 0%, #2a5a6a 30%, #c8923a 70%, #d4782f 100%); color: #f0e6d0; border-radius: 12px; margin-bottom: 2rem; h1 { font-size: 2.5rem; font-weight: 700; margin: 0 0 0.5rem 0; } p { font-size: 1.1rem; margin: 0; opacity: 0.9; } }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .stat-card { text-align: center; padding: 1rem; i { font-size: 2.5rem; color: #d4782f; margin-bottom: 0.75rem; } .stat-value { font-size: 2.5rem; font-weight: 800; color: #1a3a4a; } .stat-label { font-size: 0.95rem; color: #6c757d; margin-top: 0.25rem; } }
    .actions-section { h2 { color: #1a3a4a; font-size: 1.5rem; margin-bottom: 1rem; } }
    .actions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; }
    .action-card { display: flex; align-items: center; gap: 1rem; padding: 1.5rem; background: white; border-radius: 12px; text-decoration: none; color: #1a3a4a; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: all 0.3s; i { font-size: 1.5rem; color: #d4782f; } span { font-weight: 600; font-size: 1.05rem; } &:hover { transform: translateY(-3px); box-shadow: 0 8px 16px rgba(0,0,0,0.12); background: linear-gradient(135deg, #1a3a4a 0%, #1e4d5e 100%); color: #f0e6d0; i { color: #e8a832; } } }
    .qr-section { margin-top: 2rem; h2 { color: #1a3a4a; font-size: 1.5rem; margin-bottom: 1rem; } }
    .qr-card { display: flex; align-items: center; gap: 2rem; padding: 1rem; flex-wrap: wrap; justify-content: center; }
    .qr-image { width: 220px; height: 220px; background: white; padding: 12px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .qr-info { display: flex; flex-direction: column; gap: 0.75rem; }
    .qr-label { font-size: 1.5rem; font-weight: 700; color: #1a3a4a; }
    .qr-url { font-family: monospace; color: #6c757d; font-size: 1rem; }
    .qr-download { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; background: #d4782f; color: white; border-radius: 8px; text-decoration: none; font-weight: 600; width: fit-content; transition: background 0.2s; &:hover { background: #b8651f; } }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private registrationService = inject(RegistrationService);
  stats: any = null;

  ngOnInit(): void {
    this.registrationService.getStats().subscribe({
      next: (data) => this.stats = data,
      error: () => this.stats = { totalRegistrations: 0, totalAttendees: 0, paidRegistrations: 0, totalRevenue: 0 }
    });
  }
}
