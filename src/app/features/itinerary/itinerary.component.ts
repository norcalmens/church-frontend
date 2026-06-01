import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

interface TimeSlot {
  time: string;
  title: string;
  detail?: string;
  speaker?: string;
  type?: 'meal' | 'session' | 'worship' | 'free' | 'arrival' | 'departure' | 'fellowship';
}
interface Day {
  label: string;
  date: string;
  subtitle: string;
  slots: TimeSlot[];
}

@Component({
  selector: 'app-itinerary',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, ButtonModule],
  template: `
    <div class="itinerary-container">

      <!-- DRAFT banner — top -->
      <div class="draft-banner" role="alert">
        <i class="pi pi-exclamation-triangle"></i>
        <div>
          <strong>DRAFT — Not a final document</strong>
          <p>This itinerary is a tentative working schedule and is subject to change. Final times, sessions, and speakers will be confirmed closer to the retreat.</p>
        </div>
      </div>

      <div class="hero-section">
        <i class="pi pi-calendar"></i>
        <h1>Retreat Itinerary</h1>
        <p class="subtitle">NorCal Men's Retreat 2026 &mdash; <em>Standing in the Gap</em></p>
        <p class="dates"><i class="pi pi-calendar"></i> June 11&ndash;13, 2026</p>
        <p class="location"><i class="pi pi-map-marker"></i> Alliance Redwoods Conference Grounds, Occidental, CA</p>
      </div>

      <div *ngFor="let day of days; let i = index" class="day-card">
        <div class="day-header">
          <div class="day-number">Day {{ i + 1 }}</div>
          <div class="day-meta">
            <h2>{{ day.label }}</h2>
            <p class="day-date">{{ day.date }}</p>
            <p class="day-subtitle">{{ day.subtitle }}</p>
          </div>
        </div>
        <div class="schedule">
          <div *ngFor="let slot of day.slots" class="slot" [class.slot-meal]="slot.type === 'meal'"
               [class.slot-session]="slot.type === 'session'" [class.slot-worship]="slot.type === 'worship'"
               [class.slot-free]="slot.type === 'free'" [class.slot-arrival]="slot.type === 'arrival'"
               [class.slot-departure]="slot.type === 'departure'" [class.slot-fellowship]="slot.type === 'fellowship'">
            <div class="slot-time">{{ slot.time }}</div>
            <div class="slot-body">
              <div class="slot-title">
                <i class="pi" [ngClass]="iconFor(slot.type)"></i>
                <span>{{ slot.title }}</span>
              </div>
              <p *ngIf="slot.detail" class="slot-detail">{{ slot.detail }}</p>
              <p *ngIf="slot.speaker" class="slot-speaker"><strong>Speaker:</strong> {{ slot.speaker }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Speakers strip -->
      <div class="speakers-card">
        <h3><i class="pi pi-users"></i> Confirmed Speakers</h3>
        <ul>
          <li *ngFor="let s of speakers"><strong>{{ s.name }}</strong> &mdash; {{ s.church }}</li>
        </ul>
        <p class="muted">Session assignments above are tentative; actual speaker-to-session matching will be finalized.</p>
      </div>

      <!-- Footer note -->
      <div class="draft-footer">
        <i class="pi pi-info-circle"></i>
        <div>
          <strong>Remember &mdash; this is a draft.</strong>
          <p>Times, sessions, meals, and speaker assignments may shift. Check back closer to June 11 for the final schedule, or reach out to the retreat team with questions.</p>
          <div class="cta-row">
            <a routerLink="/registration"><button pButton label="Register Now" icon="pi pi-pencil"></button></a>
            <a routerLink="/venue"><button pButton label="See the Venue" icon="pi pi-map" class="p-button-outlined"></button></a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .itinerary-container { max-width: 920px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.25rem; }

    /* DRAFT banner — top + footer */
    .draft-banner, .draft-footer {
      display: flex; gap: 1rem; align-items: flex-start;
      background: repeating-linear-gradient(45deg, #fff7e0, #fff7e0 12px, #fff0c4 12px, #fff0c4 24px);
      border: 2px solid #e8a832; border-radius: 12px; padding: 1rem 1.25rem; color: #6e4b08;
      box-shadow: 0 2px 8px rgba(232, 168, 50, 0.18);
      i { font-size: 1.6rem; color: #b8651f; flex-shrink: 0; }
      strong { display: block; font-size: 1.05rem; color: #8a4a08; letter-spacing: 0.03em; text-transform: uppercase; }
      p { margin: 0.35rem 0 0; color: #6e4b08; line-height: 1.55; }
    }
    .draft-footer .cta-row { display: flex; gap: 0.75rem; margin-top: 1rem; flex-wrap: wrap;
      a { text-decoration: none; }
    }

    .hero-section {
      background: linear-gradient(135deg, #1a3a4a 0%, #1e4d5e 100%);
      border-radius: 16px; padding: 2.25rem 2rem; text-align: center; color: #f0e6d0;
      i.pi-calendar { font-size: 2.25rem; color: #e8a832; }
      h1 { font-size: 2.1rem; font-weight: 800; margin: 0.5rem 0 0.35rem; }
      .subtitle { font-size: 1.1rem; margin: 0 0 1rem; opacity: 0.92;
        em { color: #e8a832; font-style: italic; }
      }
      .dates, .location {
        display: inline-flex; align-items: center; gap: 0.5rem; margin: 0.25rem 0.75rem;
        font-size: 1.05rem; color: #f0e6d0;
        i { color: #e8a832; font-size: 1rem; }
      }
    }

    .day-card {
      background: #fff; border-radius: 14px; overflow: hidden;
      box-shadow: 0 4px 16px rgba(0,0,0,0.07); border-top: 4px solid #e8a832;
    }
    .day-header {
      display: flex; align-items: center; gap: 1.5rem; padding: 1.25rem 1.5rem;
      background: linear-gradient(135deg, #1a3a4a 0%, #1e4d5e 100%); color: #f0e6d0;
    }
    .day-number {
      flex-shrink: 0; width: 64px; height: 64px;
      display: flex; align-items: center; justify-content: center;
      background: #e8a832; color: #1a3a4a; border-radius: 50%;
      font-weight: 800; font-size: 0.85rem; text-align: center; line-height: 1.05;
    }
    .day-meta {
      h2 { margin: 0; font-size: 1.45rem; font-weight: 700; }
      .day-date { margin: 0.15rem 0 0.2rem; font-size: 0.95rem; opacity: 0.95; }
      .day-subtitle { margin: 0; font-size: 0.85rem; opacity: 0.78; font-style: italic; }
    }

    .schedule { padding: 0.85rem 0; }
    .slot {
      display: grid; grid-template-columns: 110px 1fr; gap: 1.25rem; padding: 0.75rem 1.5rem;
      border-left: 4px solid transparent; transition: background 0.15s;
      &:hover { background: #f8f9fa; }
      &.slot-meal       { border-left-color: #d4782f; }
      &.slot-session    { border-left-color: #1a3a4a; }
      &.slot-worship    { border-left-color: #e8a832; }
      &.slot-free       { border-left-color: #6c757d; }
      &.slot-arrival    { border-left-color: #2e9e5b; }
      &.slot-departure  { border-left-color: #2e9e5b; }
      &.slot-fellowship { border-left-color: #b56d3f; }
    }
    .slot-time { color: #1a3a4a; font-weight: 700; font-variant-numeric: tabular-nums; padding-top: 2px; }
    .slot-body { color: #495057; }
    .slot-title { display: flex; align-items: center; gap: 0.55rem; color: #1a3a4a; font-weight: 600; font-size: 1.02rem;
      i { color: #d4782f; font-size: 0.95rem; }
    }
    .slot-detail { margin: 0.25rem 0 0; font-size: 0.92rem; line-height: 1.5; color: #495057; }
    .slot-speaker { margin: 0.25rem 0 0; font-size: 0.88rem; color: #1a3a4a;
      strong { color: #b8651f; }
    }

    .speakers-card { background: #fff; border-radius: 14px; padding: 1.5rem; box-shadow: 0 4px 16px rgba(0,0,0,0.07);
      h3 { color: #1a3a4a; margin: 0 0 0.85rem; display: flex; align-items: center; gap: 0.55rem; font-size: 1.15rem;
        i { color: #d4782f; }
      }
      ul { margin: 0; padding-left: 1.25rem; color: #495057; line-height: 1.85;
        strong { color: #1a3a4a; }
      }
      .muted { color: #6c757d; font-size: 0.85rem; margin: 0.85rem 0 0; font-style: italic; }
    }

    @media (max-width: 600px) {
      .day-header { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
      .slot { grid-template-columns: 90px 1fr; gap: 0.75rem; padding: 0.65rem 1rem; }
      .slot-time { font-size: 0.92rem; }
    }
  `]
})
export class ItineraryComponent {
  speakers = [
    { name: 'JK Hamilton',         church: 'Community CoC' },
    { name: 'James Walker',        church: 'San Pablo Ave CoC' },
    { name: 'Stanley Winters',     church: 'Parkway CoC' },
    { name: 'Stanley Winters Jr',  church: 'Parkway CoC' },
    { name: 'Mark Hancock',        church: 'Central Church of Christ' },
  ];

  days: Day[] = [
    {
      label: 'Thursday',
      date: 'June 11, 2026',
      subtitle: 'Arrival & opening',
      slots: [
        { time: '3:00 PM', title: 'Check-in opens',            detail: 'Pick up your room assignment, retreat packet, and meet the team at the welcome table.', type: 'arrival' },
        { time: '5:30 PM', title: 'Welcome dinner',            detail: 'Hot meal in the dining hall.', type: 'meal' },
        { time: '7:00 PM', title: 'Opening session',           detail: '“Standing in the Gap” — kickoff and introductions.', speaker: 'JK Hamilton', type: 'session' },
        { time: '8:30 PM', title: 'Worship',                   type: 'worship' },
        { time: '9:30 PM', title: 'Campfire & fellowship',     detail: 'Coffee, dessert, and time to meet your brothers.', type: 'fellowship' },
        { time: '11:00 PM', title: 'Lights out',                type: 'free' },
      ],
    },
    {
      label: 'Friday',
      date: 'June 12, 2026',
      subtitle: 'Teaching & fellowship',
      slots: [
        { time: '7:00 AM',  title: 'Morning prayer / quiet time', detail: 'Optional — meet at the chapel.', type: 'worship' },
        { time: '8:00 AM',  title: 'Breakfast',                   type: 'meal' },
        { time: '9:00 AM',  title: 'Morning session',             detail: 'Teaching on the retreat theme.', speaker: 'James Walker', type: 'session' },
        { time: '10:30 AM', title: 'Break',                       type: 'free' },
        { time: '11:00 AM', title: 'Bible study / breakouts',     speaker: 'Stanley Winters', type: 'session' },
        { time: '12:30 PM', title: 'Lunch',                       type: 'meal' },
        { time: '2:00 PM',  title: 'Free time / outdoor activities', detail: 'Hiking trails, sports fields, recreation among the redwoods. Take a nap if you need one — no judgment.', type: 'free' },
        { time: '4:30 PM',  title: 'Small groups',                detail: 'Intentional time to share, pray, and connect with a few brothers.', type: 'fellowship' },
        { time: '6:00 PM',  title: 'Dinner',                      type: 'meal' },
        { time: '7:30 PM',  title: 'Evening session',             detail: 'Main teaching of the retreat.', speaker: 'Mark Hancock', type: 'session' },
        { time: '9:00 PM',  title: 'Worship & response',          type: 'worship' },
        { time: '10:00 PM', title: 'Campfire & fellowship',       type: 'fellowship' },
        { time: '11:00 PM', title: 'Lights out',                  type: 'free' },
      ],
    },
    {
      label: 'Saturday',
      date: 'June 13, 2026',
      subtitle: 'Sending out',
      slots: [
        { time: '7:00 AM',  title: 'Morning prayer / quiet time', type: 'worship' },
        { time: '8:00 AM',  title: 'Breakfast',                   type: 'meal' },
        { time: '9:00 AM',  title: 'Closing session',             detail: 'Carrying the retreat home.', speaker: 'Stanley Winters Jr', type: 'session' },
        { time: '10:30 AM', title: 'Communion & closing worship', type: 'worship' },
        { time: '12:00 PM', title: 'Lunch',                       type: 'meal' },
        { time: '1:00 PM',  title: 'Departure',                   detail: 'Check out of your cabin, head home. Travel safely.', type: 'departure' },
      ],
    },
  ];

  iconFor(type?: string): string {
    switch (type) {
      case 'meal':       return 'pi-bookmark';
      case 'session':    return 'pi-book';
      case 'worship':    return 'pi-heart-fill';
      case 'free':       return 'pi-sun';
      case 'arrival':    return 'pi-sign-in';
      case 'departure':  return 'pi-sign-out';
      case 'fellowship': return 'pi-users';
      default:           return 'pi-circle-fill';
    }
  }
}
