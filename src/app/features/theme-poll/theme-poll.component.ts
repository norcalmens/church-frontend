import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-theme-poll',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  templateUrl: './theme-poll.component.html',
  styleUrls: ['./theme-poll.component.scss']
})
export class ThemePollComponent {
  googleFormUrl: SafeResourceUrl;
  themes = [
    'Standing in the Gap', 'A Man Who Shows Up', 'Cover Your House', 'Finishing Well',
    'Brotherhood Strengthened', 'Being Our Brother\'s Keeper', 'If We Don\'t Tell Them, Who Will?',
    'Saved to Serve, Sent to Share', 'Forged by Fire', 'Becoming the Man God Called Us to Be'
  ];

  constructor(private sanitizer: DomSanitizer) {
    const formUrl = 'https://docs.google.com/forms/d/19ggaCHafh_QI0wBjKTBbJhulHkTpX2DNUXfJRBWl_Fw/viewform?embedded=true';
    this.googleFormUrl = this.sanitizer.bypassSecurityTrustResourceUrl(formUrl);
  }

  openInNewTab(): void {
    window.open('https://docs.google.com/forms/d/19ggaCHafh_QI0wBjKTBbJhulHkTpX2DNUXfJRBWl_Fw/viewform', '_blank');
  }
}
