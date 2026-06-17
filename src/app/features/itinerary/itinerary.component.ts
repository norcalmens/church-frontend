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
  type?: 'meal' | 'session' | 'worship' | 'free' | 'arrival' | 'departure' | 'fellowship' | 'breakout' | 'panel';
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

      <div class="hero-section">
        <i class="pi pi-calendar"></i>
        <h1>Retreat Itinerary</h1>
        <p class="subtitle">NorCal Men's Retreat 2026 &mdash; <em>Standing in the Gap</em> <span class="scripture">(Ezekiel 22:30)</span></p>
        <p class="tagline">A weekend of reset, renewal, and brotherhood. <strong>Come ready. Leave changed.</strong></p>
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
               [class.slot-departure]="slot.type === 'departure'" [class.slot-fellowship]="slot.type === 'fellowship'"
               [class.slot-breakout]="slot.type === 'breakout'" [class.slot-panel]="slot.type === 'panel'">
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
        <h3><i class="pi pi-users"></i> Speakers</h3>
        <ul>
          <li *ngFor="let s of speakers"><strong>{{ s.name }}</strong> &mdash; {{ s.church }}</li>
        </ul>
      </div>

      <!-- Retreat activities -->
      <div class="activities-card">
        <h3><i class="pi pi-star"></i> Retreat Activities</h3>
        <p class="hint">Free-time and fellowship activities running throughout the weekend:</p>
        <ul class="activities-grid">
          <li *ngFor="let a of activities"><i class="pi pi-check-circle"></i> {{ a }}</li>
        </ul>
      </div>

      <!-- Next steps -->
      <div class="next-steps">
        <i class="pi pi-arrow-right"></i>
        <div>
          <strong>Ready for June 11?</strong>
          <p>If you haven't already, register, review the venue, and double-check your route. Questions? Call <strong>Bro. Washington</strong> at <a href="tel:+17076563789">(707) 656-3789</a>.</p>
          <div class="cta-row">
            <a routerLink="/registration"><button pButton label="Register Now" icon="pi pi-pencil"></button></a>
            <a routerLink="/venue"><button pButton label="See the Venue" icon="pi pi-map" class="p-button-outlined"></button></a>
            <a routerLink="/directions"><button pButton label="Get Directions" icon="pi pi-map-marker" class="p-button-outlined"></button></a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .itinerary-container { max-width: 920px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.25rem; }

    /* Next-steps footer */
    .next-steps {
      display: flex; gap: 1rem; align-items: flex-start;
      background: #fff; border: 1px solid #e6e6e6; border-left: 4px solid var(--retreat-sunset);
      border-radius: 12px; padding: 1.25rem 1.4rem; color: #495057;
      box-shadow: 0 4px 16px rgba(0,0,0,0.06);
      i { font-size: 1.4rem; color: var(--retreat-sunset); flex-shrink: 0; margin-top: 0.15rem; }
      strong { display: block; font-size: 1.1rem; color: var(--retreat-teal-dark); }
      p { margin: 0.35rem 0 0; color: #495057; line-height: 1.55;
        a { color: var(--retreat-sunset); font-weight: 600; }
      }
    }
    .next-steps .cta-row { display: flex; gap: 0.75rem; margin-top: 1rem; flex-wrap: wrap;
      a { text-decoration: none; }
    }

    .hero-section {
      background: var(--retreat-grad-nav);
      border-radius: 16px; padding: 2.25rem 2rem; text-align: center; color: var(--retreat-cream);
      i.pi-calendar { font-size: 2.25rem; color: var(--retreat-gold); }
      h1 { font-size: 2.1rem; font-weight: 800; margin: 0.5rem 0 0.35rem; }
      .subtitle { font-size: 1.1rem; margin: 0 0 0.4rem; opacity: 0.92;
        em { color: var(--retreat-gold); font-style: italic; }
        .scripture { color: var(--retreat-gold); opacity: 0.85; font-size: 0.95rem; margin-left: 0.25rem; }
      }
      .tagline { font-size: 0.98rem; margin: 0 0 1rem; opacity: 0.88; line-height: 1.5;
        strong { color: var(--retreat-gold); }
      }
      .dates, .location {
        display: inline-flex; align-items: center; gap: 0.5rem; margin: 0.25rem 0.75rem;
        font-size: 1.05rem; color: var(--retreat-cream);
        i { color: var(--retreat-gold); font-size: 1rem; }
      }
    }

    .day-card {
      background: #fff; border-radius: 14px; overflow: hidden;
      box-shadow: 0 4px 16px rgba(0,0,0,0.07); border-top: 4px solid var(--retreat-gold);
    }
    .day-header {
      display: flex; align-items: center; gap: 1.5rem; padding: 1.25rem 1.5rem;
      background: var(--retreat-grad-nav); color: var(--retreat-cream);
    }
    .day-number {
      flex-shrink: 0; width: 64px; height: 64px;
      display: flex; align-items: center; justify-content: center;
      background: var(--retreat-gold); color: var(--retreat-teal-dark); border-radius: 50%;
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
      &.slot-meal       { border-left-color: var(--retreat-sunset); }
      &.slot-session    { border-left-color: var(--retreat-teal-dark); }
      &.slot-worship    { border-left-color: var(--retreat-gold); }
      &.slot-free       { border-left-color: #6c757d; }
      &.slot-arrival    { border-left-color: #2e9e5b; }
      &.slot-departure  { border-left-color: #2e9e5b; }
      &.slot-fellowship { border-left-color: #b56d3f; }
      &.slot-breakout   { border-left-color: #5b8ab8; }
      &.slot-panel      { border-left-color: #8a4f9e; }
    }
    .slot-time { color: var(--retreat-teal-dark); font-weight: 700; font-variant-numeric: tabular-nums; padding-top: 2px; }
    .slot-body { color: #495057; }
    .slot-title { display: flex; align-items: center; gap: 0.55rem; color: var(--retreat-teal-dark); font-weight: 600; font-size: 1.02rem;
      i { color: var(--retreat-sunset); font-size: 0.95rem; }
    }
    .slot-detail { margin: 0.25rem 0 0; font-size: 0.92rem; line-height: 1.5; color: #495057; }
    .slot-speaker { margin: 0.25rem 0 0; font-size: 0.88rem; color: var(--retreat-teal-dark);
      strong { color: var(--retreat-sunset); }
    }

    .speakers-card { background: #fff; border-radius: 14px; padding: 1.5rem; box-shadow: 0 4px 16px rgba(0,0,0,0.07);
      h3 { color: var(--retreat-teal-dark); margin: 0 0 0.85rem; display: flex; align-items: center; gap: 0.55rem; font-size: 1.15rem;
        i { color: var(--retreat-sunset); }
      }
      ul { margin: 0; padding-left: 1.25rem; color: #495057; line-height: 1.85;
        strong { color: var(--retreat-teal-dark); }
      }
      .muted { color: #6c757d; font-size: 0.85rem; margin: 0.85rem 0 0; font-style: italic; }
    }

    .activities-card { background: #fff; border-radius: 14px; padding: 1.5rem; box-shadow: 0 4px 16px rgba(0,0,0,0.07);
      h3 { color: var(--retreat-teal-dark); margin: 0 0 0.5rem; display: flex; align-items: center; gap: 0.55rem; font-size: 1.15rem;
        i { color: var(--retreat-sunset); }
      }
      .hint { margin: 0 0 1rem; color: #6c757d; font-size: 0.9rem; }
      .activities-grid {
        list-style: none; margin: 0; padding: 0;
        display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 0.5rem 1rem;
        li {
          display: flex; align-items: center; gap: 0.5rem; color: #495057;
          font-size: 0.95rem; padding: 0.35rem 0;
          i { color: #2e9e5b; font-size: 0.85rem; flex-shrink: 0; }
        }
      }
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
    { name: 'Mike Hancock',     church: 'Opening Night' },
    { name: 'Winters Jr.',      church: 'Friday Morning' },
    { name: 'Winters Sr.',      church: 'Friday Morning' },
    { name: 'Jamell Hamilton',  church: 'Friday Evening' },
    { name: 'Bro. Walker',      church: 'Saturday Morning' },
  ];

  activities = [
    'Basketball', 'Swimming', 'Air Hockey', 'Dominoes', 'Cards',
    'Flag Football', 'Cornhole Tournament', 'Tug-of-War', 'Relay Races',
    'Hiking / Prayer Walk', 'Spades Tournament', 'Testimony Circles',
    'BBQ Cook-Off', 'Chess / Checkers', 'Movie Night',
    'Small Group Discussions', 'Prayer Partner Sessions',
    'Accountability Circles', 'Silent Reflection and Journaling',
  ];

  days: Day[] = [
    {
      label: 'Thursday — Arrival Day',
      date: 'June 11, 2026',
      subtitle: 'Come ready. Settle in. Open the weekend.',
      slots: [
        { time: '3:00 PM',          title: 'Check-In',                   detail: 'Pick up your room assignment, retreat packet, and meet the team at the welcome table.', type: 'arrival' },
        { time: '5:00 PM',          title: 'Meet & Greet',               detail: 'Connect with brothers before dinner.', type: 'fellowship' },
        { time: '6:00 – 7:00 PM',   title: 'Dinner',                     type: 'meal' },
        { time: '7:30 – 8:00 PM',   title: '“When There Is No Man”',     detail: 'Ezekiel 22:30 — opening message.', speaker: 'Mike Hancock', type: 'session' },
        { time: '8:05 – 8:35 PM',   title: 'Breakout Session',           detail: 'Discouragement and Development: Practical, Solution-Oriented Strategies for Men.', type: 'breakout' },
        { time: '9:00 PM – Until',  title: 'Open Fellowship & Free Time', type: 'fellowship' },
      ],
    },
    {
      label: 'Friday — Build Day',
      date: 'June 12, 2026',
      subtitle: 'Teaching, breakouts, fellowship, and rest.',
      slots: [
        { time: '8:00 – 9:00 AM',     title: 'Breakfast', type: 'meal' },
        { time: '10:00 – 10:30 AM',   title: '“A Message on Bringing Our Youth Back into the Fold”', speaker: 'Winters Jr.', type: 'session' },
        { time: '10:35 – 11:05 AM',   title: 'Breakout Session', type: 'breakout' },
        { time: '11:10 – 11:40 AM',   title: '“The Gap of Mentorship: Guiding the Next Generation”', detail: 'Proverbs 22:6 · 2 Timothy 2:2 · Titus 2:6–7.', speaker: 'Winters Sr.', type: 'session' },
        { time: '11:45 – 12:15 PM',   title: 'Breakout Session', type: 'breakout' },
        { time: '12:30 – 1:30 PM',    title: 'Lunch', type: 'meal' },
        { time: '1:30 – 4:30 PM',     title: 'Free Time', detail: 'Hiking, sports, rest among the redwoods — recharge before the evening.', type: 'free' },
        { time: '5:00 – 5:45 PM',     title: 'Evening Message', speaker: 'Jamell Hamilton', type: 'session' },
        { time: '6:00 – 6:30 PM',     title: 'Breakout Session', type: 'breakout' },
        { time: '7:00 – 8:00 PM',     title: 'Dinner', type: 'meal' },
        { time: '8:00 PM – Until',    title: 'Free Time', type: 'free' },
      ],
    },
    {
      label: 'Saturday — Breakthrough Day',
      date: 'June 13, 2026',
      subtitle: 'Be positioned. Stand in the gap. Carry it home.',
      slots: [
        { time: '8:00 – 9:00 AM',     title: 'Breakfast', type: 'meal' },
        { time: '9:30 – 10:15 AM',    title: '“Positioned for the Gap”', detail: 'Nehemiah 4:13–14.', speaker: 'Bro. Walker', type: 'session' },
        { time: '10:20 – 10:50 AM',   title: 'Breakout Session', type: 'breakout' },
        { time: '11:00 – 11:30 AM',   title: 'Panel Discussion', detail: 'Speakers join together for Q&A and closing reflection.', type: 'panel' },
        { time: '12:30 PM',           title: 'Departure', detail: 'Check out, head home. Travel safely.', type: 'departure' },
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
      case 'breakout':   return 'pi-comments';
      case 'panel':      return 'pi-megaphone';
      default:           return 'pi-circle-fill';
    }
  }
}
