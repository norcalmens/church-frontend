import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="app-footer">
      <div class="footer-content">
        <span>NorCal Men's Retreat 2026</span>
        <span class="separator">|</span>
        <span>Churches of Christ, Northern California</span>
      </div>
    </footer>
  `,
  styles: [`
    .app-footer {
      background: linear-gradient(135deg, #1a3a4a 0%, #1e4d5e 100%);
      color: rgba(240, 230, 208, 0.7);
      padding: 1.25rem 2rem;
      text-align: center;
      font-size: 0.9rem;
    }
    .footer-content {
      display: flex; align-items: center; justify-content: center;
      gap: 0.75rem; flex-wrap: wrap;
    }
    .separator { opacity: 0.5; }
  `]
})
export class FooterComponent {}
