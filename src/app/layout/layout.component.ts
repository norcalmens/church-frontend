import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TopbarComponent } from './topbar/topbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, TopbarComponent, SidebarComponent, FooterComponent],
  template: `
    <div class="layout-wrapper">
      <app-topbar (toggleSidebar)="sidebarVisible = !sidebarVisible"></app-topbar>
      <app-sidebar [(visible)]="sidebarVisible"></app-sidebar>
      <div class="layout-main">
        <div class="layout-content">
          <router-outlet></router-outlet>
        </div>
        <app-footer></app-footer>
      </div>
    </div>
  `,
  styles: [`
    .layout-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .layout-main {
      margin-top: 60px;
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .layout-content {
      flex: 1;
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
    }
    @media (max-width: 768px) {
      .layout-content { padding: 1rem; }
    }
  `]
})
export class LayoutComponent {
  sidebarVisible = false;
}
