import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, ButtonModule],
  template: `
    <div class="home-container">
      <div class="hero-section">
        <div class="hero-content">
          <div class="hero-text">
            <h1>NorCal Men's Retreat 2026</h1>
            <p class="hero-subtitle">Standing in the Gap</p>
            <p class="hero-details"><i class="pi pi-calendar"></i> June 11-13, 2026</p>
            <p class="hero-details"><i class="pi pi-map-marker"></i> Alliance Redwoods, Occidental, CA</p>
            <p class="hero-details"><i class="pi pi-dollar"></i> $288 per person</p>
            <div class="hero-actions">
              <a routerLink="/registration">
                <button pButton label="Register Now" icon="pi pi-pencil" size="large"></button>
              </a>
              <a routerLink="/venue">
                <button pButton label="View Venue" icon="pi pi-map" size="large"
                        class="p-button-outlined" style="border-color: #f0e6d0; color: #f0e6d0;"></button>
              </a>
            </div>
          </div>
          <div class="hero-flyer">
            <img src="assets/images/retreat-flyer.png" alt="NorCal Men's Retreat 2026 Flyer" />
          </div>
        </div>
      </div>

      <div class="info-grid">
        <p-card>
          <div class="info-card">
            <i class="pi pi-users"></i>
            <h3>Fellowship</h3>
            <p>Connect with brothers in Christ from churches across Northern California</p>
          </div>
        </p-card>
        <p-card>
          <div class="info-card">
            <i class="pi pi-book"></i>
            <h3>Teaching</h3>
            <p>Hear from inspiring speakers including a young adult speaker and two main speakers</p>
          </div>
        </p-card>
        <p-card>
          <div class="info-card">
            <i class="pi pi-heart"></i>
            <h3>Renewal</h3>
            <p>Step away from daily life to focus on spiritual growth among the redwoods</p>
          </div>
        </p-card>
      </div>

      <div class="quick-links">
        <h2>Get Involved</h2>
        <div class="links-grid">
          <a routerLink="/registration" class="link-card"><i class="pi pi-pencil"></i><span>Registration</span></a>
          <a routerLink="/venue" class="link-card"><i class="pi pi-map"></i><span>Venue Info</span></a>
          <a routerLink="/payment" class="link-card"><i class="pi pi-credit-card"></i><span>Make Payment</span></a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-container { max-width: 1200px; margin: 0 auto; }
    .hero-section {
      background: linear-gradient(135deg, #1a3a4a 0%, #1e4d5e 100%);
      border-radius: 16px; padding: 3rem;
      margin-bottom: 3rem; overflow: hidden;
    }
    .hero-content {
      display: flex; align-items: center; gap: 3rem;
    }
    .hero-text {
      flex: 1; color: #f0e6d0;
      h1 { font-size: 2.8rem; font-weight: 800; margin: 0 0 0.5rem 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
    }
    .hero-subtitle { font-size: 1.3rem; font-style: italic; margin: 0 0 1.5rem 0; opacity: 0.9; }
    .hero-details { font-size: 1.1rem; margin: 0.5rem 0; display: flex; align-items: center; gap: 0.5rem; i { color: #e8a832; } }
    .hero-flyer {
      flex-shrink: 0;
      img {
        width: 300px; border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      }
    }
    .hero-actions { display: flex; gap: 1rem; margin-top: 2rem; flex-wrap: wrap; }
    .hero-actions a { text-decoration: none; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
    .info-card {
      text-align: center; padding: 1rem;
      i { font-size: 2.5rem; color: #d4782f; margin-bottom: 1rem; }
      h3 { color: #1a3a4a; font-size: 1.3rem; margin: 0 0 0.75rem 0; }
      p { color: #6c757d; line-height: 1.6; margin: 0; }
    }
    .quick-links { text-align: center; h2 { color: #1a3a4a; font-size: 2rem; margin-bottom: 1.5rem; } }
    .links-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
    .link-card {
      display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
      padding: 2rem 1rem; background: white; border-radius: 12px; text-decoration: none;
      color: #1a3a4a; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: all 0.3s;
      i { font-size: 2rem; color: #d4782f; }
      span { font-weight: 600; font-size: 1.1rem; }
      &:hover {
        transform: translateY(-4px); box-shadow: 0 8px 16px rgba(0,0,0,0.12);
        background: linear-gradient(135deg, #1a3a4a 0%, #1e4d5e 100%); color: #f0e6d0;
        i { color: #e8a832; }
      }
    }
    @media (max-width: 768px) {
      .hero-section { padding: 2rem 1.5rem; }
      .hero-content { flex-direction: column; text-align: center; gap: 2rem; }
      .hero-text h1 { font-size: 2rem; }
      .hero-details { justify-content: center; }
      .hero-actions { justify-content: center; }
      .hero-flyer img { width: 250px; }
    }
  `]
})
export class HomeComponent {}
